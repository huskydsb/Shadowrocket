let url = "https://store.steampowered.com/app/1295660/VII/";
let headers = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Host': 'store.steampowered.com',
    'Connection': 'keep-alive',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
};

var params = {
    url: url,
    timeout: 5000,
    headers: headers,
};

// 请求函数，支持重试
function fetchWithRetry(params, retries = 3) {
    return new Promise((resolve, reject) => {
        let attempt = 0;

        function tryRequest() {
            attempt++;
            console.log(`尝试请求，第 ${attempt} 次`);
            $httpClient.get(params, function (errormsg, response, data) {
                if (errormsg && attempt < retries) {
                    console.log(`请求失败，第 ${attempt} 次重试...`);
                    tryRequest();
                } else if (errormsg) {
                    console.log(`请求失败，第 ${attempt} 次，错误信息: ${errormsg}`);
                    reject('请求失败，无法获取数据');
                } else {
                    console.log(`请求成功，第 ${attempt} 次`);
                    resolve(response);
                }
            });
        }

        tryRequest();
    });
}

// 并发执行三次请求
Promise.all([fetchWithRetry(params), fetchWithRetry(params), fetchWithRetry(params)])
    .then(responses => {
        let result = {};

        // 假设第一个请求成功即认为有效
        let response = responses[0];
        if (response) {
            let steamCountry = response.headers['Set-Cookie'].split(';').find(cookie => cookie.startsWith('steamCountry='));
            if (steamCountry) {
                let countryCode = steamCountry.split('=')[1].split('%7C')[0];  // 提取国家代码
                let currency = getCurrencyByCountry(countryCode); // 根据国家代码推测货币
                result.message = `Steam商店国家代码: ${countryCode}<br>Steam商店国家货币: ${currency}`;
                console.log(`STEAM商店国家代码: ${countryCode}`);
                console.log(`STEAM商店国家货币: ${currency}`);
            } else {
                result.message = "无法检测到国家和货币信息";
                console.log(result.message);
            }
        } else {
            result.message = "所有请求均失败，无法获取数据";
            console.log(result.message);
        }

        // 返回结果给前端
        $done({
            response: {
                status: 200,
                body: JSON.stringify(result),
                headers: { "Content-Type": "application/json" }
            }
        });
    })
    .catch(error => {
        // 如果三次请求都失败，返回错误信息
        console.log(error);
        $done({
            response: {
                status: 500,
                body: JSON.stringify({ message: "请求失败，无法获取数据" }),
                headers: { "Content-Type": "application/json" }
            }
        });
    });

// 根据国家代码推测货币
function getCurrencyByCountry(countryCode) {
    const currencyMap = {
        "JP": "JPY", "US": "USD", "GB": "GBP", "CN": "CNY", "EU": "EUR", "IN": "INR", "CA": "CAD", "AU": "AUD",
        "CH": "CHF", "SE": "SEK", "NZ": "NZD", "KR": "KRW", "SG": "SGD", "HK": "HKD", "BR": "BRL", "RU": "RUB",
        "ZA": "ZAR", "MX": "MXN", "SA": "SAR", "AE": "AED", "FR": "EUR", "DE": "EUR", "IT": "EUR", "ES": "EUR",
        "NL": "EUR", "BE": "EUR", "AT": "EUR", "IE": "EUR", "PT": "EUR", "GR": "EUR", "FI": "EUR", "DK": "DKK",
        "NO": "NOK", "PL": "PLN", "TR": "TRY", "TH": "THB", "TW": "TWD"
    };
    return currencyMap[countryCode] || "Unknown Currency"; // 默认返回 "Unknown Currency"
}