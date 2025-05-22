const $utils = (() => {
  const isSurge = typeof $httpClient !== "undefined";
  const isQuanX = typeof $task !== "undefined";

  const notify = (title, message) => {
    try {
      if (isSurge) $notification.post(title, "", message);
      if (isQuanX) $notify(title, "", message);
    } catch (e) {
      console.log(`通知发送失败: ${e}`);
    }
  };

  const done = () => {
    try {
      $done();
    } catch (e) {
      console.log(`脚本结束失败: ${e}`);
    }
  };

  return { notify, done };
})();

// 获取参数
const rawArgument = $argument || "";
let subListRaw = "";

try {
  const match = rawArgument.match(/机场订阅链接=(.+)/);
  if (match) subListRaw = match[1];
  console.log(`提取的原始链接串: ${subListRaw}`);
} catch (e) {
  $utils.notify("❗️参数解析失败", `错误: ${e}`);
  $utils.done();
}

if (!subListRaw) {
  $utils.notify("❗️未填写机场订阅链接", "请检查模块参数");
  $utils.done();
}

// 多个链接以 & 分隔，先去除前后空格，然后 decodeURIComponent 恢复
let subList = subListRaw.split("&")
  .map(s => decodeURIComponent(s.trim()))
  .filter(s => /^https?:\/\/.+/.test(s));

if (subList.length === 0) {
  $utils.notify("⚠️ 无有效链接", "请检查机场订阅链接是否正确");
  $utils.done();
}

// Base64 解码
function base64Decode(str) {
  try {
    str = str.replace(/[-_]/g, m => (m === '-' ? '+' : '/'));
    while (str.length % 4 !== 0) str += '=';
    const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    let output = '', buffer, bc = 0, bs, idx = 0;
    for (; (buffer = str.charAt(idx++)); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
      buffer = b64.indexOf(buffer);
    }
    return output;
  } catch (e) {
    return "";
  }
}

// 单个机场解析
function requestAndNotify(url, index) {
  return new Promise((resolve) => {
    const headers = {
      'cache-control': 'no-cache',
      'accept-language': 'zh-CN,zh-Hans;q=0.9',
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'user-agent': 'Shadowrocket/2615 CFNetwork/3826.500.131 Darwin/24.5.0 iPhone14,3',
    };

    const params = {
      url: url,
      headers: headers,
      timeout: 8000,
      alpn: 'h2',
    };

    $httpClient.get(params, function (error, response, data) {
      if (error || response.status !== 200) {
        const msg = error || `状态码 ${response.status}`;
        $utils.notify(`❌ 机场${index + 1} 请求失败`, msg);
        resolve();
        return;
      }

      // 优先解析 response header 中的 Subscription-Userinfo
      const info = {};
      const infoStr = response.headers["Subscription-Userinfo"] || response.headers["subscription-userinfo"];
      if (infoStr) {
        const pairs = infoStr.split(";");
        pairs.forEach(p => {
          let [key, value] = p.split("=").map(s => s.trim());
          if (["upload", "download", "total"].includes(key) && !isNaN(Number(value))) {
            const size = formatBytes(Number(value));
            info[key] = size;
          } else if (key === "expire") {
            const timestamp = parseInt(value);
            if (!isNaN(timestamp) && timestamp > 0) {
              const expireDate = new Date(timestamp * 1000);
              info.expire = expireDate.toISOString().split("T")[0];
            }
          }
        });
      } else {
        // 如果 headers 没有信息，尝试从 body 解码第一行
        const decoded = base64Decode(data.slice(0, 300));
        const firstLine = decoded.split('\n')[0] || "";

        const trafficMatch = firstLine.match(/(\d+(?:\.\d+)?[KMG]B)/gi);
        if (trafficMatch && trafficMatch.length >= 2) {
          info.upload = trafficMatch[0];
          info.download = trafficMatch[1];
        }

        const totalMatch = firstLine.match(/TOT:? *(\d+(?:\.\d+)?[KMG]B)/i);
        if (totalMatch) info.total = totalMatch[1];

        const expireMatch = firstLine.match(/Expires:? *([0-9\-]+)/i);
        if (expireMatch) info.expire = expireMatch[1];
      }

      let result = `⬆️ 上传：${info.upload || '未知'}  ⬇️ 下载：${info.download || '未知'}\n🚀 总量：${info.total || '未知'} ⏰ 到期：${info.expire || '未知'}`;
      $utils.notify(`📊 机场${index + 1}流量信息`, result);
      resolve();
    });
  });
}

function formatBytes(bytes) {
  if (bytes >= 1099511627776) return (bytes / 1099511627776).toFixed(2) + ' TB';
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return bytes + ' B';
}

// 顺序执行
(async () => {
  for (let i = 0; i < subList.length; i++) {
    await requestAndNotify(subList[i], i);
  }
  $utils.done();
})();