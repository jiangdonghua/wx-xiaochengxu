// pages/address/select.js
import {
  getUserAddrs, deleteUserAddr
} from '../../utils/apis'
import {
  confirm, getPrevPage
} from '../../utils/util'

Page({
  data: {

  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.cb = options.callback || 'callback'
    this.setData({
      selectedId: options.id
    })
    this.loadData()
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onPullDownRefresh() {
    this.loadData(function () {
      wx.stopPullDownRefresh()
    })
  },
  loadData(cb) {
    var that = this
    var {loading} = this.data
    if (loading) {
      return
    }
    this.setData({
      loading: true
    })
    wx.showNavigationBarLoading()
    getUserAddrs({
      success(data) {
        that.setData({
          list: data,
          loading: false
        })
        wx.hideNavigationBarLoading()
        cb && cb()
        if(data.length === 0) {
          wx.navigateTo({
            url: '/pages/address/add',
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
          })
        }
      },
      error() {
        that.setData({
          loading: false
        })
        wx.hideNavigationBarLoading()
        cb && cb()
      }
    })
  },
  callback() {
    this.loadData()
  },
  onDelete(e) {
    var that = this
    var {id} = e.currentTarget
    var address = this.data.list[id]
    confirm({
      content: `是否删除地址 ${address.addr} ${address.detail}`,
      confirmText: '删除',
      ok() {
        deleteUserAddr({
          addr_id: address.addr_id,
          success(data) {
            that.loadData()
          }
        })
      }
    })
  },
  onItemTap(e) {
    var {id} = e.currentTarget
    var {index} = e.currentTarget.dataset
    var {selectedId, list} = this.data
    if (id == selectedId) {
      return
    }
    getApp().setCurrentAddress(list[index])

    getPrevPage()[this.cb](id)
    wx.navigateBack()
  }

})