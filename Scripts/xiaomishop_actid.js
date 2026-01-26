/*************************************
 * 小米商城 actId / sign 获取
 * 触发接口：
 * /mtop/navi/venue/batch
 *************************************/

const body = $response.body;

if (!body) {
  $done();
}

let obj;
try {
  obj = JSON.parse(body);
} catch (e) {
  console.log("❌ JSON 解析失败");
  $done();
}

let queryList =
  obj?.data?.query_list ||
  obj?.query_list ||
  [];

if (!Array.isArray(queryList)) {
  console.log("❌ 未找到 query_list");
  $done();
}

let actId = "";
let sign = "";

for (let item of queryList) {
  if (item.resolver === "infinite-task") {
    sign = item.sign || "";

    if (item.parameter) {
      try {
        const paramObj = JSON.parse(item.parameter);
        actId = paramObj.actId || "";
      } catch (e) {}
    }
    break;
  }
}

if (!actId) {
  console.log("❌ actId 未获取到");
  $done();
}

// ===== 持久化存储 =====
$persistentStore.write(actId, "xm_actId");
if (sign) {
  $persistentStore.write(sign, "xm_taskSign");
}

// ===== 日志 =====
console.log(`✅ 获取成功`);
console.log(`actId: ${actId}`);
console.log(`sign: ${sign}`);

$notification.post(
  "小米商城",
  "actId 获取成功",
  `actId: ${actId}`
);

$done();
