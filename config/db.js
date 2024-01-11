const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI);
    if (con) {
      console.log('Mongodb connected successfully');
    } else {
      console.log('Mongodb not connected, please try again');
    }
  } catch (error) {
    console.log("Something went wrong");
    process.exit();
  }
}

module.exports = connectDb;
