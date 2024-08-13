const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (to, subject, code, type = "Verification") => {
    let message = "";
    let Link = `${process.env.DOMAIN_NAME}/Verify/User/Account/${code}`;
    let preheader = "";
    
    if (type === "Verification") {
        preheader = "Please verify your account with Votas.";
    } else {
        Link = `${process.env.DOMAIN_NAME}/Password-Reset-Token/${code}`;
        preheader = "Please reset your password in your account.";
    }
    
    try {
        // Create transport
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.GMAIL_USERNAME,
                pass: process.env.GMAIL_PASSWORD,
            },
        });
        
        // Setup email data with unicode symbols
        const mailOptions = {
            from: process.env.GMAIL_USERNAME, // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta http-equiv="x-ua-compatible" content="ie=edge">
                <title>${subject}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link href="https://fonts.googleapis.com/css?family=Rajdhani:400,600,700&display=swap" rel="stylesheet">
                <style type="text/css">
                    body,
                    table,
                    td,
                    a {
                        -ms-text-size-adjust: 100%;
                        -webkit-text-size-adjust: 100%;
                    }
                    table,
                    td {
                        mso-table-rspace: 0pt;
                        mso-table-lspace: 0pt;
                    }
                    img {
                        -ms-interpolation-mode: bicubic;
                    }
                    a[x-apple-data-detectors] {
                        font-family: inherit !important;
                        font-size: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                        color: inherit !important;
                        text-decoration: none !important;
                    }
                    div[style*="margin: 16px 0;"] {
                        margin: 0 !important;
                    }
                    body {
                        font-family: 'Rajdhani', sans-serif;
                        width: 100% !important;
                        height: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background-color: #f4f4f4;
                    }
                    table {
                        border-collapse: collapse !important;
                    }
                    a {
                        color: #1a82e2;
                    }
                    img {
                        height: auto;
                        line-height: 100%;
                        text-decoration: none;
                        border: 0;
                        outline: none;
                    }
                    .preheader {
                        display: none;
                        max-width: 0;
                        max-height: 0;
                        overflow: hidden;
                        font-size: 1px;
                        line-height: 1px;
                        color: #fff;
                        opacity: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    .email-header {
                        text-align: center;
                        padding: 20px;
                        background-color: #ff6600;
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                    }
                    .email-header a {
                        font-size: 60px;
                        color: white;
                        text-decoration: none;
                    }
                    .email-body {
                        padding: 20px;
                        font-size: 16px;
                        line-height: 24px;
                        color: #333333;
                    }
                    .email-body h1 {
                        font-size: 32px;
                        font-weight: 700;
                        margin: 0 0 20px 0;
                        color: #1a82e2;
                    }
                    .email-button {
                        display: inline-block;
                        padding: 16px 36px;
                        font-size: 16px;
                        color: #ffffff;
                        background-color: #fe4536;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    .email-footer {
                        padding: 20px;
                        font-size: 14px;
                        line-height: 20px;
                        color: #666666;
                        text-align: center;
                        border-top: 1px solid #dddddd;
                    }
                </style>
            </head>
            <body>
                <div class="preheader">${preheader}</div>
                <div class="email-container">
                    <div class="email-header">
                        <a href="https://votas.co.ke" target="_blank">VOTAS</a>
                    </div>
                    <div class="email-body">
                        <h1>${subject}</h1>
                        <p>You requested for password reset. Copy the code below into our website to reset the password.</p>
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="${Link}" class="email-button">${code}</a>
                        </div>
                        <p>Cheers,<br>The ${process.env.APP_NAME} Team</p>
                    </div>
                    <div class="email-footer">
                        <p>You received this email because we received a request to ${subject} your account. If you didn't request this, you can safely delete this email.</p>
                    </div>
                </div>
            </body>
            </html> 
            `,
        };
        
        // Send mail with defined transport object
        const info = await transporter.sendMail(mailOptions);
        return "success";
    } catch (error) {
        return error;
    }
};

module.exports = sendEmail;
