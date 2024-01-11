const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      req.body.user = jwt.verify(token, process.env.JWT_KEY);
      next();
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }

  if (!token) {
    res.status(401).json({ mg: 'Not authorized' });
  }
}
