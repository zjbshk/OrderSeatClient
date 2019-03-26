<template>
  <div class="container">
    <div class="handle_div">
      <i class="el-icon-edit" title="编辑" @click="editUser"></i>
      <i class="el-icon-circle-plus-outline" title="添加" @click="addUser"></i>
      <i class="el-icon-zoom-in" @click="checkUseful()" title="检测账号是否可用"></i>
      <i class="el-icon-delete" style="color:red" title="删除账号" @click="show_DelUserPane"></i>
      <i class="el-icon-refresh" style="color:red" title="刷新信息" @click="refreshInfo()"></i>
      <i class="el-icon-time" style="color:#3D9AF9;" title="预约详情" @click="showNoSign"></i>
      <i class="el-icon-mobile-phone" style="color:#3D9AF9" title="登录账号" @click="loginUser"></i>
    </div>

    <el-container>
      <el-aside width="75%">
        <el-table
          border
          fit
          show-header
          highlight-current-row
          @current-change="currentChange"
          :data="tableData"
          style="width: 100%"
          class="my-el-table"
        >
          <el-table-column align="center" label="序号" width="50" type="index" :index="indexMethod"></el-table-column>
          <el-table-column align="center" show-overflow-tooltip prop="sno" label="学号" width="120"></el-table-column>
          <el-table-column align="center" show-overflow-tooltip prop="name" label="姓名" width="120"></el-table-column>
          <el-table-column
            align="center"
            show-overflow-tooltip
            prop="password"
            label="密码"
            width="100"
          ></el-table-column>
          <el-table-column align="center" show-overflow-tooltip prop="email" label="邮箱"></el-table-column>
          <el-table-column align="center" prop="duration" label="时长(小时)" width="100"></el-table-column>
          <el-table-column align="center" prop="waitSign" label="待签到" width="100"></el-table-column>
        </el-table>
      </el-aside>
      <el-main style="padding:0px 5px 0px 5px;">
        <webview
          ref="webview"
          :src="jxnuUrl"
          :useragent="$Resouce.weixin_useragent"
          style="width:100%;height:600px;border:1px #2c3245 solid;"
        />
      </el-main>
    </el-container>

    <transition name="el-zoom-in-top">
      <div v-if="show_form" id="form_add_user" ref="form_add_user">
        <p class="form_add_user_title">{{form_title?'添加用户信息':'修改用户信息'}}</p>
        <el-form label-position="left" :rules="rules" label-width="70px" :model="userInfo">
          <el-form-item label="学号" prop="sno">
            <el-input v-model="userInfo.sno"></el-input>
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="userInfo.name"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="userInfo.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userInfo.email"></el-input>
          </el-form-item>
        </el-form>
        <div style="text-align:right">
          <el-button size="small" type="info" @click="show_form = false">取消</el-button>
          <el-button size="small" type="primary" @click="comfine">确认</el-button>
        </div>
      </div>
    </transition>

    <div class="model_pane" v-if="show_bookList">
      <el-table :data="bookList" border style="width: 100%">
        <el-table-column align="center" prop="date" label="日期" width="100"></el-table-column>
        <el-table-column align="center" prop="roomName" label="区域" width="150"></el-table-column>
        <el-table-column align="center" prop="seatNum" label="座位" width="60"></el-table-column>
        <el-table-column align="center" prop="time" label="开始" width="120"></el-table-column>
        <el-table-column align="center" prop="duration" label="时长(小时)" width="100"></el-table-column>
        <el-table-column align="center" prop="timeRemaining" label="剩余签到时间"></el-table-column>
        <el-table-column align="center" fixed="right" label="操作" width="80">
          <template slot-scope="scope">
            <el-button @click="cancelSign(scope.row)" type="text" size="small">取消预约</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog title="提示" :visible.sync="dialogVisible" width="20%">
      <span>此操作将会删除该用户信息，是否继续？</span>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="delUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>
export default {
  name: "user",
  data() {
    return {
      tableData: [],
      bookList: [],
      bookLists: [],
      currentRow: null,
      form_title: true,
      show_form: false,
      show_bookList: false,
      dialogVisible: false,
      blankUserInfo: {},
      userInfo: {},
      rules: {
        sno: [
          { required: true, message: "学号不能为空", trigger: "blur" },
          { min: 6, max: 12, message: "长度在 6 到 12 个字符", trigger: "blur" }
        ],
        name: [{ required: true, message: "姓名不能为空", trigger: "blur" }],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" }
        ],
        email: [{ required: true, message: "邮箱不能为空", trigger: "blur" }]
      },
      jxnuUrl: null
    };
  },
  methods: {
    initUser() {
      var userInfos = this.$CC.getUserinfos();
      if (userInfos) {
        this.tableData = userInfos;
      }
    },
    checkUseful(user, func) {
      if (user || this.checkSelect()) {
        var userInfo_Temp;
        if (user) {
          userInfo_Temp = user;
        } else {
          userInfo_Temp = this.currentRow;
        }

        this.$CC.initUserinfo(userInfo_Temp, data => {
          if (func) {
            func(data);
          } else {
            if (data.status == 200) {
              this.$CC.showTip(
                "success",
                "成功提示",
                "用户(" + data.data.name + ")信息可用"
              );
            } else {
              this.$CC.showTip("error", "错误提示", data.msg);
            }
          }
        });
      }
    },
    show_DelUserPane() {
      if (this.checkSelect()) {
        this.dialogVisible = !this.dialogVisible;
      }
    },
    delUser() {
      this.dialogVisible = false;
      var index = this.tableData.indexOf(this.currentRow);
      this.tableData.splice(index, 1);
      this.currentRow = null;
      this.saveUserInfo();
      // this.$confirm("此操作将删除该用户信息, 是否继续?", "提示", {
      //   confirmButtonText: "确定",
      //   cancelButtonText: "取消",
      //   type: "warning"
      // })
      //   .then(() => {
      //     var index = this.tableData.indexOf(this.currentRow);
      //     this.tableData.splice(index, 1);
      //     this.currentRow = null;
      //     this.saveUserInfo();
      //   })
      //   .catch(() => {});
    },
    editUser() {
      if (this.checkSelect()) {
        // this.userInfo = {
        //   sno: this.currentRow.sno,
        //   name: this.currentRow.name,
        //   password: this.currentRow.password,
        //   email: this.currentRow.email
        // };
        this.userInfo = this.$Util.clone(this.currentRow);
        this.form_title = false;
        this.show_form = true;
      }
    },
    comfine() {
      this.checkUseful(this.userInfo, data => {
        if (data.status == 200) {
          if (this.form_title) {
            this.userInfo.waitSign = 0;
            this.userInfo.duration = 0;
            this.tableData.push(this.userInfo);
          } else {
            // this.currentRow.sno = this.userInfo.sno;
            // this.currentRow.name = this.userInfo.name;
            // this.currentRow.password = this.userInfo.password;
            // this.currentRow.email = this.userInfo.email;
            this.$Util.cloneValue(this.userInfo, this.currentRow);
          }
          this.show_form = false;
          this.saveUserInfo();
        } else {
          this.$CC.showTip("error", "错误提示", data.msg);
        }
      });
    },
    addUser() {
      this.userInfo = this.blankUserInfo;
      this.form_title = true;
      this.show_form = true;
    },
    loginUser() {
      if (this.checkSelect()) {
        var userInfo_Temp = this.$CC.getUserinfo(this.currentRow.sno);
        if (userInfo_Temp) {
          var cookies = userInfo_Temp.cookies;
          for (const item in cookies) {
            var cookie = cookies[item].substring(
              0,
              cookies[item].indexOf(";") + 1
            );
            var code = "document.cookie='" + cookie + "'";
            this.$refs.webview.executeJavaScript(code);
          }
          this.$refs.webview.loadURL(this.jxnuUrl);
        } else {
          this.$CC.showTip("error", "错误提示", "未找到用户信息，请重试");
        }
      }
    },
    checkSelect() {
      if (!this.currentRow) {
        this.$CC.showTip("warning", "温馨提示", "选择用户才可以操作哦");
        return false;
      } else {
        return true;
      }
    },
    refreshInfo(user) {
      var userInfo;
      if (user) {
        userInfo = user;
      } else {
        if (!this.checkSelect()) {
          return;
        }
        userInfo = this.currentRow;
      }

      this.$CC.myBookingList(
        { "1": 1 },
        data => {
          var waitSign = 0;
          var duration = 0;
          if (data.status == 200) {
            var bookList_Temp = data.data;
            for (var i = 0, len = bookList_Temp.length; i < len; i++) {
              var item = bookList_Temp[i];
              if (item.status == 0) {
                waitSign += 1;
              } else if (item.status == 2 || item.status == 3) {
                duration += item.duration / 60 / 60;
              }
            }
            userInfo.waitSign = waitSign;
            userInfo.duration = duration;
            this.saveUserInfo();

            // 将获取的booklist传入到dealTask处理
            this.$Dt.dealBookList(bookList_Temp, userInfo.name);

            this.$CC.showTip(
              "success",
              "温馨提示",
              "用户(" + userInfo.name + ")的信息，刷新成功"
            );
          } else {
            this.$CC.showTip("error", "错误提示", data.msg);
          }
        },
        userInfo.sno
      );
    },
    cancelSign(order) {
      this.$CC.cancelbooking(
        {
          "1": order.id
        },
        data => {
          if (data.status == 200) {
            this.$CC.showTip(
              "success",
              "成功提示",
              order.roomName + ",座位号：" + order.seatNum + ",已取消预约"
            );
            var index = this.$Util.getArrayObject(
              this.bookLists,
              "id",
              order.id
            );
            this.bookLists.splice(index, 1);

            index = this.$Util.getArrayObject(this.bookList, "id", order.id);
            this.bookList.splice(index, 1);
          } else {
            this.$CC.showTip("error", "失败提示", data.msg);
          }
        },
        null,
        order.name
      );
    },
    showNoSign() {
      if (this.checkSelect()) {
        this.bookList.splice(0, this.bookList.length);
        for (var i = 0, len = this.bookLists.length; i < len; i++) {
          if (this.currentRow.name == this.bookLists[i].name) {
            this.bookList.push(this.bookLists[i]);
          }
        }
        this.show_bookList = !this.show_bookList;
        // console.log(this.bookLists);
      }
    },
    notNoSign() {
      for (var i = 0; i < this.tableData.length; i++) {
        var task = {
          name: this.tableData[i].name,
          type: "防止未签到",
          time: 60 * 20,
          state: "等待执行"
        };
        this.$Dt.addTask(task);
      }

      this.$Dt.setBookLists(this.bookLists);
      this.$Dt.start();
      // this.$CC.showTip("success", "温馨提示", "防止未签到系统已启动");
    },
    saveUserInfo() {
      var userinfo = JSON.stringify(this.tableData);
      localStorage.setItem("userInfos", userinfo);
    },
    indexMethod(index) {
      return index + 1;
    },
    currentChange(currentRow, oldCurrentRow) {
      this.currentRow = currentRow;
    }
  },
  mounted: function() {
    this.jxnuUrl = this.$Resouce.jxnuUrl;
    this.initUser();
    this.notNoSign();
  }
};
</script>


<style>
.container {
  padding: 10px;
}

.handle_div {
  text-align: right;
  margin: 5px;
  width: 75%;
}
.handle_div i {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0px 10px 0px 10px;
}

#form_add_user {
  position: absolute;
  top: 20%;
  background: #fff;
  z-index: 100;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  padding: 10px 30px 20px 30px;
  margin-left: 30%;
  width: 30%;
}
.form_add_user_title {
  text-align: center;
  font-size: 20px;
  padding: 0px;
}

.model_pane {
  position: absolute;
  top: 25%;
  background: #fff;
  z-index: 100;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  padding: 20px 30px 20px 30px;
  margin-left: 20%;
  width: 60%;
}
</style>