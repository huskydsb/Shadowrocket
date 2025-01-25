let result = {}; // 用于存储返回的结果
let regions = {
  mainland: "哔哩哔哩大陆限定",
  hkMctw: "哔哩哔哩港澳台限定",
  tw: "哔哩哔哩台湾限定",
};

(async () => {
  try {
    console.log("开始 Bilibili 解锁检测...");

    // 执行大陆限定检测
    await MediaUnlockTest_Bilibili("mainland");
    // 执行港澳台限定检测
    await MediaUnlockTest_Bilibili("hkMctw");
    // 执行台湾限定检测
    await MediaUnlockTest_Bilibili("tw");

    console.log("Bilibili 解锁检测完成");

  } catch (error) {
    result.message = `❌发生错误: ${error.message}`;
    console.log("错误信息: " + error.message);
  }

  // 拼接返回的消息，使用 <br> 换行
  result.message = Object.values(result).join('<br>');
  console.log("返回结果: " + JSON.stringify(result));
  
  // 使用 $done 返回结果
  $done({
    response: {
      status: 200,
      body: JSON.stringify(result),
      headers: { "Content-Type": "application/json" },
    },
  });
})();

// 通用 Bilibili 解锁检测函数
async function MediaUnlockTest_Bilibili(region) {
  const randsession = generateUUID();
  let url = getBilibiliUrl(region, randsession);

  console.log(`检测 ${regions[region]}...`);

  // 请求结果
  let options = {
    url: url,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    timeout: 10000, // 设置超时
  };

  return new Promise((resolve, reject) => {
    $httpClient.get(options, (error, response, body) => {
      if (error) {
        result[region] = `${regions[region]}: ❌ 网络连接失败`;
        console.log(`[LOG] ${regions[region]}: 网络连接失败`);
        resolve();
      } else {
        let code = extractResultCode(body);
        if (code === "0") {
          result[region] = `${regions[region]}: ✅ 解锁成功`;
          console.log(`[LOG] ${regions[region]}: 解锁成功`);
        } else if (code === "-10403") {
          result[region] = `${regions[region]}: ❌ 未解锁`;
          console.log(`[LOG] ${regions[region]}: 未解锁`);
        } else {
          result[region] = `${regions[region]}: ❌ 错误代码: ${code}`;
          console.log(`[LOG] ${regions[region]}: 错误代码: ${code}`);
        }
        resolve();
      }
    });
  });
}

// 根据 region 返回对应的 URL
function getBilibiliUrl(region, randsession) {
  const urls = {
    mainland: `https://api.bilibili.com/pgc/player/web/playurl?avid=82846771&qn=0&type=&otype=json&ep_id=307247&fourk=1&fnver=0&fnval=16&session=${randsession}&module=bangumi`,
    hkMctw: `https://api.bilibili.com/pgc/player/web/playurl?avid=18281381&cid=29892777&qn=0&type=&otype=json&ep_id=183799&fourk=1&fnver=0&fnval=16&session=${randsession}&module=bangumi`,
    tw: `https://api.bilibili.com/pgc/player/web/playurl?avid=50762638&cid=100279344&qn=0&type=&otype=json&ep_id=268176&fourk=1&fnver=0&fnval=16&session=${randsession}&module=bangumi`,
  };
  return urls[region] || "";
}

// 从响应体中提取结果代码
function extractResultCode(body) {
  const result = body.match(/"code"\s*:\s*(-?\d+)/);
  return result ? result[1] : null;
}

// 生成 UUID
function generateUUID() {
  let dt = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}