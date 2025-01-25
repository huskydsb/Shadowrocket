let url = "https://www.tiktok.com/";
let headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 TikTok/21.3.0"
};

// 发起 HTTP 请求
$httpClient.get({ url: url, headers: headers }, function (error, response, body) {
    let result = {}; // 用于存储返回的结果

    if (error) {
        // 网络连接失败
        result.message = "TikTok:网络连接失败";
        console.log(`[LOG] TikTok 检测结果 - ${result.message}`);
        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
    } else if (body) {
        // 检测解锁状态
        console.log("[LOG] TikTok 响应体获取成功");

        if (body.includes('region')) {
            let region = body.match(/"region":"(.*?)"/);
            if (region && region[1]) {
                // 检测到地区信息
                let regionCode = region[1];
                result.message = `TikTok:解锁 ✅ (地区: ${regionCode})`;
                console.log(`[LOG] TikTok 检测结果 - ${result.message}`);
                $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
            } else if (body.includes("The #TikTokTraditions") || body.includes("This LIVE isn't available")) {
                // 无法解锁
                result.message = "TikTok:未解锁 ❌";
                console.log(`[LOG] TikTok 检测结果 - ${result.message}`);
                $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
            } else {
                // 其他未知状态
                result.message = "TikTok:检测失败，未知状态";
                console.log(`[LOG] TikTok 检测结果 - ${result.message}`);
                $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
            }
        } else {
            // 无法提取地区信息
            result.message = "TikTok:未解锁 ❌ (地区信息缺失)";
            console.log(`[LOG] TikTok 检测结果 - ${result.message}`);
            $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
        }
    } else {
        // 请求失败
        result.message = "TikTok:检测失败，无法获取响应";
        console.log(`[LOG] TikTok 检测结果 - ${result.message}`);
        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
    }
});