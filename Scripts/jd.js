/*************************
 * 京东签到（signBeanAct）
 * 功能：
 * 1. 从持久化存储读取 JD_COOKIE
 * 2. 伪装 App 发起请求
 * 3. 解析 JSONP 响应并判断签到结果
 * 4. 根据签到结果推送通知
 *************************/

//==================== 读取 JD_COOKIE ====================
console.log("📦 [1] 开始从持久化存储读取 JD_COOKIE...");

const JD_COOKIE = $persistentStore.read("JD_COOKIE");

if (!JD_COOKIE) {
    console.log("❌ 错误：未找到持久化存储中的 JD_COOKIE，无法执行签到。");
    $notification.post("京东京豆签到", "签到结果", "未找到 JD_COOKIE，无法执行签到。");
    $done({ error: "NO_COOKIE" });
} else {
    console.log("✅ 成功读取 JD_COOKIE：", JD_COOKIE.substring(0, 20) + "...");
}


//==================== 请求参数与头信息组装 ====================
console.log("📡 [2] 开始构造请求参数...");

const url = "https://api.m.jd.com/client.action";
const headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_8_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "Content-Type": "application/x-www-form-urlencoded",
    "Cookie": JD_COOKIE
};

const bodyObj = {
    fp: "-1",
    shshshfp: "-1",
    shshshfpa: "-1",
    referUrl: "-1",
    userAgent: "-1",
    jda: "-1",
    rnVersion: "3.9"
};

const ts = Date.now();
const params = {
    functionId: "signBeanAct",
    body: JSON.stringify(bodyObj),
    appid: "ld",
    client: "apple",
    clientVersion: "10.0.4",
    networkType: "wifi",
    osVersion: "14.8.1",
    uuid: String(ts),
    openudid: String(ts),
    jsonp: `jsonp_${ts}_58482`,
};

// x-www-urlencoded 编码
const postBody = Object.keys(params)
    .map(k => `${k}=${encodeURIComponent(params[k])}`)
    .join("&");

console.log("📄 请求头 headers：", JSON.stringify(headers, null, 2));
console.log("📄 请求 body（x-www-urlencoded）：", postBody);


//==================== JSONP 解析函数 ====================
function parse_jsonp(text) {
    console.log("🔍 [解析 JSONP] 开始解析响应...");
    try {
        const start = text.indexOf("(") + 1;
        const end = text.lastIndexOf(")");
        const jsonStr = text.slice(start, end);
        console.log("✅ [解析 JSONP] 提取 JSON 字符串成功！");
        return JSON.parse(jsonStr);
    } catch (err) {
        console.log("❌ [解析 JSONP] 解析失败，错误信息：", err);
        return null;
    }
}

//==================== 发起京东请求 ====================
console.log("🔔 [3] 开始执行京东签到请求...");

$httpClient.post(
    {
        url: url,
        headers: headers,
        body: postBody
    },
    (error, response, data) => {
        console.log("📨 [3] 响应接收到...");
        if (error || !data) {
            console.log("❌ 请求失败：", error);
            $notification.post("京东京豆签到", "签到结果", "请求失败，无法获取服务器响应");
            return $done({ error: "NO_RESPONSE" });
        }

        console.log("📋 [3] 原始返回数据：", data.substring(0, 200) + "...");
        const json = parse_jsonp(data);

        if (!json) {
            console.log("❌ [3] 无法解析 JSONP 响应！");
            console.log("返回内容：", data);
            $notification.post("京东京豆签到", "签到结果", "无法解析服务器响应");
            return $done({ error: "PARSE_FAILED" });
        }

        console.log("📦 [3] 解析后的 JSON 数据：", JSON.stringify(json, null, 2));

        const code = String(json.code || "");

//==================== 签到结果处理 ====================

        // 签到成功
        if (code === "0") {
            console.log("✅ [4] 签到成功！");

            let message = "签到成功";
            try {
                const award = json.data?.dailyAward?.beanAward?.beanCount || "0";

                if (award === "0") {
                    message = "签到成功";
                    console.log("🎁 [4] 今日获得京豆：0，输出 '签到成功'");
                } else {
                    message = `🎉 获得京豆：${award}`;
                    console.log("🎁 [4] 奖励信息：", message);
                }
            } catch (e) {
                message = "🎉 签到成功（奖励解析失败）";
                console.log("❌ [4] 奖励解析失败，输出 '签到成功（奖励解析失败）'");
            }

            $notification.post("京东京豆签到", "签到结果", message);
            console.log("------ Script done -------");
            return $done();
        }

        // Cookie 失效
        if (code === "3") {
            console.log("❌ [4] Cookie 已失效（pt_key 过期）");
            $notification.post("京东京豆签到", "签到结果", "Cookie 已失效，请重新获取 JD_COOKIE");
            console.log("------ Script done -------");
            return $done({ error: "COOKIE_INVALID" });
        }

        // 今日已签到
        if (data.includes("已签到")) {
            console.log("ℹ️ [4] 今日已签到，无需重复");
            $notification.post("京东京豆签到", "签到结果", "今日已签到，无需重复");
            console.log("------ Script done -------");
            return $done();
        }

        // 其他失败
        const msg = json.errorMessage || "未知错误";
        console.log("⚠️ [4] 签到失败：", msg);
        console.log("🧾 [4] 完整返回数据：", data);
        $notification.post("京东京豆签到", "签到结果", `签到失败：${msg}`);
        console.log("------ Script done -------");
        return $done({ error: "SIGN_FAILED" });
    }
);
