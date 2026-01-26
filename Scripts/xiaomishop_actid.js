/*
📌 小米商城 actId / sign 获取脚本（http-response）
拦截接口：/mtop/navi/venue/page 或 /mtop/navi/venue/batch
*/

const url = $request.url;
const body = $response.body;

if (!url.includes("/mtop/navi/venue/") || !body) {
  console.log("❌ 非目标接口或 body 为空");
  $done();
}

try {
  const data = JSON.parse(body);
  console.log("✅ 接口返回解析成功");

  // 找到包含 infinite-task 的 query_list
  let query = data?.data?.floors
                ?.flatMap(f => f.query_list || [])
                ?.find(q => q.resolver === "infinite-task");

  if (!query) {
    console.log("❌ 未找到 infinite-task query_list");
    $notification.post("🛒 actId/sign 获取失败", "", "未找到 infinite-task query_list");
    $done();
  }

  const actId = JSON.parse(query.parameter).actId;
  const sign = query.sign;

  // 写入持久化存储
  $persistentStore.write(actId, "MI_ACT_ID");
  $persistentStore.write(sign, "MI_SIGN");

  console.log("➡️ actId:", actId);
  console.log("➡️ sign:", sign);

  $notification.post("🛒 actId/sign 获取成功", "", `actId: ${actId}\nsign: ${sign}`);
} catch (e) {
  console.log("❌ 解析异常:", e);
  $notification.post("🛒 actId/sign 获取异常", "", String(e));
}

$done();
