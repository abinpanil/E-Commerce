var express = require('express');
var router = express.Router();

let admin = false
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('index',{admin,title:"Home"});
});

module.exports = router;
