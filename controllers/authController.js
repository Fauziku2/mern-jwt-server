const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const User = require('../models/userModel');
const Token = require('../models/tokenModel');
const mailSender = require('../config/mailSender');

const registerUser = async (req, res) => {
  const { user, email, password } = req.body;
  const userExist = await User.findOne({ email });
  if (userExist) {
    return res.status(200).send({ success: false, msg: 'User already registered with this email' });
  } else {
    try {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword =  await bcrypt.hash(password, salt);
      const newEntry = new User({ user, email, password: hashedPassword });
      await newEntry.save();
      await mailSender(newEntry, 'verify-mail');
      return res.status(200).send({ success: true, msg: 'Registration successful and a verification mail has been sent to your email' });
    } catch (error) {
      res.status(400).send({ success: false, msg: error });
    }
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (user && isPasswordValid) {
      if (user.isVerified) {
        const tokenData = {
          _id: user._id,
          user: user.user,
          email: user.email
        };
        const token = jwt.sign(tokenData, process.env.JWT_KEY, { expiresIn: '30d' });
        return res.status(200).send({ success: true, msg: 'Login successful', token });
      } else {
        return res.status(200).send({ success: false, msg: 'Email not verified, Please check your inbox' });
      }
    } else {
      return res.send({ success: false, msg: 'Invalid credentials' });
    }
  } catch (error) {
    return res.send(error);
  }
};

const userData = async (req, res) => {
  try {
    res.status(200).send({ success: true, data: req.body.user });
  } catch (error) {
    res.status(400).send(error);
  }
};

const updateUser = async (req, res) => {
  const { updateUser } = req.body;
  const email = updateUser.email;
  const user = await User.findOne({ email });
  const isPasswordValid = await bcrypt.compare(updateUser.currentPassword, user.password)
  if (user && isPasswordValid) {
    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(updateUser.password, salt);
    try {
      await User.findByIdAndUpdate(user._id, {
        name: updateUser.name,
        email: updateUser.email,
        password: hashedPassword
      });
      return res.status(200).send({ success: true, msg: 'Password updated successfully' });
    } catch (err) {
      return res.status(400).send({ msg: 'Something went wrong' });
    }
  } else {
    return res.send({ success: false, msg: 'No user or something went wrong' });
  }
};

const verifyMail = async (req, res) => {
  try {
    const { token } = req.body;
    const tokenDetail = await Token.findOne({ token });
    if (tokenDetail) {
      await User.findOneAndUpdate({ _id: tokenDetail.userId, isVerified: true });
      await Token.findOneAndDelete({ token });
      res.send({ success: true, msg: 'Email verified Successfully' });
    } else {
      res.send({ success: false, msg: 'Invalid token' });
    }
  } catch (err) {
    res.send({ success: false, msg: 'Invalid token' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  userData,
  updateUser,
  verifyMail
}
