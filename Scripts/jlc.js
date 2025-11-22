/*****************************************
 * 嘉立创签到脚本（单账号）
 *****************************************/

const token = $persistentStore.read("JLC_AccessToken"); // 读取 token

// 日志输出
function log(emoji, msg) {
    const time = new Date().toLocaleString();
    console.log(`${time} ${emoji} ${msg}`);
}

// 通知提示
function notify(title, msg) {
    $notification.post(title, "", msg);
    log("🔔", `${title} → ${msg}`);
}

// 掩码账号，隐藏部分信息
function mask_account(account) {
    if (account && account.length >= 4) {
        return account.slice(0, 2) + '****' + account.slice(-2);
    }
    return '****';
}

// 请求头配置
const headers = {
    "X-JLC-AccessToken": token,
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Html5Plus/1.0",
    "Content-Type": "application/json"
};

// 接口URL
const url_sign = "https://m.jlc.com/api/activity/sign/signIn?source=3";
const gold_bean_url = "https://m.jlc.com/api/appPlatform/center/assets/selectPersonalAssetsInfo";
const seventh_day_url = "https://m.jlc.com/api/activity/sign/receiveVoucher";

// ======= 单账号签到逻辑 =======
function _in(access_token, callback) {
    log("⏳", "开始获取金豆信息...");

    // 获取金豆信息
    $httpClient.get({ url: gold_bean_url, headers }, (err1, resp1, data1) => {
        if (err1) {
            log("❌", `获取资产信息失败: ${err1}`);
            notify("嘉立创签到失败", `获取金豆失败: ${err1}`);
            callback();
            return;
        }

        let customer_code = '', integral_voucher = 0;
        try {
            const bean = JSON.parse(data1);
            customer_code = bean.data.customerCode;
            integral_voucher = bean.data.integralVoucher;
            log("✅", `获取金豆信息成功 - customerCode: ${mask_account(customer_code)}, 当前金豆: ${integral_voucher}`);
        } catch (e) {
            log("❌", `解析资产信息失败: ${e}`);
            notify("嘉立创签到失败", `解析资产信息失败: ${e}`);
            callback();
            return;
        }

        log("⏳", "开始签到...");
        // 执行签到操作
        $httpClient.get({ url: url_sign, headers }, (err2, resp2, data2) => {
            if (err2) {
                log("❌", `签到接口请求失败: ${err2}`);
                notify("嘉立创签到失败", `签到请求失败: ${err2}`);
                callback();
                return;
            }

            try {
                const result = JSON.parse(data2);

                if (!result.success) {
                    if (result.message && result.message.includes("已经签到")) {
                        log("ℹ️", "今日已签到，无需重复操作");
                        notify("嘉立创签到提醒", `账号(${mask_account(customer_code)}) 今日已签到`);
                        callback();
                        return;
                    } else {
                        log("❌", `签到失败: ${result.message}`);
                        notify("嘉立创签到失败", `账号(${mask_account(customer_code)}) 错误: ${result.message}`);
                        callback();
                        return;
                    }
                }

                const data = result.data || {};
                const gain_num = data.gainNum || 0;
                const status = data.status || 0;

                if (status > 0) {
                    if (gain_num > 0) {
                        const total = integral_voucher + gain_num;
                        const msg = `账号(${mask_account(customer_code)})：获取${gain_num}个金豆，当前总数：${total}`;
                        log("🎉", msg);
                        notify("嘉立创签到成功", msg);
                        callback();
                    } else {
                        // 第七天签到处理
                        log("⏳", "处理第七天签到奖励...");
                        $httpClient.get({ url: seventh_day_url, headers }, (err3, resp3, data3) => {
                            if (err3) {
                                log("❌", `第七天签到请求失败: ${err3}`);
                                notify("嘉立创第七天签到失败", `网络请求失败: ${err3}`);
                                callback();
                                return;
                            }

                            try {
                                const seventh = JSON.parse(data3);
                                if (seventh.success) {
                                    const total = integral_voucher + 8;
                                    const msg = `账号(${mask_account(customer_code)}) 第七天签到成功，当前总金豆：${total}`;
                                    log("🎉", msg);
                                    notify("嘉立创第七天签到成功", msg);
                                    callback();
                                } else {
                                    log("❌", "第七天签到失败，无金豆获取");
                                    notify("嘉立创第七天签到失败", `账号(${mask_account(customer_code)}) 无金豆获取`);
                                    callback();
                                }
                            } catch (e) {
                                log("❌", `第七天签到解析失败: ${e}`);
                                notify("嘉立创第七天签到失败", `解析失败: ${e}`);
                                callback();
                            }
                        });
                    }
                } else {
                    log("ℹ️", "今日已签到或签到失败");
                    notify("嘉立创签到提醒", `账号(${mask_account(customer_code)}) 今日已签到或签到失败`);
                    callback();
                }

            } catch (e) {
                log("❌", `签到解析失败: ${e}`);
                notify("嘉立创签到失败", `解析签到响应失败: ${e}`);
                callback();
            }
        });
    });
}

// ======= 执行单账号签到 =======
_in(token, () => {
    $done({});
});
