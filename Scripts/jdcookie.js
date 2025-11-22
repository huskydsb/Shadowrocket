const key = "JD_COOKIE";

// 时间格式函数
function now() {
    const t = new Date();
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
}

function log(msg) {
    console.log(`[${now()}] ${msg}`);
}

if ($request) {
    const header = $request.headers;
    if (!header) {
        log("❌ 无请求头，不抓取");
        $done({});
        return;
    }

    const cookieHeader = header["Cookie"] || header["cookie"] || "";
    if (!cookieHeader) {
        log("❌ 请求无 Cookie");
        $done({});
        return;
    }

    // 必须包含 pt_key & pt_pin 才保存
    if (cookieHeader.includes("pt_key") && cookieHeader.includes("pt_pin")) {

        const pt_key = cookieHeader.match(/pt_key=([^;]+)/)?.[1];
        const pt_pin = cookieHeader.match(/pt_pin=([^;]+)/)?.[1];

        if (!pt_key || !pt_pin) {
            log("❌ Cookie 获取失败（不完整）");
            $done({});
            return;
        }

        const newCookie = `pt_key=${pt_key};pt_pin=${pt_pin};`;

        const old = $persistentStore.read(key);

        if (old) {
            if (old.includes(pt_pin)) {
                // 更新已有
                const updated = old
                    .split("&")
                    .map(c => c.includes(pt_pin) ? newCookie : c)
                    .join("&");
                $persistentStore.write(updated, key);
            } else {
                // 添加新账号
                $persistentStore.write(old + "&" + newCookie, key);
            }
        } else {
            // 第一个账号
            $persistentStore.write(newCookie, key);
        }

        log(`🎉 成功获取 Cookie → ${pt_pin}`);
        $notification.post("京东 Cookie 获取成功", pt_pin, "已写入 变量 JD_COOKIE");
    } else {
        log("⚠️ Cookie 不完整（无 pt_key 或 pt_pin），跳过");
    }
}

$done({});
