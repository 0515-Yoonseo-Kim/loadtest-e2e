const { getNewContext } = require("./browserPool");

async function testUserFlow() {
  const context = await getNewContext();
  const page = await context.newPage();

  const username = `user${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const email = `${username}@test.com`;
  const password = "password123";
  const startTime = Date.now();

  try {
    await page.goto("https://qnq0615.com/register/", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    await page.getByPlaceholder("이름을 입력하세요").fill(username);
    await page.getByPlaceholder("이메일을 입력하세요").fill(email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(password);
    await page.getByPlaceholder("비밀번호를 다시 입력하세요").fill(password);

    const signupBtn = page
      .getByRole("article")
      .getByRole("button", { name: "회원가입" });
    await signupBtn.click();

    const moveBtn = page.getByRole("button", { name: "채팅방 목록으로 이동" });

    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 }),
      moveBtn.click(),
    ]);

    const enterBtn = page.locator(
      'tbody tr:first-child button:has-text("입장")'
    );
    await enterBtn.click();

    await page.waitForSelector(".chat-input-textarea");
    await page.fill(".chat-input-textarea", "안녕하세요!");
    await page.getByRole("button", { name: "메시지 보내기" }).click();

    // ✅ 여기까지 측정
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[🎯] ${username} session 측정 완료 - ${duration}s`);

    // 소켓 연결 유지 (비측정 구간)
    await page.waitForTimeout(200_000);

    await page.close(); // ✅ 페이지만 닫기
    return parseFloat(duration);
  } catch (err) {
    console.error(`[❌] ${username} testUserFlow 실패:`, err.message);
    await page.close().catch(() => {});
    throw err;
  }
}

async function testStayOnlyFlow() {
  const context = await getNewContext();
  const page = await context.newPage();

  const username = `user${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const email = `${username}@test.com`;
  const password = "password123";
  const startTime = Date.now();

  try {
    await page.goto("https://qnq0615.com/register/", {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    await page.getByPlaceholder("이름을 입력하세요").fill(username);
    await page.getByPlaceholder("이메일을 입력하세요").fill(email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(password);
    await page.getByPlaceholder("비밀번호를 다시 입력하세요").fill(password);

    const signupBtn = page
      .getByRole("article")
      .getByRole("button", { name: "회원가입" });
    await signupBtn.click();

    const moveBtn = page.getByRole("button", { name: "채팅방 목록으로 이동" });
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 10000 }),
      moveBtn.click(),
    ]);

    const enterBtn = page.locator(
      'tbody tr:first-child button:has-text("입장")'
    );
    await enterBtn.click();

    await page.waitForSelector(".chat-input-textarea");

    // ✅ 여기까지 측정
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`[🎯] ${username} 입장 완료 측정 - ${duration}s`);

    await page.waitForTimeout(200_000); // 메시지 없이 대기
    await page.close();
    return parseFloat(duration);
  } catch (err) {
    console.error(`[❌] ${username} testStayOnlyFlow 실패:`, err.message);
    await page.close().catch(() => {});
    throw err;
  }
}

module.exports = {
  testUserFlow,
  testStayOnlyFlow,
};
