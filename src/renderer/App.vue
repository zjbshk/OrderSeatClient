<template>
  <div id="app">
    <el-menu
      default-active="1"
      mode="horizontal"
      @select="handleSelect"
      background-color="#2c3245"
      text-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="1"><router-link to="/" style="text-decoration: none;">用户信息</router-link></el-menu-item>
      <el-menu-item index="2"><router-link to="/task">任务信息</router-link></el-menu-item>
      <el-menu-item index="3"><router-link to="/data">数据可视化</router-link></el-menu-item>
    </el-menu>
      <!-- <User v-show="comName == 'User'" key="User"/>
      <Task v-show="comName == 'Task'" key="Task"/>
      <Data v-show="comName == 'Data'" key="Data"/> -->
      <router-view/>
  </div>
</template>

<script>
// var User = require("@/components/User").default;
// var Task = require("@/components/Task").default;
// var Data = require("@/components/Data").default;
export default {
  name: "seat",
  data() {
    return {
      comName: "User"
    };
  },
  // components: {
  //   User:
  //   Task:
  //   Data:
  // },
  methods: {
    handleSelect(key, keyPath) {
      if (key == "1") {
        this.comName = "User";
      } else if (key == "2") {
        this.comName = "Task";
      } else if (key == "3") {
        this.comName = "Data";
      }
    }
  },
  mounted(){
    this.$CC.notify = this.$notify;
    this.$CC.setNotify(this.$notify);
    this.$CC.initUserinfos();
  }
};
</script>

<style>
html,
body {
  margin: 0px;
  padding: 0px;
  background: #fafafa;
  
}


</style>
