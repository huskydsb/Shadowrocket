/**
 * 同程旅行签到
 * tc_cookie 格式: apptoken#device
 */

console.log("🟢 [同程旅行] 自动签到任务启动");

const ckStr = $persistentStore.read("tc_cookie") || "";
if (!ckStr) {
    console.log("❌ 未获取到 tc_cookie");
    $notification.post("同程旅行签到", "❌ 失败", "未配置 tc_cookie");
    $done({});
}

let [apptoken, device] = ckStr.split("#");
if (!apptoken || !device) {
    console.log("❌ Cookie 结构错误，应为：apptoken#device");
    $notification.post("同程旅行签到", "❌ 失败", "Cookie 格式错误");
    $done({});
}

const headers = {
    "Content-Type": "application/json",
    "Accept": "*/*",
    "apptoken": apptoken,
    "device": device,
    "os-type": "1",
    "channel": "1",
    "User-Agent": "TongchengTravel/11.2.61.12742 CFNetwork/3860.200.71 Darwin/25.1.0"
};

// 从返回数据里直接取今天的日期，最稳（防止时区错乱）
function getTodayFromData(data) {
    if (data && data.simpleSignCalendar) {
        const todayItem = data.simpleSignCalendar.find(item => item.today);
        if (todayItem) return todayItem.day;
    }
    // 兜底
    const d = new Date();
    const offset = 8 * 60; // 东八区
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const beijing = new Date(utc + 3600000 * offset);
    return `${beijing.getFullYear()}-${String(beijing.getMonth() + 1).padStart(2, "0")}-${String(beijing.getDate()).padStart(2, "0")}`;
}

async function main() {
    console.log("📡 [查询] 获取签到状态...");
    let signIndex = await post("/index/signIndex", headers, {});

    if (!signIndex || signIndex.code !== 2200 || !signIndex.data) {
        console.log("❌ Token失效或接口异常");
        $notification.post("同程旅行签到", "❌ 失败", "Token失效或接口异常");
        return $done();
    }

    let todaySign = signIndex.data.todaySign;
    let mileage = signIndex.data.mileageBalance.mileage;
    console.log(`📌 今日签到状态: ${todaySign ? "✅ 已签到" : "⏳ 未签到"}, 当前里程: ${mileage}`);

    // 关键修复：优先不传 day（最新接口已支持），失败再传正确日期
    if (!todaySign) {
        console.log("📡 [签到] 提交签到请求（方式1：不传day）...");
        let signRes = await post("/index/sign", headers, { type: 1 });

        // 如果不传 day 失败，才用方式2传正确的日期
        if (!signRes || signRes.code !== 2200) {
            console.log("🟡 方式1失败，尝试方式2（带正确日期）...");
            const correctDay = getTodayFromData(signIndex.data);
            signRes = await post("/index/sign", headers, { type: 1, day: correctDay });
        }

        if (signRes && signRes.code === 2200) {
            console.log("🎉 签到成功！");
        } else {
            console.log(`❌ 签到失败，code: ${signRes?.code || 'null'}`);
        }
    } else {
        console.log("✔️ 今日已签到，跳过签到步骤");
    }

    // —— 浏览任务部分保持不变 ——
    console.log("📡 [任务] 获取浏览任务列表...");
    let taskListRes = await post("/task/taskList?version=11.2.6", headers, {});
    let tasks = (taskListRes && taskListRes. code === 2200) ? (taskListRes.data || []) : [];
    let executableTasks = tasks.filter(t => t.state === 1 && t.browserTime && t.browserTime > 0);

    console.log(`🔵 获取到 ${executableTasks.length} 个可执行浏览任务`);

    for (let t of executableTasks) {
        console.log(`🔵 开始任务【${t.title}】，浏览 ${t.browserTime} 秒`);
        let startRes = await post("/task/start", headers, { taskCode: t.taskCode });
        if (!startRes || startRes.code !== 2200) {
            console.log(`🟠 启动任务失败 ${t.taskCode}`);
            continue;
        }
        let task_id = startRes.data;
        console.log(`🔵 任务启动成功 id=${task_id}`);

        await sleep(t.browserTime * 1000 + 1000); // 多等1秒更稳

        let finishRes = await post("/task/finish", headers, { id: task_id });
        if (finishRes && finishRes.code === 2200) {
            console.log(`🟣 完成任务成功 ${task_id}`);
            let receiveRes = await post("/task/receive", headers, { id: task_id });
            console.log(receiveRes && receiveRes.code === 2200 ? `🟢 领取奖励成功` : `🟠 领取奖励失败`);
        } else {
            console.log(`🔴 完成任务失败 ${task_id}`);
        }
        await sleep(1500);
    }

    // —— 刷新最新信息并推送 ——
    signIndex = await post("/index/signIndex", headers, {});
    if (signIndex && signIndex.code === 2200 && signIndex.data) {
        let d = signIndex.data;
        let msg = `本月签到 ${d.cycleSighNum} 天 | 连续 ${d.continuousHistory} 天\n今日+${d.mileageBalance.todayMileage} 里程 | 余额 ${d.mileageBalance.mileage}`;
        console.log("📊 " + msg);

        $notification.post(
            "同程旅行签到成功 🎉",
            `连续 ${d.continuousHistory} 天 | 今日+${d.mileageBalance.todayMileage}`,
            msg
        );
    }

    $done();
}

// POST 封装
function post(api, headers, body) {
    return new Promise(resolve => {
        $httpClient.post({
            url: "https://app.17u.cn/welfarecenter" + api,
            headers: headers,
            body: body ? JSON.stringify(body) : "{}"
        }, (err, resp, data) => {
            if (err) {
                console.log("❌ 网络错误：" + err);
                return resolve(null);
            }
            try {
                let json = JSON.parse(data);
                resolve(json);
            } catch (e) {
                console.log("❌ JSON解析失败：" + data);
                resolve(null);
            }
        });
    });
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

main();