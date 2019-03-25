<template>
  <div id="wrapper">
    <el-tabs tab-position="left" style="height: 100%;" @tab-click="tabsChange">
      <el-tab-pane v-for="item in rooms" :key="item.id" :label="item.name" lazy>
        <div class="state_tip">
          <div class="state_tip" v-for="item in state_colors" :key="item.name">
            <p class="state_tip_color" :style="'background:'+item.color"></p>
            <p>{{item.name}}</p>
          </div>
        </div>
        <table class="room_draw" align="center" v-loading="loading">
          <tr v-for="(item_x,index_x) in tableData" :key="index_x">
            <td
              v-for="(item_y,index_y) in item_x"
              :key="index_y"
              :title="item_y.id?item_y.id+' / '+item_y.t:undefined"
              :class="'td_state_'+item_y.s+' '+(item_y.t?'seat':'blank')"
              @click="clipboard(item_y.id,item_y.t)"
            >{{item_y.t}}</td>
          </tr>
        </table>
      </el-tab-pane>
    </el-tabs>

    <div ref="echarts_01" class="echarts_01"></div>
  </div>
</template>

<script>
export default {
  name: "landing-page",
  data() {
    return {
      tableData: [],
      rooms: [],
      state_colors: [],
      echarts_01: null,
      option_01: null,
      loading: false
    };
  },
  methods: {
    generateRoomDraw(contentld) {
      var userInfos_Temp = this.$CC.getUserinfos();
      if (!userInfos_Temp) {
        this.$CC.showTip("error", "错误提示", "未找到用户信息");
        return;
      }
      this.loading = true;
      this.$CC.getBlankPOIs(
        {
          contentld: contentld
        },
        data => {
          if (data.status != 200) {
            this.$CC.showTip("error", "错误提示", data.msg);
            return;
          }
          var seats = data.data;
          var tempTableData = [];
          var w = 55;
          var h = 25;
          for (var i = 1; i <= h; i++) {
            var arr = [];
            for (var j = 1; j <= w; j++) {
              arr.push({});
            }
            tempTableData.push(arr);
          }

          var state_colors_copy = JSON.parse(JSON.stringify(this.state_colors));
          for (var i = 0; i < seats.length; i++) {
            var seat = seats[i];
            var x = parseInt(seat.x / 2);
            var y = parseInt(seat.y / 2);
            tempTableData[y - 2][x - 4] = seat;

            if (state_colors_copy[seat.s].value) {
              state_colors_copy[seat.s].value++;
            } else {
              state_colors_copy[seat.s].value = 1;
            }
          }

          this.tableData = tempTableData;

          // 设置表1的值
          this.option_01 = state_colors_copy;

          // 取消loading
          this.loading = false;
        },
        userInfos_Temp[0].sno
      );
    },
    unlockallseats() {
      this.$CC.unlockallseats(data => {
        console.log(data);
      });
    },
    tabsChange(tab) {
      var id = this.rooms[tab.index].id;
      this.generateRoomDraw(id);
    },
    clipboard(id,title){
      this.$electron.clipboard.writeText(id);
      this.$CC.showTip("success","温馨提示","已将座位号("+title+")的id("+id+")写入剪切板");
    }
  },
  // 指令的定义
  // directives: {
  //   mtitle: {
  //     inserted: function(el, binding) {
  //       var value_Temp = binding.value;
  //       if (!value_Temp.includes("undefined")) {
  //         el.title = value_Temp;
  //       }
  //     }
  //   }
  // },
  watch: {
    option_01: function(newValue) {
      var optionTemp = {
        series: [
          {
            name: "访问来源",
            type: "pie",
            radius: "60%",
            data: newValue
          }
        ]
      };
      this.echarts_01.setOption(optionTemp);
    }
  },
  mounted() {
    // 初始化图表
    this.echarts_01 = this.$Echarts.init(this.$refs.echarts_01);

    //  初始化数据
    this.rooms = this.$Util.clone(this.$Resouce.rooms);
    this.state_colors = this.$Util.clone(this.$Resouce.state_colors);

    // 初始化第一个自习室
    var id = this.rooms[0].id;
    this.generateRoomDraw(id);

  }
};
</script>

<style>
.room_draw {
  background: transparent;
}
.state_tip {
  display: flex;
  flex-direction: row;
  font-size: 13px;
  justify-content: start;
  align-items: center;
}

.state_tip_color {
  width: 10px;
  height: 10px;
  margin: 0px 3px 0px 13px;
  background: #282c37;
}
.room_draw td {
  text-align: center;
  display: block;
  float: left;
  font-size: 12px;
  border-radius: 2px;
}

.seat {
  width: 20px;
  height: 13px;
  cursor: pointer;
}

.blank {
  width: 20px;
  height: 5px;
}
.td_state_0 {
  background: #9baec8;
  color: seashell;
}

.td_state_1 {
  background: #ef5285;
  color: seashell;
}

.td_state_2 {
  background: #2b90d9;
  color: seashell;
}

.td_state_3 {
  background: #282c37;
  color: seashell;
}

.td_state_4 {
  background: #9055a2;
  color: seashell;
}

.td_state_5 {
  background: #56a902;
  color: seashell;
}

.echarts_01 {
  margin-left: 200px;
  height: 300px;
  width: 300px;
  text-align: center;
}
</style>
