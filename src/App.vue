<template>
  <div class="video-comment-container">  
  </div>
</template>
<script>
import toast from '@/common/utils/toastUtils'
import { logReport } from '@/common/utils/fileUtil'
var fundebug = require('fundebug-wxjs')

export default {
  data () {
    return {
      interval: null,
      upaccessId: ''
    }
  },

  onLaunch (option) {
    console.log('app onLoauch scene', option)
    // 日志上报（进入小程序）

    logReport('info', 'app created')
    // 初始化globalData
    // if (option.path === 'pages/main/main' && option.scene === 1035) {
    //   wx.setStorageSync('gzJoinClass', true)
    // }
    let _this = this
    let phoneInfo = wx.getSystemInfoSync()
    let st = setTimeout(() => {
      _this.globalData.deviceInfo = phoneInfo
      _this.globalData.navigationBarHeightg = wx.getMenuButtonBoundingClientRect().height + wx.getMenuButtonBoundingClientRect().top + 8
      console.log('globalData', _this.globalData)
      clearTimeout(st)
    }, 0)
    let _showStarCard = wx.getStorageSync('showStarCard')
    if (_showStarCard === 'false') {
      wx.setStorageSync('showStarCard', 'false')
    } else {
      wx.setStorageSync('showStarCard', true)
    }

    wx.getUpdateManager().onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log('是否有新版本：' + res.hasUpdate)
      if (res.hasUpdate) { // 如果有新版本
        // 小程序有新版本，会主动触发下载操作（无需开发者触发）
        wx.getUpdateManager().onUpdateReady(function () { // 当新版本下载完成，会进行回调
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，单击确定重启应用',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                wx.getUpdateManager().applyUpdate()
              }
            }
          })
        })
        // 小程序有新版本，会主动触发下载操作（无需开发者触发）
        wx.getUpdateManager().onUpdateFailed(function () { // 当新版本下载失败，会进行回调
          wx.showModal({
            title: '已经有新版本了哟~',
            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
            showCancel: false
          })
        })
      }
    })
    console.log('app onLaunch finish')
  },
  onload () {
  },
  mounted () {
    console.log('app mounted')
  },
  onShow (option) {
    console.log('app onshow scene', option)
    if (option.path === 'pages/main/main' && option.scene === 1035) {
      wx.setStorageSync('scene1035', true)
    } else {
      wx.removeStorageSync('scene1035')
    }
    wx.onNetworkStatusChange(function (res) {
      if (!res.isConnected) {
        toast.show('你的设备没有连接网络')
      }
    })
    wx.onMemoryWarning(function (res) {
      console.log('可使用内存不足，请清空一些不必要的进程', res)
    })

    console.log('app show')
    // 日志上报（显示小程序）
    logReport('info', 'app show')
  },
  onHide () {
    // 日志上报（小程序切到后台）
    logReport('info', 'app hide')
  },
  methods: {

  },
  onError (err) {
    fundebug.notifyError(err)
  }
}
</script>

<style lang="less">
@import "./common/static/less/base.less";
@import "./common/static/less/common.less";
@import "./common/static/less/pad.less";
.opacity-scrollbar ::-webkit-scrollbar{
  width:0;
  height: 0;
  color: transparent;
}
page{
  height: 100%;
  background-color: #fff;
  font-size: 16px;
  font-family: -apple-system-font, Helvetica Neue, Helvetica, sans-serif;
}

/* this rule will be remove */
* {
  transition: width 2s;
  -moz-transition: width 2s;
  -webkit-transition: width 2s;
  -o-transition: width 2s;
  margin:0;
  padding: 0;
}

</style>

