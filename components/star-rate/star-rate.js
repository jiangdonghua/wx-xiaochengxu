/**
 * Created by Administrator on 2018/7/4.
 */
Component({
    properties:{
        score:{
            type:Number,
            value:0
        },
    },
    data:{
        LENGTH:5,
        CLS_ON:'on',
        CLS_HALF:'half',
        CLS_OFF:'off',
        score:null
    },
    ready(){
        this._setData()
    },
    methods:{
        _setData: function () {

            var res=this._itemClasses(this.data.score)
            this.setData({
                itemClasses:res,
            })
        },
        _itemClasses(score) {
            let result=[];
            let score1=Math.floor(score*2)
            let hasDecimal=score1%2!==0
            let integer=Math.floor(score1/2)
            for(let i=0;i<integer;i++){
                result.push(this.data.CLS_ON)
            }
            if(hasDecimal){
                result.push(this.data.CLS_HALF)
            }
            while (result.length<this.data.LENGTH){
                result.push(this.data.CLS_OFF)
            }
            return result
        }
    }
})
