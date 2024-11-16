import nodemailer from "nodemailer";

export const sendEmail = async (email, name, price, href, product) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const context = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 0">
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #0561a7; color: #ffffff; padding: 10px 0; text-align: center">
          <h1>Great News!</h1>
        </div>
        <div style="padding: 20px">
            <p>Dear ${name},</p>
            <p>We have exciting news! The product you have been tracking, <strong>${product}</strong>, is now available at an amazing deal!</p>
            <p>Don't miss out on this opportunity to get your desired item at a fantastic price. Click the button below to check out the deal:</p>
            <p>Price: <b>${price}</b></p>
            <a href="${href}" style="display: inline-block; padding: 10px 20px; margin-top: 20px; font-size: 20px; color: #ffffff; background-color: #0561a7; text-decoration: none; border-radius: 5px;">View Deal</a>
            <p>Thank you for using Tracky to stay updated on your favorite products.</p>
            <p>Happy shopping!</p>
            <p>Best regards,<br>Tracky Team</p>
        </div>
        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #777">
            <p>If you no longer wish to receive these notifications, please <a href="[Unsubscribe Link]">unsubscribe here</a>.</p>
            <p>&copy; 2024 Tracky. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  var mailOptions = {
    from: `Tracky <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Great News! Your tracked product has amazing price!",
    html: context,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return console.log(error);
    }
  });
};
