// API 路由：/api/screenshot
// 使用 Playwright 截取网页截图

import { chromium } from 'playwright';
import { isSupported } from '@vercel/kv';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  // 测试 1: 缺少 url 参数
  if (!url) {
    return Response.json(
      { error: 'Missing url parameter', code: 'MISSING_URL' },
      { status: 400 }
    );
  }

  let targetUrl = url;
  // 测试 2: 自动补全协议
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    targetUrl = 'https://' + url;
  }

  // 测试 3: 验证 URL 格式
  try {
    new URL(targetUrl);
  } catch {
    return Response.json(
      { error: 'Invalid URL format', code: 'INVALID_URL' },
      { status: 400 }
    );
  }

  let browser;
  try {
    // 启动浏览器
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    
    // 设置视口大小
    await page.setViewportSize({ width: 1280, height: 800 });

    // 导航到目标页面
    await page.goto(targetUrl, {
      waitUntil: 'networkidle',
      timeout: 25000,
    });

    // 截图
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    });

    await browser.close();

    // 返回图片
    return new Response(screenshot, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Disposition': 'attachment; filename="screenshot.png"',
      },
    });

  } catch (error) {
    if (browser) {
      await browser.close();
    }

    // 测试 4: 超时和错误处理
    console.error('Screenshot error:', error.message);

    return Response.json(
      { 
        error: `Screenshot failed: ${error.message}`,
        code: 'SCREENSHOT_ERROR'
      },
      { status: 500 }
    );
  }
}
