const $ = (() => {
  const isSurge = typeof $httpClient !== "undefined";
  const isQuanX = typeof $task !== "undefined";
  const notify = (title, subtitle, message) => {
    if (isSurge) $notification.post(title, subtitle, message);
    if (isQuanX) $notify(title, subtitle, message);
  };
  const get = (url, cb) => {
    if (isSurge) $httpClient.get(url, cb);
    if (isQuanX) $task.fetch({ url }).then(resp => cb(null, {}, resp.body));
  };
  const done = () => $done();
  return { notify, get, done };
})();

const args = Object.fromEntries(($argument || "").split("&").map(kv => kv.split("=")));
const subListRaw = args["机场订阅链接"] || "";
const notifyEnable = true; // 可改为从参数控制

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
    let info = resp?.headers?.["subscription-userinfo"];
    if (!info) {
      resultList.push(`🚫 链接${index + 1} 无 userinfo`);
    } else {
      const data = Object.fromEntries(
        info.match(/\w+=\d+/g).map(i => i.split("=").map((v, j) => j ? parseInt(v) : v))
      );
      const format = (bytes) =>
        bytes >= 1 << 30 ? `${(bytes / (1 << 30)).toFixed(2)} GB` :
        bytes >= 1 << 20 ? `${(bytes / (1 << 20)).toFixed(2)} MB` :
        `${(bytes / (1 << 10)).toFixed(2)} KB`;

      const used = data.upload + data.download;
      const total = data.total;
      const expire = data.expire ? new Date(data.expire * 1000).toLocaleDateString() : "未知";

      resultList.push(`🔗 链接${index + 1}：\n📊 使用 ${format(used)} / ${format(total)}\n📅 到期 ${expire}`);
    }

    if (finished === subList.length) {
      const fullMsg = resultList.join("\n\n");
      $.notify("📡 机场流量统计", "", fullMsg);
      $.done();
    }
  });
});