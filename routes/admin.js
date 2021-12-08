var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers')
const fs = require('fs');
const userHelpers = require('../helpers/user-helpers');
const { Db } = require('mongodb');
const { response } = require('express');

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
router.get('/dashboard', varifyLogin, async (req, res) => {
  let totalSales = await adminHelpers.getTotalSales()
  let totalOrder = await adminHelpers.getTotalOrder()
  let totalProducts = await adminHelpers.getTotalProducts()
  let completedOrder = await adminHelpers.getCompletedOrder()
  let pendingOrder = await adminHelpers.getPendingOrder()
  let cancelOrder = await adminHelpers.getCancellOrder()
  let LastOrders = await adminHelpers.getLastOrder()

  let orderStatus = {
    completedOrder: completedOrder,
    pendingOrder: pendingOrder,
    cancelOrder: cancelOrder
  }
  res.render('./admin/dashboard', { admin, title: "Dashboard", totalSales, totalOrder, totalProducts, orderStatus, LastOrders })
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

    res.render('./admin/add_products', { admin, title: "Add Products", data })
  })

})


// Coupon
router.get('/coupon', varifyLogin, async (req, res) => {
  let coupons = await adminHelpers.getCoupon()
  res.render('./admin/coupon', { admin, title: "Coupons", coupons })
})


// Category Offer
router.get('/category_offer', varifyLogin, async (req, res) => {
  let category = await adminHelpers.getCategory()
  let offerCat = await adminHelpers.getOfferCategory()

  res.render('./admin/category-offer', { admin, title: "Category-offer", category, offerCat })
  res.json({})
})

// product Offer
router.get('/product_offers', varifyLogin, async (req, res) => {
  let category = await adminHelpers.getCategory()
  let products = await adminHelpers.getActiveOfferProducts()
  res.render('./admin/product-offer', { admin, title: "Product-offer", category, products })
})


/* Get categories. */
router.get('/categories', varifyLogin, function (req, res) {

  adminHelpers.getCategory().then((data) => {

    res.render('./admin/category-management', { admin, title: "Categories", data })

  })

})

/* Get orders. */
router.get('/orders', varifyLogin, async (req, res) => {
  let orders = await adminHelpers.getOrderforAdmin()
  res.render('./admin/orders', { admin, title: "Orders", orders })
})


// home banners
router.get('/homepage-customization', varifyLogin, async (req, res) => {
  let data = await adminHelpers.getHomeData()

  res.render('./admin/home_page', { admin, title: "Home Custom", data })
})

/* Get users. */
router.get('/users', varifyLogin, function (req, res) {
  adminHelpers.getAllUsers().then((usersList) => {

    res.render('./admin/user', { admin, title: "Users", usersList })
  })
})

// sales report
router.get('/sales-report', varifyLogin, async (req, res) => {

  let data = await adminHelpers.getReportData(type)

  res.render('./admin/sales-report', { admin, title: "Sales Report", data, type })
  res.json({})
})


// top selling products report
router.get('/top-selling-products',varifyLogin, async (req, res) => {
  
  let report = await adminHelpers.topSellingProducts()
  res.render('./admin/top-selling-products', { admin, title: "Sales Report", report })
})


// transaction report
router.get('/transaction-report',varifyLogin,async(req,res)=>{

  let report = await adminHelpers.transactionReport()
  console.log(report);
  res.render('./admin/transaction-report', { admin, title: "Sales Report", report })
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

  adminHelpers.deleteCategory(req.body).then(() => {
    res.redirect('/admin/categories')
    adminHelpers.deleteProductcategory(req.body).then((productId) => {

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

})

// edit Product
router.post('/edit_product', (req, res) => {

  let product = {
    id: req.body.id,
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

  })

})


// Delete subCategory
router.post('/deletesSubCategory', (req, res) => {
  adminHelpers.deleteSubCategory(req.body).then(() => {
    res.redirect('/admin/categories')
    adminHelpers.deleteProductSubcategory(req.body).then((productId) => {

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

    bannerTitle: req.body.bannerTitle,
    bannerHeading: req.body.bannerHeading,
    bannerContent: req.body.bannerContent
  }
  adminHelpers.addBanner(data).then((id) => {

    let image = req.body.image
    let path = './public/user/images/productImage/' + id + '1.jpg'
    let img = image.replace(/^data:([A-Za-z+/]+);base64,/, "")
    fs.writeFileSync(path, img, { encoding: 'base64' })
    res.redirect('/admin/homepage-customization')
  })
})


// delete banner
router.post('/deleteBanner', (req, res) => {
  adminHelpers.deleteBanner(req.body.id).then(() => {
    res.json({})
  })
})

// sales report
router.post('/reportdate', async (req, res) => {

  type = req.body.value
  res.redirect('/admin/sales-report')

})


// Get chart data
router.post('/dashboard/weeklychart', async (req, res) => {
  let response = {}
  let weeklyUsers = await adminHelpers.getWeeklyUsers()
  let weeklyTotalSales = await adminHelpers.getWeeklySales()
  let categories = await adminHelpers.getCategories()
  let orderStatus = await adminHelpers.getOrdersStatus()
  let sales = await adminHelpers.getSalesData()
  response = {
    weeklyUsers: weeklyUsers,
    weeklyTotalSales: weeklyTotalSales,
    catName: categories.catNames,
    catData: categories.catData,
    placedOrd: orderStatus.placed,
    cancelOrd: orderStatus.cancel,
    deliveredOrd: orderStatus.delivered,
    confirmOrd: orderStatus.confirm,
    totalSales: sales
  }
  res.json(response)
})


// coupon adding
router.post('/add-coupon', async (req, res) => {
  let response = await adminHelpers.addCoupon(req.body)
  res.json(response)
})

// delete coupon
router.post('/deleteCoupon', (req, res) => {
  adminHelpers.deleteCoupon(req.body).then(() => {
    res.json({})
  })
})

// add category offer
router.post('/add-category-offer', async (req, res) => {

  await adminHelpers.addCategoryOffer(req.body)
  res.redirect('/admin/category_offer')
  res.json({})
})

// delete category offer
router.post('/delete_categoryoffer', (req, res) => {
  adminHelpers.deleteCategoryOffer(req.body.category)
  res.redirect('/admin/category_offer')
})


// search product for offer
router.post('/product-offer/get-search-products',async(req,res)=>{

  let products = await adminHelpers.getSearchedProductForProOffer(req.body.keyWord)
  res.json(products)
})


// sort sales report datewise
router.post('/sales-report/sort-date', async (req, res) => {
  let from = req.body.from
  let to = req.body.to
  let report = await adminHelpers.getOrderSortedRange(from, to)
  res.json(report)
})


// get products for product offer
router.post('/product-offer/get-products', async (req, res) => {

  let products = await adminHelpers.getProductforOffer(req.body)
  res.json(products)
})

// add product offer
router.post('/add-product-offer', async (req, res) => {
  let offerProduct = await adminHelpers.addProductOffer(req.body)
  res.json(offerProduct)
})

// delete product offer
router.post('/delete-product-offer', async (req, res) => {
  await adminHelpers.deleteProductOffer(req.body.id)
  res.json({})
})

module.exports = router;
