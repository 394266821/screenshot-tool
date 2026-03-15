// API 路由：/api/screenshot
// 使用 screenshotapi.net 服务截图

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return Response.json(
      { error: 'Missing url parameter', code: 'MISSING_URL' },
      { status: 400 }
    );
  }

  let targetUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    targetUrl = 'https://' + url;
  }

  try {
    new URL(targetUrl);
  } catch {
    return Response.json(
      { error: 'Invalid URL format', code: 'INVALID_URL' },
      { status: 400 }
    );
  }

  try {
    // 使用 screenshotapi.net 服务
    // 免费版有使用限制，生产环境建议使用付费版或自建服务
    const screenshotUrl = `https://screenshotapi.net/screenshot?url=${encodeURIComponent(targetUrl)}&width=1280&height=800&fresh=true&wait_for=2000`;
    
    const response = await fetch(screenshotUrl);
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    
    const screenshot = await response.arrayBuffer();
    
    return new Response(screenshot, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Disposition': 'attachment; filename="screenshot.png"',
      },
    });

  } catch (error) {
    console.error('Screenshot error:', error.message);
    return Response.json(
      { 
        error: `Screenshot failed: ${error.message}`,
        code: 'SCREENSHOT_ERROR',
        hint: 'Free API has usage limits. Consider using a paid service or self-hosted solution.'
      },
      { status: 500 }
    );
  }
}
