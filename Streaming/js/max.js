let url = "https://www.max.com/";
let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
};

function getTimestamp() {
    const now = new Date();
    return now.toLocaleString();
}

const regionToFlag = {
    "HK": "🇭🇰", "ID": "🇮🇩", "MY": "🇲🇾", "PH": "🇵🇭", "SG": "🇸🇬", "TW": "🇹🇼", "TH": "🇹🇭",
    "AX": "🇦🇽", "AD": "🇦🇩", "BA": "🇧🇦", "BG": "🇧🇬", "IC": "🇮🇨", "HR": "🇭🇷", "CZ": "🇨🇿", "DK": "🇩🇰",
    "FO": "🇫🇴", "FI": "🇫🇮", "FR": "🇫🇷", "GL": "🇬🇱", "HU": "🇭🇺", "PT": "🇵🇹", "MO": "🇲🇴", "ME": "🇲🇪",
    "MK": "🇲🇰", "NO": "🇳🇴", "PL": "🇵🇱", "RO": "🇷🇴", "RS": "🇷🇸", "SK": "🇸🇰", "SI": "🇸🇮", "ES": "🇪🇸",
    "SJ": "🇸🇯", "SE": "🇸🇪", "BE": "🇧🇪", "NL": "🇳🇱", "AR": "🇦🇷", "BZ": "🇧🇿", "BO": "🇧🇴", "BR": "🇧🇷",
    "CL": "🇨🇱", "CO": "🇨🇴", "CR": "🇨🇷", "EC": "🇪🇨", "SV": "🇸🇻", "GT": "🇬🇹", "GY": "🇬🇾", "HN": "🇭🇳",
    "MX": "🇲🇽", "NI": "🇳🇮", "PA": "🇵🇦", "PY": "🇵🇾", "PE": "🇵🇪", "SR": "🇸🇷", "UY": "🇺🇾", "VE": "🇻🇪",
    "AI": "🇦🇮", "AG": "🇦🇬", "AW": "🇦🇼", "BS": "🇧🇸", "BB": "🇧🇧", "VG": "🇻🇬", "KY": "🇰🇾", "CW": "🇨🇼",
    "DM": "🇩🇲", "DO": "🇩🇴", "GD": "🇬🇩", "HT": "🇭🇹", "JM": "🇯🇲", "MS": "🇲🇸", "KN": "🇰🇳", "LC": "🇱🇨",
    "VC": "🇻🇨", "TT": "🇹🇹", "TC": "🇹🇨", "US": "🇺🇸"
};

$httpClient.get({ url: url, headers: headers }, function (error, response, body) {
    let result = {};
    console.log(`[${getTimestamp()}] 🚀 请求开始...`);

    if (error) {
        result.message = "HBO Max: 网络连接失败 ❌";
        console.log(`[${getTimestamp()}] 🔴 错误: ${error}`);
        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
    } else if (response.status === 200 && body) {
        console.log(`[${getTimestamp()}] ✅ HBO Max 响应体获取成功`);

        let countryCode = response.headers["Set-Cookie"] ? response.headers["Set-Cookie"].match(/countryCode=([A-Z]{2})/) : null;
        if (countryCode) {
            let region = countryCode[1];
            let flag = regionToFlag[region] || "🌍";
            console.log(`[${getTimestamp()}] 🌍 获取的地区信息: ${region} ${flag}`);

            let unlockedRegions = [
                "HK", "ID", "MY", "PH", "SG", "TW", "TH", "AX", "AD", "BA", "BG", "IC", "HR", "CZ", "DK", "FO", "FI",
                "FR", "GL", "HU", "PT", "MO", "ME", "MK", "NO", "PL", "RO", "RS", "SK", "SI", "ES", "SJ", "SE", "BE",
                "NL", "AR", "BZ", "BO", "BR", "CL", "CO", "CR", "EC", "SV", "GT", "GY", "HN", "MX", "NI", "PA", "PY",
                "PE", "SR", "UY", "VE", "AI", "AG", "AW", "BS", "BB", "VG", "KY", "CW", "DM", "DO", "GD", "HT", "JM",
                "MS", "KN", "LC", "VC", "TT", "TC", "US"
            ];

            if (unlockedRegions.includes(region)) {
                result.message = `HBO Max: 已解锁 ✅ (地区: ${flag}${region} )`;
                console.log(`[${getTimestamp()}] 🟢 HBO Max 检测结果 - ${result.message}`);
            } else {
                result.message = `HBO Max: 未解锁 ❌ (地区: ${region} ${flag})`;
                console.log(`[${getTimestamp()}] 🔴 HBO Max 检测结果 - ${result.message}`);
            }
        } else {
            result.message = "HBO Max: 未解锁 ❌ (地区信息缺失)";
            console.log(`[${getTimestamp()}] 🔴 HBO Max 检测结果 - ${result.message}`);
        }

        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
    } else {
        result.message = `HBO Max: 请求失败，状态码: ${response.status} ❌`;
        console.log(`[${getTimestamp()}] 🔴 错误: 状态码 - ${response.status}`);
        $done({ response: { status: 200, body: JSON.stringify(result), headers: { "Content-Type": "application/json" } } });
    }
});