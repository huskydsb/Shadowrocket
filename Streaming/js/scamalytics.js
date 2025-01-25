// 通用错误处理函数
function handleError(message, error = null) {
    console.error(message, error || "");
    $notification.post("错误", "操作失败", message);
    $done({ response: { status: 200, body: JSON.stringify({ message }) } });
}

// 设置请求头
const headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1",
    "Upgrade-Insecure-Requests": "1",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh-Hans;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive"
};

// 获取外部 IP 地址信息
var ipApiParams = {
    url: "http://ip-api.com/json/",
    timeout: 5000, // 增加超时时间
    headers: headers,
};

// 并行发起三个请求来提高访问速度
function fetchIpInfo() {
    let retryCount = 0;
    const maxRetries = 3;

    // 封装请求以便重试
    function attemptFetch() {
        return new Promise((resolve, reject) => {
            $httpClient.get(ipApiParams, function (error, response, data) {
                if (error || !data || data.trim() === "") {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        console.log(`获取IP信息失败，正在第${retryCount}次重试...`);
                        resolve(attemptFetch()); // 递归调用重试
                    } else {
                        reject("获取IP信息失败，已重试3次。");
                    }
                } else {
                    resolve(data);
                }
            });
        });
    }

    // 尝试获取IP信息
    Promise.all([attemptFetch(), attemptFetch(), attemptFetch()])
        .then(results => {
            const data = results[0]; // 只取第一个成功的请求结果
            let ipInfo;
            try {
                ipInfo = JSON.parse(data);
            } catch (e) {
                return handleError("解析IP信息JSON时出错:", e);
            }

            if (ipInfo.status === "success") {
                let ipValue = ipInfo.query; // 获取查询的 IP 地址
                let city = ipInfo.city || "N/A";
                let country = ipInfo.country || "N/A";
                let isp = ipInfo.isp || "N/A";
                let org = ipInfo.org || "N/A";
                let as = ipInfo.as || "N/A";

                // 请求Scamalytics
                var requestParams = {
                    url: `https://scamalytics.com/search?ip=${ipValue}`,
                    timeout: 5000,
                    headers: headers,
                };

                // 第二步：使用获取到的 IP 进行请求
                $httpClient.get(requestParams, function (error, response, data) {
                    if (error) {
                        return handleError("获取Scamalytics IP详情时出错:", error);
                    }

                    if (!data || data.trim() === "") {
                        return handleError("Scamalytics返回内容为空，请检查接口是否有效。");
                    }

                    // 使用正则表达式提取 <pre> 标签中的内容
                    let preRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/;
                    let preMatch = data.match(preRegex);
                    let preContent = preMatch ? preMatch[1] : null;

                    let score = "N/A";
                    let risk = "N/A";
                    if (preContent) {
                        // 使用正则提取 JSON 字符串
                        let jsonRegex = /({[\s\S]*?})/;
                        let jsonMatch = preContent.match(jsonRegex);

                        if (jsonMatch) {
                            let jsonData = jsonMatch[1];

                            // 尝试解析 JSON 数据
                            try {
                                let parsedData = JSON.parse(jsonData);
                                score = parsedData.score || "N/A";
                                risk = parsedData.risk || "N/A";
                            } catch (e) {
                                console.error("解析Scamalytics JSON时出错:", e);
                            }
                        }
                    }

                    // 风险等级
                    var riskemoji, riskDescription;
                    switch (risk) {
                        case "very high":
                            riskemoji = "🔴";
                            riskDescription = "非常高风险";
                            break;
                        case "high":
                            riskemoji = "🟠";
                            riskDescription = "高风险";
                            break;
                        case "medium":
                            riskemoji = "🟡";
                            riskDescription = "中等风险";
                            break;
                        case "low":
                            riskemoji = "🟢";
                            riskDescription = "低风险";
                            break;
                        default:
                            riskemoji = "⚪";
                            riskDescription = "未知风险";
                            break;
                    }

                    // 组织最终结果，使用 <br> 进行换行
                    let scamInfo = {
                        message: `IP欺诈评分查询结果：<br>IP地址: ${ipValue}<br>IP城市: ${city}<br>IP国家: ${country}<br>IP欺诈分数: ${score}<br>IP风险等级: ${risk}<br>ISP: ${isp}<br>组织: ${org}<br>ASN: ${as}`,
                        ip: ipValue,
                        score: score,
                        risk: risk,
                        city: city,
                        country: country,
                        isp: isp,
                        org: org,
                        as: as,
                        risk_emoji: riskemoji,
                        risk_description: riskDescription
                    };

                    // 返回 JSON 格式的结果给前端
                    $done({
                        response: {
                            status: 200,
                            body: JSON.stringify(scamInfo),
                            headers: { "Content-Type": "application/json" }
                        }
                    });
                });
            } else {
                return handleError("IP信息获取失败，请检查接口或网络状态。");
            }
        })
        .catch(error => {
            return handleError(error);
        });
}

// 启动IP信息查询
fetchIpInfo();