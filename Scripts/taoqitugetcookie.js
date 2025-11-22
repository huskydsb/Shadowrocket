// Loon 获取 Authorization（过滤 OPTIONS 请求，仅保存有效 Authorization）

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const now = `[${formatDateTime(new Date())}]`;

if ($request && $request.headers) {
  const headers = $request.headers;
  const method = ($request.method || 'GET').toUpperCase();
  const authorization = headers['Authorization'] || headers['authorization'];

  console.log(`${now} 🛰 请求地址: ${$request.url}`);
  console.log(`${now} 📝 请求方法: ${method}`);
  console.log(`${now} 🧾 请求头如下:\n${JSON.stringify(headers, null, 2)}`);

  // 跳过 OPTIONS 或未携带 Authorization 的请求
  if (method === 'OPTIONS' || !authorization) {
    console.log(`${now} ⛔️ 跳过 OPTIONS 请求或无 Authorization`);
  } else {
    const saved = $persistentStore.write(authorization, 'taoqitu_authorization');
    if (saved) {
      console.log(`${now} ✅ 成功存储 Authorization`);
      $notification.post('淘气兔 Cookie 获取成功', '已成功保存 Authorization', '🎉 可用于后续签到');
    } else {
      console.log(`${now} ❌ 存储失败，请检查 Loon 权限`);
      $notification.post('淘气兔 Cookie 存储失败', '', '请检查配置是否允许写入');
    }
  }
} else {
  console.log(`${now} ⚠️ 请求中未找到 headers，跳过执行`);
}

$done({});