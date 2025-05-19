// Shadowrocket - STATUS=Base64 格式机场流量通知脚本
// 参数名：机场订阅链接（多个用 & 分隔）

const args = Object.fromEntries(($argument || "").split("&").map(kv => kv.split("=")));
const subListRaw = args["机场订阅链接"] || "";

if (!subListRaw) {
  $notification.post("❗机场流量通知", "", "未提供订阅链接参数");
  $done();
  return;
}

const subList = decodeURIComponent(subListRaw).split("&").filter(url => /^https?:\/\/\S+/.test(url));
if (subList.length === 0) {
  $notification.post("⚠️ 无有效订阅链接", "", "请检查参数格式");
  $done();
  return;
}

let results = [];
let finished = 0;

subList.forEach((url, index) => {
  queryStatus(url.trim(), index + 1);
});

function queryStatus(url, idx) {
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

  $httpClient.get(request, function (error, response, body) {
    let result = `🔗 链接${idx}（${getHostname(url)}）\n`;

    if (error) {
      result += `❌ 请求错误：${error}`;
    } else if (!body || !body.startsWith("STATUS=")) {
      result += `⚠️ 响应不包含 STATUS=，请确认机场支持`;
    }