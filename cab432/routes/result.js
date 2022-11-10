var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('result', { title: 'failed'});
  });
  
  module.exports = router;
  