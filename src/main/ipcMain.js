
var {ipcMain,BrowserWindow} = require("electron")

ipcMain.on("tasks",(event,tasks)=>{
    event.sender.send("ok","数据已经刷新成功啦")
})