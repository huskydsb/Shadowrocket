let url = "https://www.max.com/";
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
        result.message = "HBO Max: 网络连接失败";
        console.log(`[LOG] 错误: ${error}`);
        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
    } else if (response.status === 200 && body) {
        // 检测解锁状态
        console.log("[LOG] HBO Max 响应体获取成功");

        // 获取 Cookie 中的 countryCode 信息
        let countryCode = response.headers["Set-Cookie"] ? response.headers["Set-Cookie"].match(/countryCode=([A-Z]{2})/) : null;
        if (countryCode) {
            let region = countryCode[1];
            console.log(`[LOG] 获取的地区信息: ${region}`);

            // 判断是否解锁
            let unlockedRegions = [
                "HK", "ID", "MY", "PH", "SG", "TW", "TH",  // 亚太地区
                "AX", "AD", "BA", "BG", "IC", "HR", "CZ", "DK", "FO", "FI", "FR", "GL", "HU", "PT", "MO", "ME", "MK", "NO", "PL", "RO", "RS", "SK", "SI", "ES", "SJ", "SE", // 欧洲
                "BE", "NL", // 比利时和荷兰
                "AR", "BZ", "BO", "BR", "CL", "CO", "CR", "EC", "SV", "GT", "GY", "HN", "MX", "NI", "PA", "PY", "PE", "SR", "UY", "VE", // 拉丁美洲
                "AI", "AG", "AW", "BS", "BB", "VG", "KY", "CW", "DM", "DO", "GD", "HT", "JM", "MS", "KN", "LC", "VC", "TT", "TC", // 加勒比地区
                "US" // 美国
            ];

            if (unlockedRegions.includes(region)) {
                // 如果地区在解锁列表中
                result.message = `HBO Max: 解锁 ✅ (地区: ${region})`;
                console.log(`[LOG] HBO Max 检测结果 - ${result.message}`);
            } else {
                // 如果地区不在解锁列表中
                result.message = `HBO Max: 未解锁 ❌ (地区: ${region})`;
                console.log(`[LOG] HBO Max 检测结果 - ${result.message}`);
            }
        } else {
            // 未找到地区信息
            result.message = "HBO Max: 未解锁 ❌ (地区信息缺失)";
            console.log(`[LOG] HBO Max 检测结果 - ${result.message}`);
        }

        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
    } else {
        // 请求失败，输出状态码
        result.message = `HBO Max: 请求失败，状态码: ${response.status}`;
        console.log(`[LOG] 错误: 状态码 - ${response.status}`);
        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
    }
});