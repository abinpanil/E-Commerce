var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers')


let logErr = ""
let pid = 123
let pro={}
let admin = {
  status:true
  
}
let catData 

const varifyLogin = (req,res,next)=>{
  if(req.session.admin){
    
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
    res.render('./admin/login', {admin,title:"Admin",logErr});
  }
})
 
/* Get dashboard. */
router.get('/dashboard',varifyLogin, function(req,res){
  res.render('./admin/dashboard',{admin,title:"Dashboard"})
})

/* Get products. */
router.get('/products',varifyLogin, function(req,res){
  adminHelpers.getAllProducts().then((products)=>{
    adminHelpers.getCategory().then((data)=>{
      
      res.render('./admin/product-management',{admin,title:"Products",products,data})
      res.json({})
      
    })
  })
  
})

/* Get add_products. */
router.get('/add_products',varifyLogin, function(req,res){

  adminHelpers.getCategory().then((data)=>{

    console.log(data);
    res.render('./admin/add_products',{admin,title:"Add Products",data})
  })

})

/* Get categories. */
router.get('/categories',varifyLogin, function(req,res){
  
  adminHelpers.getCategory().then((data)=>{
    
    
    res.render('./admin/category-management',{admin,title:"Categories",data})
    
  })
  
})

/* Get orders. */
router.get('/orders',varifyLogin, function(req,res){
  res.render('./admin/orders',{admin,title:"Orders"})
})

/* Get users. */
router.get('/users',varifyLogin, function(req,res){
  adminHelpers.getAllUsers().then((usersList)=>{
    console.log(usersList);
    res.render('./admin/user',{admin,title:"Users",usersList})
  })
  
})


/* Login admin. */
router.post('/signin',(req,res)=>{
 
  let adminData = {
    username:"abinpanil",
    password:"pass"
  }
  
  

  if(adminData.username===req.body.username){
    if(adminData.password===req.body.password){
      req.session.admin=req.body
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
router.post('/add_category',function(req,res){
  
  
  adminHelpers.addCategory(req.body).then((data)=>{
    
    
    res.redirect('/admin/categories') 
    
  })
  
})
 
// Get SubCategory
router.post('/getSubCategory',(req,res)=>{

  
  adminHelpers.getSubCategory(req.body).then((cat)=>{
    let subCat = cat.subCategory
   
    res.json(subCat)
    
  })
})

/* Block user */
router.post('/block',(req,res)=>{
  
  
  adminHelpers.blockUser(req.body.id).then(data=>{
    
    res.json(data)
    if(req.session.user._id === req.body.id){
      
      delete req.session.user
    }
    
    
  }).catch(err=>{
    res.json(err)
  }) 
})

// Delete Category
router.post('/deleteCategory',(req,res)=>{

  
  adminHelpers.deleteCategory(req.body).then(()=>{

    res.redirect('/admin/categories') 
  })
}) 

// Delete Product
router.post('/deleteProduct',(req,res)=>{

  adminHelpers.deleteProduct(req.body).then((resolve)=>{
    
    res.redirect('/admin/products')
  })
})

// get details for edit
router.post('/editproduct_get',(req,res)=>{
 pid=req.body.id
 console.log(pid);
})

// edit Product
router.post('/edit_product',(req,res)=>{

  let image1 = req.files.productimage1
  let image2 = req.files.productimage2
  let image3 = req.files.productimage3
  let image4 = req.files.productimage4
  
  let id = req.body.id
  console.log(id);
  adminHelpers.updateProduct(req.body).then((product)=>{
    res.redirect('/admin/products') 
    image1.mv('./public/user/images/productImage/'+id+'1.jpg',(err,done)=>{

      if(!err){

        image2.mv('./public/user/images/productImage/'+id+'2.jpg',(err,done)=>{

          if(!err){
    
            image3.mv('./public/user/images/productImage/'+id+'3.jpg',(err,done)=>{

              if(!err){
                
                image4.mv('./public/user/images/productImage/'+id+'4.jpg',(err,done)=>{

                  if(!err){
            
                    
                    
                  }else{
                    console.log(err+"err 1");
                  }
                })
                
              }else{
                console.log(err+"err 2");
              }
            })
            
          }else{
            console.log(err+"err 3");
          }
        })
        
      }else{
        console.log(err+"err 4");
      }
    })
    console.log(product);
    
  })
})

// Delete subCategory
router.post('/deletesSubCategory',(req,res)=>{

  
  adminHelpers.deleteSubCategory(req.body).then(()=>{

    res.redirect('/admin/categories') 
  })
})

/* Add product */
router.post('/add_product',function(req,res){

  let image1 = req.files.productimage1
  let image2 = req.files.productimage2
  let image3 = req.files.productimage3
  let image4 = req.files.productimage4
  adminHelpers.addProduct(req.body).then((data)=>{
    
    image1.mv('./public/user/images/productImage/'+data+'1.jpg',(err,done)=>{

      if(!err){

        image2.mv('./public/user/images/productImage/'+data+'2.jpg',(err,done)=>{

          if(!err){
    
            image3.mv('./public/user/images/productImage/'+data+'3.jpg',(err,done)=>{

              if(!err){
                
                image4.mv('./public/user/images/productImage/'+data+'4.jpg',(err,done)=>{

                  if(!err){
            
                    res.redirect('/admin/add_products') 
                    
                  }else{
                    console.log(err+"err 1");
                  }
                })
                
              }else{
                console.log(err+"err 2");
              }
            })
            
          }else{
            console.log(err+"err 3");
          }
        })
        
      }else{
        console.log(err+"err 4");
      }
    })
    
    
  })

  
})

/* Logout. */
router.get('/logout',function(req,res){
  admin.adminLogin = false
  delete req.session.admin
  res.redirect('/admin')
})
// middleware



module.exports = router;
