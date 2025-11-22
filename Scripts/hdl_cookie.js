/*
  Loon 抓取海底捞 _haidilao_app_token 并保存到持久存储 hdl_data
  说明：
  - 多账号用 @ 分隔；脚本会自动去重并追加新 token。
  - 保存位置：Loon 的持久存储 key = "hdl_data"
  - 会通过通知告知结果，通知中包含合并后的 hdl_data（如过长请到脚本日志查看）
*/

(function () {
  // Loon 环境下通过 $request 获取请求信息
  const req = typeof $request !== "undefined" ? $request : null;
  if (!req) {
    $notification.post("海底捞抓取失败", "未在 http-request 环境中运行脚本", "");
    $done({});
    return;
  }

  // 尝试从请求头中读取 _haidilao_app_token（大小写兼容）
  const headers = req.headers || {};
  const token = headers["_haidilao_app_token"] || headers["_Haidilao_App_Token"] || headers["Haidilao-App-Token"] || null;

  if (!token) {
    $notification.post("海底捞抓取失败", "未找到 _haidilao_app_token 字段", JSON.stringify(headers).slice(0, 200));
    $done({});
    return;
  }

  const STORE_KEY = "hdl_data";

  // 读取已有数据（若无则空字符串）
  let existing = "";
  try {
    existing = $persistentStore.read(STORE_KEY) || "";
  } catch (e) {
    existing = "";
  }

  // 合并并去重：以 @ 分割多个 token
  const list = existing ? existing.split("@").map(s => s.trim()).filter(Boolean) : [];
  if (!list.includes(token)) {
    list.push(token);
  }

  const newValue = list.join("@");

  // 写入持久化存储
  try {
    $persistentStore.write(newValue, STORE_KEY);
    // 发送通知并在日志中输出合并后的字符串（通知长度有限，可能被截断）
    $notification.post("海底捞 token 已保存", `已写入 ${STORE_KEY}，共 ${list.length} 个 token`, newValue.length > 200 ? newValue.slice(0,200) + "..." : newValue);
  } catch (e) {
    $notification.post("海底捞保存失败", e && e.message ? e.message : String(e), token);
  }

  $done({});
})();