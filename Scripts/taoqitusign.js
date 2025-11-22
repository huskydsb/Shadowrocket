// 日志函数
function log(message, data = "") {
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  console.log(`[${time}] ${message} ${data}`);
}

// 读取存储的 Authorization
const authorization = $persistentStore.read("taoqitu_authorization");

log("🔑 获取存储的Authorization", authorization ? "成功" : "失败");

if (!authorization) {
  log("⚠️ 错误", "未找到有效的Authorization，请先获取并存储Authorization");
  $notification.post("淘气兔签到", "未找到有效的Authorization", "请先获取并存储Authorization");
  $done();
}

// 请求参数
const url = "https://gtm-1003.91tutu.xyz/gateway/tqt/cn/user/sign";
const headers = {
  "accept-encoding": "gzip, deflate, br",
  "referer": "https://gtm-1003.91tutu.xyz",
  "origin": "https://gtm-1003.91tutu.xyz",
  "authorization": authorization,
  "sec-fetch-mode": "cors",
  "accept-language": "zh-CN,zh-Hans;q=0.9",
  "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/133.0.6943.33 Mobile/15E148 Safari/604.1",
  "sec-fetch-dest": "empty",
  "accept": "*/*",
  "sec-fetch-site": "cross-site",
};

log("⚙️ 设置请求参数", `URL: ${url}`);
log("📋 请求头设置", JSON.stringify(headers, null, 2));

// 开始签到
log("🚀 开始发送签到请求", "等待响应...");

$httpClient.get({ url: url, headers: headers }, function(error, response, body) {
  if (error) {
    log("❌ 请求失败", error);
    $notification.post("淘气兔签到", "请求失败", error);
    return $done();
  }

  log("✅ 签到请求成功", `状态码: ${response.status}`);

  try {
    const result = JSON.parse(body);
    log("🔍 解析响应数据", JSON.stringify(result, null, 2));

    if (result.message) {
      if (result.message.includes("今日已签")) {
        log("✔️ 签到结果", "今日已签到 ✅");
        $notification.post("淘气兔签到", "今日已签到 ✅", "请明天再来！");
      } else if (result.message.includes("成功")) {
        log("🎉 签到成功", result.message);
        $notification.post("淘气兔签到", "签到成功 🎉", result.message);
      } else {
        log("⚠️ 未知返回", result.message);
        $notification.post("淘气兔签到", "未知返回 ⚠️", result.message);
      }
    } else {
      log("⚠️ 返回格式异常", body);
      $notification.post("淘气兔签到", "返回格式异常 ⚠️", body);
    }

  } catch (e) {
    log("⚠️ JSON解析失败", body);
    $notification.post("淘气兔签到", "JSON解析失败 ⚠️", body);
  }

  log("⏹️ 签到请求结束", "脚本执行完毕");
  $done();
});