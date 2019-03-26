import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
// 
export default new Router({
  routes: [
    {
      path: '/',
      name: 'user',
      component: require("@/components/User").default,
    },
    {
      path: '/task',
      name: 'task',
      component: require("@/components/Task").default,
    },
    {
      path: '/data',
      name: 'data',
      component: require("@/components/Data").default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
