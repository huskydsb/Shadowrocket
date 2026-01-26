/*
🛒 小米商城 actId / sign 获取脚本
接口：
GET /mtop/navi/venue/page?page_id=13880&pdl=mishop

存储字段：
MI_ACT_ID
MI_SIGN
*/

const url = $request.url;
const body = $response.body;

if (!body || !url.includes("/mtop/navi/venue/page")) {
  $done();
}

try {
  const data = JSON.parse(body);

  // query_list 一般在 floors 下面，做一次稳妥遍历
  let queryItem = null;

  const floors = data?.data?.floors || [];
  for (const floor of floors) {
    if (Array.isArray(floor.query_list) && floor.query_list.length > 0) {
      queryItem = floor.query_list[0];
      break;
    }
  }

  if (!queryItem) {
    console.log("❌ 未找到 query_list");
    $done();
    return;
  }

  const sign = queryItem.sign;
  let actId = null;

  try {
    const paramObj = JSON.parse(queryItem.parameter || "{}");
    actId = paramObj.actId;
  } catch (e) {}

  if (sign) {
    $persistentStore.write(sign, "MI_SIGN");
  }

  if (actId) {
    $persistentStore.write(actId, "MI_ACT_ID");
  }

  if (sign && actId) {
    $notification.post(
      "🛒 小米商城参数获取成功",
      "",
      `actId: ${actId}\nsign: ${sign}`
    );
  } else {
    $notification.post(
      "🛒 小米商城参数获取不完整",
      "",
      `actId: ${actId || "❌"}\nsign: ${sign || "❌"}`
    );
  }

} catch (e) {
  console.log("❌ JSON 解析失败", e);
}

$done();
