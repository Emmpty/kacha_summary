import Vue from 'vue'
import App from './App'
import { getFunDeBugApiKey } from '@/common/api/commonService'
import { fundebugInit, test } from '@/common/utils/bookUtil'
var fundebug = require('fundebug-wxjs')

// import '@/common/static/css/app.css'
// import '@/common/static/css/ui.css'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue(App)
app.$mount()
Vue.prototype.globalData = getApp().globalData

let fundebugData = {
  apikey: 'aef3196dc5a337f25a8d59fbd9124448b1f5a4e548b18f1bcd1b1db95c8b6640',
  silent: false
}
// 获取 fundebug apikey
getFunDeBugApiKey().then(res => {
  if (res.result === 0 && res.data.apikey !== '') {
    res.data.silent = false
    fundebugData = res.data
    fundebugInit(fundebug, fundebugData)
  } else {
    fundebugInit(fundebug, fundebugData)
  }
}).catch(res => {
  console.error('fundebug apikey 获取失败：', res)
  fundebugInit(fundebug, fundebugData)
})
