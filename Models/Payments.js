const { Schema ,model } = require("mongoose");

const PaymentSchema = Schema({
    paymentStatus:{
        type:String,
        default:'',
        required:[true,' This paymentStatus field is required']
    },
    paymentref:{
        type:String,
        default:'',
        required:[true,' This paymentref field is required']
    },
    paymentAmount:{
        type:String,
        default:'',
        required:[true,' This paymentAmount field is required']
    },
    paymentChannel:{
        type:String,
        default:'',
        required:[true,' This paymentChannel field is required']
    },
    paymentCurrency:{
        type:String,
        default:'',
        required:[true,' This paymentCurrency field is required']
    },
    ipAddress:{
        type:String,
        default:'',
        required:[true,' This ipAddress field is required']
    },
    cardBin:{
        type:String,
        default:'',
        required:[true,' This cardBin field is required']
    },
    cardLastFour:{
        type:String,
        default:'',
        required:[true,' This cardLastFour field is required']
    },
    cardExpMonth:{
        type:String,
        default:'',
        required:[true,' This cardExpMonth field is required']
    },
    cardExpYear:{
        type:String,
        default:'',
        required:[true,' This cardExpYear field is required']
    },
    cardType:{
        type:String,
        default:'',
    },
    cardBank:{
        type:String,
        default:'',
        required:[true,' This cardBank field is required']
    },
    cardCountry:{
        type:String,
        default:'',
        required:[true,' This cardCountry field is required']
    },
    cardBrand:{
        type:String,
        default:'',
        required:[true,' This cardBrand field is required']
    },
    customerEmail:{
        type:String,
        default:'',
        required:[true,' This customerEmail field is required']
    },
    paidAt:{
        type:String,
        default:'',
        required:[true,' This paidAt field is required']
    },
    Institution:{
        type:String,
        required:[true,' This Field is required']
    },
    Status:{
        type:String,
        enum:['Used','Not Used'],
        default:'Used'
    }
},{timestamps:true})

const Payments = model('Payments',PaymentSchema)
module.exports = Payments