var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers')
const fs = require('fs');
const userHelpers = require('../helpers/user-helpers');
const { Db } = require('mongodb');

let logErr = ""
let pid = 123
let pro = {}
let admin = {
  status: true

}
let type = 'Daily'

const varifyLogin = (req, res, next) => {
  if (req.session.admin) {

    next()
  } else {
    res.redirect('/admin/login')
    // next()
  }
}
/* GET home page. */
router.get('/', varifyLogin, async (req, res, next) => {
  
  res.redirect('/admin/dashboard')
});

/* Get Login. */
router.get('/login', function (req, res) {

  if (req.session.admin) {
    res.redirect('/admin')
  } else {
    res.render('./admin/login', { admin, title: "Admin", logErr });
  }
})

/* Get dashboard. */
router.get('/dashboard', varifyLogin, async (req, res)=> {
  let totalSales = await adminHelpers.getTotalSales()
  let totalOrder = await adminHelpers.getTotalOrder()
  let totalProducts = await adminHelpers.getTotalProducts()
  let completedOrder = await adminHelpers.getCompletedOrder()
  let pendingOrder = await adminHelpers.getPendingOrder()
  let cancelOrder = await adminHelpers.getCancellOrder()
  let LastOrders = await adminHelpers.getLastOrder()
  
  let orderStatus = {
    completedOrder : completedOrder,
    pendingOrder : pendingOrder,
    cancelOrder : cancelOrder
  } 
  res.render('./admin/dashboard', { admin, title: "Dashboard",totalSales,totalOrder,totalProducts,orderStatus,LastOrders})
})

/* Get products. */
router.get('/products', varifyLogin, function (req, res) {
  adminHelpers.getAllProducts().then((products) => {
    adminHelpers.getCategory().then((data) => {

      res.render('./admin/product-management', { admin, title: "Products", products, data })
      res.json({})

    })
  })

})

/* Get add_products. */
router.get('/add_products', varifyLogin, function (req, res) {

  adminHelpers.getCategory().then((data) => {

    // console.log(data);
    res.render('./admin/add_products', { admin, title: "Add Products", data })
  })

})


// Coupon
router.get('/coupon',async(req,res)=>{
  let coupons= await adminHelpers.getCoupon()
  console.log(coupons);
  res.render('./admin/coupon', { admin, title: "Coupons" ,coupons})
})


// Category Offer
router.get('/category_offer',(req,res)=>{

  res.render('./admin/category-offer', { admin, title: "Category-offer" })
})

// product Offer
router.get('/product_offers',(req,res)=>{

  res.render('./admin/product-offer', { admin, title: "Product-offer" })
})


/* Get categories. */
router.get('/categories', varifyLogin, function (req, res) {

  adminHelpers.getCategory().then((data) => {
    // console.log(data);
    res.render('./admin/category-management', { admin, title: "Categories", data })

  })

})

/* Get orders. */
router.get('/orders', varifyLogin, async (req, res) => {
  let orders = await adminHelpers.getOrderforAdmin()
  res.render('./admin/orders', { admin, title: "Orders", orders })
})


// home banners
router.get('/homepage-customization',varifyLogin, async(req, res) => {
  let data = await adminHelpers.getHomeData()
  console.log(data);
  res.render('./admin/home_page', { admin, title: "Home Custom", data })
})

/* Get users. */
router.get('/users', varifyLogin, function (req, res) {
  adminHelpers.getAllUsers().then((usersList) => {
    // console.log(usersList);
    res.render('./admin/user', { admin, title: "Users", usersList })
  })
})

router.get('/sales-report', varifyLogin,async(req,res)=>{

  console.log(type);
  let data = await adminHelpers.getReportData(type)
  console.log(data);
  
  res.render('./admin/sales-report', { admin, title: "Sales Report",data,type})
  res.json({})
})

/* Login admin. */
router.post('/signin', (req, res) => {

  let adminData = {
    username: "abinpanil",
    password: "pass"
  }

  if (adminData.username === req.body.username) {
    if (adminData.password === req.body.password) {
      req.session.admin = req.body
      admin.adminLogin = true
      logErr = ""
      res.json({})
      res.redirect('/admin')
    }
    logErr = "Wrong Password"
    res.json({})
    res.redirect('/admin/login')
  }
  logErr = "wrong Username"
  res.json({})
  res.redirect('/admin/login')
})


/* Add category */
router.post('/add_category', function (req, res) {

  // console.log(req.body);

  adminHelpers.addCategory(req.body).then((data) => {

    res.redirect('/admin/categories')
  })
})


// Add subcatetgory
router.post('/add_subcategory', (req, res) => {

  adminHelpers.addSubcategory(req.body).then((data) => {

    res.redirect('/admin/categories')
  })
})


// Get SubCategory
router.post('/getSubCategory', (req, res) => {


  adminHelpers.getSubCategory(req.body).then((cat) => {
    let subCat = cat.subCategory

    res.json(subCat)

  })
})


/* Block user */
router.post('/block', (req, res) => {

  adminHelpers.blockUser(req.body.id).then(data => {

    if (req.session.user) {
      if (req.session.user._id === req.body.id) {
        delete req.session.user
      }
    } else {

      res.json(data)
    }
    res.json(data)

  }).catch(err => {
    res.json(err)
  })
})


// Delete Category
router.post('/deleteCategory', (req, res) => {
  console.log(req.body);
  adminHelpers.deleteCategory(req.body).then(() => {

    res.redirect('/admin/categories')
    adminHelpers.deleteProductcategory(req.body).then((productId) => {

      fs.unlink('./public/user/images/productImage/' + productId + '1.jpg', (err) => {
        if (err) {
          console.log("failed to delete local image: 1" + err);
        } else {
          console.log('successfully deleted local image 1');
        }
      });
      fs.unlink('./public/user/images/productImage/' + productId + '2.jpg', (err) => {
        if (err) {
          console.log("failed to delete local image: 2" + err);
        } else {
          console.log('successfully deleted local image 2');
        }
      });
      fs.unlink('./public/user/images/productImage/' + productId + '3.jpg', (err) => {
        if (err) {
          console.log("failed to delete local image: 3" + err);
        } else {
          console.log('successfully deleted local image 3');
        }
      });
      fs.unlink('./public/user/images/productImage/' + productId + '4.jpg', (err) => {
        if (err) {
          1
          1
          1
          console.log("failed to delete local image: 4" + err);
        } else {
          console.log('successfully deleted local image 4');
        }
      });
      res.redirect('/admin/categories')
    })
  })
})

// Delete Product
router.post('/deleteProduct', (req, res) => {
  adminHelpers.deleteProduct(req.body).then((resolve) => {
    res.redirect('/admin/products')
  })
})

// get details for edit
router.post('/editproduct_get', (req, res) => {
  pid = req.body.id
  //  console.log(pid);

})

// edit Product
router.post('/edit_product', (req, res) => {

  let product = {

    producttitle: req.body.producttitle,
    productname: req.body.productname,
    productdiscription: req.body.productdiscription,
    productprice: req.body.productprice,
    productquantity: req.body.productquantity,
    productcategory: req.body.productcategory,
    productsubcategory: req.body.productsubcategory
  }

    adminHelpers.updateProduct(product).then((product) => {

      res.redirect('/admin/products')
      let image1 = req.body.image1
      let image2 = req.body.image2
      let image3 = req.body.image3
      let image4 = req.body.image4

      let path1 = './public/user/images/productImage/' + id + '1.jpg'
      let path2 = './public/user/images/productImage/' + id + '2.jpg'
      let path3 = './public/user/images/productImage/' + id + '3.jpg'
      let path4 = './public/user/images/productImage/' + id + '4.jpg'

      let img1 = image1.replace(/^data:([A-Za-z+/]+);base64,/, "")
      let img2 = image2.replace(/^data:([A-Za-z+/]+);base64,/, "")
      let img3 = image3.replace(/^data:([A-Za-z+/]+);base64,/, "")
      let img4 = image4.replace(/^data:([A-Za-z+/]+);base64,/, "")

      fs.writeFileSync(path1, img1, { encoding: 'base64' })
      fs.writeFileSync(path2, img2, { encoding: 'base64' })
      fs.writeFileSync(path3, img3, { encoding: 'base64' })
      fs.writeFileSync(path4, img4, { encoding: 'base64' })

      console.log(product);

    })

})


// Delete subCategory
router.post('/deletesSubCategory', (req, res) => {
  console.log(req.body);
  adminHelpers.deleteSubCategory(req.body).then(() => {
    res.redirect('/admin/categories')
    adminHelpers.deleteProductSubcategory(req.body).then((productId) => {

      fs.unlink('./public/user/images/productImage/' + productId + '1.jpg', (err) => {
        if (err) {
          console.log("failed to delete local image: 1" + err);
        } else {
          console.log('successfully deleted local image 1');
        }
      });
      fs.unlink('./public/user/images/productImage/' + productId + '2.jpg', (err) => {
        if (err) {
          console.log("failed to delete local image: 2" + err);
        } else {
          console.log('successfully deleted local image 2');
        }
      });
      fs.unlink('./public/user/images/productImage/' + productId + '3.jpg', (err) => {
        if (err) {
          console.log("failed to delete local image: 3" + err);
        } else {
          console.log('successfully deleted local image 3');
        }
      });
      fs.unlink('./public/user/images/productImage/' + productId + '4.jpg', (err) => {
        if (err) {
          console.log("failed to delete local image: 4" + err);
        } else {
          console.log('successfully deleted local image 4');
        }
      });
      res.redirect('/admin/categories')
    })
  })
})


/* Add product */
router.post('/add_product', function (req, res) {

  let product = {

    producttitle: req.body.producttitle,
    productname: req.body.productname,
    productdiscription: req.body.productdiscription,
    productprice: req.body.productprice,
    productquantity: req.body.productquantity,
    productcategory: req.body.productcategory,
    productsubcategory: req.body.productsubcategory
  }

  adminHelpers.addProduct(product).then((id) => {

    let image1 = req.body.image1
    let image2 = req.body.image2
    let image3 = req.body.image3
    let image4 = req.body.image4

    let path1 = './public/user/images/productImage/' + id + '1.jpg'
    let path2 = './public/user/images/productImage/' + id + '2.jpg'
    let path3 = './public/user/images/productImage/' + id + '3.jpg'
    let path4 = './public/user/images/productImage/' + id + '4.jpg'

    let img1 = image1.replace(/^data:([A-Za-z+/]+);base64,/, "")
    let img2 = image2.replace(/^data:([A-Za-z+/]+);base64,/, "")
    let img3 = image3.replace(/^data:([A-Za-z+/]+);base64,/, "")
    let img4 = image4.replace(/^data:([A-Za-z+/]+);base64,/, "")

    fs.writeFileSync(path1, img1, { encoding: 'base64' })
    fs.writeFileSync(path2, img2, { encoding: 'base64' })
    fs.writeFileSync(path3, img3, { encoding: 'base64' })
    fs.writeFileSync(path4, img4, { encoding: 'base64' })

    res.redirect('/admin/add_products')

  })
})


/* Logout. */
router.get('/logout', function (req, res) {
  admin.adminLogin = false
  delete req.session.admin
  res.redirect('/admin')
})


// view more Orders
router.get('/viewMoreOrders/:orderId', async (req, res) => {
  let id = req.params.orderId
  let orderDetail = await userHelpers.getOrderedProduct(req.params.orderId)

  res.render('./admin/order-details', { admin, title: "Orders", orderDetail })

})



// change status
router.post('/change-status', (req, res) => {

  adminHelpers.changeOrderStatus(req.body).then(() => {
    res.json({})
  })
})


router.post('/addbanner', (req, res) => {
let data = {
  
  bannerTitle : req.body.bannerTitle,
  bannerHeading : req.body.bannerHeading,
  bannerContent : req.body.bannerContent
}
console.log(data);
  adminHelpers.addBanner(data).then((id)=>{

    console.log("ethyyyyyy");
    let image = req.body.image
    console.log(image);  
    let path = './public/user/images/productImage/' + id + '1.jpg'
    let img = image.replace(/^data:([A-Za-z+/]+);base64,/, "")
    fs.writeFileSync(path, img, { encoding: 'base64' })
    res.redirect('/admin/homepage-customization')
  })
})


// delete banner
router.post('/deleteBanner',(req,res)=>{
  console.log(req.body)
  adminHelpers.deleteBanner(req.body.id).then(()=>{
    res.json({})
  })
})

// sales report
router.post('/reportdate',async(req,res)=>{
  
  type = req.body.value
  res.redirect('/admin/sales-report')

}) 


// Get chart data
router.post('/dashboard/weeklychart',async(req,res)=>{
  let response = {}
  let weeklyUsers = await adminHelpers.getWeeklyUsers()
  let weeklyTotalSales = await adminHelpers.getWeeklySales()
  let categories = await adminHelpers.getCategories()
  let orderStatus = await adminHelpers.getOrdersStatus()
  let sales = await adminHelpers.getSalesData()
  response = {
    weeklyUsers : weeklyUsers,
    weeklyTotalSales : weeklyTotalSales,
    catName : categories.catNames,
    catData : categories.catData,
    placedOrd : orderStatus.placed,
    cancelOrd : orderStatus.cancel,
    pendingOrd : orderStatus.pending,
    deliveredOrd : orderStatus.delivered,
    confirmOrd : orderStatus.confirm,
    totalSales:sales
  }
  console.log(response);
  res.json(response)
})


// coupon adding
router.post('/add-coupon',async(req,res)=>{
  await adminHelpers.addCoupon(req.body)
  res.redirect('/admin/coupon')
})

// delete coupon
router.post('/deleteCoupon',(req,res)=>{
  adminHelpers.deleteCoupon(req.body).then(()=>{
    res.json({})
  })
})

module.exports = router;
