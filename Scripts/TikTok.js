// TikTok 解锁检测脚本 with 日志 & 通知
// 运行模式: 快捷指令

// 配置检测参数
let url = "https://www.tiktok.com/";
let headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 TikTok/21.3.0"
};

// 发起 HTTP 请求
$httpClient.get({ url: url, headers: headers }, function (error, response, body) {
    if (error) {
        // 网络连接失败
        let title = "TikTok 检测结果";
        let message = "网络连接失败";
        console.log(`[LOG] ${title} - ${message}`);
        $notification.post(title, message, "请检查网络设置");
        $done({ title: title, content: message, icon: "wifi.exclamationmark" });
    } else if (body) {
        // 检测解锁状态
        console.log("[LOG] TikTok 响应体获取成功");

        if (body.includes('region')) {
            let region = body.match(/"region":"(.*?)"/);
            if (region && region[1]) {
                // 检测到地区信息
                let regionCode = region[1];
                let title = "TikTok 检测结果";
                let message = `解锁 ✅ (地区: ${regionCode})`;
                console.log(`[LOG] ${title} - ${message}`);
                $notification.post(title, message, "可以观看 TikTok");
                $done({
                    title: "TikTok 检测结果",
                    content: message,
                    icon: "checkmark.seal.fill",
                    "icon-color": "#00FF00"
                });
            } else if (body.includes("The #TikTokTraditions") || body.includes("This LIVE isn't available")) {
                // 无法解锁
                let title = "TikTok 检测结果";
                let message = "未解锁 ❌";
                console.log(`[LOG] ${title} - ${message}`);
                $notification.post(title, message, "当前地区无法观看 TikTok");
                $done({
                    title: "TikTok 检测结果",
                    content: message,
                    icon: "xmark.seal.fill",
                    "icon-color": "#FF0000"
                });
            } else {
                // 其他未知状态
                let title = "TikTok 检测结果";
                let message = "检测失败，未知状态";
                console.log(`[LOG] ${title} - ${message}`);
                $notification.post(title, message, "请检查配置");
                $done({
                    title: "TikTok 检测结果",
                    content: message,
                    icon: "questionmark.circle",
                    "icon-color": "#FFA500"
                });
            }
        } else {
            // 无法提取地区信息
            let title = "TikTok 检测结果";
            let message = "未解锁 ❌ (地区信息缺失)";
            console.log(`[LOG] ${title} - ${message}`);
            $notification.post(title, message, "请检查网络或代理设置");
            $done({
                title: "TikTok 检测结果",
                content: message,
                icon: "xmark.seal.fill",
                "icon-color": "#FF0000"
            });
        }
    } else {
        // 请求失败
        let title = "TikTok 检测结果";
        let message = "检测失败，无法获取响应";
        console.log(`[LOG] ${title} - ${message}`);
        $notification.post(title, message, "请检查网络或代理设置");
        $done({
            title: "TikTok 检测结果",
            content: message,
            icon: "exclamationmark.triangle",
            "icon-color": "#FFA500"
        });
    }
});