/*
🛒 小米商城任务签到脚本
依赖参数：
MI_SERVICE_TOKEN, MI_SIGN, MI_ACT_ID
*/

const SERVICE_TOKEN = $persistentStore.read("MI_SERVICE_TOKEN");
if (!SERVICE_TOKEN) {
  $notification.post("🛒 小米商城任务", "缺少 serviceToken", "请先运行抓包脚本获取参数");
  $done();
}

const HEADERS = {
  "x-user-agent": "channel/mishop platform/mishop.ios",
  "Content-Type": "application/json",
  "User-Agent": "okhttp/3.12.3",
  "Cookie": `serviceToken=${SERVICE_TOKEN};`
};

function get(url) {
  return new Promise((resolve, reject) => {
    $httpClient.get({ url, headers: HEADERS }, (err, resp, data) => {
      if (err) reject(err);
      else {
        try { resolve(JSON.parse(data)); } 
        catch(e){ reject("JSON解析失败: " + data); }
      }
    });
  });
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    $httpClient.post({ url, headers: HEADERS, body: JSON.stringify(body) }, (err, resp, data) => {
      if (err) reject(err);
      else {
        try { resolve(JSON.parse(data)); }
        catch(e){ reject("JSON解析失败: " + data); }
      }
    });
  });
}

async function getTasks() {
  console.log("🚀 获取任务列表...");
  const url = `https://shop-api.retail.mi.com/mtop/navi/venue/page?page_id=13880&pdl=mishop&_r=${Date.now()}`;
  const res = await get(url);
  if (res.code !== 0) throw `获取任务失败: ${res.message}`;

  const taskFloor = res?.data?.floors?.find(f => f.module_key === "mi_task_floor");
  if (!taskFloor) throw "未找到任务楼层";

  const query = taskFloor.query_list?.[0];
  if (!query) throw "未找到 query_list";

  const actId = JSON.parse(query.parameter).actId;
  const sign = query.sign;
  const tasks = taskFloor.data?.actIdList || [];

  console.log("➡️ actId:", actId, "sign:", sign, "任务数量:", tasks.length);

  return { actId, sign, tasks };
}

async function getTaskToken(taskId, actId) {
  const url = "https://shop-api.retail.mi.com/mtop/mf/act/infinite/do";
  const body = [{}, { taskId, actId }];
  const res = await post(url, body);
  return res?.data?.taskToken || null;
}

async function doTask(token, actId, taskType, taskName) {
  const url = "https://shop-api.retail.mi.com/mtop/mf/act/infinite/done";
  const body = [{}, { taskToken: token, actId, taskType }];
  return await post(url, body);
}

(async () => {
  try {
    const { actId, tasks } = await getTasks();
    let logs = [], success = 0;

    for (const t of tasks) {
      const { taskId, taskName, type: taskType, disabled } = t;
      if (disabled) { logs.push(`⏭️ 跳过禁用任务: ${taskName}`); continue; }

      console.log(`🔹 执行任务: ${taskName} (${taskType})`);
      const token = await getTaskToken(taskId, actId);
      if (!token) { logs.push(`❌ ${taskName} token获取失败`); continue; }

      if (taskType === 200) await new Promise(r => setTimeout(r, 3000));

      const res = await doTask(token, actId, taskType, taskName);
      if (res.success) {
        success++;
        const award = res?.data?.awardList?.[0];
        logs.push(award ? `✅ ${taskName} +${award.awardValue}${award.awardName}` : `✅ ${taskName} 完成`);
      } else {
        logs.push(`❌ ${taskName} 执行失败: ${res?.message || "未知错误"}`);
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    $notification.post("🛒 小米商城任务完成", `成功 ${success} 个`, logs.join("\n"));
  } catch(e) {
    $notification.post("🛒 小米商城任务异常", "", String(e));
  }
  $done();
})();
