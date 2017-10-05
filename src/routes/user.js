const express = require('express');
const config = require('config');
const jwt = require('jsonwebtoken');
const { models } = require('../db/index');

const router = new express.Router();

router.get('/user', async(req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) { return res.status(401).end(); }
    const userId = decoded.sub;
    return models.user.findById(userId, (userErr, user) => {
      if (userErr || !user) {
        return res.status(401).end();
      }
      const { email } = user;
      return res.status(200).json({ email });
    });
  });
});

module.exports = router;