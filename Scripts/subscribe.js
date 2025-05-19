// Shadowrocket/Surge/QuanX 通用 - STATUS=Base64 格式机场流量通知脚本
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
  subList = decodedList.filter(i => /^https?:\/\/.+$/.test(i));
  console.log(`解析后的链接: ${subList.join(", ")}`);
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

let resultList = [];
let finished = 0;

subList.forEach((url, index) => {
  console.log(`请求链接${index + 1}: ${url}`);
  $utils.get(url, (err, resp, body) => {
    finished++;
    let title = `🔗 链接${index + 1}（${getHostname(url)}）`;
    let msg = "";

    if (err) {
      console.log(`链接${index + 1} 请求错误: ${err}`);
      msg = `❌ 请求错误: ${err}`;
    } else if (!body) {
      console.log(`链接${index + 1} 响应为空`);
      msg = `⚠️ 响应为空，请确认链接有效`;
    } else {
      console.log(`链接${index + 1} 原始响应: ${body}`);
      try {
        // 对整个 body 进行 Base64 解码
        const decodedBody = atob(body.trim());
        console.log(`链接${index + 1} 解码后: ${decodedBody}`);
        // 提取 STATUS= 开头的一行（忽略 ss:// 等内容）
        const statusLine = decodedBody.split('\n').find(line => line.startsWith("STATUS="));
        if (!statusLine) {
          console.log(`链接${index + 1} 无 STATUS= 行`);
          msg = `⚠️ 解码后响应不包含 STATUS=，请确认机场支持`;
        } else {
          // 解析 STATUS= 后的内容
          const statusContent = statusLine.replace("STATUS=", "").trim();
          console.log(`链接${index + 1} STATUS 内容: ${statusContent}`);
          const parsed = parseStatus(statusContent);
          if (parsed.error) {
            console.log(`链接${index + 1} 解析失败: ${parsed.error}`);
            msg = `❗解析失败: ${parsed.error}`;
          } else {
            msg = [
              `📤 上行: ${parsed.upload}`,
              `📥 下行: ${parsed.download}`,
              `📊 总计: ${parsed.total}`,
              `⏰ 过期: ${parsed.expires}`
            ].join("\n");
          }
        }
      } catch (e) {
        console.log(`链接${index + 1} 解码失败: ${e}`);
        msg = `❗解码失败: ${e}`;
      }
    }

    resultList.push(`${title}\n${msg}`);
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
      $utils.notify("📡 机场流量通知", time, fullMsg);
      $utils.done();
    }
  });
});

function parseStatus(status) {
  try {
    // 按逗号分割并提取键值对
    const parts = status.split(",").map(part => part.trim());
    const result = {};

    parts.forEach(part => {
      if (part.startsWith("↑:")) result.upload = part.replace("↑:", "");
      else if (part.startsWith("↓:")) result.download = part.replace("↓:", "");
      else if (part.startsWith("TOT:")) result.total = part.replace("TOT:", "");
      else if (part.startsWith("Expires:")) result.expires = part.replace("Expires:", "");
    });

    // 验证是否包含所有必需字段
    if (!result.upload || !result.download || !result.total || !result.expires) {
      return { error: "缺少部分流量信息字段" };
    }

    return result;
  } catch (e) {
    return { error: `无法解析流量信息: ${e}` };
  }
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "未知地址";
  }
}