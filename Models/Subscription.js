const { Schema, model } = require('mongoose');

const getNextYearDate = () => {
    const today = new Date();
    return new Date(today.setFullYear(today.getFullYear() + 1));
};

const subscriptionSchema = new Schema({
    School: {
        type: String,
        required: [true, 'The school is required']
    },
    SubscriptionType: {
        type: String,
        enum:['Demo','Premium'],
        default:"Demo"
    },
    PaymentCode: {
        type: String,
        required: [true, 'The payment code is required']
    },
    SubscriptionBy:{
        type: String,
        enum:['Coupon','Cash',"Admin"],
        default:'Cash'
    },
    Year: {
        type: Number,
        default: new Date().getFullYear()  // Set default value to the current year
    },
    Expiry: {
        type: Date,
        default: getNextYearDate  // Set default value to the same date next year
    }
});

const Subscription = model('Subscription', subscriptionSchema);

module.exports = Subscription;
