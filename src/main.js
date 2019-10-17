import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets （CSS reset）

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n
import locale from 'element-ui/lib/locale/lang/zh-CN' // element默认使用中文

import '@/styles/index.scss' // global css (全局css)

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon （图标）
import '@/permission' // permission control （权限控制）

// set ElementUI lang
Vue.use(ElementUI, { locale })

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
