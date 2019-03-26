import Vue from 'vue'
import axios from 'axios'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import App from './App'
import router from './router'

Vue.use(ElementUI)





if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

import Util from "./assets/js/util.js"
Vue.prototype.$Util = Util

import Resouce from "./assets/js/resouce.js"
Vue.prototype.$Resouce = Resouce

import CC from "./assets/js/node_net.js"
Vue.prototype.$CC = CC

import Dt from "./assets/js/dealTask.js"
Vue.prototype.$Dt = Dt
Dt.setCC(CC)
Dt.setUtil(Util)

import * as Echarts from 'echarts'
Vue.prototype.$Echarts = Echarts





/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
