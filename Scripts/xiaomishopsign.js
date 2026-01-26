/*
🛒 小米商城任务签到脚本
依赖抓包脚本已保存：
MI_SERVICE_TOKEN
MI_SIGN
MI_ACT_ID
*/

const SERVICE_TOKEN = $persistentStore.read("MI_SERVICE_TOKEN");
const SIGN = $persistentStore.read("MI_SIGN");
const ACT_ID = $persistentStore.read("MI_ACT_ID");

let logs = []; // 全局日志记录

if (!SERVICE_TOKEN || !SIGN || !ACT_ID) {
  $notification.post(
    "🛒 小米商城任务",
    "参数缺失",
    `serviceToken: ${!!SERVICE_TOKEN}\nsign: ${!!SIGN}\nactId: ${!!ACT_ID}`
  );
  $done();
}

// ========= 基础请求头 =========
const HEADERS = {
  "x-user-agent": "channel/mishop platform/mishop.ios",
  "Content-Type": "application/json",
  "User-Agent": "okhttp/3.12.3",
  "Cookie": `serviceToken=${SERVICE_TOKEN};`
};

// ========= HTTP POST =========
function post(url, body) {
  logs.push(`➡️ 请求 URL: ${url}`);
  logs.push(`📦 请求 Body: ${JSON.stringify(body)}`);

  return new Promise((resolve, reject) => {
    $httpClient.post(
      { url, headers: HEADERS, body: JSON.stringify(body) },
      (err, resp, data) => {
        if (err) {
          logs.push(`❌ 请求失败: ${err}`);
          reject(err);
        } else {
          logs.push(`✅ 响应 Status: ${resp?.status}`);
          logs.push(`📤 响应 Body: ${data}`);
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            logs.push(`❌ JSON 解析失败: ${e}`);
            reject("JSON 解析失败");
          }
        }
      }
    );
  });
}

// ========= 获取任务 =========
async function getTasks() {
  const url =
    "https://shop-api.retail.mi.com/mtop/navi/venue/batch?page_id=13880&pdl=mishop";

  const body = {
    query_list: [
      {
        resolver: "infinite-task",
        sign: SIGN,
        parameter: JSON.stringify({
          actId: ACT_ID,
          taskTypeList: [101, 110, 200, 201, 202]
        }),
        variable: {}
      }
    ]
  };

  const res = await post(url, body);
  if (res.message !== "ok") throw `获取任务失败，message: ${res.message}, sign可能已失效`;

  const comps = res?.data?.result_list?.[0]?.components || [];
  logs.push(`📌 可执行组件数量: ${comps.length}`);
  return comps.filter(c => c.canDo !== false).map(c => ({
    taskId: c.taskId,
    taskName: c.taskName || "",
    taskType: Number(c.taskType || 0)
  }));
}

// ========= 获取 taskToken =========
async function getTaskToken(taskId) {
  const url = "https://shop-api.retail.mi.com/mtop/mf/act/infinite/do";
  const body = [{}, { taskId, actId: ACT_ID }];
  const res = await post(url, body);

  const token = res?.data?.taskToken;
  logs.push(`🎫 taskId: ${taskId} -> taskToken: ${token ? "✅获取成功" : "❌获取失败"}`);
  return token || null;
}

// ========= 完成任务 =========
async function doTask(token, taskType, taskName) {
  const url = "https://shop-api.retail.mi.com/mtop/mf/act/infinite/done";
  const body = [{}, { taskToken: token, actId: ACT_ID, taskType }];
  const res = await post(url, body);

  if (res.success) {
    const award = res?.data?.awardList?.[0];
    if (award) {
      logs.push(`🏆 ${taskName} 成功: +${award.awardValue}${award.awardName}`);
    } else {
      logs.push(`✅ ${taskName} 成功（无奖励）`);
    }
  } else {
    logs.push(`❌ ${taskName} 执行失败, msg: ${res.msg || "未知错误"}`);
  }

  return res;
}

// ========= 主流程 =========
(async () => {
  let success = 0;

  try {
    logs.push("🚀 开始获取任务列表...");
    const tasks = await getTasks();
    logs.push(`📋 发现任务 ${tasks.length} 个`);

    for (const t of tasks) {
      const { taskId, taskName, taskType } = t;

      if (taskType === 201) {
        logs.push(`⏭️ 跳过支付任务: ${taskName}`);
        continue;
      }

      logs.push(`🔹 执行任务: ${taskName}, type: ${taskType}`);
      const token = await getTaskToken(taskId);
      if (!token) {
        logs.push(`❌ ${taskName} taskToken 获取失败`);
        continue;
      }

      if (taskType === 200) {
        logs.push(`⏳ 浏览任务等待 3 秒...`);
        await new Promise(r => setTimeout(r, 3000));
      }

      await doTask(token, taskType, taskName);
      success++;
      await new Promise(r => setTimeout(r, 1000));
    }

    logs.push(`🎯 所有任务执行完成，成功 ${success} 个`);
    $notification.post(
      "🛒 小米商城任务完成",
      `成功 ${success} 个`,
      logs.join("\n")
    );

  } catch (e) {
    logs.push(`❌ 脚本异常: ${e}`);
    $notification.post(
      "🛒 小米商城任务异常",
      "",
      logs.join("\n")
    );
  }

  $done();
})();
