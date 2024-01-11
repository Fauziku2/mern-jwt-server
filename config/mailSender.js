const nodemailer = require('nodemailer');
const Token = require('../models/tokenModel');
const bcrypt = require('bcryptjs');

module.exports = async (data, mailType) => {
  try {
    const mailConfig = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.VERIFY_MAIL,
        pass: process.env.VERIFY_PASS,
      },
    });

    const verifyToken = await bcrypt.hashSync(data._id.toString(), 10).replaceAll('/', '');
    const token = new Token({
      userId: data._id,
      token: verifyToken
    });
    await token.save();
    const content = `
      <div>
        <h1>Please verify your email by clicking this link</h1>
        <br />
        <a href="http://localhost:3000/verify/${verifyToken}">Click this token</a>
      </div>
    `;

    const mailOptions = {
      from: process.env.VERIFY_MAIL,
      to: data.email,
      subject: 'Verify your mail for JWT App',
      html: content
    }

    await mailConfig.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
}
