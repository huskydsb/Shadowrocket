let url = "https://www.bing.com/search?q=curl";
let headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9"
};
const regionToFlag = {
    AC: "🇦🇨",
    AE: "🇦🇪",
    AF: "🇦🇫",
    AI: "🇦🇮",
    AL: "🇦🇱",
    AM: "🇦🇲",
    AQ: "🇦🇶",
    AR: "🇦🇷",
    AS: "🇦🇸",
    AT: "🇦🇹",
    AU: "🇦🇺",
    AW: "🇦🇼",
    AX: "🇦🇽",
    AZ: "🇦🇿",
    BA: "🇧🇦",
    BB: "🇧🇧",
    BD: "🇧🇩",
    BE: "🇧🇪",
    BF: "🇧🇫",
    BG: "🇧🇬",
    BH: "🇧🇭",
    BI: "🇧🇮",
    BJ: "🇧🇯",
    BM: "🇧🇲",
    BN: "🇧🇳",
    BO: "🇧🇴",
    BR: "🇧🇷",
    BS: "🇧🇸",
    BT: "🇧🇹",
    BV: "🇧🇻",
    BW: "🇧🇼",
    BY: "🇧🇾",
    BZ: "🇧🇿",
    CA: "🇨🇦",
    CF: "🇨🇫",
    CH: "🇨🇭",
    CK: "🇨🇰",
    CL: "🇨🇱",
    CM: "🇨🇲",
    CN: "🇨🇳",
    CO: "🇨🇴",
    CP: "🇨🇵",
    CR: "🇨🇷",
    CU: "🇨🇺",
    CV: "🇨🇻",
    CW: "🇨🇼",
    CX: "🇨🇽",
    CY: "🇨🇾",
    CZ: "🇨🇿",
    DE: "🇩🇪",
    DG: "🇩🇬",
    DJ: "🇩🇯",
    DK: "🇩🇰",
    DM: "🇩🇲",
    DO: "🇩🇴",
    DZ: "🇩🇿",
    EA: "🇪🇦",
    EC: "🇪🇨",
    EE: "🇪🇪",
    EG: "🇪🇬",
    EH: "🇪🇭",
    ER: "🇪🇷",
    ES: "🇪🇸",
    ET: "🇪🇹",
    EU: "🇪🇺",
    FI: "🇫🇮",
    FJ: "🇫🇯",
    FK: "🇫🇰",
    FM: "🇫🇲",
    FO: "🇫🇴",
    FR: "🇫🇷",
    GA: "🇬🇦",
    GB: "🇬🇧",
    GD: "🇬🇩",
    GE: "🇬🇪",
    GF: "🇬🇫",
    GG: "🇬🇬",
    GH: "🇬🇭",
    GI: "🇬🇮",
    GL: "🇬🇱",
    GM: "🇬🇲",
    GN: "🇬🇳",
    GP: "🇬🇵",
    GQ: "🇬🇶",
    GR: "🇬🇷",
    GT: "🇬🇹",
    GU: "🇬🇺",
    GW: "🇬🇼",
    GY: "🇬🇾",
    HK: "🇭🇰",
    HM: "🇭🇲",
    HN: "🇭🇳",
    HR: "🇭🇷",
    HT: "🇭🇹",
    HU: "🇭🇺",
    ID: "🇮🇩",
    IE: "🇮🇪",
    IL: "🇮🇱",
    IM: "🇮🇲",
    IN: "🇮🇳",
    IO: "🇮🇴",
    IQ: "🇮🇶",
    IR: "🇮🇷",
    IS: "🇮🇸",
    IT: "🇮🇹",
    JE: "🇯🇪",
    JM: "🇯🇲",
    JO: "🇯🇴",
    JP: "🇯🇵",
    KE: "🇰🇪",
    KG: "🇰🇬",
    KH: "🇰🇭",
    KI: "🇰🇮",
    KM: "🇰🇲",
    KN: "🇰🇳",
    KP: "🇰🇵",
    KR: "🇰🇷",
    KW: "🇰🇼",
    KY: "🇰🇾",
    KZ: "🇰🇿",
    LA: "🇱🇦",
    LB: "🇱🇧",
    LC: "🇱🇨",
    LI: "🇱🇮",
    LK: "🇱🇰",
    LR: "🇱🇷",
    LS: "🇱🇸",
    LT: "🇱🇹",
    LU: "🇱🇺",
    LV: "🇱🇻",
    LY: "🇱🇾",
    MA: "🇲🇦",
    MC: "🇲🇨",
    MD: "🇲🇩",
    ME: "🇲🇪",
    MF: "🇲🇫",
    MG: "🇲🇬",
    MH: "🇲🇭",
    MK: "🇲🇰",
    ML: "🇲🇱",
    MM: "🇲🇲",
    MN: "🇲🇳",
    MO: "🇲🇴",
    MP: "🇲🇵",
    MQ: "🇲🇶",
    MR: "🇲🇷",
    MS: "🇲🇸",
    MT: "🇲🇹",
    MU: "🇲🇺",
    MV: "🇲🇻",
    MW: "🇲🇼",
    MX: "🇲🇽",
    MY: "🇲🇾",
    MZ: "🇲🇿",
    NA: "🇳🇦",
    NC: "🇳🇨",
    NE: "🇳🇪",
    NF: "🇳🇫",
    NG: "🇳🇬",
    NI: "🇳🇮",
    NL: "🇳🇱",
    NO: "🇳🇴",
    NP: "🇳🇵",
    NR: "🇳🇷",
    NU: "🇳🇺",
    NZ: "🇳🇿",
    OM: "🇴🇲",
    PA: "🇵🇦",
    PE: "🇵🇪",
    PF: "🇵🇫",
    PG: "🇵🇬",
    PH: "🇵🇭",
    PK: "🇵🇰",
    PL: "🇵🇱",
    PM: "🇵🇲",
    PN: "🇵🇳",
    PR: "🇵🇷",
    PT: "🇵🇹",
    PW: "🇵🇼",
    PY: "🇵🇾",
    QA: "🇶🇦",
    RE: "🇷🇪",
    RO: "🇷🇴",
    RS: "🇷🇸",
    RU: "🇷🇺",
    RW: "🇷🇼",
    SA: "🇸🇦",
    SB: "🇸🇧",
    SC: "🇸🇨",
    SD: "🇸🇩",
    SE: "🇸🇪",
    SG: "🇸🇬",
    SH: "🇸🇭",
    SI: "🇸🇮",
    SJ: "🇸🇯",
    SK: "🇸🇰",
    SL: "🇸🇱",
    SM: "🇸🇲",
    SN: "🇸🇳",
    SO: "🇸🇴",
    SR: "🇸🇷",
    SS: "🇸🇸",
    ST: "🇸🇹",
    SV: "🇸🇻",
    SX: "🇸🇽",
    SY: "🇸🇾",
    SZ: "🇸🇿",
    TC: "🇹🇨",
    TD: "🇹🇩",
    TF: "🇹🇫",
    TG: "🇹🇬",
    TH: "🇹🇭",
    TJ: "🇹🇯",
    TK: "🇹🇰",
    TL: "🇹🇱",
    TM: "🇹🇲",
    TN: "🇹🇳",
    TO: "🇹🇴",
    TR: "🇹🇷",
    TT: "🇹🇹",
    TV: "🇹🇻",
    TW: "🇹🇼",
    TZ: "🇹🇿",
    UA: "🇺🇦",
    UG: "🇺🇬",
    UM: "🇺🇲",
    US: "🇺🇸",
    UY: "🇺🇾",
    UZ: "🇺🇿",
    VA: "🇻🇦",
    VC: "🇻🇨",
    VE: "🇻🇪",
    VG: "🇻🇬",
    VI: "🇻🇮",
    VN: "🇻🇳",
    VU: "🇻🇺",
    WF: "🇼🇫",
    WS: "🇼🇸",
    XK: "🇽🇰",
    YE: "🇾🇪",
    YT: "🇾🇹",
    ZA: "🇿🇦",
    ZM: "🇿🇲",
    ZW: "🇿🇼"
};
$httpClient.get({
    url: url,
    headers: headers
}, function(error, response, body) {
    let result = {};
    let timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    console.log(`[${timestamp}]📝请求开始，目标URL:${url}`);
    if (error) {
        result.message = "Bing Region: 网络连接失败";
        console.log(`[${timestamp}]❌请求失败，错误信息:${error}`);
        $done({
            response: {
                status: 200,
                body: JSON.stringify(result),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        });
        return
    }
    if (response.status !== 200) {
        result.message = `Bing Region:请求失败，状态码:${response.status}`;
        console.log(`[${timestamp}]❌请求失败，HTTP状态码:${response.status}`);
        $done({
            response: {
                status: 200,
                body: JSON.stringify(result),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        });
        return
    }
    console.log(`[${timestamp}]✅请求成功，Bing响应体已获取，响应体长度:${body.length}字节`);
    let region = "Unknown";
    let regionFlag = "🌍";
    let isCN = body.includes('cn.bing.com');
    if (isCN) {
        region = "CN";
        regionFlag = regionToFlag[region] || "🌍";
        console.log(`[${timestamp}]🌍检测到区域为中国${regionFlag}(CN)`)
    } else {
        let regionMatch = body.match(/Region\s*:\s*"([^"]+)"/);
        if (regionMatch && regionMatch[1]) {
            region = regionMatch[1];
            regionFlag = regionToFlag[region] || "🌍";
            console.log(`[${timestamp}]🌍检测到区域为:${regionFlag}(${region})`)
        } else {
            console.log(`[${timestamp}]🌍未检测到明确区域信息，默认设置为:Unknown`)
        }
    }
    let isRisky = body.includes('sj_cook.set("SRCHHPGUSR","HV"');
    if (isRisky) {
        result.message = `Bing Region:${region}${regionFlag}(Risky)`;
        console.log(`[${timestamp}]⚠️检测到Bing区域为${region}${regionFlag}，状态为有风险(Risky)`)
    } else {
        result.message = `Bing Region:${region}${regionFlag}`;
        console.log(`[${timestamp}]✅检测到Bing区域为${region}${regionFlag}，状态正常`)
    }
    $done({
        response: {
            status: 200,
            body: JSON.stringify(result),
            headers: {
                "Content-Type": "application/json"
            }
        }
    })
});