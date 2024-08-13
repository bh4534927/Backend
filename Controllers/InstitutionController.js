const Institution = require('../Models/Institutions')
const { InstitutionValidator } = require("../Utils/Validator")
const fs = require('fs');
const InitiatePay = require('../Utils/Payments')
const IntializedPayments = require('../Models/InitializedPayments')
const Payments = require("../Models/Payments");
const Subscription = require('../Models/Subscription')
const Coupons = require('../Models/Coupons');
const Voters = require('../Models/Voters');
const { findOneAndUpdate } = require('../Models/User');
const { response } = require('express');
const SubscriptionFees = require('../Models/SubscriptionFees');
const Index = async (req, res) => {
    const institutions = await Institution.find({}, {
        _id: 0,
        __v: 0
    })
    res.json({
        data: institutions
    })
}
const AddInstitutions = async (req, res, next) => {
    //import the validator here 
    const valid_details = await InstitutionValidator.validateAsync(req.body)
    //check if the institution exists
    const inst = await Institution.countDocuments({ InstitutionName: valid_details.InstitutionName, County: valid_details.County, SubCounty: valid_details.SubCounty })
    if (inst > 0) {
        //the institution exists
        res.status(400).json({
            status: 'error',
            message: 'Institution already exists'
        })
    } else {
        // if the details are valid, save the details to the database
        try {

            const InstitutionSingle = new Institution(valid_details)
            await InstitutionSingle.save()
            const subscription = new Subscription({
                School: valid_details.InstitutionName,
                SubscriptionType: "Demo",
                PaymentCode: "Demo"
            })
            await subscription.save()
            if (InstitutionSingle) {
                res.status(201).json({
                    status: 'success',
                    message: 'Institution Successfully Created'
                })
            } else {
                res.status(422).json({
                    status: 'error',
                    message: 'Unknown Error Occurred'
                })
            }
        } catch (e) {
            res.status(500).json({
                status: 'error',
                message: 'Server Error'
            })
        }
    }
}
const CreateSubscription = async (req, res) => {
    //get the subscription amount 
    const sub = await SubscriptionFees.findOne({
        SubsName: 'Subscription'
    })
    const subscriptionAmount =  sub.SubscriptionAmount
    const { School, CouponCode, userEmail } = req.body
    let finalAmount = 0;
    if (!School || !userEmail) {
        res.json({
            status: 'error',
            message: 'Invalid data submitted'
        })
    } else {
        //load the voters infor from the school
        const voters = await Voters.countDocuments({
            Institution: School,
            VoterStatus: {
                $ne: 'Deleted'
            }
        })
        if (voters === 0) {
            res.json({
                status: 'error',
                message: 'Please Add voters so that You can Subscribe'
            })
            return;
        }
        finalAmount = voters * subscriptionAmount;
        //check if there is a coupon code
        if (CouponCode) {
            const coupon = await Coupons.findOne({
                CouponCode: CouponCode,
                Status: 'Active'
            })
            if (coupon === null) {
                res.json({
                    status: 'error',
                    message: 'The coupon code Entered is Invalid'
                })
                return
            } else {
                finalAmount = Math.round(parseInt(finalAmount - ((finalAmount * coupon.Discount) / 100)))

            }
        }
        //if the amount is zero then update the subscriptions 
        if (finalAmount === 0) {
            const subscription = new Subscription({
                School: School,
                SubscriptionType: "Premium",
                PaymentCode: CouponCode,
                SubscriptionBy: "Coupon"
            })
            await subscription.save()
            await Coupons.findOneAndUpdate({
                CouponCode
            }, {
                $set: {
                    Status: 'Redeemed'
                }
            })
            res.json({
                status: 'success',
                message: 'Subscribed via Coupon Code'
            })
        } else {
            await InitiatePay(res, School, "Subscription", "Subscription For the App", finalAmount, userEmail, voters, CouponCode)
        }
    }
}
const getCallbackData = async (req, res) => {
    const { data } = req.body;
    const Institution = await IntializedPayments.findOne({
        PaymentRef: data.reference
    })
    //set the coupon to redeemed 
    await Coupons.findOneAndUpdate({
        CouponCode: Institution.CouponCode
    }, {
        $set: {
            Status: 'Redeemed'
        }
    })
    let paymentsData = {
        paymentStatus: data.status,
        paymentref: data.reference,
        paymentAmount: data.amount / 100,
        paymentChannel: data.channel,
        paymentCurrency: data.currency,
        ipAddress: data.ip_address,
        cardBin: data.authorization.bin,
        cardLastFour: data.authorization.last4,
        cardExpMonth: data.authorization.exp_month,
        cardExpYear: data.authorization.exp_year,
        cardType: data.authorization.card_type,
        cardBank: data.authorization.bank,
        cardCountry: data.authorization.country_code,
        cardBrand: data.authorization.brand,
        customerEmail: data.customer.email,
        paidAt: data.paidAt,
        Institution: Institution.OurRef
    }
    const payment = new Payments(paymentsData)
    await payment.save()
    //add the institution to subscriptions
    //update subscription
    //check if the subscription is there 
    Subscription.findOneAndUpdate({
        School: Institution.OurRef
    }, {
        $set: {
            SubscriptionType: "Premium",
            PaymentCode: data.reference
        }
    })
    res.json({
        status: 'success',
        data: paymentsData
    })
}
const CreateCoupon = async (req, res) => {
    const { CouponCode, Discount } = req.body
    if (!CouponCode || !Discount) {
        res.json({
            status: 'error',
            message: 'Invalid data submitted'
        })
    } else {
        const couponExists = await Coupons.countDocuments({
            CouponCode: CouponCode
        })
        if (couponExists > 0) {
            //coupon exists 
            res.json({
                status: 'error',
                message: 'Coupon already exists'
            })
        } else {
            const coupon = new Coupons({
                CouponCode: CouponCode,
                Discount: Discount
            })
            await coupon.save()
            res.json({
                status: 'success',
                message: 'Coupon saved successfully'
            })
        }
    }
}
const getCoupons = async (req, res) => {
    //get all the coupons from the system
    const coupons = await Coupons.find()
    res.json({
        status: 'success',

        data: coupons
    })
}
const SuspendCoupon = async (req, res) => {
    //get the couponCode
    const { CouponCode } = req.body
    if (!CouponCode) {
        res.json({
            status: 'error',
            message: 'Invalid data Submitted'
        })
        return;
    }
    //get the couponCode 
    const couponExists = await Coupons.countDocuments({
        CouponCode: CouponCode
    })
    if (couponExists) {
        //update 
        const coupon = await Coupons.findOneAndUpdate({
            CouponCode
        }, {
            $set: {
                Status: 'Suspended'
            }
        })
        res.json({
            status: 'success',
            message: 'Coupon Successfully Suspended'
        })
    } else {
        res.json({
            status: 'error',
            message: 'Coupon Does Not Exists'
        })
    }
}
const getAllSubscriptions = async (req, res) => {
    const subscriptions = await Subscription.find()
    res.json({
        status: 'success',
        data: subscriptions
    })
}
const ActivateSubscriptions = async (req, res) => {
    //get the  name of the school 
    const { Institution } = req.body
    if (!Institution) {
        res.json({
            status: 'error',
            message: 'The Institution is required'
        })
    } else {
        try {
            const today = new Date();
            const subscription = await Subscription.findOneAndUpdate({
                School: Institution
            }, {
                $set: {
                    SubscriptionType: 'Premium',
                    SubscriptionBy: "Admin",
                    Year: new Date().getFullYear(),
                    Expiry: new Date(today.setFullYear(today.getFullYear() + 1))
                }
            })
            res.json({
                status: 'success',
                data: subscription,
                message: 'Subscription updated successfully'
            })
        } catch (error) {
            res.json({
                status: 'error',
                data: [],
                message: error.message
            })
        }
    }
}
const SuspendSubscriptions = async (req, res) => {
    //get the  name of the school 
    const { Institution } = req.body
    if (!Institution) {
        res.json({
            status: 'error',
            message: 'The Institution is required'
        })
    } else {
        try {
            const today = new Date();
            const subscription = await Subscription.findOneAndUpdate({
                School: Institution
            }, {
                $set: {
                    SubscriptionType: 'Demo',
                    Year: new Date().getFullYear(),
                    Expiry: new Date(today.setFullYear(today.getFullYear()))
                }
            })
            res.json({
                status: 'success',
                data: subscription,
                message: 'Subscription updated Suspended'
            })
        } catch (error) {
            res.json({
                status: 'error',
                data: [],
                message: error.message
            })
        }
    }
}
const Get_Subscription_Fees = async (req, res) => {
    const sub = await SubscriptionFees.findOne({
        SubsName: 'Subscription'
    })
    res.json({
        status: 'success',
        data: sub.SubscriptionAmount
    })
}
const Post_Subscription_Fees = async (req, res) => {
    //get the data from the backend 
    const { SubscriptionAmount } = req.body

    if (SubscriptionAmount == 0) {
        //then return an error message 
        res.json({
            status: 'error',
            message: 'The subscription Amount can not be zero'
        })
    } else {
        //create the subscription model
        const subscription = await SubscriptionFees.countDocuments({ SubsName: 'Subscription' })
        //if the document exists 
        if (subscription > 0) {
            SubscriptionFees.findOneAndUpdate(
                { SubsName: 'Subscription' },
                { $set: { SubscriptionAmount: SubscriptionAmount } },
                { new: true } // This returns the updated document
            )
                .then((result) => {
                    if (result) {
                        res.json({
                            status: 'success',
                            message: 'The subscription amount has been updated successfully',
                        });
                    } else {
                        res.status(404).json({
                            status: 'error',
                            message: 'Subscription not found',
                        });
                    }
                })
                .catch((error) => {
                    res.status(500).json({
                        status: 'error',
                        message: 'An error occurred while updating the subscription amount',
                        error: error.message,
                    });
                });

        } else {
            //create the record 
            const subs = new SubscriptionFees({
                SubscriptionAmount: SubscriptionAmount
            })
            await subs.save()
            res.json({
                status: 'success',
                message: 'The subscription has been Added successfully'
            })
        }
    }
}
module.exports = { Index, CreateSubscription, Get_Subscription_Fees, Post_Subscription_Fees, ActivateSubscriptions, SuspendSubscriptions, AddInstitutions, getCoupons, CreateCoupon, getAllSubscriptions, getCallbackData, SuspendCoupon }