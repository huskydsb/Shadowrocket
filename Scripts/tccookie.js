console.log("========== 🟢 [同程旅行] 开始抓取 Cookie ==========");

let headers = $request.headers || {};

// 提取字段（兼容大小写）
let apptoken = headers["apptoken"] || headers["Apptoken"];
let device = headers["device"] || headers["Device"];

// 判断缺失字段
if (!apptoken || !device) {
    console.log("❌ 抓取失败：缺少 apptoken 或 device");
    $notification.post(
        "同程旅行签到获取Cookie",
        "❌ 获取失败",
        "未找到有效字段，请确认已开启 HTTPS 解密"
    );
    $done({});
}

// 组合 cookie 字段
let newCookie = `${apptoken}#${device}`;
console.log("📥 拼装 Cookie 完成");

// 直接覆盖存储
$persistentStore.write(newCookie, "tc_cookie");

console.log("✔️ Cookie 已成功写入存储（覆盖旧 Cookie）");
console.log("========== ✅ 抓取流程完成 ==========");

// 成功通知（不含 cookie）
$notification.post(
    "同程旅行签到获取Cookie",
    "✔️ 获取成功",
    "已成功写入 Cookie，可执行签到脚本"
);

$done({});