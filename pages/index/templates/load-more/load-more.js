// components/load-more/load-more.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
loading:{
  type:Boolean,
    value:false
},
      hasMore:{
          type:Boolean,
          value:false
      }
  },
    ready:function () {
        console.log(this.data.list)
        this.setData({
            loading:this.data.loading,
            hasMore:this.data.hasMore
        })
    },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
