const $ = $httpClient ? {
  get: $httpClient.get,
  notify: $notification.post,
  done: $done
} : {
  get: (params, cb) => $task.fetch(params).then(resp => cb(null, resp, resp.body)),
  notify: (title, subtitle, message) => $notify(title, subtitle, message),
  done: () => $done()
};

const args = Object.fromEntries(($argument || "").split("&").map(i => i.split("=")));
const urlList = decodeURIComponent(args["机场订阅链接地址"] || "").split("&").filter(Boolean);

if (urlList.length === 0) {
  $.notify("📡 机场流量通知", "", "❗未设置订阅链接");
  $.done();
}

let finished = 0;
let output = [];

urlList.forEach((url, index) => {
  const params = {
    url: url.trim(),
    headers: {
      "User-Agent": "Shadowrocket"
    },
    timeout: 8000
  };

  $.get(params, (error, resp, body) => {
    finished++;

    if (error || !body) {
      output.push(`🚫 链接${index + 1} 请求失败`);
    } else {
      try {
        const decoded = decodeURIComponent(body);

        if (!decoded.includes("STATUS=")) {
          output.push(`❌ 链接${index + 1} 无有效 STATUS`);
        } else {
          // 匹配 STATUS=↑:0.94GB,↓:114.99GB,TOT:200GB,Expires:2025-06-06
          const statusMatch = decoded.match(/STATUS=↑:(.*?),↓:(.*?),TOT:(.*?)(Expires:(.*))?/);
          if (statusMatch) {
            const upload = statusMatch[1];
            const download = statusMatch[2];
            const total = statusMatch[3];
            const expire = statusMatch[5] || "未知";

            output.push(
              `🔗 链接${index + 1}：\n📤↑：${upload} | 📥↓：${download}\n📦 总量：${total}\n⏳ 到期：${expire}`
            );
          } else {
            output.push(`⚠️ 链接${index + 1} 状态解析失败`);
          }
        }
      } catch (e) {
        output.push(`❌ 链接${index + 1} 解码失败`);
      }
    }

    if (finished === urlList.length) {
      $.notify("📡 机场流量通知", "", output.join("\n\n"));
      $.done();
    }
  });
});