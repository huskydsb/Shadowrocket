const arrow = " ➟ ";
let lastPrice = null;
let spotify = "🔴No"; 
let result = {}; 

const token = $persistentStore.read("ipinfo_token") || "";

(async () => {
  try {
    console.log("开始 Spotify 测试...");
    await Spotify_Test();
    console.log("Spotify 测试完成");

    console.log("开始获取 Spotify 价格...");
    await Spotify_Price();
    console.log("Spotify 价格获取完成");
  } catch (error) {
    result.message = "❌发生错误: " + error.message;
    console.log("错误信息: " + error.message);
    return $done({
      response: {
        status: 200,
        body: JSON.stringify(result),
        headers: { "Content-Type": "application/json" },
      },
    });
  }

  // 将结果封装到 result.message 中，并确保格式正确
  result.message = `🎶查询成功 - Spotify 状态与价格<br>`;
  result.message += `Spotify Status: ${spotify}<br>`;
  result.message += `Price: ${lastPrice || "N/A"}<br>`; // 如果没有价格则返回N/A

  console.log("返回结果: " + JSON.stringify(result));

  return $done({
    response: {
      status: 200,
      body: JSON.stringify(result),
      headers: { "Content-Type": "application/json" },
    },
  });
})();

async function Spotify_Test() {
  var options = {
    url: `https://spclient.wg.spotify.com/signup/public/v1/account`,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": "en",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    body: "birth_day=11&birth_month=11&birth_year=2000&collect_personal_info=undefined&creation_flow=&creation_point=https%3A%2F%2Fwww.spotify.com%2Fhk-en%2F&displayname=Gay%20Lord&gender=male&iagree=1&key=a1e486e2729f46d6bb368d6b2bcda326&platform=www&referrer=&send-email=0&thirdpartyemail=0&identifier_token=AgE6YTvEzkReHNfJpO114514",
    timeout: 10000, // 设置超时
  };

  console.log("发送 Spotify 测试请求...");
  // 使用 $httpClient 发送 POST 请求
  return new Promise((resolve, reject) => {
    $httpClient.post(options, (error, response, body) => {
      if (error) {
        reject("❌请求失败: " + error);
      } else {
        console.log("Spotify 注册响应: " + body);
        var obj = JSON.parse(body);
        if (obj.status == "320" || obj.status == "120") {
          spotify = "🔴No";
        } else if (obj.status == "311") {
          spotify_country = obj.country;
          spotify = "🎉Yes" + arrow + getCountryFlagEmoji(obj.country) + spotify_country;
        }
        console.log("🎵Spotify: " + spotify);
        resolve();
      }
    });
  });
}

async function Spotify_Price() {
  var lang = spotify_country ? spotify_country.toLowerCase() : await getLanguage();

  var options = {
    url: `https://www.spotify.com/${lang}/premium/`,
    headers: {
      Cookie: `sp_t=10f2c6c4-dcd4-4ca8-9b60-bd1718e60d4b; sp_landing=https%3A%2F%2Fwww.spotify.com%2Fnl%2Fpremium%2F; sp_m=nl; sp_new=1; sp_t=8edfd15b-23d8-4b5f-b6ec-27da0f69f674`,
      "Accept-Encoding": `gzip, deflate, br`,
      Accept: `*/*`,
      Referer: `https://www.spotify.com/nl/premium/`,
      Connection: `keep-alive`,
      Host: `www.spotify.com`,
      "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/604.1`,
      "Accept-Language": `zh-CN,zh-Hans;q=0.9`,
    },
    timeout: 10000, // 设置超时
  };

  console.log("发送 Spotify 价格请求...");
  // 使用 $httpClient 发送 GET 请求
  return new Promise((resolve, reject) => {
    $httpClient.get(options, (error, response, body) => {
      if (error) {
        reject("❌请求失败: " + error);
      } else {
        console.log("Spotify 价格响应: " + body);
        let matchResult;
        const regex = /"primaryPriceDescription"\s*:\s*"([^"]+)"/g;

        while ((matchResult = regex.exec(body)) !== null) {
          const price = matchResult[1];
          if (!price.includes("Free")) {
            lastPrice = price.trim().replace(/\s*\/\s*/, "/");
          }
        }

        if (lastPrice !== null) {
          console.log(`🎶 Last Primary Price: ${lastPrice}`);
        } else {
          lastPrice = "N/A";
          console.log("🎶 No family plan found");
        }

        resolve();
      }
    });
  });
}

async function getCountry() {
  var options = {
    url: `https://ipinfo.io/json?token=${token}`,
    headers: {
      "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36`,
      "Content-Type": "application/json",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Encoding": "gzip, deflate, br",
    },
  };

  return new Promise((resolve, reject) => {
    $httpClient.get(options, (error, response, body) => {
      if (error) {
        reject("❌IP查询失败: " + error);
      } else {
        console.log("IP查询响应: " + body);
        var obj = JSON.parse(body);
        if (!obj.ip) {
          console.log("🔴IP查询失败!");
          reject("🔴IP查询失败!");
        }
        resolve(obj.country.toLowerCase());
      }
    });
  });
}

async function getLanguage() {
  var country = await getCountry();

  var options = {
    url: `https://www.spotify.com/${country}/premium/`,
    headers: {
      Cookie: `sp_t=10f2c6c4-dcd4-4ca8-9b60-bd1718e60d4b; sp_landing=https%3A%2F%2Fwww.spotify.com%2Fnl%2Fpremium%2F; sp_m=nl; sp_new=1; sp_t=8edfd15b-23d8-4b5f-b6ec-27da0f69f674`,
      "Accept-Encoding": `gzip, deflate, br`,
      Accept: `*/*`,
      Referer: `https://www.spotify.com/nl/premium/`,
      Connection: `keep-alive`,
      Host: `www.spotify.com`,
      "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 16_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Mobile/15E148 Safari/604.1`,
      "Accept-Language": `zh-CN,zh-Hans;q=0.9`,
    },
    timeout: 10000, // 设置超时
  };

  return new Promise((resolve, reject) => {
    $httpClient.get(options, (error, response, body) => {
      if (error) {
        reject("❌获取语言失败: " + error);
      } else {
        console.log("获取语言响应: " + body);
        const regex =
          /updatePreferredLocaleUrl\"\:\"https:\/\/www\.spotify\.com\/(.*)\/update-preferred-locale\//;

        let ret = regex.exec(body);
        if (ret != null && ret.length === 2) {
          region = ret[1];
        } else {
          region = `${country}`;
        }
        console.log("Spotify地区: " + region);
        resolve(region);
      }
    });
  });
}

function getCountryFlagEmoji(countryCode) {
  if (countryCode.toUpperCase() == "TW") {
    countryCode = "WS";
  }
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}