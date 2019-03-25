var rooms = [
    {
        id: "35",
        name: "二楼北自习室(202)"
    },
    {
        id: "36",
        name: "二楼南自习室(201)"
    },
    {
        id: "31",
        name: "三楼南自习室(301)"
    },
    {
        id: "37",
        name: "三楼北自习室(302)"
    }
]

var state_colors = [{
    color: "#9baec8",
    name: "未被占",
    state: "0"
},
{
    color: "#ef5285",
    name: "已被占",
    state: "1"
},
{
    color: "#2b90d9",
    name: "推荐",
    state: "2"
},
{
    color: "#282c37",
    name: "关闭",
    state: "3"
},
{
    color: "#9055A2",
    name: "他人的推荐",
    state: "4"
},
{
    color: "#56A902",
    name: "暂离",
    state: "5"
}]

var weixin_useragent =
    "mozilla/5.0 (Linux; U; Android 5.1; zh-cn; OPPO R9tm Build/LMY47I) AppleWebKit/537.36 (KHTML, like Gecko)Version/4.0 Chrome/37.0.0.0 MQQBrowser/7.5 Mobile Safari/537.36"

var jxnuUrl = "https://jxnu.huitu.zhishulib.com"

export default {
    rooms,
    state_colors,
    weixin_useragent,
    jxnuUrl
}