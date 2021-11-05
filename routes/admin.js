var express = require('express');
var router = express.Router();

let admin = true;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('./admin/login', {admin,title:"Admin"});
});
 
/* Get dashboard. */
router.get('/dashboard',function(req,res){
  res.render('./admin/dashboard',{admin,title:"Dashboard"})
})

/* Get products. */
router.get('/products',function(req,res){
  res.render('./admin/product-management',{admin,title:"Products"})
})

/* Get add_products. */
router.get('/add_products',function(req,res){
  res.render('./admin/add_products',{admin,title:"Add Products"})
})

/* Get categories. */
router.get('/categories',function(req,res){
  res.render('./admin/category-management',{admin,title:"Categories"})
})

/* Get orders. */
router.get('/orders',function(req,res){
  res.render('./admin/orders',{admin,title:"Orders"})
})

/* Get users. */
router.get('/users',function(req,res){
  res.render('./admin/user',{admin,title:"Users"})
})


module.exports = router;
