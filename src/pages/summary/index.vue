<template>
  <div class="box pad_box" :class="{inited:true||pageInited}">
    <div class="starApp" :class="{'show':showStar}">
      <span class='close_star_icon iconfont icon-cuohao' @click='onCloseStarTagClick()'></span>
      点击添加到小程序<br>
      下次访问更便捷！
    </div>
    <div class="loading_cover" v-if='rloading'></div>
    <button
      v-if='!showBgk'
      :session-from='data'
      open-type="contact"
      plain="true"
      type="book_primary"
      class="contact-button"
      @longpress="onBookManageButtonLongPress()"
      @click="onKeFuButtonClcik()"
    >联系客服</button>

    <div class='child-tag-box container_flex row'>
       <button
        open-type="getUserInfo" @getuserinfo="onGotUserInfo"
        class="child-tag noborder"
        @click="onChildTagClick()"
        v-if="childData">
        <div class='avater-img-box'>
          <img :src="childData.avatarUrl?childData.avatarUrl:'/static/images/defaultavater@2x.png'" class='avater_img' alt="" >
          <img src="/static/images/vip_avater.png" v-if="vipmem > 0 && isvip" class='vip_name_icon' alt="">
        </div>
        <span class='text-overflow-ell name' :style="{fontSize:26+'rpx'}">{{childData.name||childData.nickname}}</span>
        
      </button>

      
      <div  v-if='childData'  @click.stop='onSwitchChildClick()'  class='edit-img-box container_flex row center'>
        <img src="/static/images/switchchilds.png" alt="" class='edit-img' :class="{'rotate':showMask}" >
      </div>
    </div>
   

    <div class="camera_big_box">
      <div class="camera_circle_out absolute-auto">
      </div>
      <div class="camera_circle_in absolute-auto">
      </div>
      <div class="camera_box_con absolute-auto">
      </div>
      <div class="camera_box_con_in absolute-auto" @click="selectImage(['camera'])">
        <img src="../../../static/images/camera@3x.png">
        <p class="white-color">整页拍照</p>
      </div>
    </div>


    <div class="explain-box " >
        <span class="explain-text" @click="selectImage(['album'])">从相册中选择
          <img class="youjiantou_box" src="/static/images/youjiantou@2x.png"/>
        </span>
    </div>
    <button
        class="book-button noborder"
        type="book_primary"
        hover-class="primary-hover"
        @click="onBookButtonClick()"
        >
        <img
          src="/static/images/book@3x.png"
          alt=""
        >
        <span class="white-color">错题本</span>
    </button>
    <button
        v-if='!hasBindPhone'
        class="book-button-mask"
        open-type="getPhoneNumber" 
        @getphonenumber="getPhoneNumberFun"
      >
        get phoneNumber
        
    </button>
    <!-- <button
      class="share-button container_flex center"
      open-type='share'
      type="nobgcolor"
    >
       <img
        src="../../../static/images/shareimg@3x.png"
        alt=""
      >
      <span class="primary-color">分享到微信群</span>
    </button> -->

    <button
      class="video-button container_flex center"
      @click='navigateToInstrutionPage()'
      type="nobgcolor"
    >
      <span class='iconfont icon-shipin primary-color' :style="{fontSize:38+'rpx'}"></span>
      <span class="primary-color">操作视频</span>
    </button>

     <div
      v-if="showMask"
      catchtouchmove="ture"
      class="mask switchchild-mask"
      id="switchChildMask"
      :class="{'active': showBgk}"
      @click="hideSwitchChildMask($event)"
    >
      <div style='width:100%;height:130rpx;background-color:#fff;'></div>
      <scroll-view class="switchchild-box-sc" scroll-y='true'>
        <div class="switchchild-box container_flex column font-28">
          <div v-if='allChildData.length===0'>
            <span class="kc_loading">
            </span>正在加载...
          </div>
          <div class="item-box" v-for="(cdata,index) in allChildData" :key="index" @click="onSwitchClick(cdata.id)">
          <div class="left-box">
            <!-- <img :src="cdata.avatarUrl?cdata.avatarUrl:'/static/images/defaultavater@2x.png'" style='width:92rpx;height:92rpx' alt="" > -->
            {{cdata.subname}}
          </div>
          <div class="middle-box">
            <div class='text-overflow-ell font-30' style='color:#262626;margin-bottom:10rpx;'>{{cdata.name||cdata.nickname}}</div>
            <div class='class-item-box font-26 text-overflow-ell'  v-for="(c,index1) in cdata.classList" :key="index1">{{c.className?(c.schoolName+'（ '+c.className+' ）'):'子女尚未加入班级'}}
            </div>
            <div class='class-item-box font-26 text-overflow-ell'  v-if="!cdata.classList" :key="index1">子女尚未加入班级
            </div>
          </div>
          <div class="right-box">
            <img :class="{'hidenimg': index!==0}" src="/static/images/currentchild_icon.png" alt="" class='currentchild-img'>
          </div>
        </div>
        </div>   
      </scroll-view>
      
    </div>
    <div class="sq_mask" v-if='showSqCard' :class="{'sq_mask_active':showSqCardActive}">
      <div class="sq_card" :class="{'sq_card_active':showSqCardActive}">
        <div class="sq_icon_box">
          <image  src="/static/images/defaultavater@2x.png"/>
        </div>
        <div class='sq_text text-center trivial-color'>
          咔嚓拍错题需要获取您的授权才可使用<br>
          请点击【允许授权】按钮
        </div>
        <button  open-type="getUserInfo" @getuserinfo="getUserInfoFun"  class='sq_btn noborder font28'>允许授权</button>
      </div>
    </div>
  </div>
</template>

<script>
import mask from '@/components/mask'
import activeModel from '@/components/activeModel'
import { production, PAGELIST, isAbTest, compresssSize } from '@/common/business/base'
import { weixinLogin, UserType } from '@/common/business/login'
import { checkPhone, getCurrentChild, needJoinClass, setCurrentChild } from '@/common/api/commonService'
import {weixinLoginWidthOne} from '@/common/business/loginWidthOne'

import toast from '@/common/utils/toastUtils'
// import { getPhone } from '@/common/business/getPhone'
import { getVipInfoUtil, decodeUserinfo, queryChildrenFun } from '@/common/utils/bookUtil'
import { ABTest } from '@/common/utils/weapp'
import { logReport } from '@/common/utils/fileUtil'

export default {
  data () {
    return {
      childData: null,
      userData: '',
      pictures: [{areas: [], count: 0, url: '', photoScore: 0, serUrl: '', rotate: '', angle: 0}],
      subselected: null,
      isvip: false,
      vipmem: 0,
      // showHgGetPhoneFix: false,
      hasBindPhone: true,
      rloading: false,
      WXCODE: '',
      showStar: false,
      pageInited: false,
      showSqCard: false,
      showSqCardActive: false,
      showMask: false,
      showBgk: false,
      allChildData: []

    }
  },

  components: {
    mask, activeModel
  },

  methods: {
    onSwitchClick (id) {
      let _this = this
      wx.showLoading({
        title: '',
        mask: true,
        success: res => {}
      })
      let st = setTimeout(() => {
        setCurrentChild({childId: id}).then(res => {
          wx.hideLoading()
          if (res.result === 0) {
            _this.toHideSwitchChildMask()
            _this.doQueryChildren()
            _this.doGetCurrentChid()
          } else {
            toast.show('子女切换失败')
          }
        }).catch(res => {
          toast.show('子女切换失败')
        })
        clearTimeout(st)
      }, 500)
    },
    toHideSwitchChildMask () {
      let _this = this
      let st = setTimeout(() => {
        _this.showBgk = false
        st = setTimeout(() => {
          _this.showMask = false
          clearTimeout(st)
        }, 200)
      }, 100)
    },
    onSwitchChildClick () {
      console.log('click')
      if (!this.showMask) {
        let _this = this
        setTimeout(() => {
          _this.doQueryChildren()
        }, 300)
        this.showSwitchChildMask()
      } else {
        this.toHideSwitchChildMask()
      }
    },
    doQueryChildren () {
      let _this = this
      queryChildrenFun(true).then(res => {
        if (res.data === undefined) {
          const url = '../login/main'
          wx.reLaunch({ url: url })
          return
        }
        _this.allChildData = res.data
        wx.setStorageSync('allChildData', _this.allChildData)
      }).catch(res => {
        console.error('catch', res)
      })
    },
    hideSwitchChildMask (e) {
      if (!e) {
        this.toHideSwitchChildMask()
      } else if (e.target.id === 'switchChildMask') {
        this.toHideSwitchChildMask()
      }
    },
    showSwitchChildMask () {
      let _this = this
      this.showMask = true
      let st = setTimeout(() => {
        _this.showBgk = true
        clearTimeout(st)
      }, 100)
    },
    onGotUserInfo (e) {
      let userInfo = e.mp.detail.userInfo
      if (this.showStar) {
        let userData = {
          city: userInfo && userInfo.city === '' ? '未知' : userInfo.city,
          gender: userInfo.gender === 1 ? '男性' : userInfo.gender === 2 ? '女性' : '未知'
        }
        logReport('info', 'userData', userData, 'userData')
        this.onCloseStarTagClick()
      }
    },
    getUserInfoFun (e) {
      console.log(e)
      let _this = this
      if (e.mp.detail.errMsg === 'getUserInfo:ok') {
        wx.showLoading({
          title: '',
          mask: true,
          success: res => {}
        })
        let edata = {
          encryptedData: e.mp.detail.encryptedData,
          iv: e.mp.detail.iv
        }
        decodeUserinfo(_this.WXCODE, edata, {
          success: function (res) {
            wx.hideLoading()
            console.log('uesr getuserinfo success.')
            wx.removeStorageSync('scene1035')
            wx.removeStorageSync('nouid')
            wx.removeStorageSync('nosq')
            _this.hideSqCardFun()
            _this.checkScanClassCode24h() //
          },
          fail: function (res) {
            _this.getWxcode()
            toast.show('授权失败：请稍后重试' + '(' + res + ')')
            wx.hideLoading()
          }
        })
      } else {
        _this.hideSqCardFun()
        _this.doGetCurrentChid()
        _this.checkUserPhone()
        // return
        // wx.showModal({
        //   title: '提示',
        //   content: '拒绝授权将无法加入班级收集错题，请授权后再进入',
        //   confirmText: '确定',
        //   showCancel: false,
        //   success: function (res) {
        //     wx.login({
        //       success: res => {
        //       },
        //       fail: () => {},
        //       complete: () => {}
        //     })
        //   }
        // })
      }
    },
    onCloseStarTagClick () {
      wx.setStorageSync('showStarCard', 'false')
      this.showStar = false
    },
    navigateToInstrutionPage () {
      wx.navigateTo({ url: '../instruction/main' })
    },
    doGetVipInfo () {
      let _this = this
      getVipInfoUtil().then(res => {
        if (res) {
          _this.innitVipData()
        }
      }).catch(res => {
        console.error('catch', res)
        _this.requestFinish()
      })
    },
    initABTest () {
      let abtest = new ABTest()
      var appKey = 'TESTIN_we83d0b32-dd34-49a7-a988-caccb0d51c33'
      abtest.init(appKey)
      abtest.setTags({
        origin: false
      })
      // // abtest.openOverlay() // 得到变量之前开启白色遮罩
      let cameraType = true
      abtest.getVars(function (vars) {
        cameraType = vars.get('origin')
        console.log('init abtest:', cameraType)
        wx.setStorageSync('cameraType', cameraType)
      })
    },
    innitVipData (vdata) {
      let vipdata = vdata || wx.getStorageSync('vipdata')
      if (!vipdata.member) {
        this.isvip = false
      } else {
        this.vipmem = vipdata.member
        if (vipdata.member != '0') {
          this.isvip = true
        } else {
          this.isvip = false
        }
      }
      if (isAbTest) this.initABTest()
    },
    selectImage: function (sourceType) {
      let _newUser = wx.getStorageSync('isNewUser')
      if (_newUser == true) {
        wx.setStorageSync('isNewUser', 'false')
        wx.navigateTo({ url: '../instruction/main?takeType=' + sourceType[0] })
        return
      }
      let cameraType = false
      // 调用小程序原生camera组件
      if (wx.getStorageSync('cameraType') !== '') {
        cameraType = wx.getStorageSync('cameraType')
      }
      console.log('是否调用原生相机', cameraType)

      cameraType ? logReport('info', '原生相机') : logReport('info', '系统相机')

      if (sourceType.indexOf('camera') > -1 && cameraType) {
        let url = '../takephoto/main'
        wx.navigateTo({ url })
        // 日志上报（相机拍照）
        logReport('info', 'wx camera')
        return
      }
      let pictures = [{}]
      wx.chooseImage({
        count: 1,
        sourceType: sourceType,
        sizeType: ['original'],
        success: function (res) {
          if (res.tempFilePaths !== undefined) {
            console.log('取图成功:', res)
            // 日志上报（相册取图）
            logReport('info', 'take by album')

            let _size = res.tempFiles[0].size / 1024 / 1024
            pictures[0].needCompress = false
            if (_size > compresssSize) {
              pictures[0].needCompress = true
            }

            let _imgurl = res.tempFilePaths[0]
            pictures[0].url = _imgurl
            let url = '../addquestion/main?pictures=' + JSON.stringify(pictures)
            // if (!cameraType) {
            //   url = '../cropImage/main?pictures=' + JSON.stringify(pictures)
            // }
            console.log('图片信息...', url, pictures)
            wx.navigateTo({ url })
          }
        },
        fail: function (res) {
          console.log(res)
          if (res.errMsg.indexOf('fail cancel') == -1) {
            wx.showToast({title: '取图失败', icon: 'none'})
          }
        }
      })
    },
    // compressRes ({result, compressUrl, errMsg, imgSize}) {
    //   if (result === 0) {
    //     this.pictures[0].url = compressUrl
    //     this.pictures[0].imgObj = imgSize
    //     this.showCompress = false
    //     console.log('图片压缩完成再进入识别界面')
    //     wx.hideLoading()
    //     const url = '../addquestion/main?pictures=' + JSON.stringify(this.pictures)
    //     wx.navigateTo({ url })
    //   } else {
    //     wx.hideLoading()
    //     console.error('压缩失败:' + errMsg)
    //   }
    // },
    // onGetUserInfo (e) {
    //   let chdata = JSON.stringify(this.childData)
    //   let hastoken = validateToken()
    //   wx.setStorageSync('userData', userInfo)
    //   if (hastoken) {
    //     wx.navigateTo({ url: '../personalpackage/personalpage/main?chdata=' + chdata })
    //   }
    // },
    onBookButtonClick () {
      const url = '../bookpackage/book/main'
      wx.navigateTo({ url })
    },
    async checkUserPhone () {
      let _this = this
      try {
        let res = await checkPhone()
        if (res.result === 0) {
          if (res.data.phoneNumber) {
            _this.hasBindPhone = true
          } else {
            _this.hasBindPhone = false
          }
        } else {
          toast.show(res.msg)
        }
      } catch (error) {
        _this.requestFinish()
        console.error('catch', error)
      }
    },

    onKeFuButtonClcik () {
      // this.userData = JSON.stringify(wx.getStorageSync('userData'))
    },
    onBookManageButtonLongPress () {
      if (!production) {
        wx.showModal({
          title: '警告',
          content: '注销后用户数据将无法找回！确定要注销吗？',
          showCancel: true,
          cancelText: '取消',
          confirmText: '确定',
          success: res => {
            if (res.confirm) {
              weixinLoginWidthOne(UserType.project, {

                success: function (res) {
                  console.log('用户注销成功')
                  let st = setTimeout(() => {
                    // let _phoneInfo = wx.getStorageSync('phoneInfo')
                    wx.clearStorageSync()
                    wx.setStorageSync('isNewUser', true)
                    // wx.setStorageSync('phoneInfo', _phoneInfo)
                    const url = '../login/main'
                    wx.reLaunch({ url: url })
                    clearTimeout(st)
                  }, 1000)
                },
                fail: function (res) {
                }
              })
            }
          }
        })
      } else {
        let st = setTimeout(() => {
          // let _phoneInfo = wx.getStorageSync('phoneInfo')
          wx.clearStorageSync()
          wx.setStorageSync('isNewUser', true)
          const url = '../login/main'
          wx.reLaunch({ url: url })
          clearTimeout(st)
        }, 1000)
      }
    },
    onChildTagClick () {
      this.toHideSwitchChildMask()
      let _url = '../personalpackage/personalpage/main'
      if (this.childData != null) _url += '?currentChild=' + escape(JSON.stringify(this.childData))
      wx.navigateTo({ url: _url })
    },

    async doGetCurrentChid () {
      let _this = this
      try {
        let res = await getCurrentChild()

        _this.requestFinish()
        if (res.result === 0) {
          if (res.data) {
            let _cdata = res.data
            if (!_cdata.avatarUrl) {
              _cdata.avatarUrl = '/static/images/defaultavater@2x.png'
            }
            if (_cdata.vipInfo) {
              wx.setStorageSync('vipdata', _cdata.vipInfo)
            } else {
              wx.setStorageSync('vipdata', false)
            }
            _this.innitVipData(_cdata.vipInfo)
            wx.setStorageSync('childData', _cdata)
            _this.childData = _cdata
          } else {
            wx.reLaunch({ url: '../login/main' })
          }
        } else {
          toast.show('服务器错误:' + res.msg)
        }
      } catch (error) {
        _this.requestFinish()
        toast.show('获取子女错误')
        console.warn('catch', error)
      }
    },
    requestFinish () {
      console.log('main page request finish')
      this.rloading = false
      wx.hideNavigationBarLoading()
      let _showStarCard = wx.getStorageSync('showStarCard')
      if (_showStarCard === true) {
        this.showStar = true
      }
    },
    // hgGetphoneFix (arr) {
    //   for (let i = 0; i < arr.length; i++) {
    //     if (arr[i].classList) {
    //       const _class = arr[i].classList
    //       for (let j = 0; j < _class.length; j++) {
    //         console.log('学校班级信息', _class[j].classId, _class[j].classId)
    //         // 黄冈
    //         let _fixClassId = 144// 324//
    //         let _fixSchoolId = 8426// 8256//

    //         if (_class[j].classId == _fixClassId || _class[j].classId == _fixSchoolId) {
    //           console.error('加入了指定培训班')
    //           if (!this.hasBindPhone) {
    //             console.error('加入了指定培训班,并且没有手机号')
    //             this.showHgGetPhoneFix = true
    //           } else {
    //             console.log('加入了指定培训班,有手机号')
    //           }
    //         }
    //       }
    //     }
    //   }
    // },
    getPhoneNumberFun (e) {
      let _this = this
      if (e.mp.detail.errMsg === 'getPhoneNumber:ok') {
        let edata = {
          encryptedData: e.mp.detail.encryptedData,
          iv: e.mp.detail.iv
        }
        decodeUserinfo(_this.WXCODE, edata, {
          success: function (res) {
            _this.hasBindPhone = true
            wx.navigateTo({ url: '../bookpackage/book/main' })
          },
          fail: function (res) {
            console.error('get phoneNumber fail:', res)
            wx.navigateTo({ url: '../bookpackage/book/main' })
          }
        })
      } else {
        // 拒绝获取
        // wx.showModal({
        //   title: '提示',
        //   content: '请允许微信授权',
        //   confirmColor: baseColor.primaryColor,
        //   confirmText: '确定',
        //   showCancel: false,
        //   success: function (res) {
        //   }
        // })
        wx.navigateTo({ url: '../bookpackage/book/main' })
      }
    },
    showSqCardFun () {
      console.error('check user shouquan', wx.getStorageSync('nouid') == true && wx.getStorageSync('scene1035') == true, wx.getStorageInfoSync())

      this.showSqCard = true
      let _this = this
      setTimeout(() => {
        _this.showSqCardActive = true
      }, 300)

      this.requestFinish()
    },
    hideSqCardFun () {
      this.showSqCardActive = false
      let _this = this
      setTimeout(() => {
        _this.showSqCard = false
      }, 200)
    },
    wxLoginInit () {
      let _this = this
      let _nosq = wx.getStorageSync('nosq')
      weixinLogin(UserType.project, {
        success: function (res) {
          if ((_nosq == true || res.result === 11001) && wx.getStorageSync('scene1035') == true) {
            // 授权弹框
            wx.setStorageSync('nouid', true)
            return _this.showSqCardFun()
          } else {
            wx.removeStorageSync('nouid')
            _this.checkScanClassCode24h()
          }
        },
        fail: function (res) {
          console.error('登陆失败', res)
          wx.hideLoading()
          _this.requestFinish()
          toast.show('微信登陆失败')
        }
      })
    },
    async checkScanClassCode24h () {
      let _this = this
      try {
        let res = await needJoinClass({childId: 4425092539435008})
        console.error('是否扫描了加入班级二维码', res)
        if (res.result === 0) {
          if (res.data && res.data.classId) {
            // 收到加班指令 需要去加入班级界面
            let sid = res.data.scanId
            if (sid !== undefined) {
              wx.reLaunch({ url: '../joinClass/main?scanId=' + sid + '&classId=' + res.data.classId })
            } else {
              toast.show('没有班级信息')
            }
          } else {
            if (!_this.$root.$mp.query.currentChild) {
              _this.doGetCurrentChid()
            }
            // _this.doQueryChildren()
            _this.checkUserPhone()
          }
        } else {
          _this.requestFinish()
          wx.hideLoading()
          toast.show('服务器错误' + res.data.msg)
        }
      } catch (error) {
        _this.requestFinish()
        toast.show('服务器错误')
        console.error('catch', error)
      }
    },
    getWxcode () {
      let _this = this
      wx.login({
        success: res => {
          if (res.code) {
            _this.WXCODE = res.code
          }
        },
        fail: () => {},
        complete: () => {}
      })
    }
  },

  created () {

  },
  onLoad () {
    console.log('main page onload')
    this.showStar = false
    wx.setStorageSync('orderIndex', 0)
    wx.setStorageSync('recognitionError', 0)
    wx.setStorageSync('recognitionSum', 0)
    this.isvip = false
    this.allChildData = []
    this.childData = null
    // 已经有子女返回的情况
    let _allChildData = wx.getStorageSync('allChildData')
    if (_allChildData) {
      this.allChildData = _allChildData
    }
    if (this.$root.$mp.query.currentChild) {
      let cdata = JSON.parse(unescape(this.$root.$mp.query.currentChild))
      console.log('login page back chilData ', cdata)
      this.childData = cdata
      this.requestFinish()

      if (cdata.vipInfo) {
        wx.setStorageSync('vipdata', cdata.vipInfo)
      } else {
        wx.setStorageSync('vipdata', false)
      }
      this.innitVipData(cdata.vipInfo)
      wx.setStorageSync('childData', cdata)

      return this.checkUserPhone()
    }

    this.rloading = true
    wx.showNavigationBarLoading()
    this.wxLoginInit()
  },
  onUnload () {
    // 日志上报（退出小程序）
    logReport('info', 'main unload')
  },
  onHide () {
    this.toHideSwitchChildMask()
  },
  onShow () {
    console.log('main page onshow', this.globalData)
    // 日志上报（进入首页）
    logReport('info', 'page show')

    // 清空本地部分数据
    PAGELIST.data = []
    wx.removeStorageSync('pageListCurentIndex')
    wx.removeStorageSync('replacePage')
    wx.removeStorageSync('replacePhoto')
    wx.removeStorageSync('backPageList')
    wx.removeStorageSync('pageListBack')
    // 清空本地部分数据

    let cdata = wx.getStorageSync('childData')
    let _upvip = wx.getStorageSync('upvip')
    let _updateChildInfo = wx.getStorageSync('updateChildInfo')
    if (cdata.id) {
      this.childData = cdata
    }

    if (_upvip || _updateChildInfo) {
      wx.setStorageSync('upvip', false)
      wx.removeStorageSync('updateChildInfo')
      this.doGetVipInfo()
      this.allChildData = wx.getStorageSync('allChildData')
    }
    console.log('nouid,scene1035:', wx.getStorageSync('nouid'), wx.getStorageSync('scene1035'))
    if (wx.getStorageSync('nouid') == true && wx.getStorageSync('scene1035') == true) {
      this.showSqCardFun()
    }
    this.getWxcode()
  },
  onShareAppMessage: function (res) {

  }

}
</script>

<style scoped lang="less">
@import "../../common/static/less/base.less";
.box{

  .switchchild-mask{
    z-index: 14;
  }
  .switchchild-box-sc{
    max-height: 600rpx;
    color:rgba(151,150,164,1);
    background: rgba(255,255,255);
    background-color: #fff;
    position: absolute;
    top: 130rpx;
    width: 100%;
    min-height: 80rpx;
    z-index: 999;
  }
  .switchchild-box{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8rpx;
    .item-box{
      width:100%;
      display: flex;
      min-height: 80rpx;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
      // border-top: 2rpx solid #eeeeee;
      background-color: #fff;
      padding: 23rpx 32rpx;
      .left-box{
        align-items:center;
        width:92rpx;
        height: 92rpx;
        line-height: 92rpx;
        text-align: center;
        background-color: #43A5F3;
        font-size: 32rpx;
        margin-right: 42rpx;
        color:#fff;
        border-radius: 100%;
        // .sname{
        //   display: flex;
        //   justify-content: flex-start;
        //   align-items: center;
        // }
        .text-overflow-ell{
          padding-right: 20rpx;
        }
      }
      .middle-box{
        flex:1 1 auto;
        height:100%;
        display: flex;
        align-items:flex-start;
        justify-content: center;
        flex-direction: column;
        .class-item-box{
          width:400rpx;
          color: #BABBBC;
        }
      }
      .right-box{
        // flex:1 1 auto;
        height:100%;
        display: flex;
        align-items:flex-start;
        justify-content: center;
        .currentchild-img{
          width: 30rpx;
          height: 30rpx;
        }
        .hidenimg{
          opacity: 0;
        }
      }
    }
  }
  .imagebg{
    width:100%;
    height:100%;
    position: absolute;
    top:0;
  }
  .inner{
    position: absolute;
    top:0;
    width:100%;
    height:300rpx;
    background-color: transparent;
    justify-content: flex-start;
  }
}
.sq_mask{
  width:100%;
  height: 100%;
  background-color: rgba(0,0,0,.2);
  position: fixed;
  top:0;
  z-index: 9999;
  opacity: 0;
  transition: opacity .2s;
  &.sq_mask_active{
    opacity: 1;
  }
  .sq_card{
    width:690rpx;
    height: 380rpx;
    border-radius: 16rpx;
    position: absolute;
    bottom:30rpx;
    background-color: #fff;
    margin:auto;
    left:0;
    right:0;
    transform: translateY(450rpx);
    opacity: 0;
    transition: all .3s;
    &.sq_card_active{
      transform: translateY(0);
      opacity: 1;
    }
    .sq_icon_box{
      width:130rpx;
      height: 130rpx;
      border:4rpx solid #fff;
      border-radius: 100%;
      position: absolute;
      margin: auto;
      left:0;
      right: 0;
      top:-65rpx;
      image{
        width:100%;
        height: 100%;
      }
    }

    .sq_text{
      line-height: 50rpx;
      margin-top: 100rpx;
      
    }
    .sq_btn{
      width:320rpx;
      height: 90rpx;
      border-radius: 45rpx;
      line-height: 90rpx;
      background-image: -webkit-linear-gradient(left, rgb(67,191,254) , rgb(33 ,166 ,255));
      color:#fff;
      margin-top: 40rpx;
    }
  }
}
.box{
  height: 100%;
  // opacity: 0;
  // &.inited{
  //   opacity: 1;
  // }
}
.loading_cover{
  width:100%;
  height: 100%;
  position: fixed;
  top:0;
  left:0;
  z-index: 99999;
  opacity: 0;
}
.starApp{
  position: fixed;
  top:20rpx;
  right:70rpx;
  z-index: 999991;
  padding:14rpx 25rpx;
  padding-right: 50rpx;
  background-color: @primarycolor;
  border-radius: 8rpx;
  color:#fff;
  line-height: 40rpx;
  font-size: 28rpx;
  transform: scale(0);
  transition: all .3s;
  opacity: 0;
  &.show{
    transform: scale(1);
    opacity: 1;
  }
  &::before{
    content: '';
    position: absolute;
    top:-18rpx;
    right:50rpx;
    display: inline-block;
    width:0;
    height:0;
    border-right:20rpx solid transparent;
    border-left:20rpx solid transparent;
    border-bottom:20rpx solid @primarycolor;
  }
  .close_star_icon{
    position: absolute;
    top: 2rpx;
    right: -2rpx;
    font-size: 28rpx;
    width: 40rpx;
    height: 40rpx;

  }
}
// .hg_getPhone_mask{
//   position: fixed;
//   width:100%;
//   height: 100%;
//   top:0;
//   left:0;
//   background-color: rgba(0,0,0,.5);
//   z-index: 99999;
//   .content{
//     width:600rpx;
//     margin: auto;
//     margin-top:55%;
//     background-color: #fff;
//     border-radius: 30rpx;
//     box-sizing: border-box;
//     line-height: 50rpx;
//     display: flex;
//     flex-direction: column;
//     justify-content: space-between;
//     .childbox{
//       width:100%;
//       height: 450rpx;
//       border-radius: 20rpx;
//       background-color: #fff;
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//       box-shadow: 0 0 10rpx #999;
//       position: relative;
//     }
//     .header-icon-box{
//       width:117rpx;
//       height:117rpx;
//       border-radius: 100%;
//       overflow: hidden;
//       position: absolute;
//       margin: auto;
//       left:0;
//       right:0;
//       top:-60rpx;
//       border:6rpx solid #fff;
//     }
//     .header-icon-box>image{
//       width:117rpx;
//       height:117rpx;
//     }
//     .title{
//       margin-top:100rpx;
//     }
//     .title2{
//       margin:10rpx 0;
//     }


//     .title-color{
//       color:rgb( 80 ,98, 114);
//     }
//     .bind-button-fix{
//       width:400rpx;
//       height: 80rpx;
//       border-radius: 60rpx;
//       line-height: 80rpx;
//       margin: 0;
//       background-color: rgb(255 ,102, 102);
//       padding:0;
//       margin-top:40rpx;
//     }

//     .primary-hover2{
//       background-color:lighten(rgb(255 ,102, 102),10%) !important;
//     }
//   }
// }


.contact-button {
  width: 148rpx;
  height: 60rpx;
  line-height: 60rpx;
  padding: 0;
  font-size: 26rpx;
  border-radius: 0;
  border-top-left-radius: 30rpx;
  border-bottom-left-radius: 30rpx;
  position: fixed;
  top: 50rpx;
  border-right: 0;
  right: 0;
}
.child-tag-box{
  align-items: center;
  position: fixed;
  z-index: 15;
  top: 50rpx;
  left: 0;
  width: 260rpx;
  padding-left: 14rpx;
  .child-tag{
    height: 60rpx;
    margin: 0;
    line-height: 60rpx;
    padding: 0;
    max-width: 200rpx;
    font-size: 26rpx;
    border-right: 0;
    text-align: center;
    display: flex;
    justify-content: center;
    color:@colorlight;
    align-items: center;
    background-color: transparent;
    .name{
      margin-left: 10rpx;
      max-width: 140rpx;
    }

  }
  .edit-img-box{
    width:60rpx;
    height:60rpx;
    .edit-img{
      width:36rpx;
      height:36rpx;
      transition: transform .3s;
      &.rotate{
        transform: rotate(-180deg);
      }
    }
  }
  
}
.avater-img-box{
  width:60rpx;
  min-width: 60rpx;
  height: 60rpx;
  border-radius: 100%;
  position: relative;
  .avater_img{
    width:100%;
    height: 100%;
    border-radius: 100%;
  }
  .vip_name_icon{
    width:30rpx;
    height: 25rpx;
    position: absolute;
    right: -4rpx;
    bottom: 4rpx;
  }
}


.book-button,.book-button-mask{
  width: 300rpx;
  height: 80rpx;
  text-align: center;
  font-size: 26rpx;
  border-radius: 40rpx;
  position:absolute;
  margin:auto;
  left:0;
  right:0;
  bottom:200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 36rpx;
    height: 36rpx;
  }
  span{
    font-size: 32rpx;
    margin-left: 10rpx;
  }
}
.book-button-mask{
  opacity: 0;
}

// .share-button {
//   position:absolute;
//   bottom:40rpx;
//   display: flex;
//   align-items: center;
//   span {
//     font-size: 30rpx;
//     margin-left: 10rpx;
//     position: relative;
//     top:2rpx;
//   }
//   img {
//     width: 36rpx;
//     height: 36rpx;
//   }
// }
.video-button {
  position:absolute;
  bottom:40rpx;
  height: 60rpx;
  line-height: 60rpx;
  display: flex;
  align-items: center;
  margin: auto;
  left:0;
  right: 0;
  width: 265rpx;
  span {
    font-size: 30rpx;
    margin-left: 10rpx;
    position: relative;
    top:2rpx;
    height: 100%;
    display: inline-block;
    vertical-align: center;
  }
  img {
    width: 48rpx;
    height: 48rpx;
  }
}
.explain-box {
  font-size: 28rpx;
  position: absolute;
  margin:auto;
  left:0;
  right:0;
  top: 54%;
  text-align: center;
  z-index: 4;
  .explain-text {
    font-size: 30rpx;
    color: rgb(141, 150, 159);
    width:112rpx;
    padding:15rpx;
    position: relative;
  }
  .youjiantou_box{
    width: 26rpx;
    height: 26rpx;
    position:relative;
    top:2rpx;
  }
}

.camera_big_box {
  width: 560rpx;
  height: 560rpx;
  border-radius: 100%;
  // top: 180rpx;
  position: absolute;
  margin:auto;
  left:0;
  right: 0;
  top:calc(50% - 430rpx);
}
.camera_circle_in {
  width: 260rpx;
  height: 260rpx;
  border-radius: 100%;
  position: absolute;
  z-index: 2;
  animation: cameraCircleInActive 1.5s linear infinite;
}
.camera_circle_out {
  width: 360rpx;
  height: 360rpx;
  background-color: rgb(221, 241, 255);
  border-radius: 100%;
  animation: cameraCircleOutActive 1.5s linear infinite;
  animation-direction: normal;
  z-index: 1;
}

.camera_box_con {
  width: 328rpx;
  height: 328rpx;
  border-radius: 100%;
  background-color: @primarycolor;
  position: absolute;
  z-index: 3;
  animation: cameraBoxInnerScale 3s infinite alternate;
  
  
}
.camera_box_con_in{
    width: 328rpx;
    height: 328rpx;
    z-index: 4;
    img {
      width: 144rpx;
      height: 144rpx;
      animation: cameraBoxInnerImageScale 2s infinite;
      animation-direction:alternate;
      -webkit-animation-direction:alternate;
      animation-delay: 1s;
      display: block;
      margin:auto;
      margin-top: 70rpx;
    }
    p {
      font-size: 28rpx;
      text-align: center;
      margin-top: 20rpx;
    }
}
.book-form-box{
  width:100%;
  height:100%;
  position: absolute;
  left:0;
  z-index: 9;
  opacity: 0;
}

@media (min-height:720px){
  .book-button{
    bottom:230rpx;
  }
}
@keyframes cameraCircleOutActive {
  0% {
    background-color: rgba(221, 241, 255, 0);
  }
  50% {
    background-color: rgba(221, 241, 255, 0.8);
  }
  100% {
    width: 520rpx;
    height: 520rpx;
    //transform: scale(1.44);
    background-color: rgba(221, 241, 255, 0);
  }
}
@keyframes cameraCircleInActive {
  0% {
    width: 280rpx;
    height: 280rpx;
    // transform: scale(1.07);
    background-color: rgba(153, 213, 254, 1);
  }

  100% {
    width: 430rpx;
    height: 430rpx;
    // transform: scale(1.6);
    background-color: rgba(153, 213, 254, 0);
  }

}

@keyframes cameraBoxInnerScale {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(0.95);
  }
}
@keyframes cameraBoxInnerImageScale {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(1.1);
  }
}
@media (min-width:532px){
  @keyframes cameraCircleInActive {
  0% {
    width: 236rpx;
    height: 236rpx;
    background-color: rgba(153, 213, 254, 1);
  }

  100% {
    width: 352rpx;
    height: 352rpx;
    background-color: rgba(153, 213, 254, 0);
  }

}
@keyframes cameraCircleOutActive {
  0% {
    background-color: rgba(221, 241, 255, 0);
  }
  50% {
    background-color: rgba(221, 241, 255, 0.8);
  }
  100% {
    width: 432rpx;
    height: 432rpx;
    background-color: rgba(221, 241, 255, 0);
  }
}
}
</style>