/*
📌 小米商城 serviceToken 获取脚本（http-request）
说明：
1. 拦截 page 接口请求
2. 从请求头 Cookie 中获取 serviceToken
3. 保存到 $persistentStore
*/

const url = $request.url;
const headers = $request.headers;

// 只处理 page 接口
if (!url.includes("/mtop/navi/venue/page") || !headers) {
  $done();
}

try {
  const cookie = headers["Cookie"] || headers["cookie"] || "";
  const match = cookie.match(/serviceToken=([^;]+)/);
  if (match && match[1]) {
    const serviceToken = match[1];
    $persistentStore.write(serviceToken, "MI_SERVICE_TOKEN");
    $notification.post(
      "🛒 小米商城 serviceToken 获取成功",
      "",
      serviceToken
    );
    console.log("✅ serviceToken:", serviceToken);
  } else {
    console.log("⚠️ 未匹配到 serviceToken");
  }
} catch (e) {
  console.log("❌ 获取 serviceToken 异常:", e);
}

$done();
