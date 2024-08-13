const nodemailer = require("nodemailer");
require("dotenv").config();

const sendActionEmail = async (to, subject, message) => {
    const preheader = "<strong>Important activity in your Account</strong>";

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
            from: process.env.GMAIL_USERNAME,
            to: to,
            subject: subject,
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
                        body, div, a {
                            -ms-text-size-adjust: 100%;
                            -webkit-text-size-adjust: 100%;
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
                            background-color: #e9ecef;
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
                        .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 36px 24px;
                            background-color: #ffffff;
                            border-top: 3px solid #d4dadf;
                        }
                        .email-header {
                            text-align: center;
                            padding: 36px 24px;
                        }
                        .email-body {
                            padding: 24px;
                            font-size: 16px;
                            line-height: 24px;
                        }
                        .email-footer {
                            padding: 24px;
                            font-size: 14px;
                            line-height: 20px;
                            color: #666;
                            background-color: #e9ecef;
                            text-align: center;
                        }
                        .email-title {
                            font-size: 32px;
                            font-weight: 700;
                            letter-spacing: -1px;
                            line-height: 48px;
                        }
                        .email-preheader {
                            display: none;
                            max-width: 0;
                            max-height: 0;
                            overflow: hidden;
                            font-size: 1px;
                            line-height: 1px;
                            color: #fff;
                            opacity: 0;
                        }
                        .votas-logo {
                            font-size: 60px;
                            font-weight: bold;
                            color: white;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-preheader">${preheader} ${subject}</div>
                    <div class="email-container">
                        <div class="email-header">
                            <div class="votas-logo">VOTAS</div>
                        </div>
                        <div class="email-body">
                            <h1 class="email-title">${subject}</h1>
                            <div>${message}</div>
                            <p>Cheers,<br> ${process.env.APP_NAME} Team</p>
                        </div>
                    </div>
                    <div class="email-footer">
                        <p>You received this email because we received a request to ${subject} for your account.</p>
                    </div>
                </body>
                </html>
            `,
        };

        // Send mail with defined transport object
        await transporter.sendMail(mailOptions);
        return "success";
    } catch (error) {
        return error;
    }
};

module.exports = sendActionEmail;
