require('dotenv').config();
const https = require('https');
const IntializedPayments = require('../Models/InitializedPayments')
const InitiatePay = async (res, PaymentID, PaymentType, Reason, Amount, userEmail,voters,CouponCode) => {
    let payAmount = Amount * 100
    const secret_key = process.env.LIVE_SECRET_KEY
    const params = JSON.stringify({
        "email": userEmail,
        "amount": payAmount,
        "currency":"KES",
        "metadata": {
            "custom_fields": [
                {
                    //set the value for the order the client is paying for
                    "value": Reason,
                    "display_name": "Payment for",
                    "variable_name": "payment_for"
                },
                {
                    "value": PaymentID,
                    "display_name": "Payment Ref",
                    "variable_name": "payment_ref"
                },
                {
                    "value": PaymentType,
                    "display_name": "Payment For",
                    "variable_name": "payment_for"
                }
            ]
        },
    })

    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${secret_key}`,
            'Content-Type': 'application/json'
        }
    }

    const reqData = https.request(options, resp => {
        let data = ''
        resp.on('data', (chunk) => {
            data += chunk
        });
        resp.on('end', async () => {
            const ed = JSON.parse(data)
            if (ed.status) {
                const initLog = await IntializedPayments.create({
                    InitStatus: ed.status,
                    Message: ed.message,
                    AuthUrl: ed.data['authorization_url'],
                    AccessCode: ed.data['access_code'],
                    PaymentRef: ed.data['reference'],
                    PaymentReason: Reason,
                    UserEmail: userEmail,
                    OurRef: PaymentID,
                    PaymentType: PaymentType,
                    AmountPaid: Amount,
                    CouponCode:CouponCode
                })
                if (initLog) {
                    res.json({
                        status: 'success',
                        redirectUrl: ed.data['authorization_url'],
                        message:`You have ${voters} Voters required to pay Ksh ${(payAmount/100)}`
                    })
                }
            } else {
                res.json({
                    status: 'error',
                    redirectUrl: ed.message
                })
            }
        })
    })
        .on('error', error => {
            //if there is an error, return an error and redirect to dashboard
            res.status(400).json({
                status: 'error',
                redirectUrl: 'Could Not Initiate the Payment method'
            })
        })
    reqData.write(params)
    reqData.end()

}

module.exports = InitiatePay