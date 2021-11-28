const db = require('../config/connection')
const collection = require('../config/collections')
const objectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const moment = require('moment')
const { PRODUCTS_COLLECTION } = require('../config/collections');
const { response } = require('express');
const Razorpay = require('razorpay');
const { ObjectId } = require('bson');
const { resolve } = require('path');

var instance = new Razorpay({
    key_id: 'rzp_test_0nLdeWwVk1f3M2',
    key_secret: 'XmQRWY1GycJfrZEdtSVHRhY2',
});

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
            userData.date = new Date()
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
        console.log(id);
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
                {
                    $match:{_id: objectId(id) , status:true}
                }
            ]).toArray()
            resolve(product[0])
        })
    },
    getSubCatProducts: (cat, sub) => {
        return new Promise(async (resolve, reject) => {
            let subProduct = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match:{ productcategory: cat, productsubcategory: sub, status:true}
                    }
                ]
            ).toArray()
            resolve(subProduct)
        })
    },
    getCatProducts: (cat) => {
        return new Promise(async (resolve, reject) => {
            let subProduct = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match:{ productcategory: cat, status:true }
                    } 
                ]
            ).toArray()
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
                        updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }).then(() => {
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
    addToWishlist:()=>{

    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCTS_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: 1, subTotal: { $multiply: ['$quantity', '$product.productprice'] }
                        }
                    }
                ]
            ).toArray()

            resolve(cartItems)
        })
    },
    changeProductQuantity: (details) => {
        console.log(details);
        console.log("hereeeeeeee");
        count = parseInt(details.count)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).
                updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': count }

                    }).then(() => {

                        resolve()
                    })
        })

    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    removeCartProduct: (product, user) => {
        console.log(product)
        console.log(user);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ user: objectId(user), 'products.item': objectId(product) },
                    {
                        $pull: { products: { item: objectId(product) } }
                    })
            resolve()
        })
    },
    getTotalAmount: (userId) => {

        return new Promise(async (resolve, reject) => {

            let checkPro = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })

            if (checkPro.products != 0) {

                let total = await db.get().collection(collection.CART_COLLECTION).aggregate(
                    [
                        {
                            $match: { user: objectId(userId) }
                        },
                        {
                            $unwind: '$products'
                        },
                        {
                            $project: {
                                item: '$products.item',
                                quantity: '$products.quantity'
                            }
                        },
                        {
                            $lookup: {
                                from: collection.PRODUCTS_COLLECTION,
                                localField: 'item',
                                foreignField: '_id',
                                as: 'product'
                            }
                        },
                        {
                            $project: {
                                item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: { $multiply: ['$quantity', '$product.productprice'] } }
                            }
                        }
                    ]
                ).toArray()

                resolve(total[0].total)
            } else {
                resolve(0)
            }

        })
    },
    getSubTotalAmount: (details) => {

        return new Promise(async (resolve, reject) => {
            let Subtotal = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        $match: { _id: objectId(details.cart) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $match: {
                            item: objectId(details.product)
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCTS_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $project: {
                            subTotal: { $multiply: ['$quantity', '$product.productprice'] }
                        }
                    }
                ]
            ).toArray()
            resolve(Subtotal[0])
        })
    },
    addAddress: (newAddress) => {
        newAddress.user = objectId(newAddress.user)
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).insertOne(newAddress).then(() => {

                resolve()
            })
        })
    },
    editUser: (userObj) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.USERS_COLLECTION).updateOne({ username: userObj.username }, { $set: { name: userObj.name, username: userObj.username, email: userObj.email, mobile: userObj.mobile } })
            resolve()
        })
    },
    editPassword: (passObj) => {
        console.log(passObj);
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ username: passObj.username })
            bcrypt.compare(passObj.currentPass, user.password).then((status) => {

                if (status) {

                    console.log('true');
                    bcrypt.hash(passObj.newPass, 10).then((pass) => {
                        passObj.newPass = pass
                        console.log(passObj);
                        db.get().collection(collection.USERS_COLLECTION).updateOne({ username: passObj.username }, { $set: { password: passObj.newPass } }).then((data) => {
                            response.status = true
                            console.log(response);
                            resolve(response)
                        })

                    })

                } else {

                    console.log('false');
                    response.status = false
                    response.errormsg = "Invalid Password"
                    console.log(response);
                    resolve(response)
                }
            })
        })
    },
    getAddress: (user) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({ user: objectId(user) }).toArray()
            resolve(address)
        })
    },
    editAddress: (updateAddress) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ADDRESS_COLLECTION)
                .updateOne({ _id: objectId(updateAddress.id) }, {
                    $set: {
                        name: updateAddress.name, address: updateAddress.address,
                        town: updateAddress.town, zip: updateAddress.zip,
                        state: updateAddress.state, mobile: updateAddress.mobile
                    }
                })
            resolve()
        })
    },
    deleteAddress: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({ _id: objectId(data.id) })
            resolve()
        })
    },
    getCartProductForOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            resolve(cart.products)
        })
    },
    getAddressForOrder: (addressId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({ _id: objectId(addressId) })
            resolve(address)
        })
    },
    placeOrder: (order, products, totalPrice, address, user) => {
        return new Promise((resolve, reject) => {
            // console.log(order,products,totalPrice,address);
            let status = order.payment === 'Cash On Delivery' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    name: address.name,
                    address: address.address,
                    town: address.town,
                    zip: address.zip,
                    state: address.state,
                    mobile: address.mobile
                },
                userId: objectId(user),
                paymentMethod: order.payment,
                products: products,
                status: status,
                totalPrice: totalPrice,
                date: new Date(),
                displayDate: moment(new Date()).format('DD-MM-YYYY')
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((data) => {
                if (order.direct != true) {

                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(user) }, { $set: { 'products': [] } })
                }
                let orderId = ObjectId(data.insertedId).toString()
                // console.log(orderId);
                resolve(orderId)
            })
        })
    },
    placeOrderDirect:(order, products, totalPrice, address, user)=>{
        let proObj = {
            item: objectId(products),
            quantity: 1
        }
        return new Promise((resolve, reject) => {
            // console.log(order,products,totalPrice,address);
            let status = order.payment === 'Cash On Delivery' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    name: address.name,
                    address: address.address,
                    town: address.town,
                    zip: address.zip,
                    state: address.state,
                    mobile: address.mobile
                },
                userId: objectId(user),
                paymentMethod: order.payment,
                products: [proObj],
                status: status,
                totalPrice: totalPrice,
                date: new Date(),
                displayDate: moment(new Date()).format('DD-MM-YYYY')
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((data) => {

                let orderId = ObjectId(data.insertedId).toString()
                // console.log(orderId);
                resolve(orderId)
            })
        })
    },
    getOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match:{userId:objectId(userId)}
                    },
                    {
                        $sort:{date:-1}
                    }
                ]
            ).toArray()

            resolve(order)
        })
    },
    getProductsforOrder: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate().toArray()
            resolve(products)
        })
    },
    getUserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USERS_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(userId) }
                }
            ]).toArray()
            console.log(user);
            resolve(user)
        })
    },
    getOrderedProduct: (oredrId) => {
        console.log(oredrId);
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match: { _id: objectId(oredrId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            displayDate: 1, 
                            paymentMethod: 1,
                            status: 1,
                            deliveryDetails: 1,
                            date: 1,
                            totalPrice: 1,
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCTS_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            displayDate: 1, paymentMethod: 1, status: 1, deliveryDetails: 1, date: 1, totalPrice: 1, item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $project: {
                            displayDate: 1, paymentMethod: 1, status: 1, deliveryDetails: 1, date: 1, totalPrice: 1, item: 1, quantity: 1, product: 1, subTotal: { $multiply: ['$quantity', '$product.productprice'] }
                        }
                    }
                ]
            ).toArray()
            // console.log(order);
            resolve(order)

        })
    },
    changeStatus: (orderId) => {

        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, { $set: { status: 'cancel' } })
            resolve()
        })
    },
    generateRazorpay: (orderId, total) => {
        console.log(orderId,total);
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: ""+orderId
            }
            instance.orders.create(options, function(err,order){
                resolve(order)
            })
        })
    },
    verifyPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256','XmQRWY1GycJfrZEdtSVHRhY2')

            hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest("hex")
            console.log(hmac);
            if(hmac==details['payment[razorpay_signature]']){
                console.log("resolve");
                resolve()
              }else{
                  console.log('reject');
                reject()
              }
        })
    },
    changePayementStatus:(orderId)=>{
        console.log("in change");
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},{$set:{status:'placed'}})
            console.log("change status");
            resolve()
        })
    },
    getSearchProducts:(value)=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match:{
                            $or:[
                                {productcategory:value},
                                {productsubcategory:value}
                            ]
                        }
                    },
                    {
                        $match:{status:true}
                    }
                ]
            ).toArray()
            console.log(products);
            resolve(products)
        })
    }
}