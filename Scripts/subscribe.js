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
  if (match) {
    // 解码 URL 编码后的参数
    subListRaw = decodeURIComponent(match[1]);
    console.log(`解码后的参数: ${subListRaw}`);
  }
} catch (e) {
  $utils.notify("❗️参数解析失败", `错误: ${e}`);
  $utils.done();
}

if (!subListRaw) {
  $utils.notify("❗️未填写机场订阅链接", "请检查模块参数");
  $utils.done();
}

// 使用正则匹配 http/https 链接，避免被 & 空格影响
let subList = subListRaw.match(/https?:\/\/[^\s&]+/g) || [];
subList = subList.map(s => s.trim());
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

// 单个机场请求与解析
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

      let info = {};
      const userinfo = response.headers["Subscription-Userinfo"];
      if (userinfo) {
        const parseTraffic = (key) => {
          const match = userinfo.match(new RegExp(`${key}=(\\d+)`));
          if (!match) return '未知';
          let val = parseInt(match[1]);
          if (val > 1e12) return (val / 1099511627776).toFixed(2) + ' TB';
          if (val > 1e9) return (val / 1073741824).toFixed(2) + ' GB';
          if (val > 1e6) return (val / 1048576).toFixed(2) + ' MB';
          return val + ' B';
        };

        info.upload = parseTraffic("upload");
        info.download = parseTraffic("download");
        info.total = parseTraffic("total");

        const expireMatch = userinfo.match(/expire=(\d+)/);
        if (expireMatch) {
          const ts = parseInt(expireMatch[1]) * 1000;
          info.expire = isNaN(ts) ? '未知' : new Date(ts).toISOString().split('T')[0];
        } else {
          info.expire = "未知";
        }

      } else {
        // 如果无 headers，用 Base64 内容猜测
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
      $utils.notify(`📊 机场${index + 1} 流量信息`, result);
      resolve();
    });
  });
}

// 顺序请求多个订阅链接
(async () => {
  for (let i = 0; i < subList.length; i++) {
    await requestAndNotify(subList[i], i);
  }
  $utils.done();
})();