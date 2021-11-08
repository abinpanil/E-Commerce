const express = require('express');
const { response } = require('../app');
const router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers')

let admin = false
let user = {
  name: '',
  status: false
}

let verifyUser = (req, res, next) => {
 
}


/* GET users Home. */
router.get('/', function (req, res, next) {
  console.log(user);

  adminHelpers.getCategory().then((data)=>{
    
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
      console.log(user.name);
      res.json(response)
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

  console.log(req.body);
  userHelpers.doSignup(req.body).then((userResponse) => {
    req.session.userResponse = userResponse
    res.json(userResponse)
    if (userResponse.status) {
      res.redirect('/login')
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
