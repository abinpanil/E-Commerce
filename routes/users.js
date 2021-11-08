const express = require('express');
const { response, render } = require('../app');
const router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers');
const config = require('../auth/config');

const serviceID = "VA88c284363de9fd0c8192a127bc7b1e06"
const accountSID = "AC2253025f4ed61bf98f907de34a78dc5c"
const authToken = "2a797af2d100479d5df8375a85cefc59"
const client= require("twilio")(accountSID, authToken)

let admin = false
let user = {
  name: '',
  status: false
}

let verifyUser = (req, res, next) => {

}


/* GET users Home. */
router.get('/', function (req, res, next) {


  adminHelpers.getCategory().then((data) => {

    res.render('./user/home', { admin, user, title: "Home" });

  })

});


/* GET login. */
router.get('/login', function (req, res) {

  if (req.session.user) {

    res.redirect('/')

  } else {
    res.render('./user/login', { admin, user, title: "Login", loginErr: "" });
  }

});


/* GET Account page. */
router.get('/my_account', function (req, res, next) {
  res.render('./user/my_account', { admin, user, title: "My Account" });
});

/* GET cart. */
router.get('/cart', function (req, res, next) {
  res.render('./user/cart', { admin, user, title: "Cart" });
});

/* GET wishlist. */
router.get('/wishlist', function (req, res, next) {
  res.render('./user/wishlist', { admin, user, title: "Wishlist" });
});



/* Opt Load */
router.get('/otpLoad',(req,res)=>{

  // console.log("ethyyyyyyyyy");
  
  res.render('./user/otp', { admin, user, title: "Login", loginErr: "" });  
  
})

/* GET List products. */
router.get('/listproducts', function (req, res, next) {

  let products = [
    {
      name: "Shirt",
      category: "Men",
      discription: "Nice"
    },
    {
      name: "jeans",
      category: "Men",
      discription: "Nice"
    }]
  res.render('./user/productlist', { admin, user, title: "Products", products });
});

/* Login */
router.post('/login', function (req, res) {

  res.redirect('/login')
})

/* Sign in. */
router.post('/signIn', function (req, res) {

  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      user.status = true
      user.name = req.session.user.name

      res.redirect('/')
    } else {
      res.json(response)
      res.redirect('/login')
    }

  })

})


/* Signout. */
router.post('/signout', (req, res) => {
  delete req.session.user
  user.name = ""
  user.status = false
  res.redirect('/')
})

/* Sign Up. */
router.post('/signUp', function (req, res) {


  userHelpers.doSignup(req.body).then((userResponse) => {
    req.session.userResponse = userResponse
    res.json(userResponse)
    if (userResponse.status) {
      res.redirect('/login')
    }


  })

})

// mobile number check
router.post('/checkNum',(req,res)=>{
  
  userHelpers.checkNumber(req.body.mobilenumber).then((response)=>{
    res.json(response)
  })
})

/* Otp signin. */
router.post('/otpget',(req,res)=>{

  // console.log("ivde ethyyyyyyyyyy");
  client.verify
    .services(serviceID)
    .verifications.create({
      to:`+91${req.body.mobilenumber}`,
      channel: "sms"
    })
    .then((data)=>{
      res.json(data)
    })
})


// validate Otp
router.post('/otpcheck',(req,res)=>{

  let otp = req.body.otp
  let number = req.body.number
  console.log(otp,number);
  client.verify
    .services(serviceID)
    .verificationChecks.create({
      to:`+91${number}`,
      code:`${otp}`
      
    })
    .then((data)=>{
    
      if(data.valid){

        userHelpers.checkNumber(number).then((response)=>{
          console.log(response.user);

          // res.session.user = response.user
          console.log("1");
          user.status = true
          console.log("2");
          user.name = response.user.name
          console.log("3");
          res.redirect('/')
          
        })

      }else{
        res.json({})
      }
      
    })
  

})




// Error passing 
// router.get(function(req, res, next) {
//   next(createError(404));
// });

// router.get(function(err, req, res, next) {

//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};


//   res.status(err.status || 500);
//   res.render('error',{admin,user,title:"Categories"});
// });

module.exports = router;
