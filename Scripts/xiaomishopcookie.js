/*
📌 小米商城 Cookie / 参数抓取脚本
抓取内容：
1️⃣ serviceToken（Cookie）
2️⃣ sign（venue/batch 接口）
3️⃣ actId（infinite/do 接口）
*/

const url = $request.url;
const headers = $request.headers || {};
const body = $request.body || "";

// ====== 抓 serviceToken ======
if (headers.Cookie || headers.cookie) {
  const cookie = headers.Cookie || headers.cookie;
  const match = cookie.match(/serviceToken=([^;]+)/);
  if (match) {
    $persistentStore.write(match[1], "MI_SERVICE_TOKEN");
  }
}

// ====== 抓 sign ======
if (url.includes("/mtop/navi/venue/batch")) {
  try {
    const data = JSON.parse(body);
    const ql = data?.query_list?.[0];
    if (ql?.sign) {
      $persistentStore.write(ql.sign, "MI_SIGN");
    }
  } catch (e) {}
}

// ====== 抓 actId ======
if (url.includes("/mtop/mf/act/infinite/do")) {
  try {
    const data = JSON.parse(body);
    const actId = data?.[1]?.actId;
    if (actId) {
      $persistentStore.write(actId, "MI_ACT_ID");
    }
  } catch (e) {}
}

// ====== 通知 ======
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
