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
const urlList = decodeURIComponent(args["机场订阅链接"] || "").split("&").filter(Boolean);

if (urlList.length === 0) {
  $.notify("📡 机场流量通知", "", "❗未设置有效订阅链接");
  $.done();
}

const format = (bytes) => (bytes / (1 << 30)).toFixed(2) + " GB";

let finished = 0;
let output = [];

urlList.forEach((url, index) => {
  const params = {
    url: url.trim(),
    headers: { "User-Agent": "Shadowrocket" },
    timeout: 8000
  };

  $.get(params, (err, resp, body) => {
    finished++;

    try {
      const json = JSON.parse(body);
      if (json.status !== "success" || !json.data || !json.data.usage) {
        output.push(`🚫 链接${index + 1} 数据异常`);
      } else {
        const total = json.data.total || 0;
        const upload = json.data.usage.upload || 0;
        const download = json.data.usage.download || 0;
        const used = upload + download;

        output.push(
          `🔗 链接${index + 1}：\n📊 ${format(used)} / ${format(total)} 已用`
        );
      }
    } catch (e) {
      output.push(`❌ 链接${index + 1} 解析失败`);
    }

    if (finished === urlList.length) {
      $.notify("📡 机场流量通知", "", output.join("\n\n"));
      $.done();
    }
  });
});