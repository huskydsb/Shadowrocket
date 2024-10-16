// 定义 Disney+ API 的基础 URL
const DISNEY_LOCATION_BASE_URL = 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql';

// 创建国家代码和对应国旗的映射
const flags = new Map([
    ["AC", "🇦🇨"], ["AE", "🇦🇪"], ["AF", "🇦🇫"], ["AI", "🇦🇮"],
    ["AL", "🇦🇱"], ["AM", "🇦🇲"], ["AQ", "🇦🇶"], ["AR", "🇦🇷"],
    ["AS", "🇦🇸"], ["AT", "🇦🇹"], ["AU", "🇦🇺"], ["AW", "🇦🇼"],
    ["AX", "🇦🇽"], ["AZ", "🇦🇿"], ["BA", "🇧🇦"], ["BB", "🇧🇧"],
    ["BD", "🇧🇩"], ["BE", "🇧🇪"], ["BF", "🇧🇫"], ["BG", "🇧🇬"],
    ["BH", "🇧🇭"], ["BI", "🇧🇮"], ["BJ", "🇧🇯"], ["BM", "🇧🇲"],
    ["BN", "🇧🇳"], ["BO", "🇧🇴"], ["BR", "🇧🇷"], ["BS", "🇧🇸"],
    ["BT", "🇧🇹"], ["BV", "🇧🇻"], ["BW", "🇧🇼"], ["BY", "🇧🇾"],
    ["BZ", "🇧🇿"], ["CA", "🇨🇦"], ["CF", "🇨🇫"], ["CH", "🇨🇭"],
    ["CK", "🇨🇰"], ["CL", "🇨🇱"], ["CM", "🇨🇲"], ["CN", "🇨🇳"],
    ["CO", "🇨🇴"], ["CP", "🇨🇵"], ["CR", "🇨🇷"], ["CU", "🇨🇺"],
    ["CV", "🇨🇻"], ["CW", "🇨🇼"], ["CX", "🇨🇽"], ["CY", "🇨🇾"],
    ["CZ", "🇨🇿"], ["DE", "🇩🇪"], ["DG", "🇩🇬"], ["DJ", "🇩🇯"],
    ["DK", "🇩🇰"], ["DM", "🇩🇲"], ["DO", "🇩🇴"], ["DZ", "🇩🇿"],
    ["EA", "🇪🇦"], ["EC", "🇪🇨"], ["EE", "🇪🇪"], ["EG", "🇪🇬"],
    ["EH", "🇪🇭"], ["ER", "🇪🇷"], ["ES", "🇪🇸"], ["ET", "🇪🇹"],
    ["EU", "🇪🇺"], ["FI", "🇫🇮"], ["FJ", "🇫🇯"], ["FK", "🇫🇰"],
    ["FM", "🇫🇲"], ["FO", "🇫 "], ["FR", "🇫🇷"], ["GA", "🇬🇦"],
    ["GB", "🇬🇧"], ["HK", "🇭🇰"], ["HU", "🇭🇺"], ["ID", "🇮🇩"],
    ["IE", "🇮🇪"], ["IL", "🇮🇱"], ["IM", "🇮🇲"], ["IN", "🇮🇳"],
    ["IS", "🇮🇸"], ["IT", "🇮🇹"], ["JP", "🇯🇵"], ["KR", "🇰🇷"],
    ["LU", "🇱🇺"], ["MO", "🇲🇴"], ["MX", "🇲🇽"], ["MY", "🇲🇾"],
    ["NL", "🇳🇱"], ["PH", "🇵🇭"], ["RO", "🇷🇴"], ["RS", "🇷🇸"],
    ["RU", "🇷🇺"], ["RW", "🇷🇼"], ["SA", "🇸🇦"], ["SB", "🇧"],
    ["SC", "🇸🇨"], ["SD", "🇸🇩"], ["SE", "🇸🇪"], ["SG", "🇸🇬"],
    ["TH", "🇹🇭"], ["TN", "🇹🇳"], ["TO", "🇹🇴"], ["TR", "🇹🇷"],
    ["TV", "🇹🇻"], ["TW", "🇨🇳"], ["UK", "🇬🇧"], ["UM", "🇺🇲"],
    ["US", "🇺🇸"], ["UY", "🇺🇾"], ["UZ", "🇺🇿"], ["VA", "🇻🇦"],
    ["VE", "🇻🇪"], ["VG", "🇻🇬"], ["VI", "🇻🇮"], ["VN", "🇻🇳"],
    ["ZA", "🇿🇦"]
]);

// 定义检测 Disney+ 支持情况的函数
function disneyLocation() {
    return new Promise((resolve, reject) => {
        // 定义请求参数
        let params = {
            url: DISNEY_LOCATION_BASE_URL, // 请求 URL
            timeout: 5000, // 请求超时设置为 5000 毫秒
            headers: {
                'Accept-Language': 'en', // 请求接受的语言
                "Authorization": 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84', // 授权信息
                'Content-Type': 'application/json', // 请求体类型
                'User-Agent': 'UA' // 用户代理
            },
            body: JSON.stringify({ // 请求体
                query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }', // GraphQL 查询
                variables: { // 查询变量
                    input: {
                        applicationRuntime: 'chrome', // 应用运行时
                        attributes: { // 设备属性
                            browserName: 'chrome', // 浏览器名称
                            browserVersion: '94.0.4606', // 浏览器版本
                            manufacturer: 'microsoft', // 制造商
                            model: null, // 设备型号
                            operatingSystem: 'windows', // 操作系统
                            operatingSystemVersion: '10.0', // 操作系统版本
                            osDeviceIds: [], // 设备 ID
                        },
                        deviceFamily: 'browser', // 设备家族
                        deviceLanguage: 'en', // 设备语言
                        deviceProfile: 'windows', // 设备配置
                    },
                },
            }),
        };

        // 发送 POST 请求
        $httpClient.post(params, (errormsg, response, data) => {
            console.log("----------Disney+ 检测--------------"); // 日志输出请求开始
            if (errormsg) { // 检查是否有错误
                const message = "Disney+: 检测失败 ❗️"; // 错误消息
                console.log(message); // 日志输出错误消息
                $notification.post("Disney+ 检测结果", "", message); // 发送 iOS 通知
                resolve("disney request failed:" + errormsg); // 解析错误并结束
                return; // 结束函数执行
            }
            if (response.status == 200) { // 检查响应状态
                console.log("Disney+ 请求结果: " + response.status); // 输出请求结果状态
                let resData = JSON.parse(data); // 解析响应数据
                if (resData?.extensions?.sdk?.session != null) { // 检查 session 是否存在
                    let {
                        inSupportedLocation, // 是否在支持的位置
                        location: { countryCode }, // 获取国家代码
                    } = resData?.extensions?.sdk?.session; // 解构赋值

                    if (inSupportedLocation) { // 如果支持
                        const countryFlag = flags.get(countryCode.toUpperCase()) || "🏳️"; // 获取对应的国旗
                        const message = `Disney+: 支持 ➟ ${countryFlag} (${countryCode}) 🎉`; // 支持消息
                        console.log(message); // 日志输出支持消息
                        $notification.post("Disney+ 检测结果", "", message); // 发送 iOS 通知
                        resolve({ inSupportedLocation, countryCode }); // 解析支持结果
                    } else { // 如果不支持
                        const countryFlag = flags.get(countryCode.toUpperCase()) || "🏳️"; // 获取对应的国旗
                        const message = `Disney+: 即将登陆 ➟ ${countryFlag} ⚠️`; // 即将登陆消息
                        console.log(message); // 日志输出即将登陆消息
                        $notification.post("Disney+ 检测结果", "", message); // 发送 iOS 通知
                        resolve(); // 结束解析
                    }
                } else { // 如果没有 session
                    const message = "Disney+: 未支持 🚫 "; // 未支持消息
                    console.log(message); // 日志输出未支持消息
                    $notification.post("Disney+ 检测结果", "", message); // 发送 iOS 通知
                    resolve(); // 结束解析
                }
            } else { // 如果响应状态不是 200
                const message = "Disney+: 检测失败 ❗️"; // 错误消息
                console.log(message); // 日志输出错误消息
                $notification.post("Disney+ 检测结果", "", message); // 发送 iOS 通知
                resolve(); // 结束解析
            }
        });
    });
}

// 调用函数执行 Disney+ 支持检测
disneyLocation();
