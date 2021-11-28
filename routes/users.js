const express = require('express');
const { response, render } = require('../app');
const router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers');
const config = require('../auth/config');
const { route } = require('./admin');
const { Db } = require('mongodb');
const serviceID = "	VAa5e077df7a059df1d1bae9a32df93ca9"
const accountSID = "AC29e0de96271489ac12f1c32008d70906"
const authToken = "2975bf30634d92615dab33cee7689014"
const client = require("twilio")(accountSID, authToken)
const paypal = require('paypal-rest-sdk');

// configure paypal with the credentials you got when you created your paypal app
paypal.configure({
  'mode': 'sandbox', //sandbox or live 
  'client_id': 'AUPW2bX7QjjAvfg1WeAOHkwE9h6SibPmPjDf3bjBQA5UKPXqdet5C9b067NG4BB9_GQKQHfyHWhRmr5d', // please provide your client id here 
  'client_secret': 'EAqdQ1NTNQRDAtmZt-4H64ps_NZfKZaFnUEu4H50UE8XT0QUPhmzEbs8lVCsEB0FH1C7r16w_pVo60dE' // provide your client secret here 
});


let admin = false
let user = {
  name: '',
  status: false
}

let cartCount = 0


// user Check
function varifyLogin(req, res, next) {

  if (req.session.user) {
    next()
  } else {
    req.session.location = 'home'
    res.redirect('/login')
  }
}


/* GET users Home. */
router.get('/', async (req, res, next) => {

  let home = await adminHelpers.getHomeData()
  console.log(home);
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  } else {
    user.status = false
    user.name = ''
    delete req.session.user
    console.log("false in userrrrrrrrrrr");
  }
  console.log(user);
  adminHelpers.getCategory().then((data) => {
    adminHelpers.getAllProducts().then((products) => {
      // console.log(products);
      res.render('./user/home', { admin, user, title: "Home", data, products, cartCount, home });
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
router.get('/myaccount', varifyLogin, async (req, res) => {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let userDetails = await userHelpers.getUserDetails(req.session.user._id)
  let orders = await userHelpers.getOrder(req.session.user._id)
  let address = await userHelpers.getAddress(req.session.user._id)
  adminHelpers.getCategory().then((data) => {
    res.render('./user/my_account', { admin, user, title: "My Account", data, orders, cartCount, address, userDetails });
  })
})


/* GET cart. */
router.get('/cart', varifyLogin, async (req, res) => {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  adminHelpers.getCategory().then((data) => {
    userHelpers.getCartProducts(req.session.user._id).then((cartItems) => {
      userHelpers.getTotalAmount(req.session.user._id).then((total) => {
        let cart = cartItems
        res.render('./user/cart', { admin, user, title: "Cart", data, cart, total, cartCount });
      })
    })
  })
});


/* GET wishlist. */
router.get('/wishlist', async function (req, res, next) {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  adminHelpers.getCategory().then((data) => {
    res.render('./user/wishlist', { admin, user, title: "Wishlist", data, cartCount });
  })
});


// GET Checkout
router.get('/checkout', varifyLogin, async (req, res) => {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  adminHelpers.getCategory().then((data) => {
    userHelpers.getAddress(req.session.user._id).then((address) => {
      userHelpers.getCartProducts(req.session.user._id).then((cartItems) => {
        userHelpers.getTotalAmount(req.session.user._id).then((total) => {
          let cart = cartItems
          res.render('./user/checkout', { admin, user, title: "Checkout", data, address, cart, total, cartCount });
        })
      })
    })
  })
})


// Buy now From Direct Product
router.get('/product-buy-now/:id', varifyLogin, async (req, res) => {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  req.session.buyNowProId = req.params.id
  let product = await userHelpers.getProduct(req.params.id)
  let address = await userHelpers.getAddress(req.session.user._id)
  console.log(product);
  adminHelpers.getCategory().then((data) => {
    res.render('./user/buy-now', { admin, user, title: "Check Out", data, address, product, cartCount });
  })
})


// order placed
router.get('/order-placed', varifyLogin, async (req, res) => {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let order = req.session.order
  console.log(order);
  adminHelpers.getCategory().then((data) => {
    res.render('./user/order-placed', { admin, user, title: "Order Placed", data, order, cartCount });
  })
})


// product page
router.get('/viewproduct/:_id', async (req, res) => {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let id = req.params._id
  adminHelpers.getCategory().then((data) => {
    userHelpers.getProduct(id).then((products) => {
      res.render('./user/product', { admin, user, title: "Product", data, products, cartCount });
    })
  })
})


// Get view products
router.get('/view-order/:_id', varifyLogin, async (req, res) => {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  let orderDetail = await userHelpers.getOrderedProduct(req.params._id)
  console.log(orderDetail);
  adminHelpers.getCategory().then((data) => {
    res.render('./user/view-order-details', { admin, user, title: "View Order", data, orderDetail, cartCount });
  })
})


/* Opt Load */
router.get('/otpLoad', async (req, res) => {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  adminHelpers.getCategory().then((data) => {
    res.render('./user/otp', { admin, user, title: "Login", loginErr: "", data, cartCount });
  })
})


// Get list category products
router.get('/listproductscat/:cat', async function (req, res, next) {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  adminHelpers.getCategory().then((data) => {
    userHelpers.getCatProducts(req.params.cat).then((pro) => {
      res.render('./user/productlist', { admin, user, title: "Products", data, pro, cartCount })
    })
  })
});


// product search
router.get('/productsearch', async (req, res) => {

  console.log(req.query.search);

  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  adminHelpers.getCategory().then((data) => {
    userHelpers.getSearchProducts(req.query.search).then((pro) => {
      res.render('./user/productlist', { admin, user, title: "Products", data, pro, cartCount })
    })
  })
})


/* GET List subcategory products. */
router.get('/listproductssubcat/:subcat/:cat', async function (req, res, next) {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }

  adminHelpers.getCategory().then((data) => {
    userHelpers.getSubCatProducts(req.params.cat, req.params.subcat).then((pro) => {
      console.log(pro);
      res.render('./user/productlist', { admin, user, title: "Products", data, pro, cartCount })
    })
  })
});


// Get add new address
router.get('/add_address', async (req, res) => {
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  adminHelpers.getCategory().then((data) => {
    res.render('./user/address', { admin, user, title: "Add Address", data, cartCount });
  })
})


/* Login */
router.post('/login', function (req, res) {

  res.redirect('/login')
})


/* Sign in. */
router.post('/signIn', function (req, res) {
  console.log(req.session.location);
  let data = {
    username: req.body.username,
    password: req.body.password
  }
  userHelpers.doLogin(data).then((response) => {
    if (response.status) {
      req.session.user = response.user
      user.status = true
      user.name = req.session.user.name
      logData = response
      if (req.session.product) {
        userHelpers.addToCart(req.session.product, req.session.user._id).then(() => {
          res.redirect('/')
          res.json(response)
        })
      } else {
        res.redirect('/')
      }
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


// edit validate
router.post('/edit_validate', (req, res) => {

  // userHelpers.validate(req.body).then((userResponse)=>{
  // if(userResponse.status){
  userHelpers.editUser(req.body).then(() => {
    res.json({})
  })
  // }else{
  //   res.json(userResponse)
  // }
  // })
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
          res.json({ err: true })
          userResponse.otp = "Otp not send"
          console.log(e, "errroooorrrrrrrrrr");
        })
    } else {
      res.json(userResponse)
    }
  })
})


// resend
router.post('/resend', (req, res) => {
  console.log("ethyyyyyyyyyyyy");
  console.log(req.body);
  client.verify.services(serviceID)
    .verifications.create({
      to: `+91${req.body.mobile}`,
      channel: "sms"
    })
    .then(() => {
      console.log("ethyyyyy");
      res.json(response)
    }).catch((e) => {
      userResponse.otp = "Otp not send"
      console.log(e, "errroooorrrrrrrrrr");
      res.json({ err: true })
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
    send: true,
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
router.post('/add-to-cart', (req, res) => {
  console.log(user.status);
  let response = {}
  if (user.status === true) {
    console.log("innnn");
    let proId = req.body.proId
    let userId = req.session.user._id
    userHelpers.addToCart(proId, userId).then(() => {
      response.status = true
      res.json(response)
    })
  } else {
    response.status = false
    console.log("outtt");
    req.session.product = req.body.proId
    res.json(response)
  }
})


router.post('/add-to-wishlist', (req, res) => {
  let response = {}
  if (user.status === true) {
    let proId = req.body.proId
    let userId = req.session.user._id
    userHelpers.addToWishlist(proId, userId).then(() => {
      response.status = true
      res.json(response)
    })
  }
})


// product increment
router.post('/change-product-quantity', (req, res) => {
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then((response) => {
    userHelpers.getTotalAmount(req.session.user._id).then((total) => {
      userHelpers.getSubTotalAmount(req.body).then((subTotal) => {
        let response = {
          total: total,
          subTotal: subTotal.subTotal
        }
        console.log(response);
        res.json(response)
      })
    })
  })
})


// remove product from cart
router.post('/removeCartProduct', (req, res) => {
  let product = req.body.product
  let user = req.session.user._id
  userHelpers.removeCartProduct(product, user).then(() => {
    res.redirect('/cart')
  })
})


// add address
router.post('/add_address', (req, res) => {
  let newAddress = req.body
  newAddress.user = req.session.user._id
  console.log(newAddress);
  userHelpers.addAddress(newAddress).then(() => {
    res.redirect('/checkout')
    res.json({})
  })
})


// update address
router.post('/update_address', (req, res) => {
  let updateAddress = req.body
  userHelpers.editAddress(updateAddress).then(() => {
    res.redirect('/checkout')
    res.json({})
  })
})


// delete address
router.post('/deleteAddress', (req, res) => {
  userHelpers.deleteAddress(req.body).then(() => {
    res.redirect('/checkout')
    res.json({})
  })
})


// cancel checkout
router.post('/cancel', (req, res) => {
  res.redirect('/checkout')
  res.json({})
})

// change password
router.post('/edit_password', (req, res) => {
  userHelpers.editPassword(req.body).then((response) => {
    console.log(response);
    res.json(response)
  })
})

// place order
router.post('/place-order', async (req, res) => {
  let products = await userHelpers.getCartProductForOrder(req.session.user._id)
  let totalPrice = await userHelpers.getTotalAmount(req.session.user._id)
  let address = await userHelpers.getAddressForOrder(req.body.address)
  let lastOrder = {
    address: address,
    totalPrice: totalPrice,
    products: products
  }
  req.session.order = lastOrder
  console.log(req.session.order);
  let orderId = await userHelpers.placeOrder(req.body, products, totalPrice, address, req.session.user._id)
  if (req.body.payment === 'Cash On Delivery') {

    res.json({ cod: true })
  } else if (req.body.payment === 'Razorpay') {
    userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
      res.json(response)
    })
  } else if (req.body.payment === 'Paypal') {
    console.log("ivdeeeeeeee");
    const create_payment_json = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
        "item_list": {
          "items": [{
            "name": "Redhock Bar Soap",
            "sku": "001",
            "price": "25.00",
            "currency": "USD",
            "quantity": 1
          }]
        },
        "amount": {
          "currency": "USD",
          "total": "25.00"
        },
        "description": "Washing Bar soap"
      }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            res.redirect(payment.links[i].href);
          }
        }
      }
    });
  }
})


router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "25.00"
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send('Success');
    }
  });
});



// direct buy place order
router.post('/place-order-direct', async (req, res) => {
  let products = await userHelpers.getProduct(req.body.product)
  let address = await userHelpers.getAddressForOrder(req.body.address)
  let totalPrice = products.productprice
  let lastOrder = {
    address: address,
    totalPrice: products.productprice,
    products: req.body.product
  }
  console.log(req.body);
  req.body.direct = true
  req.session.order = lastOrder
  let orderId =
    await userHelpers.placeOrderDirect(req.body, req.body.product, totalPrice, address, req.session.user._id)
  if (req.body.payment === 'Cash On Delivery') {


    res.json({ cod: true })
  } else if (req.body.payment === 'Razorpay') {

    userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
      res.json(response)
    })
  } else if (req.body.payment === 'Paypal') {
    console.log("ivdeeeeeeeeee");
    // create payment object 
    var payment = {
      "intent": "authorize",
      "payer": {
        "payment_method": "paypal"
      },
      "redirect_urls": {
        "return_url": "http://127.0.0.1:2000/success",
        "cancel_url": "http://127.0.0.1:2000/err"
      },
      "transactions": [{
        "amount": {
          "total": 39.00,
          "currency": "USD"
        },
        "description": " a book on mean stack "
      }]
    }
    // call the create Pay method 
    createPay(payment)
      .then((transaction) => {
        var id = transaction.id;
        var links = transaction.links;
        var counter = links.length;
        while (counter--) {
          if (links[counter].method == 'REDIRECT') {
            // redirect to paypal where user approves the transaction 
            return res.redirect(links[counter].href)
          }
        }
      })
      .catch((err) => {
        console.log(err);
        res.redirect('/err');
      });
  }

})


router.get('/success' , (req ,res ) => {
  console.log(req.query); 
  res.redirect('/success.html'); 
})

// error page 
router.get('/err' , (req , res) => {
  console.log(req.query); 
  res.redirect('/err.html'); 
})



// cancel order
router.post('/cancel-order', (req, res) => {
  console.log(req.body);
  userHelpers.changeStatus(req.body.id).then(() => {
    res.json({})
  })
})


// verifyPayment
router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  console.log("in varify");
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePayementStatus(req.body['order[receipt]']).then(() => {
      console.log("Payment success");
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })
  })
})


// helper functions 
var createPay = ( payment ) => {
  return new Promise( ( resolve , reject ) => {
      paypal.payment.create( payment , function( err , payment ) {
       if ( err ) {
           reject(err); 
       }
      else {
          resolve(payment); 
      }
      }); 
  });
}		

module.exports = router;
