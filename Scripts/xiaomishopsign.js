/******************************
 * 小米商城任务 - Shadowrocket
 * 仅读取持久化存储 MI_SERVICE_TOKEN
 ******************************/

const ACT_ID = "6706c0695404a23dfb5b2cab";
const SIGN = "ff8960139490adb9071ed47a34f179ff";

const serviceToken = $persistentStore.read("MI_SERVICE_TOKEN");

if (!serviceToken) {
  $notification.post(
    "小米商城任务",
    "未找到 MI_SERVICE_TOKEN",
    "请先写入持久化存储"
  );
  $done();
}

const headers = {
  "User-Agent": "okhttp/3.12.3",
  "Content-Type": "application/json",
  "x-user-agent": "channel/mishop platform/mishop.android",
  "Cookie": `serviceToken=${serviceToken};`
};

/**
 * HTTP POST Promise 封装
 */
function post(url, body) {
  return new Promise((resolve, reject) => {
    $httpClient.post(
      { url, headers, body: JSON.stringify(body) },
      (err, resp, data) => {
        if (err) reject(err);
        else resolve(JSON.parse(data));
      }
    );
  });
}

/**
 * 获取任务列表
 */
async function getTasks() {
  const url =
    "https://shop-api.retail.mi.com/mtop/navi/venue/batch?page_id=13880&pdl=mishop";

  const body = {
    query_list: [
      {
        resolver: "infinite-task",
        sign: SIGN,
        parameter: `{"actId":"${ACT_ID}","taskTypeList":[101,200,110,201,202]}`,
        variable: {}
      }
    ]
  };

  const res = await post(url, body);
  if (res.message !== "ok") throw "获取任务失败";

  const comps =
    res.data.result_list[0]?.components || [];

  return comps
    .filter(c => c.canDo !== false)
    .map(c => ({
      id: c.taskId,
      name: c.taskName,
      type: Number(c.taskType)
    }));
}

/**
 * 获取 taskToken
 */
async function getTaskToken(taskId) {
  const url =
    "https://shop-api.retail.mi.com/mtop/mf/act/infinite/do";

  const body = [{}, { taskId, actId: ACT_ID }];
  const res = await post(url, body);
  return res?.data?.taskToken || null;
}

/**
 * 完成任务
 */
async function finishTask(token, type) {
  const url =
    "https://shop-api.retail.mi.com/mtop/mf/act/infinite/done";

  const body = [{}, { taskToken: token, actId: ACT_ID, taskType: type }];
  return await post(url, body);
}

/**
 * 主流程
 */
(async () => {
  let log = [];
  try {
    const tasks = await getTasks();

    for (const t of tasks) {
      if (t.type === 201) {
        log.push(`${t.name}：跳过（需支付）`);
        continue;
      }

      const token = await getTaskToken(t.id);
      if (!token) {
        log.push(`${t.name}：获取 token 失败`);
        continue;
      }

      if (t.type === 200) {
        await new Promise(r => setTimeout(r, 3000));
      }

      const res = await finishTask(token, t.type);
      if (!res.success) {
        log.push(`${t.name}：失败`);
      } else {
        const award = res.data?.awardList?.[0];
        if (award) {
          log.push(
            `${t.name}：${award.awardValue}${award.awardName}`
          );
        } else {
          log.push(`${t.name}：完成`);
        }
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    $notification.post(
      "🛒 小米商城任务",
      "执行完成",
      log.join("\n")
    );
  } catch (e) {
    $notification.post(
      "小米商城任务",
      "执行异常",
      String(e)
    );
  }

  $done();
})();
