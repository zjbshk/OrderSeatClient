const net = require('net');

let client = new net.Socket();
client.setEncoding('utf8');

var funcs = []
var isConnect = false;
var userInfos = [];
var notify = null;




function connectSocket() {
    client.connect(8024, 'localhost');
    isConnect = true;
}

//连接Socket
connectSocket()

// client.write('{"method":"login","params":{"1":"201626702039","2":"123456.zjb"}}')

function initUserinfo(userInfo, func) {
    login({
        "1": userInfo.sno,
        "2": userInfo.password
    }, (data) => {
        if (func) func(data);
        if (data.status == 200) {
            for (var i = 0; i < userInfos.length; i++) {
                var userInfo_Temp = userInfos[i];
                if (userInfo_Temp.sno == data.data.student_number) {
                    userInfos.splice(i, 1);
                    break;
                }
            }
            console.log("userInfos", userInfos);

            userInfos.push({
                sno: data.data.student_number,
                name: data.data.name,
                cookies: data.cookies,
                userInfo: data.data
            })
        } else {
            showTip("error", "错误提示", "初始化(" + userInfo.name + ")失败");
        }
    })
}

function initUserinfos() {
    var userInfos_Temp = getUserinfos();
    if (userInfos_Temp) {
        for (var i = 0; i < userInfos_Temp.length; i++) {
            var userInfo_Temp = userInfos_Temp[i];
            initUserinfo(userInfo_Temp);
        }
    }
}

function getUserinfos() {
    var userInfos_Str = localStorage.getItem("userInfos");
    if (userInfos_Str) {
        var userinfo_Json = JSON.parse(userInfos_Str);
        return userinfo_Json;
    }
    return null;
}


function getUserinfoByLocation(sno, name) {
    var userInfos_Temp = getUserinfos();
    if (userInfos_Temp) {
        return getUserinfoByUserInfos(sno, name, userInfos_Temp);
    }
    return null;
}

function getUserinfoByUserInfos(sno, name, infos) {
    var userInfos_Temp;
    if (!infos) {
        userInfos_Temp = userInfos;
    } else {
        userInfos_Temp = infos;
    }
    for (var i = 0; i < userInfos_Temp.length; i++) {
        var ui = userInfos_Temp[i];
        if ((name && ui.name == name) || (sno && ui.sno == sno)) {
            return ui;
        }
    }
    return null;
}

function getUserinfo(sno, name) {
    var userInfo_Temp = getUserinfoByUserInfos(sno, name);
    if (!userInfo_Temp) {
        userInfo_Temp = getUserinfoByLocation(sno, name);
        if (userInfo_Temp) {
            initUserinfo(userInfo_Temp);
        }
    }
    return userInfo_Temp;
}




client.on("data", (data) => {
    console.log("receive data", data)
    if (data.startsWith("{") && data.endsWith("}\n")) {
        var jsonObj = JSON.parse(data)
        for (var i = 0; i < funcs.length; i++) {
            const item = funcs[i];
            var jsonObj = JSON.parse(data)
            if (item.id == jsonObj.id) {
                funcs.splice(i, 1)
                delete jsonObj.id
                item.func(jsonObj)
                break
            }
        }
    } else {
        console.log("接受数据的不规范", data);
    }
});


client.on("error", function (err) {
    console.log(err)
    isConnect = false;
});



function send(myxy, func) {
    myxy.id = parseInt(Math.random() * 100000)
    if (func) funcs.push({
        id: myxy.id,
        func: func
    })

    if (myxy.method != "login") {
        var userInfo;
        if (myxy.name || myxy.sno) {
            userInfo = getUserinfo(myxy.sno, myxy.name);
        } else {
            showTip("error", "错误提示", "缺少用户标记!");
            return;
        }
        if (!userInfo) {
            showTip("error", "错误提示", "用户信息不存在!");
            return;
        } else {
            myxy.cookies = userInfo.cookies;
            myxy.userInfo = userInfo.userInfo;
            delete myxy.name;
            delete myxy.sno;
        }
    }

    if (myxy.params) {
        for (var i in myxy.params) {
            var t = typeof myxy.params[i];
            if (t == "number" || t == "boolean") {
                myxy.params[i] = myxy.params[i].toString();
            }
        }
    }

    var jsonStr = JSON.stringify(myxy)
    console.log("song data", jsonStr)
    if (!isConnect) {
        connectSocket()
    }

    client.write(jsonStr)
    client.write("\n")
}

function basic(myxy, method, func, sno, name) {
    var jsonObj = {}
    jsonObj.method = method
    jsonObj.params = myxy
    if (sno) jsonObj.sno = sno;
    if (name) jsonObj.name = name;
    send(jsonObj, func)
}

function login(myxy, func) {
    basic(myxy, "login", func)
}

function logout(func, sno, name) {
    basic(null, "logout", func, sno, name)
}

function getAreaList(func, sno, name) {
    basic(null, "getAreaList", func, sno, name)
}

function myBookingList(myxy, func, sno, name) {
    basic(myxy ? myxy : null, "myBookingList", func, sno, name)
}

function getCategoryInfo(myxy, func, sno, name) {
    basic(myxy, "getCategoryInfo", func, sno, name)
}

function searchSeats(myxy, func, sno, name) {
    basic(myxy, "searchSeats", func, sno, name)
}

function lockSeats(myxy, func, sno, name) {
    basic(myxy, "lockSeats", func, sno, name)
}

function unlockallseats(func, sno, name) {
    basic(null, "unlockallseats", func, sno, name)
}

function cancelbooking(myxy, func, sno, name) {
    basic(myxy, "cancelbooking", func, sno, name)
}

function getBlankPOIs(myxy, func, sno, name) {
    basic(myxy, "getBlankPOIs", func, sno, name)
}

function getRecommendSeat(myxy, func, sno, name) {
    basic(myxy, "getRecommendSeat", func, sno, name)
}

function showTip(type, title, message) {
    if (!this) {
        notify({
            title: title,
            message: message,
            type: type,
            position: "bottom-left",
            duration: 2000
        });
    } else {
        this.notify({
            title: title,
            message: message,
            type: type,
            position: "bottom-left",
            duration: 2000
        });
    }
}

function setNotify(n) {
    notify = n;
}

export default {
    client: client,
    send: send,
    login: login,
    logout: logout,
    getAreaList: getAreaList,
    myBookingList: myBookingList,
    getCategoryInfo: getCategoryInfo,
    searchSeats: searchSeats,
    lockSeats: lockSeats,
    unlockallseats: unlockallseats,
    cancelbooking: cancelbooking,
    getBlankPOIs: getBlankPOIs,
    getRecommendSeat: getRecommendSeat,
    isConnect: isConnect,
    notify,
    showTip,
    initUserinfos,
    initUserinfo,
    getUserinfos,
    getUserinfoByLocation,
    getUserinfoByUserInfos,
    getUserinfo,
    setNotify
}