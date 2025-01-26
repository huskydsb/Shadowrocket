let url = "https://www.bing.com/search?q=curl";
let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
};

// 发起 HTTP 请求
$httpClient.get({ url: url, headers: headers }, function (error, response, body) {
    let result = {}; // 用于存储返回的结果
    console.log("[LOG] Request started...");

    if (error) {
        // 网络连接失败
        result.message = "Bing Region: 网络连接失败";
        console.log(`[LOG] 错误: ${error}`);
        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
        return;
    }

    if (response.status !== 200) {
        // 请求失败，输出状态码
        result.message = `Bing Region: 请求失败，状态码: ${response.status}`;
        console.log(`[LOG] 错误: 状态码 - ${response.status}`);
        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
        return;
    }

    // 响应成功，开始分析响应体
    console.log("[LOG] Bing 响应体获取成功");

    let region = "Unknown";

    // 查找是否为中国的 Bing
    let isCN = body.includes('cn.bing.com');
    if (isCN) {
        region = "CN";
        console.log("[LOG] 区域：CN");
    } else {
        // 查找区域信息
        let regionMatch = body.match(/Region\s*:\s*"([^"]+)"/);
        if (regionMatch && regionMatch[1]) {
            region = regionMatch[1];
            console.log(`[LOG] 区域：${region}`);
        }
    }

    // 查找是否为有风险的状态
    let isRisky = body.includes('sj_cook.set("SRCHHPGUSR","HV"');
    if (isRisky) {
        result.message = `Bing Region: ${region} (Risky)`;
        console.log(`[LOG] Bing 检测结果 - ${region} (Risky)`);
    } else {
        result.message = `Bing Region: ${region}`;
        console.log(`[LOG] Bing 检测结果 - ${region}`);
    }

    $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
});