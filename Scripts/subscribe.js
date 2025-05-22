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
  if (match) subListRaw = decodeURIComponent(match[1]);
  console.log(`提取的原始链接串: ${subListRaw}`);
} catch (e) {
  $utils.notify("❗️参数解析失败", `错误: ${e}`);
  $utils.done();
}

if (!subListRaw) {
  $utils.notify("❗️未填写机场订阅链接", "请检查模块参数");
  $utils.done();
}

// 使用正则提取 http 开头的合法链接（避免&等被错误分割）
let subList = subListRaw.match(/https?:\/\/[^\s@&]+/g) || [];

if (subList.length === 0) {
  $utils.notify("⚠️ 无有效链接", "请检查订阅链接格式是否正确");
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

function formatBytes(bytes) {
  if (isNaN(bytes)) return '未知';
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return bytes.toFixed(2) + units[i];
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
      timeout: 5000,
      alpn: 'h2',
    };

    $httpClient.get(params, function (error, response, data) {
      if (error || response.status !== 200) {
        const msg = error || `状态码 ${response.status}`;
        $utils.notify(`❌ 机场${index + 1} 请求失败`, msg);
        resolve();
        return;
      }

      let info = {
        upload: '未知',
        download: '未知',
        total: '未知',
        expire: '未知',
      };

      // 优先解析响应头
      const userinfo = response.headers["subscription-userinfo"] || response.headers["Subscription-Userinfo"];
      if (userinfo) {
        const matches = {
          upload: userinfo.match(/upload=(\d+)/),
          download: userinfo.match(/download=(\d+)/),
          total: userinfo.match(/total=(\d+)/),
          expire: userinfo.match(/expire=(\d+)/),
        };

        if (matches.upload) info.upload = formatBytes(parseInt(matches.upload[1]));
        if (matches.download) info.download = formatBytes(parseInt(matches.download[1]));
        if (matches.total) info.total = formatBytes(parseInt(matches.total[1]));
        if (matches.expire) {
          const ts = parseInt(matches.expire[1]);
          if (ts > 0 && ts < 9999999999) {
            const d = new Date(ts * 1000);
            info.expire = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
          }
        }
      } else {
        // 解析 body 内容
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

      const result = `⬆️ 上传：${info.upload}  ⬇️ 下载：${info.download}\n🚀 总量：${info.total} ⏰ 到期：${info.expire}`;
      $utils.notify(`📊 机场${index + 1}流量信息`, result);
      resolve();
    });
  });
}

// 顺序执行
(async () => {
  for (let i = 0; i < subList.length; i++) {
    await requestAndNotify(subList[i], i);
  }
  $utils.done();
})();