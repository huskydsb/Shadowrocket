// Shadowrocket/Surge/QuanX 通用 - STATUS=Base64 格式机场流量通知脚本
// 参数名：机场订阅链接（多个用 & 分隔）

const $ = (() => {
  const isSurge = typeof $httpClient !== "undefined";
  const isQuanX = typeof $task !== "undefined";
  const notify = (title, subtitle, message) => {
    if (isSurge) $notification.post(title, subtitle, message);
    if (isQuanX) $notify(title, subtitle, message);
  };
  const get = (url, cb) => {
    if (isSurge) $httpClient.get(url, cb);
    if (isQuanX) $task.fetch({ url }).then(resp => cb(null, resp, resp.body));
  };
  const done = () => $done();
  return { notify, get, done };
})();

const args = Object.fromEntries(($argument || "").split("&").map(kv => kv.split("=")));
const subListRaw = args["机场订阅链接"] || "";
const notifyEnable = true; // 可通过参数开关控制通知（后续可加）

if (!subListRaw) {
  $.notify("❗️未填写机场订阅链接", "", "请检查模块参数");
  $.done();
}

const subList = decodeURIComponent(subListRaw).split("&").filter(i => /^https?:\/\/\S+/.test(i));
if (subList.length === 0) {
  $.notify("⚠️ 无有效链接", "", "请检查机场订阅链接是否正确");
  $.done();
}

let resultList = [];
let finished = 0;

subList.forEach((url, index) => {
  $.get(url, (err, resp, body) => {
    finished++;
    let title = `🔗 链接${index + 1}（${getHostname(url)}）`;
    let msg = "";

    if (err) {
      msg = `❌ 请求错误：${err}`;
    } else if (!body) {
      msg = `⚠️ 响应为空，请确认链接有效`;
    } else {
      try {
        // 先对整个 body 进行 Base64 解码
        const decodedBody = decodeURIComponent(escape(atob(body.trim())));
        if (!decodedBody.startsWith("STATUS=")) {
          msg = `⚠️ 解码后响应不包含 STATUS=，请确认机场支持`;
        } else {
          // 提取 STATUS= 后的内容
          const statusContent = decodedBody.replace("STATUS=", "").trim();
          // 解析流量信息
          const parsed = parseStatus(statusContent);
          if (parsed.error) {
            msg = `❗解析失败：${parsed.error}`;
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
        msg = `❗解码失败：${e}`;
      }
    }

    resultList.push(`${title}\n${msg}`);
    if (finished === subList.length) {
      const fullMsg = resultList.join("\n\n");
      if (notifyEnable) {
        const time = new Date().toLocaleString("zh-CN", { hour12: false });
        $.notify("📡 机场流量通知", time, fullMsg);
      }
      $.done();
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
    return { error: `无法解析流量信息：${e}` };
  }
}

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "未知地址";
  }
}