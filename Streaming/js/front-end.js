const html = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#ffffff">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="icon" href="https://www.shadowrocketdownload.com/img/logo.png" sizes="192x192">
    <link rel="apple-touch-icon" href="https://www.shadowrocketdownload.com/img/logo.png" sizes="180x180">
    <link rel="icon" type="image/png" href="https://www.shadowrocketdownload.com/img/logo.png" sizes="64x64">
    <title>常规流媒体服务解锁查询</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Segoe UI", Arial, sans-serif;
            background-color: #f7f7f7;
            background-image: url('https://raw.githubusercontent.com/huskydsb/Shadowrocket/main/Streaming/icon/cool-background.png');
            background-size: cover;
            background-position: center;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            transition: background-color 0.3s ease;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            margin-top: 16px;
        }
        .header a {
            display: flex;
            align-items: center;
            text-decoration: none;
        }
        .header img {
            width: 60px;
            height: 60px;
            margin-right: 15px;
        }
        .header h1 {
            font-size: 28px;
            font-weight: bold;
            color: transparent;
            background: linear-gradient(45deg, #ff0077, #5900b3, #00b3b3);
            -webkit-background-clip: text;
            background-clip: text;
            margin: 0;
            text-align: center;
        }
        .container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 20px;
            width: 90%;
            max-width: 1000px;
            margin-bottom: 50px;
            padding: 10px;
        }
        @media (max-width: 375px) {
            .container {
                grid-template-columns: repeat(2, 1fr);
            }
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
            color: #444;
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
            color: #333;
        }
        @media (prefers-color-scheme: dark) {
            .module span {
                color: #999;
            }
        }
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
            color: #444;
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
        @media (prefers-color-scheme: dark) {
            body {
                background-color: #121212;
            }
            .module {
                background-color: #333;
                color: #fff;
            }
            .module:hover {
                background-color: #444;
            }
            #result-popup {
                background-color: #333;
                color: #fff;
            }
            #result-popup h2 {
                color: #fff;
            }
            #result-popup p {
                color: #bbb;
            }
            #close-btn {
                background-color: #d32f2f;
            }
            #copy-btn {
                background-color: #388e3c;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <a href="https://t.me/ShadowrocketApp" target="_blank">
            <img class="logo" src="https://www.shadowrocketdownload.com/img/logo.png" alt="Logo">
            <h1>常规流媒体服务解锁查询</h1>
        </a>
    </div>

    <div id="container" class="container"></div>

    <div id="result-popup">
        <h2 id="popup-title"></h2>
        <p id="popup-message"></p>
        <div class="buttons">
            <button id="close-btn">关闭</button>
            <button id="copy-btn">复制</button>
        </div>
    </div>

    <script>
        const baseUrl = "https://streaming.test";

        const streamingServices = [
            { name: 'YouTube', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg', endpoint: 'youtube' },
            { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', endpoint: 'netflix' },
            { name: 'ChatGPT', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/2048px-ChatGPT-Logo.svg.png', endpoint: 'chatgpt' },
            { name: 'TikTok', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/2560px-TikTok_logo.svg.png', endpoint: 'tiktok' },
            { name: 'Disney+', logo: 'https://upload.wikimedia.org/wikipedia/commons/archive/7/77/20230514165915%21Disney_Plus_logo.svg', endpoint: 'disney' },
            { name: 'Spotify', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Spotify_logo_with_text.svg/2560px-Spotify_logo_with_text.svg.png', endpoint: 'spotify' },
            { name: 'Scamalytics', logo: 'https://scamalytics.com/wp-content/uploads/2016/09/Scamalytics_Logo_horizontal_no_background_no_strapline-1024x226.png', endpoint: 'scamalytics' },
            { name: 'Bing', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Bing_Fluent_Logo_Text.svg/2535px-Bing_Fluent_Logo_Text.svg.png', endpoint: 'bing' },            
            { name: 'Bilibili', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b7/Bilibili_logo.svg/2560px-Bilibili_logo.svg.png', endpoint: 'bilibili' },
            { name: 'Steam', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/2048px-Steam_icon_logo.svg.png', endpoint: 'steam' },
            { name: 'PrimeVideo', logo: 'https://logos-world.net/wp-content/uploads/2021/04/Amazon-Prime-Video-Logo.png', endpoint: 'primevideo' },
            { name: 'HBO Max', logo: 'https://logotyp.us/file/hbo-max.svg', endpoint: 'max' },
            { name: 'Bahamut', logo: 'https://i2.bahamut.com.tw/anime/logo.svg', endpoint: 'bahamut' },
            { name: 'ニコニコ', logo: 'https://raw.githubusercontent.com/huskydsb/Shadowrocket/main/Streaming/icon/niconco.png', endpoint: 'nicovideo' }
        ];

        const container = document.getElementById('container');
        const resultPopup = document.getElementById('result-popup');
        const popupTitle = document.getElementById('popup-title');
        const popupMessage = document.getElementById('popup-message');
        const closeBtn = document.getElementById('close-btn');
        const copyBtn = document.getElementById('copy-btn');

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

        streamingServices.forEach(service => {
            container.appendChild(createModule(service));
        });

        async function runTest(name, endpoint) {
            const url = \`\${baseUrl}/\${endpoint}\`;

            popupTitle.textContent = \`正在测试 \${name}\`;
            popupMessage.textContent = '请稍候...';
            resultPopup.style.display = 'block';

            try {
                const response = await fetch(url, { method: 'GET', timeout: 10000 });
                if (!response.ok) throw new Error('请求失败');
                const result = await response.json();

                popupTitle.textContent = \`\${name} 测试结果\`;
                const resultMessage = result.message || "未知结果";

                popupMessage.innerHTML = resultMessage;
                console.log(\`\${name} 测试结果：\`, resultMessage);
            } catch (error) {
                popupTitle.textContent = \`\${name} 测试失败\`;
                popupMessage.textContent = '请检查网络连接或分流规则';
            }
        }

        closeBtn.addEventListener('click', () => {
            resultPopup.style.display = 'none';
        });

        copyBtn.addEventListener('click', () => {
            const message = popupMessage.textContent || popupMessage.innerText;
            navigator.clipboard.writeText(message);
            resultPopup.style.display = 'none';
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