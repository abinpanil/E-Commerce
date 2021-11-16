const db = require('../config/connection')
const collection = require('../config/collections')
const objectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const { PRODUCTS_COLLECTION } = require('../config/collections');
module.exports = {

    validate: (userData) => {
        console.log(userData);
        let userResponse = {
            email: "",
            username: "",
            mobile: "",
            block: "",
            status: true
        }

        let emailCheck = true
        let mobileCheck = true
        let usernameCheck = true

        return new Promise(async (resolve, reject) => {

            let checkEmail = await db.get().collection(collection.USERS_COLLECTION).findOne({ email: userData.email })
            if (checkEmail) {
                emailCheck = false
                userResponse.email = "Email is already exists"
            }
            let checkUsername = await db.get().collection(collection.USERS_COLLECTION).findOne({ username: userData.username })
            if (checkUsername) {
                usernameCheck = false
                userResponse.username = "Username is already exists"
            }
            let checkMobile = await db.get().collection(collection.USERS_COLLECTION).findOne({ mobile: userData.mobile })
            if (checkMobile) {
                mobileCheck = false
                userResponse.mobile = "Mobile Number already exists"
            }
            if (emailCheck && usernameCheck && mobileCheck) {

                resolve(userResponse)

            } else {

                userResponse.status = false
                resolve(userResponse)

            }
        })
    },


    doSignup: (userData) => {

        console.log(userData);
        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 10)
            userData.isActive = "Block"
            userData.blockStatus = "Active"
            console.log(userData);
            db.get().collection(collection.USERS_COLLECTION).insertOne(userData).then((data) => {

                resolve()
            })
        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {

            let response = {}
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ username: userData.username })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {

                        if (user.blockStatus === "Active") {

                            response.user = user
                            response.status = true
                            response.errormsg = ""
                            resolve(response)
                        } else {


                            response.status = false
                            response.errormsg = "You Blocked by Admin"
                            resolve(response)

                        }

                    } else {

                        response.status = false
                        response.errormsg = "Invalid Password"
                        resolve(response)
                    }
                })
            } else {
                response.status = false
                response.errormsg = "User not Found"
                resolve(response)
            }
        })
    },
    checkNumber: (number) => {

        return new Promise(async (resolve, reject) => {

            let mobRes = {}

            let userNum = await db.get().collection(collection.USERS_COLLECTION).findOne({ mobile: number })
            if (userNum) {
                mobRes.user = userNum
                mobRes.status = true
                resolve(mobRes)
            } else {
                mobRes.user = userNum
                mobRes.status = false
                resolve(mobRes)
            }
        })
    },
    getProduct: (id) => {

        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: objectId(id) })
            resolve(product)
        })
    },
    getSubCatProducts: (cat, sub) => {
        return new Promise(async (resolve, reject) => {
            let subProduct = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ productcategory: cat, productsubcategory: sub }).toArray()
            resolve(subProduct)
        })
    },
    getCatProducts: (cat) => {
        return new Promise(async (resolve, reject) => {
            let subProduct = await db.get().collection(collection.PRODUCTS_COLLECTION).find({ productcategory: cat }).toArray()
            resolve(subProduct)
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {

            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

            if (userCart) {

                let prodExist = userCart.products.findIndex(product => product.item == proId)

                if (prodExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).
                        updateOne({user:objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then(()=>{
                                resolve()
                            })
                } else {

                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }
                            })
                        .then((response) => {
                            resolve()
                        })
                }
            } else {
                let cartObj = {

                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then(() => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            item:'$products.item',
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCTS_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                    }
                ]
            ).toArray()
            resolve(cartItems)
        })
    },
    changeProductQuantity:(details)=>{
        console.log(details);
        console.log("hereeeeeeee");
        count = parseInt(details.count)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION).
                updateOne({_id:objectId(details.cart),'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': count }
 
                    }).then(()=>{

                        resolve()
                    })
        })

    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count =0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count = cart.products.length
            }
            resolve(count)
        })
    },
    removeCartProduct:(product,user)=>{
        console.log(product)
        console.log(user);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({user:objectId(user), 'products.item': objectId(product) },
            {
                $pull:{products:{item:objectId(product)}}
            })
            resolve()
        })
    },
    getTotalAmount:(userId)=>{

        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            item:'$products.item',
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCTS_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                    },
                    {
                        $group:{
                            _id:null,
                            total:{$sum:{$multiply:['$quantity','$product.productprice']}}
                        }
                    }
                ]
            ).toArray()
            console.log(total[0].total);
            resolve(total[0].total)
        })
    },
    getSubTotalAmount:(userId)=>{

        return new Promise(async (resolve, reject) => {
            let Subtotal = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $project:{
                            item:'$products.item',
                            quantity:'$products.quantity'
                        }
                    },
                    {
                        $lookup:{
                            from:collection.PRODUCTS_COLLECTION,
                            localField:'item',
                            foreignField:'_id',
                            as:'product'
                        }
                    },
                    {
                        $project:{
                            item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                        }
                    },
                    {
                        $project:{
                            total:{$sum:{$multiply:['$quantity','$product.productprice']}}
                        }
                    }
                ]
            ).toArray()
            console.log("hereeeeee");
            console.log();
            resolve()
        })
    }
}