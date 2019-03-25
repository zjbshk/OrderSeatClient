<template>
  <div id="wrapper">
    <div class="task_handle_div">
      <i class="el-icon-edit" title="编辑任务" @click="editTask"></i>
      <i class="el-icon-circle-plus-outline" title="添加任务" @click="addTask"></i>
      <i class="el-icon-delete" style="color:red" title="删除任务" @click="delTask"></i>
      <i class="el-icon-upload2" style="color:red" title="数据同步到执行程序中" @click="sendInfo"></i>
      <i class="el-icon-news" style="color:#9055A2;" title="立即执行" @click="runTask"></i>
    </div>
    <el-table
      border
      fit
      show-header
      highlight-current-row
      @current-change="currentChange"
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column align="center" label="序号" width="50" type="index" :index="indexMethod"></el-table-column>
      <el-table-column align="center" show-overflow-tooltip prop="name" label="姓名" width="120"></el-table-column>
      <el-table-column align="center" show-overflow-tooltip prop="room" label="自习室" width="120"></el-table-column>
      <el-table-column align="center" show-overflow-tooltip prop="seat" label="座位" width="120"></el-table-column>
      <el-table-column
        align="center"
        show-overflow-tooltip
        prop="beginTime"
        label="预约时间"
        width="120"
      ></el-table-column>
      <el-table-column align="center" show-overflow-tooltip prop="duration" label="时长" width="120"></el-table-column>
      <el-table-column align="center" show-overflow-tooltip prop="time" label="执行时间"></el-table-column>
      <el-table-column align="center" prop="state" label="状态" width="100"></el-table-column>
      <el-table-column align="center" show-overflow-tooltip prop="timeRemaining" label="剩余时间"></el-table-column>
    </el-table>

    <transition name="el-zoom-in-top">
      <div v-if="show_form" id="form_add_task">
        <p class="form_add_user_title">{{form_title?'添加任务信息':'修改任务信息'}}</p>
        <el-form :model="userInfo" label-width="70px">
          <el-form-item label="用户">
            <el-select v-model="userInfo.name" placeholder="请选择用户" style="width:100%;">
              <el-option
                v-for="item in form_placeholder.users"
                :label="item.name"
                :value="item.name"
                :key="item.sno"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="自习室">
            <el-select v-model="userInfo.room" placeholder="请选择自习室" style="width:100%;">
              <el-option
                v-for="item in form_placeholder.rooms"
                :label="item.name"
                :value="item.id"
                :key="item.id"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="座位">
            <el-input v-model="userInfo.seat" placeholder="多个座位号用逗号隔开" style="width:100%;"></el-input>
          </el-form-item>

          <el-form-item label="预约时间">
            <el-select v-model="userInfo.beginTime" placeholder="请选择预约时间" style="width:100%;">
              <el-option
                v-for="item in form_placeholder.times"
                :label="item"
                :value="item"
                :key="item"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="时长">
            <el-select v-model="userInfo.duration" placeholder="请选择时长" style="width:100%;">
              <el-option
                v-for="item in form_placeholder.durations"
                :label="item"
                :value="item"
                :key="item"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="执行时间">
            <el-input v-model="userInfo.time" placeholder="设置执行时间" style="width:100%;"></el-input>
          </el-form-item>

          <el-form-item label="状态">
            <el-select v-model="userInfo.state" placeholder="请选择状态" style="width:100%;">
              <el-option
                v-for="item in form_placeholder.states"
                :label="item"
                :value="item"
                :key="item"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item>
            <div style="text-align:right">
              <el-button size="small" type="info" @click="show_form = false">取消</el-button>
              <el-button size="small" type="primary" @click="comfine">确认</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "landing-page",
  data() {
    return {
      tableData: [],
      form_title: false,
      show_form: false,
      userInfo: {},
      blankUserInfo: {},
      currentRow: null,
      form_placeholder: {
        users: [],
        rooms:[],
        times: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
        durations: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        states: ["等待执行", "正在执行", "已执行", "暂时冻结"]
      }
    };
  },
  methods: {
    initTasks() {
      var tasks = localStorage.getItem("tasks");
      if (tasks) {
        var tasksObj = JSON.parse(tasks);
        this.tableData = tasksObj;
      }
    },
    initForm() {
      var userInfos_Temp = this.$CC.getUserinfos();
      if (userInfos_Temp) {
        this.form_placeholder.users = userInfos_Temp;
      }
    },
    indexMethod(index) {
      return index + 1;
    },
    currentChange(currentRow, oldCurrentRow) {
      this.currentRow = currentRow;
    },
    editTask() {
      if (this.checkSelect()) {
        this.userInfo = this.$Util.clone(this.currentRow);

        this.show_form = true;
        this.form_title = false;
        this.initForm();
      }
    },
    addTask() {
      this.show_form = true;
      this.form_title = true;
      this.userInfo = this.blankUserInfo;
      this.initForm();
    },
    delTask() {
      if (this.checkSelect()) {
        this.$confirm("此操作将删除该任务, 是否继续?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            var index = this.tableData.indexOf(this.currentRow);
            this.tableData.splice(index, 1);
            this.currentRow = null;
            this.sendInfo();
            this.saveInfo();
          })
          .catch(() => {});
      }
    },
    comfine() {
      if (this.userInfo.beginTime + this.userInfo.duration <= 22) {
        if (this.form_title) {
          this.tableData.push(this.userInfo);
          this.blankUserInfo = {};
        } else {
          this.$Util.cloneValue(this.userInfo,this.currentRow);


          // this.currentRow.beginTime = this.userInfo.beginTime;
          // this.currentRow.duration = this.userInfo.duration;
          // this.currentRow.room = this.userInfo.room;
          // this.currentRow.seat = this.userInfo.seat;
          // this.currentRow.name = this.userInfo.name;
          // this.currentRow.time = this.userInfo.time;
          // this.currentRow.state = this.userInfo.state;
          // this.currentRow.timeRemaining = this.userInfo.timeRemaining;
        }
        this.sendInfo();
        this.saveInfo();
        this.show_form = false;
      } else {
        this.$CC.showTip(
          "error",
          "错误数据",
          "时间范围选择错误，不可以超过22点"
        );
      }
    },
    runTask() {
      if (this.checkSelect()) {
        this.currentRow.time = this.$Dt.getFormatDate(0,0,1);
        this.currentRow.state = "等待执行";
        this.sendInfo();
        this.saveInfo();
      }
    },
    sendInfo() {
      this.$CC.showTip("success", "温馨提示", "数据同步成功");
      this.$Dt.setTasks(this.tableData);
    },
    saveInfo() {
      var tasks = JSON.stringify(this.tableData);
      localStorage.setItem("tasks", tasks);
    },
    checkSelect() {
      if (!this.currentRow) {
        this.$CC.showTip("warning", "温馨提示", "选择任务才可以操作哦");
        return false;
      } else {
        return true;
      }
    }
  },
  mounted() {
    // 初始化任务
    this.initTasks();

    // 初始化数据
    this.form_placeholder.rooms = this.$Util.clone(this.$Resouce.rooms);
  }
};
</script>

<style>
#wrapper {
  padding: 10px;
}

#form_add_task {
  position: absolute;
  top: 5%;
  background: #fff;
  z-index: 100;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  padding: 10px 30px 10px 30px;
  margin-left: 30%;
  width: 30%;
}
.task_handle_div {
  text-align: right;
  margin: 5px;
}

.task_handle_div i {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0px 10px 0px 10px;
}
</style>
