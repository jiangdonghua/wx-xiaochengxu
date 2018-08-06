/**
 * Created by Administrator on 2018/7/5.
 */
Component({
    properties:{
        list:{
            type:Array,
            value:[]
        }
    },
    ready:function () {
        this.setData({
            list:this.data.list
        })
},
    methods:{
    }
})