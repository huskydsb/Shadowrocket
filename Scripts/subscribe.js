// Shadowrocket/Surge/QuanX 通用 - 显示机场订阅链接参数
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

// 解析参数
const args = Object.fromEntries(($argument || "").split("&").map(kv => {
  const [key, value] = kv.split("=");
  return [key, value || ""];
}));
const subListRaw = args["机场订阅链接"] || "";

console.log(`输入参数: ${subListRaw}`);

// 检查参数是否为空
if (!subListRaw) {
  console.log("未填写机场订阅链接");
  $utils.notify("❗️未填写机场订阅链接", "", "请检查模块参数");
  $utils.done();
}

// 解析订阅链接
let subList;
try {
  subList = decodeURIComponent(subListRaw).split("&").filter(i => /^https?:\/\/\S+/.test(i));
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

// 生成通知内容
const notifyMsg = subList.map((url, index) => `链接${index + 1}: ${url}`).join("\n");
console.log(`通知内容: ${notifyMsg}`);

// 发送通知
const time = new Date().toLocaleString("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
}).replace(/\//g, "-");
$utils.notify("📡 机场订阅链接", time, notifyMsg);
$utils.done();