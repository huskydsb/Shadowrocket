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

// 获取原始参数
const rawArgument = $argument || "";
console.log(`原始参数: ${rawArgument}`);

// 解析参数
let subListRaw = "";
try {
  // 手动解析 argument，避免截断
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
  // 解码并按 & 分割，确保保留完整链接
  const decodedList = decodeURIComponent(subListRaw).split("&");
  // 使用更宽松的正则，仅验证基本 URL 格式
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