const {Schema,model} = require('mongoose')
const subSchema = new Schema({
    SubsName:{
        type:String,
        default:'Subscription'
    },
    SubscriptionAmount :{
        type:Number,
        required: true,
        default:30
    }
})
const SubscriptionFees = model('SubscriptionFees',subSchema)

module.exports = SubscriptionFees