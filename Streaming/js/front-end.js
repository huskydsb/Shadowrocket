const html = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#ffffff"> <!-- 设置主题颜色，避免黑边 -->
    <meta name="apple-mobile-web-app-capable" content="yes"> <!-- 启用“应用程序”模式 -->
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"> <!-- 设置状态栏样式 -->
    
    <!-- 网页图标 -->
    <link rel="icon" href="https://www.shadowrocketdownload.com/img/logo.png" sizes="192x192"> <!-- 推荐使用 192x192 图标 -->
    <link rel="apple-touch-icon" href="https://www.shadowrocketdownload.com/img/logo.png" sizes="180x180"> <!-- iOS 上的应用图标 -->
    <!-- 为书签添加图标 -->
    <link rel="icon" type="image/png" href="https://www.shadowrocketdownload.com/img/logo.png" sizes="64x64">

    <title>流媒体解锁测试</title>
    <style>
        /* 页面基本样式 */
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }

        /* 顶部 logo 和标题 */
/* 顶部 logo 和标题 */
.header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30px;
    margin-top: 16px;  /* 向下移动 logo 和标题 */
}
        .header a {
            display: flex;
            align-items: center;
            text-decoration: none;
        }

        .header img {
            width: 80px; /* 放大 Logo */
            height: 80px; /* 放大 Logo */
            margin-right: 15px; /* logo 与标题的间距 */
        }

        .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin: 0;
            text-align: center;
        }

        /* 模块容器 */
        .container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 20px;
            width: 90%;
            max-width: 1000px;
            margin-bottom: 50px;
            padding: 10px;
        }

        .module {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 2px solid #ddd;
            border-radius: 12px;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: all 0.3s ease-in-out;
        }

        .module:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .module img {
            width: 80px;
            height: 80px;
            margin-bottom: 15px;
            object-fit: contain;
        }

        .module span {
            font-size: 18px;
            font-weight: 600;
            color: #444;
        }

        /* 弹窗样式 */
        #result-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 75%;
            max-width: 600px;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            padding: 20px;
            display: none;
            z-index: 1000;
            box-sizing: border-box;
        }

        #result-popup h2 {
            margin: 0 0 15px 0;
            font-size: 20px;
            color: #444;
            text-align: center;
        }

        #result-popup p {
            margin: 0 0 20px 0;
            font-size: 16px;
            text-align: center;
            color: #666;
        }

        #result-popup .buttons {
            display: flex;
            justify-content: space-between;
        }

        #result-popup button {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            width: 48%;
            transition: background-color 0.3s;
        }

        #close-btn {
            background-color: #f44336;
            color: white;
        }

        #close-btn:hover {
            background-color: #d32f2f;
        }

        #copy-btn {
            background-color: #4caf50;
            color: white;
        }

        #copy-btn:hover {
            background-color: #388e3c;
        }
    </style>
</head>
<body>
    <!-- 添加 logo 和标题，logo 被包裹在 <a> 标签中 -->
    <div class="header">
        <a href="https://t.me/ShadowrocketApp" target="_blank">
            <img class="logo" src="https://www.shadowrocketdownload.com/img/logo.png" alt="Logo">
            <h1>流媒体解锁测试</h1>
        </a>
    </div>

    <div id="container" class="container"></div>

    <!-- 弹出模块 -->
    <div id="result-popup">
        <h2 id="popup-title"></h2>
        <p id="popup-message"></p>
        <div class="buttons">
            <button id="close-btn">关闭</button>
            <button id="copy-btn">复制</button>
        </div>
    </div>

    <script>
        // 配置基础 URL
        const baseUrl = "https://streaming.test"; // 请修改为实际后端地址

        const streamingServices = [
            { name: 'YouTube', logo: 'https://th.bing.com/th/id/R.b02b5d363a610229fe82e82ed0c369b4?rik=lECwiztO4NeaVA&pid=ImgRaw&r=0', endpoint: 'youtube' },
            { name: 'Netflix', logo: 'https://th.bing.com/th/id/R.f8cfc663b462b3a20167b743aa3bc059?rik=%2bScScgSR6An6uw&pid=ImgRaw&r=0', endpoint: 'netflix' },
            { name: 'ChatGPT', logo: 'https://thumbs.dreamstime.com/b/minsk-belarus-openai-chatgpt-logo-artifical-chatbot-system-chat-bot-button-web-app-phone-icon-symbol-editorial-vector-278857334.jpg', endpoint: 'chatgpt' },
            { name: 'TikTok', logo: 'https://th.bing.com/th/id/R.d48d60b648c547f4603eafedb273e2d6?rik=A6hIvIL7D%2bQYMw&pid=ImgRaw&r=0', endpoint: 'tiktok' },
            { name: 'Disney+', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg', endpoint: 'disney' },
            { name: 'Scamalytics', logo: 'https://thumbs.dreamstime.com/b/ip-icon-isolated-white-background-simple-vector-logo-221565540.jpg', endpoint: 'scamalytics' },
            { name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg', endpoint: 'spotify' },  // 新增 Spotify 模块
            { name: 'Bilibili', logo: 'https://img.icons8.com/?size=512&id=5E24fZ9ORelo&format=png', endpoint: 'bilibili' },  // 新增 Bilibili 模块
            { name: 'Steam', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/2048px-Steam_icon_logo.svg.png', endpoint: 'steam' },  // 新增 Steam 模块
            { name: 'Bahamut', logo: 'https://play-lh.googleusercontent.com/OM1SQPEe8MSSCwLNmHr14meKhmwE3uYW5n24VxMnozsKK58TOWsgyUuSqq78EOV4l7c', endpoint: 'bahamut' }  // 新增 Bahamut 模块
        ];

        // 获取 HTML 元素
        const container = document.getElementById('container');
        const resultPopup = document.getElementById('result-popup');
        const popupTitle = document.getElementById('popup-title');
        const popupMessage = document.getElementById('popup-message');
        const closeBtn = document.getElementById('close-btn');
        const copyBtn = document.getElementById('copy-btn');

        // 动态创建流媒体模块
        function createModule(service) {
            const moduleDiv = document.createElement('div');
            moduleDiv.className = 'module';
            moduleDiv.innerHTML = \`
                <img src="\${service.logo}" alt="\${service.name} Logo">
                <span>\${service.name}</span>
            \`;
            moduleDiv.addEventListener('click', () => runTest(service.name, service.endpoint));
            return moduleDiv;
        }

        // 渲染所有模块到页面
        streamingServices.forEach(service => {
            container.appendChild(createModule(service));
        });

        // 测试流媒体服务
        async function runTest(name, endpoint) {
            const url = \`\${baseUrl}/\${endpoint}\`;

            popupTitle.textContent = \`正在测试 \${name}\`;
            popupMessage.textContent = '请稍候...';
            resultPopup.style.display = 'block';

            try {
                const response = await fetch(url, { method: 'GET', timeout: 10000 });
                if (!response.ok) throw new Error('请求失败');
                const result = await response.json(); // 假设服务器返回的是 JSON 格式的响应

                popupTitle.textContent = \`\${name} 测试结果\`;

                // 提取并显示 message 字段的值
                const resultMessage = result.message || "未知结果";

                popupMessage.innerHTML = resultMessage; // 使用 innerHTML 来显示包含 <br> 的内容
                console.log(\`\${name} 测试结果：\`, resultMessage);
            } catch (error) {
                popupTitle.textContent = \`\${name} 测试失败\`;
                popupMessage.textContent = '请检查网络连接或脚本错误';
            }
        }

        // 关闭弹窗
        closeBtn.addEventListener('click', () => {
            resultPopup.style.display = 'none';
        });

        // 复制按钮功能
        copyBtn.addEventListener('click', () => {
            const message = popupMessage.textContent || popupMessage.innerText;
            navigator.clipboard.writeText(message); // 移除复制成功弹窗提示
            resultPopup.style.display = 'none'; // 复制后自动关闭弹窗
        });
    </script>
</body>
</html>
`;

$done({
  response: {
    status: 200,
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    body: html
  }
});