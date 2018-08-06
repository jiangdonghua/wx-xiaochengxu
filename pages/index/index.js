//index.js
//获取应用实例
import {getSellers} from '../../utils/apis'
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        category: [
            {
                "category_id": "1",
                "title": "本地特产",
                "icon": "/images/category/1.png"
            },
            {
                "category_id": "2",
                "title": "美食外卖",
                "icon": "/images/category/2.png"
            },
            {
                "category_id": "3",
                "title": "甜品蛋糕",
                "icon": "/images/category/3.png"
            },
            {
                "category_id": "4",
                "title": "果蔬生鲜",
                "icon": "/images/category/4.png"
            },
            {
                "category_id": "5",
                "title": "超市便利",
                "icon": "/images/category/5.png"
            },
            {
                "category_id": "6",
                "title": "进口产品",
                "icon": "/images/category/6.png"
            },
            {
                "category_id": "7",
                "title": "优惠活动",
                "icon": "/images/category/7.png"
            },
            {
                "category_id": "8",
                "title": "全部分类",
                "icon": "/images/category/8.png"
            }

        ],
        page: 0,
        hasMore: true,
        loading: false,
    },
    //事件处理函数
    bindViewTap: function () {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    onReady: function () {
        //获得popup组件
        this.popup = this.selectComponent("#popup");
        //this.star = this.selectComponent("#star-rate");

        // this.showPopup()
        // this._setData()
    },
    // _setData(){
    //     this.star._setData()
    // },

    showPopup() {
        this.popup.showPopup();
    },

    //取消事件
    _error() {
        console.log('你点击了取消');
        this.popup.hidePopup();
    },
    //确认事件
    _success() {
        console.log('你点击了确定');
        this.popup.hidePopup();
    },
    onLoad: function () {
        // if (app.globalData.userInfo) {
        //   this.setData({
        //     userInfo: app.globalData.userInfo,
        //     hasUserInfo: true
        //   })
        // } else if (this.data.canIUse){
        //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        //   // 所以此处加入 callback 以防止这种情况
        //   app.userInfoReadyCallback = res => {
        //     this.setData({
        //       userInfo: res.userInfo,
        //       hasUserInfo: true
        //     })
        //   }
        // } else {
        //   // 在没有 open-type=getUserInfo 版本的兼容处理
        //   wx.getUserInfo({
        //     success: res => {
        //       app.globalData.userInfo = res.userInfo
        //       this.setData({
        //         userInfo: res.userInfo,
        //         hasUserInfo: true
        //       })
        //     }
        //   })
        // }
        this.initAddress()
        // console.log(app)
    },
    //初始化地址
    initAddress(){
        const _this = this;
        this.invalidateData()
        app.getCurAddress(function (address) {
            if (address.addr_id) {
                address['title'] = `${address.addr} ${address.detail}`
            }
            _this.setData({
                currentAddress: address
            })
            _this.loadData()
        })
    },
    //加载店铺信息
    loadData() {
        if (this.data.loading) {
            return;
        }
        const _this = this
        const {
            page,
        } = this.data.page

        this.setData({
            loading: true
        })
        getSellers({
            page,
            success(data){
                var {shopList} = _this.data
                var list = data.list.map(item => {
                    item['distanceFormat'] = (item.distance / 1000).toFixed(2)
                    return item
                })

                _this.setData({
                    shopList: shopList ? shopList.concat(list) : list,
                    page: page + 1,
                    hasMore: data.count === 10,
                    loading: false
                })
            }
        })
    },
    //校验数据页码，有无
    invalidateData(){
        this.setData({
            page: 0,
            hasMore: true,
            loading: false,
            shopList: null
        })
    },
    onReachBottom(e){
        if(this.data.hasMore&&!this.data.loading){
            this.loadData()
        }
    },
    callback(address){
        console.log(address)
        console.log("callback")
        app.setCurrentAddress(address)

        this.initAddress()
    },

    getUserInfo: function (e) {
        console.log(e)
        app.globalData.userInfo = e.detail.userInfo
        this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true
        })
    },
    onShareAppMessage(){
        return{
            title: '首页',
            path: '/pages/index/index'
        }

    }

})
