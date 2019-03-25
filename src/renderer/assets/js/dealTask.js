var tasks = []
var notNoSignTasks = []


var bookLists = null;



var interval = null;
var CC = null;
var Util = null;



function setBookLists(bLs) {
    bookLists = bLs;
}

function setCC(cc) {
    CC = cc;
}

function setUtil(util) {
    Util = util;
}


function setTasks(ts) {
    tasks = ts;
}

function addTask(t) {
    for (var i = 0; i < notNoSignTasks.length; i++) {
        var notNoSignTask = notNoSignTasks[i];
        if (t.name == notNoSignTask.name) {
            return;
        }
    }
    notNoSignTasks.push(t);
}

function start() {
    if (!interval)
        interval = setInterval(run, 1000);
}

function stop() {
    if (interval) {
        clearInterval(interval)
        interval = null;
    }
}


function grabSeat(task) {
    var nowTime = new Date().getTime() / 1000;
    var taskTime = Date.parse(task.time) / 1000;
    task.timeRemaining = parseInt(taskTime - nowTime) + 's';
    if (taskTime - nowTime < 60 && task.state != "已初始化") {
        task.state = "已初始化";
        var name = task.name;
        var userInfo_Temp = CC.getUserinfoByLocation(null, name);
        if (userInfo_Temp) {
            CC.initUserinfo(userInfo_Temp, (data) => {
                if (data.status == 200) {
                    CC.showTip("success", "成功提示", "已初始化成功");
                } else {
                    task.state = "初始化失败";
                    CC.showTip("error", "失败提示", data.msg);
                }
            })
        } else {
            CC.showTip("error", "失败提示", "用户不存在");
        }
        saveTasks();
    } else if (nowTime - taskTime >= 0 && task.state == "已初始化") {
        task.state = "正在执行";
        var tempData = new Date();
        if (tempData.getHours() >= 22) {
            // tomorrow
            tempData.setDate(tempData.getDate() + 1)
        }
        tempData.setMinutes(0);
        tempData.setHours(task.beginTime);
        var beginTime = tempData.getTime();

        var seatsStr = task.seat
        var seats = [];
        if (seatsStr.includes(",")) {
            seats = seatsStr.split(/\s?,\s?/);
        } else {
            seats.push(seatsStr);
        }

        var requestInfo = {
            "1": parseInt(beginTime / 1000),
            "2": parseInt(task.duration * 60 * 60),
            "3": seats
        }

        CC.lockSeats(requestInfo, (data) => {
            var type;
            if (data.status == 200) {
                type = "success";
                task.state = "抢座成功";
            } else {
                type = "error";
                task.state = "抢座失败";
            }

            saveTasks();
            CC.showTip(type, "提示", data.msg);
        }, null, task.name);
    }
}

function dealBookList(booklist,name_Temp){
    console.log(name_Temp,booklist);
    for (var i = 0; i < booklist.length; i++) {
        var book_Temp = booklist[i];
        if (book_Temp.status == 0) {
            if (!Util.isInArrayObject(bookLists, "id", book_Temp.id)) {
                var temp = {
                    date: Util.getFormatDate("Y-M-D", new Date(parseInt(book_Temp.time) * 1000)),
                    roomName: book_Temp.roomName,
                    seatNum: book_Temp.seatNum,
                    time: Util.getFormatDate("h:m", new Date(parseInt(book_Temp.time) * 1000)),
                    duration: parseInt(book_Temp.duration / 60 / 60),
                    timeRemaining: parseInt((parseInt(book_Temp.time) + book_Temp.limitSignBack - book_Temp.nowTime) / 60),
                    id: book_Temp.id,
                    name: name_Temp
                }
                bookLists.push(temp);
            }
        } else {
            var index = Util.getArrayObject(bookLists, "id", book_Temp.id);
            if (index != -1) {
                bookLists.splice(index, 1);
            }
        }
    }
}

var oldTime = 0;
function notNoSign(task) {
    var nowDate = new Date();
    var nowTime = parseInt(nowDate.getTime() / 1000);

    if(nowTime == oldTime){
        return;
    }
    oldTime = nowTime;

    var name_Temp = task.name;
    if ((nowTime % task.time) == 0) {
        CC.myBookingList(null, data => {
            if (data.status == 200) {
                var booklist = data.data;
                dealBookList(booklist,name_Temp);
            } else {
                CC.showTip("error", "失败提示", "获取预约列表错误");
            }
        }, null, name_Temp)
    }

    if ((nowTime % 60) == 0) {
        
        for (var i = 0, len = bookLists.length; i < len; i++) {
            var book_Temp = bookLists[i];
            if (book_Temp.timeRemaining <= 5) {
                var i_Temp = i;
                CC.cancelbooking({
                    "1": book_Temp.id
                }, data => {
                    if (data.status == 200) {
                        bookLists.splice(i_Temp,1);
                        CC.showTip("success", "成功提示", book_Temp.roomName + ",座位号：" + book_Temp.seatNum + ",未签到已帮您取消");
                    } else {
                        CC.showTip("error", "失败提示", data.msg);
                    }
                }, null, name_Temp)
            } else {
                book_Temp.timeRemaining = book_Temp.timeRemaining - 1;
            }
        }
    }

}



function monitoring(task) {

}

function analysis(task) {

}

function saveTasks() {
    var tasks_Str = JSON.stringify(tasks);
    localStorage.setItem("tasks", tasks_Str);
}

function getFormatDate(h, m, s) {
    var nowDate = new Date();
    var year = nowDate.getFullYear();
    var month = nowDate.getMonth() + 1;
    var day = nowDate.getDate();

    var hours = nowDate.getHours();
    var minutes = nowDate.getMinutes();
    var seconds = nowDate.getSeconds();

    if (h) {
        hours = hours + h;
    }

    if (m) {
        minutes = minutes + m;
    }

    if (s) {
        seconds = seconds + s;
    }

    return year + "/" + month + "/" + day + " " + hours + ":" + minutes + ":" + seconds;
}

function run() {
    var tasks_Temp = tasks.concat(notNoSignTasks);
    for (var i = 0; i < tasks_Temp.length; i++) {
        var item = tasks_Temp[i];
        if (item.state == "等待执行" || item.state == "已初始化") {
            if (!item.type) {
                grabSeat(item);
                continue;
            }
            switch (item.type) {
                case "抢座":
                    grabSeat(item);
                    break;
                case "防止未签到":
                    notNoSign(item);
                    break;
                case "监控":
                    monitoring(item);
                    break;
                case "数据分析":
                    analysis(item);
                    break;
            }
        }
    }
}

export default {
    setTasks: setTasks,
    stop: stop,
    start: start,
    run: run,
    setCC,
    getFormatDate,
    addTask,
    setBookLists,
    setUtil,
    dealBookList
}