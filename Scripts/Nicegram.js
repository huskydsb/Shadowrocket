var body = $response.body;

// 记录替换前的内容
console.log("替换前的 body: " + body);

// 定义替换函数
function replaceSubscriptions(body) {
    return body.replace(/"(store_subscription|lifetime_subscription|subscription)":false(?!\s*,\s*"true")/g, '"$1":true');
}

// 第一次替换
body = replaceSubscriptions(body);

// 检查是否替换成功
if (body.includes('"false"')) {
    console.log("第一次替换未完全成功，尝试再次替换...");
    // 如果仍然存在未替换的 "false"，再次进行替换
    body = replaceSubscriptions(body);
}

// 记录替换后的内容
console.log("替换后的 body: " + body);

// 确保替换后不为空
if (body) {
    $done({ body });
} else {
    console.log("替换失败，body 为空");
    $done({ body: $response.body }); // 如果替换失败，返回原始响应
}
