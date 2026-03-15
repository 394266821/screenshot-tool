// API 路由：/api/screenshot
// 当前使用 Thum.io 前端跳转方式，API 暂不启用

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

  // 重定向到 Thum.io
  return Response.redirect('https://thum.io/' + targetUrl, 302);
}
