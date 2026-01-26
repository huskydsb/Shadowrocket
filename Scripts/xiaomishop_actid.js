/*
📌 小米商城 actId 获取脚本（http-response）
来源接口：
/mtop/mf/usercenter/personalHome
*/

const url = $request.url;
const body = $response.body;

if (!url.includes("/mtop/mf/usercenter/personalHome") || !body) {
  $done();
}

try {
  const data = JSON.parse(body);

  // 深度递归查找 actId
  const findActId = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    if (obj.actId) return obj.actId;
    for (const k in obj) {
      const r = findActId(obj[k]);
      if (r) return r;
    }
    return null;
  };

  const actId = findActId(data);

  if (actId) {
    $persistentStore.write(actId, "MI_ACT_ID");
    $notification.post(
      "🛒 小米商城 actId 获取成功",
      "",
      actId
    );
  }
} catch (e) {}

$done();
