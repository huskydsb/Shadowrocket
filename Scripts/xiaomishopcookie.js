/*
📌 小米商城参数抓取脚本
抓取：
- serviceToken（Cookie）
- sign（URL / body）
- actId（usercenter/personalHome 响应体）
*/

const url = $request.url;
const headers = $request.headers || {};
const body = $response?.body || $request.body || "";

// ========= 1️⃣ serviceToken =========
const cookie = headers.Cookie || headers.cookie || "";
const tokenMatch = cookie.match(/serviceToken=([^;]+)/);
if (tokenMatch) {
  $persistentStore.write(tokenMatch[1], "MI_SERVICE_TOKEN");
}

// ========= 2️⃣ sign（URL / body） =========
try {
  if (url.includes("/mtop/navi/venue/batch")) {
    const u = new URL(url);
    const signFromUrl = u.searchParams.get("sign");

    if (signFromUrl) {
      $persistentStore.write(signFromUrl, "MI_SIGN");
    } else if (body) {
      const data = JSON.parse(body);
      const ql = data?.query_list?.[0];
      if (ql?.sign) {
        $persistentStore.write(ql.sign, "MI_SIGN");
      }
    }
  }
} catch (_) {}

// ========= 3️⃣ actId（最终来源） =========
try {
  if (url.includes("/mtop/mf/usercenter/personalHome") && body) {
    const data = JSON.parse(body);

    // 深度遍历查找 actId
    const findActId = (obj) => {
      if (!obj || typeof obj !== "object") return null;
      if (obj.actId) return obj.actId;
      for (const k in obj) {
        const res = findActId(obj[k]);
        if (res) return res;
      }
      return null;
    };

    const actId = findActId(data);
    if (actId) {
      $persistentStore.write(actId, "MI_ACT_ID");
    }
  }
} catch (_) {}

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
