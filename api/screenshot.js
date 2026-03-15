// API 路由：/api/screenshot
// 主要使用 ScreenshotOne 服务截图（更稳定）
// 备用方案：使用 Thum.io（无需API Key，但功能有限）

export const dynamic = 'force-dynamic';

const ACCESS_KEY = process.env.SCREENSHOT_ONE_ACCESS_KEY || '';

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

  // 如果配置了 ScreenshotOne API Key，使用它
  if (ACCESS_KEY) {
    return await takeScreenshotWithScreenshotOne(targetUrl);
  } else {
    // 否则使用备用方案：重定向到 Thum.io
    return await takeScreenshotWithThumIo(targetUrl);
  }
}

// ScreenshotOne 方案（更专业，功能更多）
async function takeScreenshotWithScreenshotOne(targetUrl) {
  try {
    const apiUrl = new URL('https://api.screenshotone.com/take');
    apiUrl.searchParams.set('url', targetUrl);
    apiUrl.searchParams.set('access_key', ACCESS_KEY);
    apiUrl.searchParams.set('width', '1280');
    apiUrl.searchParams.set('height', '800');
    apiUrl.searchParams.set('format', 'png');
    apiUrl.searchParams.set('wait_until', 'network_idle');
    apiUrl.searchParams.set('timeout', '30');
    
    const response = await fetch(apiUrl.toString(), {
      signal: AbortSignal.timeout(45000)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API returned ${response.status}`;
      throw new Error(errorMessage);
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
    console.error('ScreenshotOne error:', error.message);
    // 如果 ScreenshotOne 失败，尝试备用方案
    return await takeScreenshotWithThumIo(targetUrl);
  }
}

// Thum.io 备用方案（无需 API Key）
async function takeScreenshotWithThumIo(targetUrl) {
  try {
    // 从 URL 中提取域名部分（去掉 https://）
    let domain = targetUrl;
    if (domain.startsWith('https://')) {
      domain = domain.substring(8);
    } else if (domain.startsWith('http://')) {
      domain = domain.substring(7);
    }
    // 去掉任何路径
    if (domain.includes('/')) {
      domain = domain.split('/')[0];
    }
    
    // 使用 thum.io 服务
    const thumIoUrl = `https://thum.io/${domain}`;
    
    const response = await fetch(thumIoUrl, {
      signal: AbortSignal.timeout(30000),
      redirect: 'follow'
    });
    
    if (!response.ok) {
      throw new Error(`Thum.io returned ${response.status}`);
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
    console.error('Thum.io error:', error.message);
    return Response.json(
      { 
        error: `截图失败: ${error.message}`,
        code: 'SCREENSHOT_ERROR',
        hint: '请稍后重试，或联系管理员检查配置'
      },
      { status: 500 }
    );
  }
}
