import {
    getCurrentAddressList,
    searchAddressList,
    splitByKeyword,
    getPrevPage
} from '../../utils/util'
import debounce from '../../utils/debounce'
import {getUserAddr} from '../../utils/apis'

const initRelocateLabel = '重新定位'
Page({
    data: {
        reLocateLabel: initRelocateLabel,
        searchKey: '',
        searchList: [],
        showSearchList: false,
        addressList: [],
        poiList: []
    },
    onLoad: function (options) {
        // 页面初始化 options为页面跳转所带来的参数
        this.callback = options.callback || 'callback'
        this.initAddressList()
        //初始化定位周边
        this.initPoiList()
        this.onSearchInput = debounce(this.onSearchInput, 300)
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
    relocate(e){
        this.initPoiList()
    },
    onSearchInput(e){
        //输入触发
        if (e === undefined) return
        let _this = this
        let {value} = e.detail
        this.setData({
            searchKey: value,
            showSearchList: !!value
        })

        if (value) {
            searchAddressList({
                keyword: value,
                success(data){
                    data = data.map(item => {
                        item['titleSplit'] = splitByKeyword(item.title, value)
                        return item
                    })
                    _this.setData({
                        searchList: data
                    })
                }
            })
        }


    },
    clearSearchKey(e){
        //清除输入
        this.setData({
            searchKey: '',
            showSearchList: false
        })
    },
    onSearchItemTap(e){
        //搜索列表
        const {id}=e.currentTarget
        const {searchList}=this.data
        const {
            title,
            district,
            adcode,
            address,
            city,
            location
            // city_name: address.city,
            // city_id: address.city_id,
            // district_name: address.district,
            // district_id: address.district_id,
            // longitude: location.longitude,
            // latitude: location.latitude
        }=searchList[id]
        getPrevPage()[this.callback]({
            location,
            district,
            city,
            title,address,
            district_id:adcode.toString(),
            city_id:adcode.toString().replace(/\d{2}$/,'00')
        })
        wx.navigateBack()
    },
    onPoiItemTap(e){
        //周边列表
        const {id}=e.currentTarget
        const {poiList}=this.data
        getPrevPage()[this.callback](poiList[id])
        wx.navigateBack()
    },
    onAddressItemTemp(e){
        //地址列表
        const {id} = e.currentTarget
        const {addressList} = this.data
        getPrevPage()[this.callback](addressList[id])
        wx.navigateBack()
    },
    initAddressList(){
        //初始化地址列表
        let _this = this
        getApp().getLoginInfo(loginInfo => {
            if (loginInfo.is_login) {
                getUserAddr({
                    success(data){
                        _this.setData({
                            addressList: data
                        })
                    }
                })
            }
        })
    },
    initPoiList(){
        //初始化周边
        let _this = this
        this.setData({
            reLocateLabel: '定位中...'
        })
        getCurrentAddressList({
            success(addressList){
                _this.setData({
                    poiList: addressList,
                    reLocateLabel: initRelocateLabel
                })
            }
        })

    },

})