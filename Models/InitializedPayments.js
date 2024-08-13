const {Schema, model} = require('mongoose')

const InitializedPaymentsSchema = new Schema({
    InitStatus : {
        type:String,
        default:'',
        required:[true,'The status is required']
    },
    Message : {
        type:String,
        default:'',
        required:[true,'The Message is required']
    },
    AuthUrl : {
        type:String,
        default:'',
        required:[true,'The AuthUrl is required']
    },
    AccessCode : {
        type:String,
        default:'',
        required:[true,'The AccessCode is required']
    },
    PaymentRef : {
        type:String,
        default:'',
        required:[true,'The PaymentRef is required']
    },
    UserEmail : {
        type:String,
        default:'',
        required:[true,'The UserEmail is required']
    },
    PaymentReason : {
        type:String,
        default:'',
        required:[true,'The PaymentReason is required']
    },
    OurRef : {
        type:String,
        default:'',
        required:[true,'The OurRef is required']
    },
    PaymentType:{
        type:String,
        enum:['Subscription','Membership','Bids','Others'],
        default:'Subscription'
    },
    AmountPaid : {
        type:String,
        default:'',
        required:[true,'The AmountPaid is required']
    },
    CouponCode:{
        type:String,
        default:'None'
    }
},{timestamps:true})

const IntializedPayments = model('InitializedPayments',InitializedPaymentsSchema)

module.exports = IntializedPayments