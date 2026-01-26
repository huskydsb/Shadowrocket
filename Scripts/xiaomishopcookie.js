/*
📌 小米商城参数获取脚本（http-request）
功能：
- 获取 serviceToken（Cookie）
- 获取 sign（venue/batch URL / body）
*/

const url = $request.url;
const headers = $request.headers || {};
const body = $request.body || "";

// ========= 1️⃣ serviceToken =========
const cookie = headers.Cookie || headers.cookie || "";
const tokenMatch = cookie.match(/serviceToken=([^;]+)/);
if (tokenMatch) {
  $persistentStore.write(tokenMatch[1], "MI_SERVICE_TOKEN");
}

// ========= 2️⃣ sign =========
try {
  if (url.includes("/mtop/navi/venue/batch")) {
    // iOS：sign 在 URL
    const u = new URL(url);
    const signFromUrl = u.searchParams.get("sign");
    if (signFromUrl) {
      $persistentStore.write(signFromUrl, "MI_SIGN");
    } else if (body) {
      // 兼容旧版：sign 在 body
      const data = JSON.parse(body);
      const ql = data?.query_list?.[0];
      if (ql?.sign) {
        $persistentStore.write(ql.sign, "MI_SIGN");
      }
    }
  }
} catch (_) {}

// ========= 通知（只要抓到就提示） =========
const st = $persistentStore.read("MI_SERVICE_TOKEN");
const sign = $persistentStore.read("MI_SIGN");

if (st || sign) {
  $notification.post(
    "🛒 小米商城参数获取",
    "",
    `serviceToken: ${st ? "✅" : "❌"}\n` +
    `sign: ${sign ? "✅" : "❌"}`
  );
}

$done();
