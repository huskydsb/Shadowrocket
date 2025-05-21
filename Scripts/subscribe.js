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

// 多个链接以 & 分隔
let subList = subListRaw.split("&").map(s => s.trim()).filter(s => /^https?:\/\/.+/.test(s));
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

      const decoded = base64Decode(data.slice(0, 300));
      const firstLine = decoded.split('\n')[0] || "";
      let info = {};

      const trafficMatch = firstLine.match(/(\d+(?:\.\d+)?[KMG]B)/gi);
      if (trafficMatch && trafficMatch.length >= 2) {
        info.upload = trafficMatch[0];
        info.download = trafficMatch[1];
      }

      const totalMatch = firstLine.match(/TOT:? *(\d+(?:\.\d+)?[KMG]B)/i);
      if (totalMatch) info.total = totalMatch[1];

      const expireMatch = firstLine.match(/Expires:? *([0-9\-]+)/i);
      if (expireMatch) info.expire = expireMatch[1];

      let result = `⬆️ 上传：${info.upload || '未知'}  ⬇️ 下载：${info.download || '未知'}\n🚀 总量：${info.total || '未知'} ⏰ 到期：${info.expire || '未知'}`;
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