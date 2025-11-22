$done({
  status: 200,
  headers: { 'Content-Type': 'text/html' },
  body: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>流媒体测速 - Ping 测试</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
    h1 { color: #333; }
    .result { margin-top: 20px; }
    .loading { color: #888; }
  </style>
</head>
<body>
  <h1>流媒体 Ping 测试</h1>
  <button onclick="startPingTest()">开始测试</button>
  <div id="results" class="result"></div>

  <script>
    const services = [
      { name: "Netflix", url: "https://fast.com" },
      { name: "YouTube", url: "https://youtube.com" },
      { name: "Disney+", url: "https://disneyplus.com" },
      { name: "HBO Max", url: "https://hbomax.com" },
      { name: "Hulu", url: "https://hulu.com" }
    ];

    function startPingTest() {
      document.getElementById('results').innerHTML = '<p class="loading">正在测试...</p>';
      let resultsHTML = '';

      services.forEach(service => {
        const startTime = Date.now();
        fetch(service.url, { method: 'HEAD', mode: 'no-cors' })
          .then(() => {
            const ping = Date.now() - startTime;
            resultsHTML += `<p>${service.name}: ${ping} ms</p>`;
            document.getElementById('results').innerHTML = resultsHTML;
          })
          .catch(() => {
            resultsHTML += `<p>${service.name}: 测试失败</p>`;
            document.getElementById('results').innerHTML = resultsHTML;
          });
      });
    }
  </script>
</body>
</html>
  `
});