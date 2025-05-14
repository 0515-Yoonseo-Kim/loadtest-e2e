const { chromium } = require("playwright");

let browser;
const contextPool = [];
const MAX_CONTEXT = 300;

async function getNewContext() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
    console.log("🚀 브라우저 최초 실행됨");
    await new Promise((res) => setTimeout(res, 1000)); // 안정화 대기
  }

  if (contextPool.length >= MAX_CONTEXT) {
    const old = contextPool.shift();
    await old.close(); // 오래된 컨텍스트 제거
  }

  const context = await browser.newContext(); // 새로운 컨텍스트 생성
  contextPool.push(context);
  return context;
}

async function closeAll() {
  for (const ctx of contextPool) {
    await ctx.close();
  }
  if (browser) {
    await browser.close();
    browser = null;
    console.log("🧹 브라우저 종료");
  }
}

module.exports = { getNewContext, closeAll };
