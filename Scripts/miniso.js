console.log("✨ 名创优品签到任务启动");

const COOKIES = ($persistentStore.read("wx_mcyp") || "").trim();
if (!COOKIES) {
    $notification.post("名创优品签到任务", "失败", "未配置 wx_mcyp");
    $done();
}

const cookieList = COOKIES.split(/\s+|&/).map(c => c.trim()).filter(c => c.includes("#"));
if (cookieList.length === 0) {
    $notification.post("名创优品签到任务", "失败", "Cookie格式错误");
    $done();
}

let finalSummary = [];

function now() {
    return new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-");
}
function log(t) {
    console.log(`[${now()}] ${t}`);
}
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function getHeaders(uid, skey) {
    return {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.65(0x1800412d) NetType/WIFI",
        "Content-Type": "application/json",
        "tenant": "MINISO",
        "content-uid": uid,
        "content-skey": skey
    };
}

async function http(method, url, headers, body) {
    for (let i = 0; i < 3; i++) {
        try {
            const opt = { url, headers };
            if (body) opt.body = JSON.stringify(body);
            const resp = await new Promise((resolve, reject) => {
                const client = method === "get" ? $httpClient.get : $httpClient.post;
                client(opt, (err, r, data) => err ? reject(err) : resolve(data));
                setTimeout(() => reject(new Error("timeout")), 12000);
            });
            return JSON.parse(resp);
        } catch (e) {
            if (i === 2) log(`请求失败 ${url}`);
            else await sleep(3000);
        }
    }
    return null;
}

async function doSign(uid, skey) {
    const url = "https://api-saas.miniso.com/task-manage-platform/api/activity/signInTask/award/receive";
    const body = { activityId: "18", taskId: 79 };
    let res = await http("post", url, getHeaders(uid, skey), body);

    if (res?.code === 500 && res?.message?.includes("今日")) {
        const phone = (res.message.match(/当前手机号(.*?)今日/) || [])[1] || "";
        log(`签到成功（已签） → ${phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2")}`);
        return true;
    }

    if (res?.code === 200) {
        log("初始化成功，3.5秒后正式签到...");
        await sleep(3500);
        res = await http("post", url, getHeaders(uid, skey), body);
    }

    if (res?.code === 500 && res?.message?.includes("今日")) {
        const phone = (res.message.match(/当前手机号(.*?)今日/) || [])[1] || "";
        log(`签到成功 → ${phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1****$2")}`);
        return true;
    } else {
        log(`签到失败 → ${res?.message || "未知错误"}`);
        return false;
    }
}


function getUnionId(skey) {
    try {
        const payload = JSON.parse(atob(skey.split(".")[1]));
        return payload.unionId || payload.unionid || "oLPTw1KTVzpqUaJ6xMGHU5YiUa20";
    } catch (e) {
        return "oLPTw1KTVzpqUaJ6xMGHU5YiUa20";
    }
}


async function getRealTaskIds(uid, skey, unionId) {
    const url = `https://api-saas.miniso.com/task-manage-platform/api/activity/periodTask/taskDetail?activityId=18&unionId=${unionId}`;
    const res = await http("get", url, getHeaders(uid, skey));

    if (!res || res.code !== 200 || !res.data) {
        log("真实任务接口失败，启用保底");
        return [238, 240, 241, 242, 243, 244];
    }

    const ids = [];
    for (const period of res.data) {
        if (period.period === 2 && period.periodTasks) {
            for (const task of period.periodTasks) {
                if (task.taskType === 5 && task.buttonStatus === 1) {
                    ids.push(task.taskId);
                }
            }
        }
    }

    if (ids.length > 0) {
        log(`获取到 ${ids.length} 个真实浏览任务 → ${ids.join(", ")}`);
        return ids;
    } else {
        log("真实接口无任务，启用保底");
        return [238, 240, 241, 242, 243, 244];
    }
}

async function runAccount(uid, skey, idx) {
    log(`\n账号${idx} 开始执行 (uid: ${uid})`);

    const unionId = getUnionId(skey);
    const signOk = await doSign(uid, skey);
    const taskIds = await getRealTaskIds(uid, skey, unionId);

    let successCount = 0;
    for (const id of taskIds) {
        log(`开始浏览任务 ${id}`);
        await http("post", "https://api-saas.miniso.com/task-manage-platform/api/activity/task/uvClick", getHeaders(uid, skey), {
            activityId: "18", taskId: id, taskType: 5
        });
        await sleep(18000 + Math.random() * 10000); // 18~28秒随机

        const finish = await http("post", "https://api.multibrands.miniso.com/multi-configure-platform/api/activity/task/browse/finish", getHeaders(uid, skey), {
            activityId: "18", taskId: id
        });

        if (finish?.code === 200) {
            const receive = await http("post", "https://api-saas.miniso.com/task-manage-platform/api/activity/periodTask/award/receive", getHeaders(uid, skey), {
                activityId: "18", taskId: id, taskType: 5
            });
            if (receive?.code === 200) {
                log(`任务${id} 成功 +10 mini币`);
                successCount++;
            } else {
                log(`任务${id} 领取失败`);
            }
        } else {
            log(`任务${id} 上报失败`);
        }
        await sleep(3000);
    }
    log(`浏览完成 ${successCount}/${taskIds.length}`);

    // 查询 mini币
    const coinRes = await http("get", "https://api-saas.miniso.com/task-manage-platform/api/virtualCoin/member", getHeaders(uid, skey));
    const coin = coinRes?.data?.quantity !== undefined ? coinRes.data.quantity : "查询失败";
    log(`当前 mini币: ${coin}`);

    finalSummary.push(`账号${idx}: ${signOk ? "成功" : "失败"} | mini币 ${coin}（90天有效）`);
}

(async () => {
    for (let i = 0; i < cookieList.length; i++) {
        const [uid, skey] = cookieList[i].split("#");
        await runAccount(uid.trim(), skey.trim(), i + 1);
        if (i < cookieList.length - 1) await sleep(8000);
    }

    $notification.post(
        "名创优品签到任务",
        "",
        finalSummary.join("\n")
    );

    log("全部账号执行完毕");
    $done();
})();