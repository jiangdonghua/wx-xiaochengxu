//app.js
import {getCurrentAddress, coordFormat} from './utils/util'
import {gcj02tobd09} from './utils/coordtransform'
import distance from './utils/distance'
import {
    getLoginInfo, getUserAddrs
} from './utils/apis'
App({
    onLaunch: function () {
    //     // 展示本地存储能力
    //     var logs = wx.getStorageSync('logs') || []
    //     logs.unshift(Date.now())
    //     wx.setStorageSync('logs', logs)
    //
    //     // 登录
    //     wx.login({
    //         success: res => {
    //             console.log(res)
    //             // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //         }
    //     })
    //     // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.userInfo = res.userInfo

                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }
                        }
                    })
                }
            }
        })
    },
    //删
    getLoginInfo: function (cb) {
        var that = this
        if (this.globalData.loginInfo) {
            cb && cb(this.globalData.loginInfo)
        } else {
            //调用登录接口
            getLoginInfo({
                success(data) {
                    console.log(data)
                    that.setLoginInfo(data)
                    cb && cb(data)
                }
            })
        }
    },
    setLoginInfo(loginInfo) {
        if (loginInfo.session_3rd) {
            wx.setStorageSync('session_3rd', loginInfo.session_3rd)
        }
        this.globalData.loginInfo = loginInfo
    },
    //删
    getCurAddress(cb){
        var that = this;
        if (this.globalData.currentAddress) {
            return cb&&cb(this.globalData.currentAddress)
        }
        getCurrentAddress(address=>{
            address=that.setCurrentAddress(address)
            cb(address)
            //登录信息
            //...
            this.getLoginInfo(loginInfo => {
                if (loginInfo.is_login) {
                    this.findNearbyUserAddr(userAddress => {
                        if (!userAddress) {
                            return
                        }
                        that.setCurrentAddress(userAddress)
                    })
                }
            })
        })
    },
    setCurrentAddress(address){
            if(address.addr_id){
                address.title=`${address.addr} ${address.detail}`
                address.city=address.city_name
                address.district=address.district_name
                address.location={
                    longitude:address.longitude,
                    latitude:address.latitude
                }
            }else{
                //国测局坐标转百度经纬度坐标
                address.location=coordFormat(address.location)
            }
            this.globalData.currentAddress=address
        return address
    },

    findNearbyUserAddr(cb, radius = 100) {
        radius /= 100
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                var [lng1, lat1] = gcj02tobd09(res.longitude, res.latitude)
                getUserAddrs({
                    success(addressList) {
                        for (let i = 0, len = addressList.length; i < len; i++) {
                            var address = addressList[i]
                            var {
                                longitude: lng2,
                                latitude: lat2
                            } = address
                            if (distance(lat1, lng1, lat2, lng2) <= radius) {
                                return cb(address)
                            }
                        }
                        return cb()
                    }
                })
            },
            fail(res) {
                console.log(res.errMsg)
                alert('获取用户地址失败')
            }
        })
    },
    globalData: {
        userInfo: null,
        currentAddress: null
    }
})