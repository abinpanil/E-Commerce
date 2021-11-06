const express = require('express');
const { response } = require('../app');
const router = express.Router();
const userHelpers = require('../helpers/user-helpers')

let admin = false
let user = false

/* GET users Home. */
router.get('/', function(req, res, next) {
  res.render('./user/home',{admin,user,title:"Home"});
});

/* GET login. */
router.get('/login', function(req, res, next) {
  res.render('./user/login',{admin,user,title:"Login"});
});

/* GET Account page. */
router.get('/my_account', function(req, res, next) {
  res.render('./user/my_account',{admin,user,title:"My Account"});
});

/* GET cart. */
router.get('/cart', function(req, res, next) {
  res.render('./user/cart',{admin,user,title:"Cart"});
});

/* GET wishlist. */
router.get('/wishlist', function(req, res, next) {
  res.render('./user/wishlist',{admin,user,title:"Wishlist"});
});

/* GET List products. */
router.get('/listproducts', function(req, res, next) {

  let products= [
    {
    name:"Shirt",
    category:"Men",
    discription:"Nice"
  },
  {
    name:"jeans",
    category:"Men",
    discription:"Nice"
  }]
  res.render('./user/productlist',{admin,user,title:"Wishlist",products});
});

/* Login */
router.post('/login',function(req,res){
  
  res.redirect('/login')
})

/* Sign in. */
router.post('/signIn',function(req,res){
  console.log(req.body);
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      res.redirect('/')
    }else{
      res.redirect('/login')
    }
    
  })
  
})

/* Sign Up. */
router.post('/signUp',function(req,res){
  
  console.log(req.body);
  userHelpers.doSignup(req.body).then((response)=>{
    res.redirect('/login')
    
  })
  
})


module.exports = router;
