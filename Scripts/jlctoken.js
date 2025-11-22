/*****************************************
 * 嘉立创 AccessToken 自动捕获脚本,打开嘉立创下单助手，我的页面时触发
 * 自动捕获：
 * 1. x-jlc-accesstoken
 * 2. X-JLC-AccessToken
 * 并保存到 JLC_AccessToken
 * 仅在 token 更新时通知
 *****************************************/

// 日志输出函数
function log(emoji, msg) {
    const time = new Date().toLocaleString();
    console.log(`${time} ${emoji} ${msg}`);
}

// 通知函数
function notify(title, msg) {
    $notification.post(title, "", msg);
    log("🔔", `${title} → ${msg}`);
}

if ($request && $request.headers) {
    const h = $request.headers;

    // 优先捕获 x-jlc-accesstoken
    let token = h["x-jlc-accesstoken"] || h["X-JLC-AccessToken"];

    if (token) {
        const old = $persistentStore.read("JLC_AccessToken");

        if (!old) {
            // 第一次保存 token
            $persistentStore.write(token, "JLC_AccessToken");
            notify("嘉立创 Token 已保存", token);
        } else if (old !== token) {
            // token 更新
            $persistentStore.write(token, "JLC_AccessToken");
            notify("嘉立创 Token 已更新", token);
        } else {
            // token 未变化，仅日志
            log("ℹ️", "Token 未变化，跳过通知");
        }
    } else {
        log("⚠️", "未在请求头中捕获到 Token");
    }
} else {
    log("⚠️", "当前请求不存在 headers，无法捕获 Token");
}

$done({});
