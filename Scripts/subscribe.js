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
const subListRaw = args["机场订阅链接地址"] || "";
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
    } else if (!body || !body.startsWith("STATUS=")) {
      msg = `⚠️ 响应不包含 STATUS=，请确认机场支持`;
    } else {
      try {
        const b64 = body.replace("STATUS=", "").trim();
        const decoded = decodeURIComponent(escape(atob(b64)));
        msg = decoded;
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

function getHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "未知地址";
  }
}