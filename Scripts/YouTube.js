// 定义通知和日志函数
function notify(title, message) {
    $notification.post(title, "", message);
}

function log(message) {
    console.log(message);
}

// 重试请求的函数
function retryRequest(options, callback, attempts = 3) {
    $httpClient.get(options, function (error, response, data) {
        if (error) {
            if (attempts > 1) {
                log(`Retrying... Attempts left: ${attempts - 1}`);
                return retryRequest(options, callback, attempts - 1);
            }
            callback(error);
            return;
        }
        callback(null, response, data);
    });
}

// YouTube Premium 检测函数
function MediaUnlockTest_YouTube_Premium() {
    let options = {
        url: 'https://www.youtube.com/premium',
        headers: {
            'accept-language': 'en-US,en;q=0.9',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1'
        },
        timeout: 10000
    };

    retryRequest(options, function (error, response, data) {
        if (error) {
            log("YouTube Premium: Failed (Network Connection)");
            notify("YouTube Premium Status", "Failed (Network Connection)");
            $done(); // 结束执行
            return;
        }

        let isCN = data.includes('www.google.cn');
        if (isCN) {
            log("YouTube Premium: No (Region: CN)");
            notify("YouTube Premium Status", "No (Region: CN)");
            $done(); // 结束执行
            return;
        }

        let isNotAvailable = data.match(/Premium is not available in your country/i);
        let region = data.match(/"INNERTUBE_CONTEXT_GL"\s*:\s*"([^"]+)"/);
        let isAvailable = data.match(/ad-free/i);

        if (isNotAvailable) {
            log("YouTube Premium: No");
            notify("YouTube Premium Status", "No");
            $done(); // 结束执行
            return;
        }

        region = region ? region[1] : 'UNKNOWN';

        if (isAvailable) {
            log(`YouTube Premium: Yes (Region: ${region})`);
            notify("YouTube Premium Status", `Yes (Region: ${region})`);
        } else {
            log("YouTube Premium: Failed (Error: PAGE ERROR)");
            notify("YouTube Premium Status", "Failed (Error: PAGE ERROR)");
        }
        $done(); // 结束执行
    });
}

// YouTube CDN 检测函数
function RegionTest_YouTubeCDN() {
    let options = {
        url: 'https://redirector.googlevideo.com/report_mapping',
        headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1'
        },
        timeout: 10000
    };

    retryRequest(options, function (error, response, data) {
        if (error) {
            log("YouTube CDN: Failed (Network Connection)");
            notify("YouTube CDN Status", "Failed (Network Connection)");
            $done(); // 结束执行
            return;
        }

        // 获取响应数据中"Debug Info:"之前的内容
        let output = data.split('Debug Info:')[0].trim();

        if (output.length === 0) {
            log("YouTube CDN: Failed (No valid data found before 'Debug Info:')");
            notify("YouTube CDN Status", "Failed (No valid data found before 'Debug Info:')");
            $done(); // 结束执行
            return;
        }

        // 提取"lax"部分
        let match = output.match(/=>\s*([a-z]{3})/i); // 匹配 "=> lax" 部分
        let location = match ? match[1] : "Unknown";

        log(`YouTube CDN Response Data:\n${location}`);
        notify("YouTube CDN Response", location);
        $done(); // 结束执行
    });
}

// 执行测试
MediaUnlockTest_YouTube_Premium();
RegionTest_YouTubeCDN();
