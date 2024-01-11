const express = require('express');
const connectDb = require('./config/db');
const authRoute = require('./routes/authRoute');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization' );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/auth', authRoute);

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static('client/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client/build/index.html'))
  })
}

connectDb().then(() => {
  app.listen(port, () => {
    console.log(`Server started on ${port}`);
  });
})
