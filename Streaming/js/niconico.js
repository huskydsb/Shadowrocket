let url = "https://www.nicovideo.jp/watch/so23017073";
let liveUrl = "https://live.nicovideo.jp/?cmnhd_ref=device=pc&site=nicolive&pos=header_servicelink&ref=WatchPage-Anchor";
let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
    "sec-ch-ua": "Some-UA", // Adjust according to your original value
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "Windows",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1"
};

// 发起 HTTP 请求以获取视频页面
$httpClient.get({ url: url, headers: headers }, function (error, response, body) {
    let result = {}; // 用于存储返回的结果
    console.log("[LOG] Request started...");

    if (error) {
        result.message = "Niconico: 网络连接失败";
        console.log(`[LOG] 错误: ${error}`);
        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
        return;
    }

    // 获取直播网页
    $httpClient.get({ url: liveUrl, headers: headers }, function (error2, response2, body2) {
        if (error2) {
            result.message = "Niconico: 网络连接失败 (Live Page)";
            console.log(`[LOG] 错误: ${error2}`);
            $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
            return;
        }

        // 从直播网页中提取第一个官方直播ID
        let liveID = body2.match(/&quot;id&quot;:&quot;(lv[0-9]+)/);
        if (!liveID) {
            result.message = "Niconico: 获取直播ID失败";
            console.log(`[LOG] 错误: 无法找到直播ID`);
            $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
            return;
        }

        // 访问获取的直播ID页面
        $httpClient.get({ url: `https://live.nicovideo.jp/watch/${liveID[1]}`, headers: headers }, function (error3, response3, body3) {
            if (error3) {
                result.message = "Niconico: 网络连接失败 (LiveID Page)";
                console.log(`[LOG] 错误: ${error3}`);
                $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
                return;
            }

            let isBlocked = body.match(/同じ地域/);
            let isJapanOnly = body3.match(/notAllowedCountry/);

            if (!isBlocked && !isJapanOnly) {
                result.message = `Niconico: 解锁 ✅ (LiveID: ${liveID[1]})`;
                console.log(`[LOG] Niconico 解锁成功`);
            } else if (isBlocked) {
                result.message = "Niconico: 未解锁 ❌ (地区限制)";
                console.log(`[LOG] Niconico 被地区限制`);
            } else if (isJapanOnly) {
                result.message = `Niconico: 未解锁 ❌ (仅限日本) (LiveID: ${liveID[1]})`;
                console.log(`[LOG] Niconico 仅限日本`);
            } else {
                result.message = "Niconico: 未解锁 ❌ (未知原因)";
                console.log(`[LOG] Niconico 未解锁 (未知原因)`);
            }

            $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
        });
    });
});