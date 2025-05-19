const $ = $httpClient ? {
    get: $httpClient.get,
    notify: $notification.post,
    done: $done
} : {
    get: (p, cb) => $task.fetch(p).then(r => cb(null, r, r.body)),
    notify: (t, s, m) => $notify(t, s, m),
    done: () => $done()
};

const args = Object.fromEntries(($argument || "").split("&").map(i => i.split("=")));
const urlList = decodeURIComponent(args["机场订阅链接"] || "").split("&").filter(Boolean);

let results = [], finished = 0;

for (let i = 0; i < urlList.length; i++) {
  const url = urlList[i];
  const params = {
    url,
    timeout: 5000,
    headers: { "User-Agent": "QuantumultX" },
    alpn: "h2"
  };

  $.get(params, function (err, resp, body) {
    finished++;

    try {
      const json = JSON.parse(body);
      if (json.status !== "success" || !json.data) {
        results.push(`🚫 链接${i + 1} 返回格式异常`);
      } else {
        const { total, usage, appUrl } = json.data;
        const format = b => (b / (1 << 30)).toFixed(2) + " GB";
        const used = usage.upload + usage.download;
        const msg = `🔗 链接${i + 1}\n📊 使用 ${format(used)} / ${format(total)}\n🌐 管理地址：${appUrl || "无"}`;
        results.push(msg);
      }
    } catch (e) {
      results.push(`❌ 链接${i + 1} 解析失败`);
    }

    if (finished === urlList.length) {
      $.notify("📡 机场流量通知", "", results.join("\n\n"));
      $.done();
    }
  });
}