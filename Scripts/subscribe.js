// Shadowrocket 机场流量通知脚本
// 参数来自模块：机场订阅链接地址

const argStr = typeof $argument === 'string' ? $argument : '';
const args = Object.fromEntries(argStr.split("&").map(kv => kv.split("=")));

const raw = args["机场订阅链接地址"];
if (!raw) {
    $notification.post("❗机场流量通知", "", "未提供订阅链接参数");
    $done();
    return;
}

const urls = decodeURIComponent(raw).split("&");
let results = [];
let completed = 0;

for (let url of urls) {
    querySubInfo(url.trim());
}

function querySubInfo(url) {
    const headers = {
        'user-agent': 'Shadowrocket',
        'accept-encoding': 'gzip, deflate, br',
    };

    const request = {
        url,
        headers,
        timeout: 5000,
        alpn: 'h2',
    };

    $httpClient.get(request, function (err, resp, body) {
        let title = `📡 ${getHostname(url)}`;
        let msg = '';

        if (err) {
            msg = `请求失败：${err}`;
        } else if (resp.status !== 200) {
            msg = `请求失败，状态码：${resp.status}`;
        } else {
            try {
                if (body.startsWith("STATUS=")) {
                    // 解码 base64 可能未启用 userinfo 格式
                    body = body.replace("STATUS=", "").trim();
                    msg = body;
                } else if (body.includes("upload") && body.includes("download")) {
                    const json = JSON.parse(body);
                    const info = json.data || {};
                    msg = `↑${formatBytes(info.usage?.upload)} ↓${formatBytes(info.usage?.download)} / 总:${formatBytes(info.total)}`;
                    if (info.expire) {
                        msg += `\n⏰到期时间: ${info.expire}`;
                    }
                } else {
                    msg = "❗未包含 userinfo 或格式异常";
                }
            } catch (e) {
                msg = `解析失败：${e}`;
            }
        }

        results.push(`${title}\n${msg}`);
        completed++;
        if (completed === urls.length) notifyDone();
    });
}

function formatBytes(bytes) {
    if (bytes === 0 || !bytes) return "0B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(2) + sizes[i];
}

function getHostname(url) {
    try {
        return new URL(url).hostname;
    } catch {
        return "未知地址";
    }
}

function notifyDone() {
    const time = new Date().toLocaleString("zh-CN", { hour12: false });
    $notification.post("📢 机场流量使用情况", `${time}`, results.join("\n\n"));
    $done();
}