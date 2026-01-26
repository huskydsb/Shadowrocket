/*
🛒 小米商城 actId / sign 获取脚本（http-response）
作用：从 /mtop/navi/venue/page 响应体中提取 sign 和 actId 并持久化
*/

const url = $request.url;
const body = $response.body;

if (!url.includes("/mtop/navi/venue/page") || !body) {
    $done();
}

try {
    const data = JSON.parse(body);

    // 查找 query_list 中 resolver = "infinite-task"
    let query = data?.data?.floors?.flatMap(f => f.query_list || [])?.find(q => q.resolver === "infinite-task");

    if (!query) {
        console.log("❌ 未找到 infinite-task query_list");
        $done();
    }

    const actId = JSON.parse(query.parameter).actId;
    const sign = query.sign;

    if (actId && sign) {
        $persistentStore.write(actId, "MI_ACT_ID");
        $persistentStore.write(sign, "MI_SIGN");
        $notification.post("🛒 小米商城 actId / sign 获取成功", "", `actId: ${actId}\nsign: ${sign}`);
        console.log("✅ actId:", actId, "sign:", sign);
    } else {
        console.log("❌ actId 或 sign 获取失败");
    }
} catch(e) {
    console.log("❌ 解析异常:", e);
}

$done();
