const NF_BASE_URL = "https://www.netflix.com/title/80211492"; // 请求的 Netflix 内容链接
let result = {}; // 用于存储检测结果的对象
const flags = new Map([
    ["AC", "🇦🇨"], ["AE", "🇦🇪"], ["AF", "🇦🇫"], ["AI", "🇦🇮"],
    ["AL", "🇦🇱"], ["AM", "🇦🇲"], ["AQ", "🇦🇶"], ["AR", "🇦🇷"],
    ["AS", "🇦🇸"], ["AT", "🇦🇹"], ["AU", "🇦🇺"], ["AW", "🇦🇼"],
    ["AX", "🇦🇽"], ["AZ", "🇦🇿"], ["BA", "🇧🇦"], ["BB", "🇧🇧"],
    ["BD", "🇧🇩"], ["BE", "🇧🇪"], ["BF", "🇧🇫"], ["BG", "🇧🇬"],
    ["BH", "🇧🇭"], ["BI", "🇧🇮"], ["BJ", "🇧🇯"], ["BM", "🇧🇲"],
    ["BN", "🇧🇳"], ["BO", "🇧🇴"], ["BR", "🇧🇷"], ["BS", "🇧🇸"],
    ["BT", "🇧🇹"], ["BV", "🇧🇻"], ["BW", "🇧🇼"], ["BY", "🇧🇾"],
    ["BZ", "🇧🇿"], ["CA", "🇨🇦"], ["CF", "🇨🇫"], ["CH", "🇨🇭"],
    ["CK", "🇨🇰"], ["CL", "🇨🇱"], ["CM", "🇨🇲"], ["CN", "🇨🇳"],
    ["CO", "🇨🇴"], ["CP", "🇨🇵"], ["CR", "🇨🇷"], ["CU", "🇨🇺"],
    ["CV", "🇨🇻"], ["CW", "🇨🇼"], ["CX", "🇨🇽"], ["CY", "🇨🇾"],
    ["CZ", "🇨🇿"], ["DE", "🇩🇪"], ["DG", "🇩🇬"], ["DJ", "🇩🇯"],
    ["DK", "🇩🇰"], ["DM", "🇩🇲"], ["DO", "🇩🇴"], ["DZ", "🇩🇿"],
    ["EA", "🇪🇦"], ["EC", "🇪🇨"], ["EE", "🇪🇪"], ["EG", "🇪🇬"],
    ["EH", "🇪🇭"], ["ER", "🇪🇷"], ["ES", "🇪🇸"], ["ET", "🇪🇹"],
    ["EU", "🇪🇺"], ["FI", "🇫🇮"], ["FJ", "🇫🇯"], ["FK", "🇫🇰"],
    ["FM", "🇫🇲"], ["FO", "🇫"], ["FR", "🇫🇷"], ["GA", "🇬🇦"],
    ["GB", "🇬🇧"], ["HK", "🇭🇰"], ["HU", "🇭🇺"], ["ID", "🇮🇩"],
    ["IE", "🇮🇪"], ["IL", "🇮🇱"], ["IM", "🇮🇲"], ["IN", "🇮🇳"],
    ["IS", "🇮🇸"], ["IT", "🇮🇹"], ["JP", "🇯🇵"], ["KR", "🇰🇷"],
    ["LU", "🇱🇺"], ["MO", "🇲🇴"], ["MX", "🇲🇽"], ["MY", "🇲🇾"],
    ["NL", "🇳🇱"], ["PH", "🇵🇭"], ["RO", "🇷🇴"], ["RS", "🇷🇸"],
    ["RU", "🇷🇺"], ["RW", "🇷🇼"], ["SA", "🇸🇦"], ["SB", "🇧"],
    ["SC", "🇸🇨"], ["SD", "🇸🇩"], ["SE", "🇸🇪"], ["SG", "🇸🇬"],
    ["TH", "🇹🇭"], ["TN", "🇹🇳"], ["TO", "🇹🇴"], ["TR", "🇹🇷"],
    ["TV", "🇹🇻"], ["TW", "🇨🇳"], ["UK", "🇬🇧"], ["UM", "🇺🇲"],
    ["US", "🇺🇸"], ["UY", "🇺🇾"], ["UZ", "🇺🇿"], ["VA", "🇻🇦"],
    ["VE", "🇻🇪"], ["VG", "🇻🇬"], ["VI", "🇻🇮"], ["VN", "🇻🇳"],
    ["ZA", "🇿🇦"]
]);

function nfTest() {
    return new Promise((resolve, reject) => {
        let params = {
            url: NF_BASE_URL,
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
            }
        };
        
        console.log("\n开始请求 Netflix...");

        $httpClient.get(params, (errormsg, response, data) => {
            console.log("\n---------- Netflix 请求日志 ----------");
            console.log("请求参数:", JSON.stringify(params, null, 2));

            if (errormsg) {
                console.log("❌ NF 请求失败:", JSON.stringify({ error: errormsg }, null, 2));
                result.message = "Netflix: 检测失败 ❗️";
                console.log(`[LOG] Netflix 检测结果 - ${result.message}`);
                $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
                resolve(errormsg);
                return;
            }

            if (response.status === 403) {
                result.message = "Netflix: 未支持 🚫";
                console.log(`[LOG] Netflix 检测结果 - ${result.message}`);
                $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
                resolve("403 Not Available");
            } else if (response.status === 404) {
                result.message = "Netflix: 支持自制剧集 ⚠️";
                console.log(`[LOG] Netflix 检测结果 - ${result.message}`);
                $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
                resolve("404 Not Found");
            } else if (response.status === 200) {
                console.log("\n📦 NF 请求结果:", JSON.stringify(response.headers, null, 2));

                let ourl = response.headers['X-Originating-URL'] || 
                           response.headers['X-Originating-Url'] || 
                           response.headers['x-originating-url'];

                if (ourl === undefined) {
                    console.log("⚠️ 未知地区");
                    result.message = "Netflix: 完整支持 ⟦未知地区⟧ 🎉";
                    console.log(`[LOG] Netflix 检测结果 - ${result.message}`);
                    $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
                    resolve();
                } else {
                    console.log("🌍 X-Originating-URL:", ourl);
                    let region = ourl.split('/')[3];
                    region = region.split('-')[0];
                    if (region === 'title') {
                        region = 'us';
                    }
                    result.message = `Netflix: 完整支持 ⟦${flags.get(region.toUpperCase()) || '🇺 unknown'}（${region.toUpperCase()}）⟧ 🎉`;
                    console.log(`[LOG] Netflix 检测结果 - ${result.message}`);
                    $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
                    resolve(region);
                }
            } else {
                result.message = "Netflix: 检测失败 ❗️";
                console.log(`[LOG] Netflix 检测结果 - ${result.message}`);
                $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
                resolve(response.status);
            }
        });
    });
}

nfTest().then(region => {
    console.log("\n检测结果:", JSON.stringify(result, null, 2));
    $done(); // 在这里结束脚本
}).catch(error => {
    console.error("\n发生错误:", JSON.stringify({ error: error }, null, 2));
    $done(); // 在这里结束脚本
});