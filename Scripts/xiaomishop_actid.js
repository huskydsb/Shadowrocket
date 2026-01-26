/*
📌 小米商城 actId & sign 获取脚本（http-response）
来源接口：
/mtop/navi/venue/page?page_id=13880&pdl=mishop
功能：
1. 抓取最新 actId 和 sign
2. 保存到 $persistentStore（MI_ACT_ID、MI_SIGN）
*/

const url = $request.url;
const body = $response.body;

// 只处理 page 接口返回
if (!url.includes("/mtop/navi/venue/page") || !body) {
  $done();
}

try {
  const data = JSON.parse(body);
  const floors = data?.data?.floors || [];

  // 查找任务模块 mi_task_floor
  const taskFloor = floors.find(f => f.module_key === "mi_task_floor");
  if (!taskFloor) {
    console.log("⚠️ 未找到任务模块");
    $done();
  }

  // 查找 query_list 中 resolver 为 infinite-task 的对象
  const query = (taskFloor.query_list || []).find(q => q.resolver === "infinite-task");
  if (!query) {
    console.log("⚠️ 未找到签到参数（sign）");
    $done();
  }

  // 从 parameter 中提取 actId
  const paramObj = JSON.parse(query.parameter || "{}");
  const actId = paramObj.actId;
  const sign = query.sign;

  if (actId && sign) {
    $persistentStore.write(actId, "MI_ACT_ID");
    $persistentStore.write(sign, "MI_SIGN");

    $notification.post(
      "🛒 小米商城 actId & sign 获取成功",
      "",
      `actId: ${actId}\nsign: ${sign}`
    );
    console.log("✅ 获取成功:", `actId=${actId}, sign=${sign}`);
  }

} catch (e) {
  console.log("❌ actId & sign 获取异常:", e);
}

$done();
