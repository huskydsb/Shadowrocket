let url = "https://store.steampowered.com/app/1295660/VII/";
let headers = {
    'Accept':'*/*',
    'Accept-Encoding':'gzip, deflate, br',
    'Host':'store.steampowered.com',
    'Connection':'keep-alive',
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
};

var params = {
    url: url,
    timeout: 5000,
    headers: headers,
};

$httpClient.get(params, function(errormsg, response, data) {
    let result = {};

    if (errormsg) {
        console.log(errormsg);
        result.message = "请求失败，无法获取数据";
    } else {
        // 从响应头中提取 steamCountry 信息
        let steamCountry = response.headers['Set-Cookie'].split(';').find(cookie => cookie.startsWith('steamCountry='));
        if (steamCountry) {
            let countryCode = steamCountry.split('=')[1].split('%7C')[0];  // 提取国家代码
            let currency = getCurrencyByCountry(countryCode); // 根据国家代码推测货币
            result.message = `STEAM商店国家代码: ${countryCode}<br>STEAM商店国家货币: ${currency}`;
            console.log(`STEAM商店国家代码: ${countryCode}`);
            console.log(`STEAM商店国家货币: ${currency}`);
        } else {
            result.message = "无法检测到国家和货币信息";
        }
    }

    // 返回结果给前端
    $done({
        response: {
            status: 200,
            body: JSON.stringify(result),
            headers: { "Content-Type": "application/json" }
        }
    });
    $done();
});

// 根据国家代码推测货币
function getCurrencyByCountry(countryCode) {
    const currencyMap = {
"JP": "JPY", // 日本日元
        "US": "USD", // 美国美元
        "GB": "GBP", // 英国英镑
        "CN": "CNY", // 中国人民币
        "EU": "EUR", // 欧元区欧元
        "IN": "INR", // 印度卢比
        "CA": "CAD", // 加拿大加元
        "AU": "AUD", // 澳大利亚澳元
        "CH": "CHF", // 瑞士法郎
        "SE": "SEK", // 瑞典克朗
        "NZ": "NZD", // 新西兰元
        "KR": "KRW", // 韩国韩元
        "SG": "SGD", // 新加坡元
        "HK": "HKD", // 香港元
        "BR": "BRL", // 巴西雷亚尔
        "RU": "RUB", // 俄罗斯卢布
        "ZA": "ZAR", // 南非兰特
        "MX": "MXN", // 墨西哥比索
        "SA": "SAR", // 沙特里亚尔
        "AE": "AED", // 阿联酋迪拉姆
        "FR": "EUR", // 法国欧元
        "DE": "EUR", // 德国欧元
        "IT": "EUR", // 意大利欧元
        "ES": "EUR", // 西班牙欧元
        "NL": "EUR", // 荷兰欧元
        "BE": "EUR", // 比利时欧元
        "AT": "EUR", // 奥地利欧元
        "IE": "EUR", // 爱尔兰欧元
        "PT": "EUR", // 葡萄牙欧元
        "GR": "EUR", // 希腊欧元
        "FI": "EUR", // 芬兰欧元
        "DK": "DKK", // 丹麦克朗
        "NO": "NOK", // 挪威克朗
        "PL": "PLN", // 波兰兹罗提
        "TR": "TRY", // 土耳其里拉
        "TH": "THB", // 泰国泰铢
        // 其他国家和货币可以继续添加
    };
    return currencyMap[countryCode] || "Unknown Currency"; // 默认返回 "Unknown Currency"
}