const $utils = (() => {
  const isSurge = typeof $httpClient !== "undefined";
  const isQuanX = typeof $task !== "undefined";

  const notify = (title, subtitle, message) => {
    try {
      if (isSurge) $notification.post(title, subtitle, message);
      if (isQuanX) $notify(title, subtitle, message);
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

console.log("脚本开始运行");

// 获取原始参数
const rawArgument = $argument || "";
console.log(`原始参数: ${rawArgument}`);

// 解析参数
let subListRaw = "";
try {
  const argPairs = rawArgument.split("&");
  for (const pair of argPairs) {
    if (pair.startsWith("机场订阅链接=")) {
      subListRaw = pair.replace("机场订阅链接=", "");
      break;
    }
  }
  console.log(`提取的机场订阅链接: ${subListRaw}`);
} catch (e) {
  console.log(`参数解析失败: ${e}`);
  $utils.notify("❗️参数解析失败", "", `错误: ${e}`);
  $utils.done();
}

if (!subListRaw) {
  console.log("未填写机场订阅链接");
  $utils.notify("❗️未填写机场订阅链接", "", "请检查模块参数");
  $utils.done();
}

let subList;
try {
  const decodedList = decodeURIComponent(subListRaw).split("&");
  subList = decodedList.filter(i => /^https?:\/\/.+$/.test(i));
  console.log(`解析后的链接: ${subList.join(", ")}`);
} catch (e) {
  console.log(`链接解析失败: ${e}`);
  $utils.notify("⚠️ 链接解析失败", "", `错误: ${e}`);
  $utils.done();
}

if (subList.length === 0) {
  console.log("无有效链接");
  $utils.notify("⚠️ 无有效链接", "", "请检查机场订阅链接是否正确");
  $utils.done();
}

// 自定义 Base64 解码（兼容小火箭）
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
    return `❌ Base64 解码失败：${e}`;
  }
}

// 请求和解析订阅链接，返回Promise
function requestAndParse(url, index) {
  return new Promise((resolve) => {
    const headers = {
      'cache-control': 'no-cache',
      'accept-language': 'zh-CN,zh-Hans;q=0.9',
      'accept': '*/*',
      'accept-encoding': 'gzip, deflate, br',
      'user-agent': 'Shadowrocket/2615 CFNetwork/3826.500.131 Darwin/24.5.0 iPhone14,3',
    };
    const params = { url, headers, timeout: 5000, alpn: 'h2' };

    console.log(`开始请求第${index + 1}个链接：${url}`);
    $httpClient.get(params, (error, response, data) => {
      if (error) {
        console.log(`请求错误：${error}`);
        resolve(`链接${index + 1}请求失败：${error}`);
        return;
      }
      if (response.status !== 200) {
        console.log(`状态码异常：${response.status}`);
        resolve(`链接${index + 1}请求异常，状态码：${response.status}`);
        return;
      }
      const preview = data.slice(0, 300);
      const decoded = base64Decode(preview);
      console.log(`链接${index + 1}解码内容预览：\n${decoded.split('\n').slice(0, 5).join('\n')}`);

      const firstLine = decoded.split('\n')[0] || "";
      let info = {};

      const trafficMatch = firstLine.match(/(\d+(?:\.\d+)?[KMG]B)/gi);
      if (trafficMatch && trafficMatch.length >= 2) {
        info.upload = trafficMatch[0];
        info.download = trafficMatch[1];
      }

      const totalMatch = firstLine.match(/TOT:? *(\d+(?:\.\d+)?[KMG]B)/i);
      if (totalMatch) {
        info.total = totalMatch[1];
      }

      const expireMatch = firstLine.match(/Expires:? *([0-9\-]+)/i);
      if (expireMatch) {
        info.expire = expireMatch[1];
      }

      let result = `📊 机场${index + 1}流量信息：
⬆️ 上传：${info.upload || '未知'} ⬇️ 下载：${info.download || '未知'}
📦 总量：${info.total || '未知'} ⏰ 到期：${info.expire || '未知'}`;

      resolve(result);
    });
  });
}

// 依次请求所有链接并汇总通知
(async () => {
  let results = [];
  for (let i = 0; i < subList.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    let res = await requestAndParse(subList[i], i);
    results.push(res);
  }
  const notifyMsg = results.join("\n\n");
  console.log(`通知内容:\n${notifyMsg}`);

  $utils.notify("📡 机场订阅流量信息", "", notifyMsg);
  $utils.done();
})();