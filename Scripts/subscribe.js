// Shadowrocket/Surge/QuanX 通用 - 获取并解码机场订阅链接内容
// 参数名：机场订阅链接（多个用 & 分隔）

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
  const get = (url, cb) => {
    const headers = {
      'accept-encoding': 'gzip, deflate, br',
      'user-agent': 'Shadowrocket/2615 CFNetwork/3826.500.131 Darwin/24.5.0 iPhone14,3',
      'accept': '*/*',
      'cache-control': 'no-cache',
      'accept-language': 'zh-CN,zh-Hans;q=0.9',
      'Connection': 'keep-alive',
      'Host': new URL(url).hostname
    };
    const params = { url, headers, timeout: 5000 };
    try {
      if (isSurge) $httpClient.get(params, cb);
      if (isQuanX) $task.fetch(params).then(resp => cb(null, resp, resp.body), err => cb(err, null, null));
    } catch (e) {
      cb(`请求初始化失败: ${e}`, null, null);
    }
  };
  const done = () => {
    try {
      $done();
    } catch (e) {
      console.log(`脚本结束失败: ${e}`);
    }
  };
  return { notify, get, done };
})();

console.log("脚本开始运行");

// 获取原始参数
const rawArgument = $argument || "";
console.log(`原始参数: ${rawArgument}`);

// 解析参数
let subListRaw = "";
try {
  const argPairs = rawArgument.split("&");
  console.log(`参数键值对: ${argPairs.join(", ")}`);
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

// 检查参数是否为空
if (!subListRaw) {
  console.log("未填写机场订阅链接");
  $utils.notify("❗️未填写机场订阅链接", "", "请检查模块参数");
  $utils.done();
}

// 解析订阅链接
let subList;
try {
  const decodedList = decodeURIComponent(subListRaw).split("&");
  console.log(`解码后的链接列表: ${decodedList.join(", ")}`);
  subList = decodedList.filter(i => /^https?:\/\/.+$/.test(i));
  console.log(`过滤后的有效链接: ${subList.join(", ")}`);
} catch (e) {
  console.log(`链接解析失败: ${e}`);
  $utils.notify("⚠️ 链接解析失败", "", `错误: ${e}`);
  $utils.done();
}

// 检查是否有有效链接
if (subList.length === 0) {
  console.log("无有效链接");
  $utils.notify("⚠️ 无有效链接", "", "请检查机场订阅链接是否正确");
  $utils.done();
}

// 处理每个链接
let resultList = [];
let finished = 0;

subList.forEach((url, index) => {
  console.log(`请求链接${index + 1}: ${url}`);
  $utils.get(url, (err, resp, body) => {
    finished++;
    let msg = `链接${index + 1}: ${url}\n`;

    if (err) {
      console.log(`链接${index + 1} 请求错误: ${err}`);
      msg += `❌ 请求错误: ${err}`;
    } else if (!body) {
      console.log(`链接${index + 1} 响应为空`);
      msg += `⚠️ 响应为空，请确认链接有效`;
    } else {
      console.log(`链接${index + 1} 原始响应: ${body}`);
      try {
        // 对整个 body 进行 Base64 解码
        const decodedBody = atob(body.trim());
        console.log(`链接${index + 1} 解码后: ${decodedBody}`);
        msg += `解码结果: ${decodedBody}`;
      } catch (e) {
        console.log(`链接${index + 1} 解码失败: ${e}`);
        msg += `❗解码失败: ${e}`;
      }
    }

    resultList.push(msg);
    if (finished === subList.length) {
      const fullMsg = resultList.join("\n\n");
      // 使用当前时间，格式为 YYYY-MM-DD HH:MM:SS
      const time = new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }).replace(/\//g, "-");
      console.log(`发送通知: ${fullMsg}`);
      $utils.notify("📡 机场订阅信息", time, fullMsg);
      $utils.done();
    }
  });
});