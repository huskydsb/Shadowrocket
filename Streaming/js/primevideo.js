let url = "https://www.primevideo.com/";
let headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 PrimeVideo/1.0"
};

// 发起 HTTP 请求
$httpClient.get({ url: url, headers: headers }, function (error, response, body) {
    let result = {}; // 用于存储返回的结果
    console.log("[LOG] Request started...");

    if (error) {
        // 网络连接失败
        result.message = "Amazon Prime Video:网络连接失败";
        console.log(`[LOG] Prime Video 检测结果 - ${result.message}`);
        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
    } else if (body) {
        // 检测解锁状态
        console.log("[LOG] Prime Video 响应体获取成功");

        let isBlocked = body.includes("isServiceRestricted");
        let regionMatch = body.match(/"currentTerritory":"(.*?)"/);

        if (isBlocked) {
            // 无法访问服务
            result.message = "Amazon Prime Video:未解锁 ❌ (服务不可用)";
            console.log(`[LOG] Prime Video 检测结果 - ${result.message}`);
            $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
        } else if (regionMatch && regionMatch[1]) {
            // 检测到地区信息
            let region = regionMatch[1];
            result.message = `Amazon Prime Video:解锁 ✅ (地区: ${region})`;
            console.log(`[LOG] Prime Video 检测结果 - ${result.message}`);
            $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
        } else {
            // 未知错误
            result.message = "Amazon Prime Video:检测失败，未知状态";
            console.log(`[LOG] Prime Video 检测结果 - ${result.message}`);
            $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
        }
    } else {
        // 请求失败
        result.message = "Amazon Prime Video:检测失败，无法获取响应";
        console.log(`[LOG] Prime Video 检测结果 - ${result.message}`);
        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
    }
});