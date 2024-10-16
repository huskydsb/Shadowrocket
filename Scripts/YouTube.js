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

// YouTube 检测结果
let youTubePremiumStatus = "未知";
let youTubeCDNStatus = "未知";

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
            youTubePremiumStatus = "Failed (Network Connection)";
            checkDone();
            return;
        }

        let isCN = data.includes('www.google.cn');
        if (isCN) {
            log("YouTube Premium: No (Region: CN)");
            youTubePremiumStatus = "No (Region: CN)";
            checkDone();
            return;
        }

        let isNotAvailable = data.match(/Premium is not available in your country/i);
        let region = data.match(/"INNERTUBE_CONTEXT_GL"\s*:\s*"([^"]+)"/);
        let isAvailable = data.match(/ad-free/i);

        if (isNotAvailable) {
            log("YouTube Premium: No");
            youTubePremiumStatus = "No";
            checkDone();
            return;
        }

        region = region ? region[1] : 'UNKNOWN';

        if (isAvailable) {
            log(`YouTube Premium: Yes (Region: ${region})`);
            youTubePremiumStatus = `Yes (Region: ${region})`;
        } else {
            log("YouTube Premium: Failed (Error: PAGE ERROR)");
            youTubePremiumStatus = "Failed (Error: PAGE ERROR)";
        }

        checkDone();
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
            youTubeCDNStatus = "Failed (Network Connection)";
            checkDone();
            return;
        }

        // 获取响应数据中"Debug Info:"之前的内容
        let output = data.split('Debug Info:')[0].trim();

        if (output.length === 0) {
            log("YouTube CDN: Failed (No valid data found before 'Debug Info:')");
            youTubeCDNStatus = "Failed (No valid data found before 'Debug Info:')";
            checkDone();
            return;
        }

        // 提取"lax"部分
        let match = output.match(/=>\s*([a-z]{3})/i); // 匹配 "=> lax" 部分
        let location = match ? match[1] : "Unknown";

        log(`YouTube CDN Response Data:\n${location}`);
        youTubeCDNStatus = `CDN Location: ${location}`;

        checkDone();
    });
}

// 用于跟踪请求完成的次数
let completedRequests = 0;

// 检查是否所有请求都已完成
function checkDone() {
    completedRequests++;
    if (completedRequests === 2) {
        // 合并通知内容
        let message = `YouTube CDN： ${youTubeCDNStatus}\nYouTube Premium： ${youTubePremiumStatus}`;
        notify("YouTube 检测", message); // 发送合并的通知
        $done(); // 结束执行
    }
}

// 执行测试
MediaUnlockTest_YouTube_Premium();
RegionTest_YouTubeCDN();
