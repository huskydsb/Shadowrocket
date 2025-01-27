function handleError(message, error = null) {
    console.error(`[${new Date().toLocaleString()}] 🛑 错误处理:`, message, error || "");
    $notification.post("错误", "操作失败", message);
    $done({ response: { status: 200, body: JSON.stringify({ message }) } });
}

const headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1",
    "Upgrade-Insecure-Requests": "1",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh-Hans;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive"
};

var ipApiParams = {
    url: "http://ip-api.com/json/",
    timeout: 5000,
    headers: headers,
};

function fetchIpInfo() {
    console.log(`[${new Date().toLocaleString()}] 📝 开始获取IP信息...`);

    $httpClient.get(ipApiParams, function (error, response, data) {
        if (error || !data || data.trim() === "") {
            return handleError("获取IP信息失败，请检查接口或网络状态。", error);
        }

        console.log(`[${new Date().toLocaleString()}] ✅ 成功获取IP信息:`, data);

        let ipInfo;
        try {
            ipInfo = JSON.parse(data);
            console.log(`[${new Date().toLocaleString()}] ✅ 解析IP信息成功:`, ipInfo);
        } catch (e) {
            return handleError("解析IP信息JSON时出错:", e);
        }

        if (ipInfo.status === "success") {
            let ipValue = ipInfo.query;
            let city = ipInfo.city || "N/A";
            let country = ipInfo.country || "N/A";
            let isp = ipInfo.isp || "N/A";
            let org = ipInfo.org || "N/A";
            let as = ipInfo.as || "N/A";

            console.log(`[${new Date().toLocaleString()}] 🌍 IP地址: ${ipValue}, 城市: ${city}, 国家: ${country}, ISP: ${isp}, 组织: ${org}, ASN: ${as}`);

            var requestParams = {
                url: `https://scamalytics.com/search?ip=${ipValue}`,
                timeout: 5000,
                headers: headers,
            };

            console.log(`[${new Date().toLocaleString()}] 📝 开始请求Scamalytics IP详情...`);

            $httpClient.get(requestParams, function (error, response, data) {
                if (error) {
                    return handleError("获取Scamalytics IP详情时出错:", error);
                }

                if (!data || data.trim() === "") {
                    return handleError("Scamalytics返回内容为空，请检查接口是否有效。");
                }

                console.log(`[${new Date().toLocaleString()}] ✅ 成功获取Scamalytics IP详情:`, data);

                let preRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/;
                let preMatch = data.match(preRegex);
                let preContent = preMatch ? preMatch[1] : null;

                let score = "N/A";
                let risk = "N/A";
                if (preContent) {
                    console.log(`[${new Date().toLocaleString()}] 🔍 提取到<pre>标签内容:`, preContent);

                    let jsonRegex = /({[\s\S]*?})/;
                    let jsonMatch = preContent.match(jsonRegex);

                    if (jsonMatch) {
                        let jsonData = jsonMatch[1];
                        console.log(`[${new Date().toLocaleString()}] 🔍 提取到JSON数据:`, jsonData);

                        try {
                            let parsedData = JSON.parse(jsonData);
                            score = parsedData.score || "N/A";
                            risk = parsedData.risk || "N/A";
                            console.log(`[${new Date().toLocaleString()}] ✅ 解析Scamalytics JSON成功:`, parsedData);
                        } catch (e) {
                            console.error(`[${new Date().toLocaleString()}] 🛑 解析Scamalytics JSON时出错:`, e);
                        }
                    }
                }

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

                console.log(`[${new Date().toLocaleString()}] 🔍 风险等级: ${riskemoji} ${riskDescription}, 欺诈分数: ${score}`);

                let scamInfo = {
                    message: `IP欺诈评分查询结果：<br>IP地址: ${ipValue}<br>IP城市: ${city}<br>IP国家: ${country}<br>IP欺诈分数: ${score}<br>IP风险等级: ${riskemoji} ${riskDescription}<br>ISP: ${isp}<br>组织: ${org}<br>ASN: ${as}`
                };

                console.log(`[${new Date().toLocaleString()}] ✅ 最终结果:`);
                console.log(`
                    IP欺诈评分查询结果：
                    IP地址: ${ipValue}
                    IP城市: ${city}
                    IP国家: ${country}
                    IP欺诈分数: ${score}
                    IP风险等级: ${riskemoji} ${riskDescription}
                    ISP: ${isp}
                    组织: ${org}
                    ASN: ${as}
                `);

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
    });
}

fetchIpInfo();