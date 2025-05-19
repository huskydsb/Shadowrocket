// Shadowrocket 参数传入脚本，适配 STATUS 格式解析

const $ = $httpClient ? {
  get: $httpClient.get,
  notify: $notification.post,
  done: $done
} : {
  get: (params, cb) => $task.fetch(params).then(resp => cb(null, resp, resp.body)),
  notify: (title, subtitle, message) => $notify(title, subtitle, message),
  done: () => $done()
};

// 提取参数
const argStr = typeof $argument === 'string' ? $argument : '';
const args = Object.fromEntries(argStr.split("&").map(kv => kv.split("=")));
const subRaw = args["机场订阅链接地址"] || args["sub"] || "";

if (!subRaw) {
  $.notify("📡 机场流量通知", "", "❗未提供订阅链接参数");
  $.done();
}

const urls = decodeURIComponent(subRaw).split("&").map(u => u.trim()).filter(Boolean);
let finished = 0;
let results = [];

urls.forEach((url, i) => {
  const options = {
    url,
    timeout: 8000,
    headers: {
      "User-Agent": "Shadowrocket/2615 CFNetwork/1406 Darwin/22.4.0"
    }
  };

  $.get(options, (err, resp, body) => {
    finished++;
    const tag = `链接${i + 1}`;

    if (err || !body) {
      results.push(`🚫 ${tag} 请求失败`);
    } else {
      try {
        const decoded = decodeURIComponent(body);
        if (!decoded.includes("STATUS=")) {
          results.push(`❌ ${tag} 无有效状态信息`);
        } else {
          const match = decoded.match(/STATUS=↑:(.*?),↓:(.*?),TOT:(.*?)(?:Expires:([\d\-]+))?/);
          if (match) {
            const up = match[1];
            const down = match[2];
            const total = match[3];
            const expire = match[4] || "未知";
            results.push(`🔗 ${tag}\n📤↑：${up} | 📥↓：${down}\n📦 总量：${total}\n⏳ 到期：${expire}`);
          } else {
            results.push(`⚠️ ${tag} 状态解析失败`);
          }
        }
      } catch (e) {
        results.push(`💥 ${tag} 解码异常`);
      }
    }

    if (finished === urls.length) {
      $.notify("📡 机场流量通知", "", results.join("\n\n"));
      $.done();
    }
  });
});