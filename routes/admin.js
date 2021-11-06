var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers')



let admin = true

const varifyLogin = (req,res,next)=>{
  if(req.session.admin){
    console.log("Haii");
    next()
  }else{
    res.redirect('/admin/login')
  }
}

/* GET home page. */
router.get('/',varifyLogin,function(req, res, next) {

  res.redirect('/admin/dashboard')
});

/* Get Login. */
router.get('/login', function(req,res){
  if(req.session.admin){
    res.redirect('/admin')
  }else{
    res.render('./admin/login', {admin,title:"Admin"});
  }
  
})
 
/* Get dashboard. */
router.get('/dashboard',varifyLogin, function(req,res){
  res.render('./admin/dashboard',{admin,title:"Dashboard"})
})

/* Get products. */
router.get('/products',varifyLogin, function(req,res){
  res.render('./admin/product-management',{admin,title:"Products"})
})

/* Get add_products. */
router.get('/add_products',varifyLogin, function(req,res){
  res.render('./admin/add_products',{admin,title:"Add Products"})
})

/* Get categories. */
router.get('/categories',varifyLogin, function(req,res){
  res.render('./admin/category-management',{admin,title:"Categories"})
})

/* Get orders. */
router.get('/orders',varifyLogin, function(req,res){
  res.render('./admin/orders',{admin,title:"Orders"})
})

/* Get users. */
router.get('/users',varifyLogin, function(req,res){
  res.render('./admin/user',{admin,title:"Users"})
})

/* Login admin. */
router.post('/login',(req,res)=>{

  let adminData = {
    username:"abinpanil",
    password:"pass"
  }
  console.log(adminData);
  console.log(req.body);
  if(adminData.username===req.body.username){
    if(adminData.password===req.body.password){
      req.session.admin=adminData
      res.redirect('/admin')
    }
    res.redirect('/admin/login')
  }
  res.redirect('/admin/login')
})

/* Add category */
router.post('/add_category',function(req,res){
  console.log("hai");
  console.log(req.body);
  res.redirect('/admin/categories') 
})
 

/* Add product */
router.post('/add_product',function(req,res){
  console.log("hai");
  console.log(req.body);
  console.log(req.files);
  res.redirect('/admin/add_products') 
})

/* Logout. */
router.get('/logout',function(req,res){
  adminLogin = true
  delete req.session.admin
  res.redirect('/admin')
})
// middleware



module.exports = router;
