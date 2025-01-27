let url = "https://www.primevideo.com/";
let headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 PrimeVideo/1.0"
};

const regionFlags = {
    AC: "🇦🇨", AE: "🇦🇪", AF: "🇦🇫", AI: "🇦🇮", AL: "🇦🇱", AM: "🇦🇲", AQ: "🇦🇶", AR: "🇦🇷", AS: "🇦🇸", AT: "🇦🇹", AU: "🇦🇺", AW: "🇦🇼",
    AX: "🇦🇽", AZ: "🇦🇿", BA: "🇧🇦", BB: "🇧🇧", BD: "🇧🇩", BE: "🇧🇪", BF: "🇧🇫", BG: "🇧🇬", BH: "🇧🇭", BI: "🇧🇮", BJ: "🇧🇯", BM: "🇧🇲",
    BN: "🇧🇳", BO: "🇧🇴", BR: "🇧🇷", BS: "🇧🇸", BT: "🇧🇹", BV: "🇧🇻", BW: "🇧🇼", BY: "🇧🇾", BZ: "🇧🇿", CA: "🇨🇦", CF: "🇨🇫", CH: "🇨🇭",
    CK: "🇨🇰", CL: "🇨🇱", CM: "🇨🇲", CN: "🇨🇳", CO: "🇨🇴", CP: "🇨🇵", CR: "🇨🇷", CU: "🇨🇺", CV: "🇨🇻", CW: "🇨🇼", CX: "🇨🇽", CY: "🇨🇾",
    CZ: "🇨🇿", DE: "🇩🇪", DG: "🇩🇬", DJ: "🇩🇯", DK: "🇩🇰", DM: "🇩🇲", DO: "🇩🇴", DZ: "🇩🇿", EA: "🇪🇦", EC: "🇪🇨", EE: "🇪🇪", EG: "🇪🇬",
    EH: "🇪🇭", ER: "🇪🇷", ES: "🇪🇸", ET: "🇪🇹", EU: "🇪🇺", FI: "🇫🇮", FJ: "🇫🇯", FK: "🇫🇰", FM: "🇫🇲", FO: "🇫🇴", FR: "🇫🇷", GA: "🇬🇦",
    GB: "🇬🇧", GD: "🇬🇩", GE: "🇬🇪", GF: "🇬🇫", GG: "🇬🇬", GH: "🇬🇭", GI: "🇬🇮", GL: "🇬🇱", GM: "🇬🇲", GN: "🇬🇳", GP: "🇬🇵", GQ: "🇬🇶",
    GR: "🇬🇷", GT: "🇬🇹", GU: "🇬🇺", GW: "🇬🇼", GY: "🇬🇾", HK: "🇭🇰", HM: "🇭🇲", HN: "🇭🇳", HR: "🇭🇷", HT: "🇭🇹", HU: "🇭🇺", ID: "🇮🇩",
    IE: "🇮🇪", IL: "🇮🇱", IM: "🇮🇲", IN: "🇮🇳", IO: "🇮🇴", IQ: "🇮🇶", IR: "🇮🇷", IS: "🇮🇸", IT: "🇮🇹", JE: "🇯🇪", JM: "🇯🇲", JO: "🇯🇴",
    JP: "🇯🇵", KE: "🇰🇪", KG: "🇰🇬", KH: "🇰🇭", KI: "🇰🇮", KM: "🇰🇲", KN: "🇰🇳", KP: "🇰🇵", KR: "🇰🇷", KW: "🇰🇼", KY: "🇰🇾", KZ: "🇰🇿",
    LA: "🇱🇦", LB: "🇱🇧", LC: "🇱🇨", LI: "🇱🇮", LK: "🇱🇰", LR: "🇱🇷", LS: "🇱🇸", LT: "🇱🇹", LU: "🇱🇺", LV: "🇱🇻", LY: "🇱🇾", MA: "🇲🇦",
    MC: "🇲🇨", MD: "🇲🇩", ME: "🇲🇪", MF: "🇲🇫", MG: "🇲🇬", MH: "🇲🇭", MK: "🇲🇰", ML: "🇲🇱", MM: "🇲🇲", MN: "🇲🇳", MO: "🇲🇴", MP: "🇲🇵",
    MQ: "🇲🇶", MR: "🇲🇷", MS: "🇲🇸", MT: "🇲🇹", MU: "🇲🇺", MV: "🇲🇻", MW: "🇲🇼", MX: "🇲🇽", MY: "🇲🇾", MZ: "🇲🇿", NA: "🇳🇦", NC: "🇳🇨",
    NE: "🇳🇪", NF: "🇳🇫", NG: "🇳🇬", NI: "🇳🇮", NL: "🇳🇱", NO: "🇳🇴", NP: "🇳🇵", NR: "🇳🇷", NU: "🇳🇺", NZ: "🇳🇿", OM: "🇴🇲", PA: "🇵🇦",
    PE: "🇵🇪", PF: "🇵🇫", PG: "🇵🇬", PH: "🇵🇭", PK: "🇵🇰", PL: "🇵🇱", PM: "🇵🇲", PN: "🇵🇳", PR: "🇵🇷", PT: "🇵🇹", PW: "🇵🇼", PY: "🇵🇾",
    QA: "🇶🇦", RE: "🇷🇪", RO: "🇷🇴", RS: "🇷🇸", RU: "🇷🇺", RW: "🇷🇼", SA: "🇸🇦", SB: "🇸🇧", SC: "🇸🇨", SD: "🇸🇩", SE: "🇸🇪", SG: "🇸🇬",
    SH: "🇸🇭", SI: "🇸🇮", SJ: "🇸🇯", SK: "🇸🇰", SL: "🇸🇱", SM: "🇸🇲", SN: "🇸🇳", SO: "🇸🇴", SR: "🇸🇷", SS: "🇸🇸", ST: "🇸🇹", SV: "🇸🇻",
    SX: "🇸🇽", SY: "🇸🇾", SZ: "🇸🇿", TC: "🇹🇨", TD: "🇹🇩", TF: "🇹🇫", TG: "🇹🇬", TH: "🇹🇭", TJ: "🇹🇯", TK: "🇹🇰", TL: "🇹🇱", TM: "🇹🇲",
    TN: "🇹🇳", TO: "🇹🇴", TR: "🇹🇷", TT: "🇹🇹", TV: "🇹🇻", TW: "🇹🇼", TZ: "🇹🇿", UA: "🇺🇦", UG: "🇺🇬", UM: "🇺🇲", US: "🇺🇸", UY: "🇺🇾",
    UZ: "🇺🇿", VA: "🇻🇦", VC: "🇻🇨", VE: "🇻🇪", VG: "🇻🇬", VI: "🇻🇮", VN: "🇻🇳", VU: "🇻🇺", WF: "🇼🇫", WS: "🇼🇸", XK: "🇽🇰", YE: "🇾🇪",
    YT: "🇾🇹", ZA: "🇿🇦", ZM: "🇿🇲", ZW: "🇿🇼"
};
function getTimeStamp() {
    const now = new Date();
    return `[${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}]`;
}

console.log(`${getTimeStamp()} 🚀 启动检测请求 - 目标URL: ${url}`);
$httpClient.get({ url: url, headers: headers }, function (error, response, body) {
    let result = {};
    console.log(`${getTimeStamp()} 📥 收到响应 - 状态码: ${response?.status || '无响应'}`);

    if (error) {
        console.log(`${getTimeStamp()} ❌ 网络错误: ${error}`);
        result.message = "Prime Video: 连接失败";
    } else if (body) {
        console.log(`${getTimeStamp()} ✅ 响应长度: ${(body.length/1024).toFixed(2)}KB`);

        const isBlocked = body.includes("isServiceRestricted");
        const regionMatch = body.match(/"currentTerritory":"(.*?)"/);
        const flag = regionMatch ? (regionFlags[regionMatch[1]] || '🌐') : '❓';

        if (isBlocked) {
            console.log(`${getTimeStamp()} ⚠️ 服务受限标记被触发`);
            result.message = "Prime Video: 服务受限 ❌";
        } else if (regionMatch) {
            console.log(`${getTimeStamp()} 🌍 识别到地区代码: ${regionMatch[1]} ${flag}`);
            result.message = `Prime Video: 已解锁 ✅ (${flag} ${regionMatch[1]})`;
        } else {
            console.log(`${getTimeStamp()} ⚠️ 异常响应结构`);
            result.message = "Prime Video: 检测异常";
        }
    } else {
        console.log(`${getTimeStamp()} ⚠️ 空响应体`);
        result.message = "Prime Video: 无有效响应";
    }

    console.log(`${getTimeStamp()} 📊 最终结果: ${result.message}`);
    $done({ response: { status: 200, body: JSON.stringify(result) } });
});

console.log(`${getTimeStamp()} ⏳ 等待响应...`);