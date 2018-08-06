// pages/shoppe/shoppe.js
import {makePhoneCall, datetimeFormat} from '../../utils/util'
import {getSellerInfo, getReviews,addQuasiOrder} from '../../utils/apis'
var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

var initOrder = {
    totalNum: 0,
    totalPrice: 0,
    totalGoodsPrice: 0,
    totalPackingFee: 0,
    goodsNums: {},
    goods: []
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: ['菜单', '评价', '商家'],
        tabs1: ['全部', '满意', '不满意'],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0,
        _active: 1,
        activeMenuIndex: 0,
        showCart: false,
        showSubGoods: false,
        order: initOrder,
        review: {
            hasMore: true,
            loading: false,
            page: 0
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.id = options.id || 2
        this.loadData()
        this.loadReviews();
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
                });
            }
        });
    },
    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id
        });
    },
    menuClick(e){
        console.log(e.currentTarget.id)
        this.setData({
            activeMenuIndex: e.currentTarget.id
        });
    },
    loadData(){
        var that = this
        var id = this.options.id;
        wx.showNavigationBarLoading()
        getSellerInfo({
            seller_id: id,
            success(data){
                console.log(data)
                data['distanceFormat'] = +(data['distance'] / 1000).toFixed(2)

                that.setData({
                    info: data
                })
                // console.log(info)
                wx.setNavigationBarTitle({
                    title: data.seller_name
                })
            },
            complete(){
                wx.hideNavigationBarLoading()
            }
        })
    },
    //获取评论
    loadReviews(){
        var _this = this
        var id = this.options.id;
        var {
            review: {
                page, loading
            }
        } = this.data
        if (loading) {
            return
        }
        this.setData({
            "review.loading": true
        })
        getReviews({
            page,
            seller_id: id,
            success(data){
                var review_count;
                if (data.review_count) {
                    review_count = data.review_count
                    _this.setData({
                        "review.review_count": review_count,
                    })
                }

                var {
                    review: {
                        list
                    }
                } = _this.data
                var list2 = data.list.map(item => {
                    item['timeFormat'] = datetimeFormat(item['time'])
                    return item
                });
                var goodRate = [], badRate = [], normalRate = [];
                var list = list ? list.concat(list2) : list2
                list.filter(item => {
                    return item['quality'] >= 4 ? goodRate.push(item) : item['quality'] < 2 ? badRate.push(item) : normalRate
                });
                _this.setData({
                    "review.list": list,
                    "review.loading": false,
                    "review.page": page + 1,
                    "review.hasMore": data.count == 10,
                    "goodRate": goodRate,
                    "badRate": badRate,
                    "normalRate": normalRate
                })
            }
        })
    },
    //加载好评
    menuRate(e){
        // this.loadReviews()
        this.setData({
            _active: e.target.dataset.rate
        })
        console.log(this.data)
    },
    //底部加载
    onScrolltolower(e){
        var {
            hasMore, loading
        } = this.data.review
        if (hasMore && !loading) {
            this.loadReviews()
        }
    },
    // 拨打电话
    onPhoneTap(e){
        var {phone} = e.currentTarget.dataset
        makePhoneCall(phone)
    },
    //增加需要的商品进购买列表
    addGoods(goods, item){
        var {goods_id, sub_id, num} = item
        var itemIndex
        if (sub_id) {
            itemIndex = goods.findIndex(item => {
                return item['goods_id'] === goods_id && item['sub_id'] === sub_id
            })
        } else {
            itemIndex = goods.findIndex(item => {
                return item['goods_id'] === goods_id
            })
        }
        if (itemIndex >= 0) {
            goods[itemIndex]['num'] += num
        } else {
            goods.push(item)
        }
        return goods

    },
    //减少需要的商品进购买列表
    removeGoods(goods, item){
        var {goods_id, sub_id, num} = item
        console.log(goods)
        console.log(item)
        var itemIndex
        if (sub_id) {
            itemIndex = goods.findIndex(item => {
                return item['goods_id'] === goods_id && item['sub_id'] === sub_id
            })
        } else {
            itemIndex = goods.findIndex(item => {
                return item['goods_id'] === goods_id
            })
        }
        if (itemIndex >= 0) {
            goods[itemIndex]['num'] -= num
        } else {
            goods.splice(itemIndex, 1)
        }
        return goods

    },
    //增加数量或者商品
    increase(e){
        // console.log(e.currentTarget.dataset)
        let {order, info: goods_map} = this.data;
        let goodsArray = goods_map.menus[this.data.activeMenuIndex].goods.split(',')
        let {goodsId, subId} = e.currentTarget.dataset;
        let goods2Index = goodsArray.indexOf(goodsId)
        let goods = goods_map.menus[this.data.activeMenuIndex].goods2[goods2Index]
        let {goods_id, goods_name} = goods
        order.totalNum += 1
        order.totalGoodsPrice += +goods.price
        order.totalPackingFee += +goods.packing_fee
        order.totalPrice = +((order.totalGoodsPrice + order.totalPackingFee).toFixed(2))
        if (goodsId && subId) {
            goods = goods.sub_goods.filter(item => {
                return subId === item.sub_id
            })
            console.log(goods)
            var {sub_id, sub_name, packing_fee} = goods[0]
            order.goods = this.addGoods(order.goods, {
                goods_id, goods_name,
                sub_id, sub_name,
                packing_fee,
                price: goods.price,
                num: 1
            })
        } else {
            order.goods = this.addGoods(order.goods, {
                goods_id, goods_name,
                packing_fee: goods.packing_fee,
                price: goods.price,
                num: 1
            })
        }
        order.goodsNums = this.calcGoodsNums(order.goods)
        this.setData({
            order
        })
        if (sub_id) {
            this.setData({
                activeSubGoods: Object.assign(this.data.activeSubGoods, {
                    subNums: this.calcSubNums(order.goods, goodsId)
                })
            })
        }
        console.log(this.data.order)
    },
    decrease(e){
        console.log(e.currentTarget.dataset)
        let {order, info: goods_map} = this.data;
        let goodsArray = goods_map.menus[this.data.activeMenuIndex].goods.split(',')
        let {goodsId, subId} = e.currentTarget.dataset;
        let goods2Index = goodsArray.indexOf(goodsId)
        let goods = goods_map.menus[this.data.activeMenuIndex].goods2[goods2Index]
        let {goods_id, goods_name} = goods
        order.totalNum -= 1
        order.totalGoodsPrice -= +goods.price
        order.totalPackingFee -= +goods.packing_fee
        order.totalPrice = +((order.totalGoodsPrice + order.totalPackingFee).toFixed(2))
        console.log(order.goods)
        if (goodsId && subId) {
            goods = goods.sub_goods.filter(item => {
                return subId === item.sub_id
            })
            console.log(goods)
            var {sub_id, sub_name, packing_fee} = goods[0]
            order.goods = this.removeGoods(order.goods, {
                goods_id, goods_name,
                sub_id, sub_name,
                packing_fee,
                price: goods.price,
                num: 1
            })
        } else {
            // console.log(goods)
            order.goods = this.removeGoods(order.goods, {
                goods_id, goods_name,
                packing_fee: goods.packing_fee,
                price: goods.price,
                num: 1
            })
        }
        order.goodsNums = this.calcGoodsNums(order.goods)
        this.setData({
            order
        })
        if (sub_id) {
            this.setData({
                activeSubGoods: Object.assign(this.data.activeSubGoods, {
                    subNums: this.calcSubNums(order.goods, goodsId)
                })
            })
        }
        console.log(this.data.order)

        if (order.totalNum === 0) {
            this.hideCart()
        }
    },
    //计算所选商品的数量
    calcGoodsNums(goods){
        console.log(goods);
        var goodsNums = {}
        for (let i = 0, len = goods.length; i < len; i++) {
            let {goods_id, num} = goods[i]

            if (goodsNums[goods_id]) {
                goodsNums[goods_id] += num
            }
            else {
                goodsNums[goods_id] = num
            }
        }
        return goodsNums
    },
    //计算所选规格的数量
    calcSubNums(goods, goodsId){
        console.log(goods);
        console.log(goodsId);
        var subNums = {}
        for (let i = 0, len = goods.length; i < len; i++) {
            let {goods_id, sub_id, num} = goods[i]
            // if(sub_id){
            //     subNums[sub_id] = num
            // }
            // if (goods_id === goodsId) {
            //     subNums[goodsId] = num
            // }
            if (goods_id === goodsId) {
                subNums[sub_id] = num
            }
        }
        return subNums
    },
    //显示有规格的
    showSubGoods(e){
        // console.log(e.currentTarget.dataset)
        // console.log(this.data)
        const {goodsId} = e.currentTarget.dataset
        console.log(goodsId)
        let goods = this.data.info.menus[this.data.activeMenuIndex].goods2
        let goodsItem = goods.filter((item, index) => {
            return item.goods_id === goodsId
        })
        console.log(goodsItem)
        let {order} = this.data
        console.log(order)
        let {
            goods_id, goods_name, sub_goods
        } = goodsItem[0]

        console.log(goods_id)
        this.setData({
            showSubGoods: true,
            activeSubGoods: {
                goods_id, goods_name, sub_goods,
                activeIndex: 0,
                subNums: this.calcSubNums(order.goods, goodsId)
            }
        })
        console.log(this.data.activeSubGoods)
    },
    hideSubGoods(e){
        this.setData({
            showSubGoods: false,
        })
    },
    changeSubGoods(e){
        console.log(e.currentTarget.dataset)
        var {subIndex} = e.currentTarget.dataset
        var {activeSubGoods} = this.data
        activeSubGoods['activeIndex'] = subIndex
        this.setData({
            activeSubGoods
        })
    },
    toggleCart(e){
        var {showCart, order: {totalNum}} = this.data
        if (totalNum < 0) {
            return
        }
        this.setData({
            showCart: !showCart
        })
    },
    hideCart(e) {
        this.setData({
            showCart: false
        })
    },
    clearCart(e) {
        this.setData({
            order: initOrder,
            showCart: false
        })
    },
    onAddQuasiOrder(e){
        var _this = this
        var {
            info: {seller_id},
            order: {goods},
            loading
        } = this.data
        if (loading) {
            return
        }
        this.setData({
            loading: true
        })
        getApp().getLoginInfo(loginInfo=>{
            console.log(loginInfo)
            if(!loginInfo.is_login){
                wx.navigateTo({
                  url: '/pages/login/login'
                })
                this.setData({
                    loading:false
                })
                return
            }
            addQuasiOrder({
                seller_id,goods,
                success(data){
                    console.log(data)
                    this.setData({
                        loading:false
                    })
                    wx.navigateTo({
                        url: `/pages/order/submitOrder/submitOrder?id=${data.quasi_order_id}`
                    })

                },
                error(){
                    _this.setData({
                        loading:false
                    })
                }
            })
        })

    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})