const express = require('express');
const { response, render } = require('../app');
const router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers');
const config = require('../auth/config');

const serviceID = "	VAa5e077df7a059df1d1bae9a32df93ca9"
const accountSID = "AC29e0de96271489ac12f1c32008d70906"
const authToken = "2975bf30634d92615dab33cee7689014"
const client = require("twilio")(accountSID, authToken)

let admin = false
let user = {
  name: '',
  status: false
}

let logData

function varifyLogin(req,res,next) {

  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET users Home. */
router.get('/', function (req, res, next) {

  console.log(req.session.user);

  if(req.session.user){
    console.log("true in userrrrr");
  }else{
    user.status = false
    user.name = ''
    delete req.session.user
    console.log("false in userrrrrrrrrrr");
    
  }
  console.log(user);

  adminHelpers.getCategory().then((data) => {
    adminHelpers.getAllProducts().then((products) => {
      // console.log(products);

      res.render('./user/home', { admin, user, title: "Home", data, products });

    })

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
    res.render('./user/my_account', { admin, user, title: "My Account", data });
  })
});

/* GET cart. */
router.get('/cart',varifyLogin, function (req, res, next) {

  adminHelpers.getCategory().then((data) => {
    userHelpers.getCartProducts(req.session.user._id).then((cartItems)=>{
      
      let cart = cartItems
      console.log(cart);
      res.render('./user/cart', { admin, user, title: "Cart", data,cart });
      res.json({})
    })
  })
});

/* GET wishlist. */
router.get('/wishlist', function (req, res, next) {

  adminHelpers.getCategory().then((data) => {
    res.render('./user/wishlist', { admin, user, title: "Wishlist", data });
  })
});


// product page
router.get('/viewproduct/:_id', (req, res) => {

  let id = req.params._id
  adminHelpers.getCategory().then((data) => {
    userHelpers.getProduct(id).then((products) => {

      res.render('./user/product', { admin, user, title: "Login", data, products });
    })

  })


})

/* Opt Load */
router.get('/otpLoad', (req, res) => {

  adminHelpers.getCategory().then((data) => {
    res.render('./user/otp', { admin, user, title: "Login", loginErr: "", data });
  })

})


// Get list category products
router.get('/listproductscat/:cat', function (req, res, next) {
  console.log(req.params.cat);
  adminHelpers.getCategory().then((data) => {
    userHelpers.getCatProducts(req.params.cat).then((pro) => {
      res.render('./user/productlist', { admin, user, title: "Products", data, pro })
    })
      ;


  })
});




/* GET List subcategory products. */
router.get('/listproductssubcat/:subcat/:cat', function (req, res, next) {
  console.log(req.params.subcat);
  console.log(req.params.cat);
  adminHelpers.getCategory().then((data) => {

    userHelpers.getSubCatProducts(req.params.cat, req.params.subcat).then((pro) => {
      console.log(pro);
      res.render('./user/productlist', { admin, user, title: "Products", data, pro })
    })
      ;


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
      logData = response
      res.json({})
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

/* Sign Up otp send. */
router.post('/validate', function (req, res) {

  userHelpers.validate(req.body).then((userResponse) => {
    console.log(userResponse);
    if (userResponse.status) {

      client.verify.services(serviceID)
        .verifications.create({
          to: `+91${req.body.mobile}`,
          channel: "sms"
        })
        .then((response) => {
          console.log("hereeeeeeee");
          console.log(response);
          req.session.signup = req.body
          req.session.number = req.body.mobile
          res.json(userResponse)

        }).catch((e) => {
          userResponse.otp = "Otp not send"
          console.log(e, "errroooorrrrrrrrrr");
        })
    }else{
      res.json(userResponse)
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

  let response = {
    send:true,

  }
  res.json(response)

  client.verify.services(serviceID)
    .verifications.create({
      to: `+91${req.body.mobilenumber}`,
      channel: "sms"
    })
    .then((response) => {
      response.send = true
      res.json(response)
    }).catch((e) => {

      console.log(e, "errroooorrrrrrrrrr");
    })
  
})


// validate Otp
router.post('/otpcheck', (req, res) => {

  let otp = req.body.otp
  let number = req.body.number

  client.verify
    .services(serviceID)
    .verificationChecks.create({
      to: `+91${number}`,
      code: `${otp}`

    })
    .then((data) => {

      if (data.valid) {

        userHelpers.checkNumber(number).then((response) => {

          req.session.user = response.user
          user.status = true
          user.name = response.user.name
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



// signup otp Validate
router.post('/otpvalidate', (req, res) => {

  let otp = req.body.otp
  let number = req.session.number
  console.log(number);
  console.log("bodyyyyyyyy");
  console.log(req.body);



  client.verify
    .services(serviceID)
    .verificationChecks.create({
      to: `+91${number}`,
      code: `${otp}`

    })
    .then((data) => {
      console.log("dataaaaaaaaaaaaa");
      console.log(data);

      if (data.valid) {

        userHelpers.doSignup(req.session.signup).then((userResponse) => {
          console.log(userResponse);
          res.redirect('/login')
      
        })

      } else {
        console.log("notb valid");
        res.json(data)
      }
    }).catch((e) => {

      console.log(e + 'errrrrrrr');
      let data = {
        err: true
      }
      console.log("errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      res.json(data)
    })

})


// add to cart
router.post('/add-to-cart',(req,res)=>{
 
  let proId = req.body.proId
  console.log(proId);
  let userId = req.session.user._id
  
  userHelpers.addToCart(proId,userId).then(()=>{
    res.json({})
  })
})

// product increment
router.post('/change-product-quantity',(req,res)=>{
console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then((response)=>{
    res.redirect('/cart')
    
  })
})

module.exports = router;
