/*
📌 小米商城参数抓取脚本
抓取：
- serviceToken（Cookie）
- sign（URL / body）
- actId（infinite/do）
*/

const url = $request.url;
const headers = $request.headers || {};
const body = $request.body || "";

// ========= 1️⃣ 抓 serviceToken =========
const cookie = headers.Cookie || headers.cookie || "";
const tokenMatch = cookie.match(/serviceToken=([^;]+)/);
if (tokenMatch) {
  $persistentStore.write(tokenMatch[1], "MI_SERVICE_TOKEN");
}

// ========= 2️⃣ 抓 sign（URL 优先） =========
try {
  if (url.includes("/mtop/navi/venue/batch")) {
    const urlObj = new URL(url);
    const sign = urlObj.searchParams.get("sign");

    if (sign) {
      $persistentStore.write(sign, "MI_SIGN");
    } else if (body) {
      // 兼容旧版 body 里有 sign
      const data = JSON.parse(body);
      const ql = data?.query_list?.[0];
      if (ql?.sign) {
        $persistentStore.write(ql.sign, "MI_SIGN");
      }
    }
  }
} catch (e) {}

// ========= 3️⃣ 抓 actId =========
try {
  if (url.includes("/mtop/mf/act/infinite/do") && body) {
    const data = JSON.parse(body);
    const actId = data?.[1]?.actId;
    if (actId) {
      $persistentStore.write(actId, "MI_ACT_ID");
    }
  }
} catch (e) {}

// ========= 通知 =========
const st = $persistentStore.read("MI_SERVICE_TOKEN");
const sign = $persistentStore.read("MI_SIGN");
const actId = $persistentStore.read("MI_ACT_ID");

if (st || sign || actId) {
  $notification.post(
    "🛒 小米商城参数抓取成功",
    "",
    `serviceToken: ${st ? "✅" : "❌"}\n` +
    `sign: ${sign ? "✅" : "❌"}\n` +
    `actId: ${actId || "未抓取"}`
  );
}

$done();
