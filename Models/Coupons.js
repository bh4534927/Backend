const {Schema,model} = require('mongoose')

const CouponSchema = new Schema({
    CouponCode:{
        type:String,
        required:[true,'The coupon code is required']
    },
    Discount:{
        type:Number,
        required:[true,'The coupon percent is required']
    },
    Status:{
        type:String,
        enum:['Active','Expired','Redeemed','Suspended'],
        default:'Active'
    }
})

const Coupons = model('Coupons',CouponSchema)
module.exports = Coupons