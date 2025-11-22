/**
 * 变量名：wx_mcyp（多账号换行分隔）
 */

function now() {
    const d = new Date();
    const pad = n => (n < 10 ? "0" + n : n);
    return `${d.getMonth() + 1}-${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function log(msg) {
    console.log(`[${now()}] ${msg}`);
}

const headers = $request.headers || {};
const uid = headers["content-uid"] || headers["Content-Uid"] || headers["CONTENT-UID"] || headers["content-UID"];
const skey = headers["content-skey"] || headers["Content-Skey"] || headers["CONTENT-SKEY"] || headers["content-SKEY"];

if (!uid || !skey || uid.length < 5 || skey.length < 20) {
    $done({});
}

const newCookie = `${uid}#${skey}`;

let oldValue = ($persistentStore.read("wx_mcyp") || "").trim();
let cookies = oldValue ? oldValue.split("\n").map(c => c.trim()).filter(c => c) : [];

let existedIndex = -1;
let oldCookieOfThisUid = null;

for (let i = 0; i < cookies.length; i++) {
    if (cookies[i].startsWith(uid + "#")) {
        existedIndex = i;
        oldCookieOfThisUid = cookies[i];
        break;
    }
}

let shouldNotify = false;
let notifyTitle = "";
let notifySubtitle = "";
let notifyBody = "";


if (existedIndex === -1) {
    cookies.push(newCookie);
    shouldNotify = true;
    notifyTitle = "名创优品 Cookie";
    notifySubtitle = "新增账号成功";
    log(`新增第 ${cookies.length} 个账号`);


    let phone = "未知用户";
    try {
        const payload = JSON.parse(atob(skey.split(".")[1]));
        if (payload.PHONE) phone = payload.PHONE.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2");
    } catch (e) {}

    notifyBody = `用户: ${phone}\nUID: ${uid}\n共 ${cookies.length} 个账号`;
}


else if (oldCookieOfThisUid !== newCookie) {
    cookies[existedIndex] = newCookie;
    shouldNotify = true;
    notifyTitle = "名创优品 Cookie";
    notifySubtitle = "SKEY 已更新";
    log(`UID ${uid} 的 SKEY 已更新`);
    notifyBody = `UID: ${uid}\nSKEY 已刷新\n共 ${cookies.length} 个账号`;
}


else {
    log(`UID ${uid} 已存在且未变化，静默跳过`);
    $done({});
}

const finalValue = cookies.join("\n");
$persistentStore.write(finalValue, "wx_mcyp");

if (shouldNotify) {
    $notification.post(
        notifyTitle,
        notifySubtitle,
        notifyBody
    );
}

$done({});