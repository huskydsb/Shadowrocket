/*
🛒 小米商城任务签到脚本
依赖抓包脚本已保存：
MI_SERVICE_TOKEN
MI_SIGN
MI_ACT_ID
*/

const SERVICE_TOKEN = $persistentStore.read("MI_SERVICE_TOKEN");
const SIGN = $persistentStore.read("MI_SIGN");
const ACT_ID = $persistentStore.read("MI_ACT_ID") || "6706c0695404a23dfb5b2cab";

if (!SERVICE_TOKEN || !SIGN) {
  $notification.post(
    "🛒 小米商城任务",
    "参数缺失",
    "请先运行抓包脚本获取 serviceToken / sign"
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
  return new Promise((resolve, reject) => {
    $httpClient.post(
      { url, headers: HEADERS, body: JSON.stringify(body) },
      (err, resp, data) => {
        if (err) reject(err);
        else {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
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
  if (res.message !== "ok") throw "获取任务失败，sign 可能已失效";

  const comps = res?.data?.result_list?.[0]?.components || [];
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
  return res?.data?.taskToken || null;
}

// ========= 完成任务 =========
async function doTask(token, taskType) {
  const url = "https://shop-api.retail.mi.com/mtop/mf/act/infinite/done";
  const body = [{}, { taskToken: token, actId: ACT_ID, taskType }];
  return await post(url, body);
}

// ========= 主流程 =========
(async () => {
  let logs = [];
  let success = 0;

  try {
    const tasks = await getTasks();
    logs.push(`发现任务 ${tasks.length} 个`);

    for (const t of tasks) {
      const { taskId, taskName, taskType } = t;

      if (taskType === 201) {
        logs.push(`⏭️ 跳过支付任务：${taskName}`);
        continue;
      }

      const token = await getTaskToken(taskId);
      if (!token) {
        logs.push(`❌ ${taskName} token 获取失败`);
        continue;
      }

      if (taskType === 200) {
        await new Promise(r => setTimeout(r, 3000));
      }

      const res = await doTask(token, taskType);
      if (res.success) {
        success++;
        const award = res?.data?.awardList?.[0];
        if (award) {
          logs.push(`✅ ${taskName} +${award.awardValue}${award.awardName}`);
        } else {
          logs.push(`✅ ${taskName} 完成`);
        }
      } else {
        logs.push(`❌ ${taskName} 执行失败`);
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    $notification.post(
      "🛒 小米商城任务完成",
      `成功 ${success} 个`,
      logs.join("\n")
    );

  } catch (e) {
    $notification.post(
      "🛒 小米商城任务异常",
      "",
      String(e)
    );
  }

  $done();
})();
