/*
📌 小米商城 actId / sign 获取脚本（http-response）
目标：递归查找 query_list 中 resolver 为 "infinite-task" 的 actId 和 sign
并保存到持久化存储 MI_ACT_ID / MI_SIGN，同时打印完整响应体
*/

const url = $request.url;
const body = $response.body;

if (!url.includes("/mtop/navi/venue/page") && !url.includes("/mtop/navi/venue/batch")) {
    $done();
}

try {
    const data = JSON.parse(body);
    console.log("✅ 接口返回解析成功");

    // 打印完整响应体（调试用）
    console.log("📝 响应体完整 JSON：", JSON.stringify(data, null, 2));

    // 递归查找 query_list
    const findInfiniteTask = (obj) => {
        if (!obj || typeof obj !== "object") return null;

        if (Array.isArray(obj.query_list)) {
            for (const q of obj.query_list) {
                if (q.resolver === "infinite-task" && q.sign && q.parameter) {
                    return q;
                }
            }
        }

        for (const k in obj) {
            const res = findInfiniteTask(obj[k]);
            if (res) return res;
        }

        return null;
    };

    const taskQuery = findInfiniteTask(data);

    if (taskQuery) {
        const actId = JSON.parse(taskQuery.parameter).actId;
        const sign = taskQuery.sign;

        $persistentStore.write(actId, "MI_ACT_ID");
        $persistentStore.write(sign, "MI_SIGN");

        console.log("✅ 找到 infinite-task actId & sign");
        console.log("➡️ actId:", actId);
        console.log("➡️ sign:", sign);

        $notification.post("🛒 小米商城参数获取成功", "", `actId: ${actId}\nsign: ${sign}`);
    } else {
        console.log("❌ 未找到 infinite-task query_list");
    }
} catch (e) {
    console.log("❌ 解析异常:", e);
    $notification.post("🛒 小米商城参数获取异常", "", String(e));
}

$done();
