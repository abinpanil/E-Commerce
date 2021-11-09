const express = require('express');
const { response, render } = require('../app');
const router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers');
const config = require('../auth/config');

const serviceID = "VAa5e077df7a059df1d1bae9a32df93ca9"
const accountSID = "AC29e0de96271489ac12f1c32008d70906"
const authToken = "2975bf30634d92615dab33cee7689014"
const client = require("twilio")(accountSID, authToken)

let admin = false
let user = {
  name: '',
  status: false
}




/* GET users Home. */
router.get('/', function (req, res, next) {



  adminHelpers.getCategory().then((data) => {
    console.log(data);
    res.render('./user/home', { admin, user, title: "Home" ,data});
    res.json({})

  })

});


/* GET login. */
router.get('/login', function (req, res) {

  if (req.session.user) {

    res.redirect('/')

  } else {

    adminHelpers.getCategory().then((data) => {
      res.render('./user/login', { admin, user, title: "Login", loginErr: "", data });
    })
  }

});


/* GET Account page. */
router.get('/my_account', function (req, res, next) {

  adminHelpers.getCategory().then((data) => {
    res.render('./user/my_account', { admin, user, title: "My Account",data });
  })
});

/* GET cart. */
router.get('/cart', function (req, res, next) {

  adminHelpers.getCategory().then((data) => {
    res.render('./user/cart', { admin, user, title: "Cart" ,data});
  })
});

/* GET wishlist. */
router.get('/wishlist', function (req, res, next) {

  adminHelpers.getCategory().then((data) => {
    res.render('./user/wishlist', { admin, user, title: "Wishlist" });
  })
});



/* Opt Load */
router.get('/otpLoad', (req, res) => {

  // console.log("ethyyyyyyyyy");
  adminHelpers.getCategory().then((data) => {
    res.render('./user/otp', { admin, user, title: "Login", loginErr: "" });
  })

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
    adminHelpers.getCategory().then((data) => {
      res.render('./user/productlist', { admin, user, title: "Products", products });
    })
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
router.post('/checkNum', (req, res) => {
  userHelpers.checkNumber(req.body.mobilenumber).then((response) => {

    res.json(response)
  })
})

/* Otp signin. */
router.post('/otpget', (req, res) => {


  client.verify.services(serviceID)
    .verifications.create({
      to: `+91${req.body.mobilenumber}`,
      channel: "sms"
    })
    .then((response) => {

      res.json(response)
    }).catch((e) => {
      console.log(e, "errroooorrrrrrrrrr");
    })
})


// validate Otp
router.post('/otpcheck', (req, res) => {

  let otp = req.body.otp
  let number = req.body.number
  console.log(otp, number);

  client.verify
    .services(serviceID)
    .verificationChecks.create({
      to: `+91${number}`,
      code: `${otp}`

    })
    .then((data) => {

      console.log(data.valid);
      if (data.valid) {

        userHelpers.checkNumber(number).then((response) => {
          console.log(response.user.name);

          req.session.user = response.user
          console.log(req.session.user);
          console.log("1");
          user.status = true
          console.log(user.status);
          console.log("2");

          user.name = response.user.name
          console.log(user.name);
          console.log("3");
          res.redirect('/')


        })



      } else {

        res.json(data)
      }

    }).catch((e) => {
      console.log(e + 'errrrrrrr');
      let data = {
        err: true
      }
      res.json(data)
    })


})



module.exports = router;
