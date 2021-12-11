const db = require('../config/connection')
const collection = require('../config/collections')
const objectId = require('mongodb').ObjectId;
const bcrypt = require('bcryptjs');
const moment = require('moment')
const { PRODUCTS_COLLECTION } = require('../config/collections');
const { response } = require('express');
const Razorpay = require('razorpay');
const { ObjectId } = require('bson');
const { resolve } = require('path');

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_ID || 'rzp_test_0nLdeWwVk1f3M2',
    key_secret: process.env.RAZORPAY_SECRET || 'XmQRWY1GycJfrZEdtSVHRhY2'
});

module.exports = {

    validate: (userData) => {

        let userResponse = {
            email: "",
            username: "",
            mobile: "",
            block: "",
            referal: "",
            status: true
        }

        let emailCheck = true
        let mobileCheck = true
        let usernameCheck = true
        let referalCheck = true

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
            if (userData.referal_code != '') {

                let checkRefferal = await db.get().collection(collection.USERS_COLLECTION).findOne({ refferalCode: userData.referal_code })
                if (checkRefferal) {
                    referalCheck = false
                    userResponse.referal = "Refferal code not valid"
                }

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


        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 10)
            userData.isActive = "Block"
            userData.blockStatus = "Active"
            userData.date = new Date()
            userData.coupon = []
            userData.wallet = 0
            userData.refferalCode = Math.floor(Math.random() * 10000)


            db.get().collection(collection.USERS_COLLECTION).insertOne(userData).then((data) => {

                let userId = ObjectId(data.insertedId).toString()
                resolve(userId)
            })
        })
    },
    addWalletAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ _id: objectId(userId) })

            wallet = user.wallet + 20
            await db.get().collection(collection.USERS_COLLECTION).updateOne(
                {
                    _id: objectId(userId)
                },
                {
                    $set: { wallet: wallet }
                }
            )
            resolve()
        })
    },
    checkReferalcode: (referalCofe) => {

        return new Promise(async (resolve, reject) => {
            let code = await db.get().collection(collection.USERS_COLLECTION).findOne({ refferalCode: referalCofe })
            if (code) {
                wallet = code.wallet + 25
                await db.get().collection(collection.USERS_COLLECTION).updateOne(
                    {
                        _id: code._id
                    },
                    {
                        $set: { wallet: wallet }
                    }
                )
                resolve({ value: true })
            } else {
                resolve({ value: false })
            }

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
    SignInWithGoogle: (payload) => {
        let email = payload.email
        let userData = {}
        userData.name = payload.given_name
        userData.username = payload.email
        userData.email = payload.email
        userData.mobile = ''
        userData.password = ''
        userData.isActive = "Block"
        userData.blockStatus = "Active"
        userData.date = new Date()
        userData.coupon = []
        userData.wallet = 0
        userData.refferalCode = Math.floor(Math.random() * 10000)

        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ email: email })

            if (user) {
                resolve(user)
            } else {

                await db.get().collection(collection.USERS_COLLECTION).insertOne(userData)

                user = await db.get().collection(collection.USERS_COLLECTION).findOne({ email: email })
                resolve(user)
            }
        })
    },
    createPassword: (passObj) => {

        return new Promise(async (resolve, reject) => {

            passObj.pass = await bcrypt.hash(passObj.pass, 10)

            db.get().collection(collection.USERS_COLLECTION).updateOne({ username: passObj.username }, { $set: { password: passObj.pass } }).then((data) => {

                resolve()
            })

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
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(id), status: true }
                }
            ]).toArray()
            resolve(product[0])
        })
    },
    getCouponForHome:()=>{
        return new Promise(async(resolve,reject)=>{
            let coupon = await db.get().collection(collection.COUPONS_COLLECTION).aggregate(
                [
                    {
                        $limit:1
                    }
                ]
            ).toArray()
            
            resolve(coupon[0])
        })
    },
    getLatestProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match:{status:true}
                    },
                    {
                        $sort:{createAt:-1}
                    },
                    {
                        $limit:12
                    }
                ]
            ).toArray()
            resolve(product)
        })
    },
    getSubCatProducts: (cat, sub) => {
        return new Promise(async (resolve, reject) => {
            let subProduct = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match: { productcategory: cat, productsubcategory: sub, status: true }
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
                        $match: { productcategory: cat, status: true }
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
    addToWishlist: (proId, userId) => {
        return new Promise(async (resolve, reject) => {

            let user = await db.get().collection(collection.WISHLIST_COLLESTION).find({ user: objectId(userId) }).toArray()

            if (user.length) {
                let flag = 0
                let products = user[0].products


                for (i = 0; i < products.length; i++) {

                    if (products[i] === proId) {
                        flag = 1
                        break;
                    }
                }
                if (flag === 1) {
                    db.get().collection(collection.WISHLIST_COLLESTION).updateOne(
                        {
                            user: objectId(userId)
                        },
                        {
                            $pull: { products: proId }
                        }
                    )

                    response.status = 2
                    resolve(response)
                } else {
                    db.get().collection(collection.WISHLIST_COLLESTION).updateOne(
                        {
                            user: objectId(userId)
                        },
                        {
                            $push: { products: proId }
                        }
                    )

                    response.status = 1
                    resolve(response)
                }
            } else {

                let wishlistObj = {
                    user: objectId(userId),
                    products: [proId]
                }
                await db.get().collection(collection.WISHLIST_COLLESTION).insertOne(wishlistObj)

                response.status = 1
                resolve(response)
            }
        })

    },
    getWishlistforCheck: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlist = await db.get().collection(collection.WISHLIST_COLLESTION).aggregate(
                [
                    {
                        $match: { user: objectId(userId) }
                    }
                ]
            ).toArray()
            if (wishlist.length != 0) {
                resolve(wishlist[0].products)
            } else {
                resolve(wishlist)
            }

        })
    },
    getWishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlist = await db.get().collection(collection.WISHLIST_COLLESTION).aggregate(
                [
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products'
                        }
                    }
                ]
            ).toArray()
            let wish = []
            for (i = 0; i < wishlist.length; i++) {
                let product = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                    [
                        {
                            $match: { _id: objectId(wishlist[i].item) }
                        }
                    ]
                ).toArray()
                wish.push(product[0])
            }
            resolve(wish)
        })
    },
    removeWishlistProduct: (userId, proId) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.WISHLIST_COLLESTION).updateOne(
                {
                    user: objectId(userId)
                },
                {
                    $pull: { products: proId }
                }
            )
            resolve()
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
                            item: 1, quantity: 1, product: 1, subTotal: { $multiply: ['$quantity', '$product.productprice'] },
                            offerSubTotal: { $multiply: ['$quantity', '$product.offer_price'] },
                            proOfferSubTotal: { $multiply: ['$quantity', '$product.productoffer_price'] }
                        }
                    }
                ]
            ).toArray()

            resolve(cartItems)
        })
    },
    changeProductQuantity: (details) => {

        count = parseInt(details.count)
        return new Promise(async (resolve, reject) => {

            let cart = await db.get().collection(collection.CART_COLLECTION).aggregate(
                [
                    {
                        $match:{_id: objectId(details.cart)}
                    },
                    {
                        $unwind:'$products'
                    },
                    {
                        $match:{'products.item':objectId(details.product)}
                    }
                ]
            ).toArray()
            
            if (cart[0].products.quantity === 1) {

                if (count != -1) {
                    console.log('true');
                    await db.get().collection(collection.CART_COLLECTION).
                        updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                            {
                                $inc: { 'products.$.quantity': count }

                            })
                    resolve.err = false
                }

            } else if (cart[0].products.quantity > 1) {
                await db.get().collection(collection.CART_COLLECTION).
                    updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': count }

                        })
                resolve.err = false
            } else {
                console.log('false');
                response.err = 1
            }
            resolve(response)
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
            if (checkPro) {

                if (checkPro.products != 0) {
                    let totalPrice = await db.get().collection(collection.CART_COLLECTION).aggregate(
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
                            }
                        ]
                    ).toArray()
                    let total = 0
                    for (i = 0; i < totalPrice.length; i++) {
                        let subtotal = 0
                        if (totalPrice[i].product.isOfferActive === true) {
                            if (totalPrice[i].product.isProOfferActive === true) {
                                if (totalPrice[i].product.offer_price > totalPrice[i].product.productoffer_price) {
                                    subtotal = totalPrice[i].quantity * totalPrice[i].product.productoffer_price
                                } else {
                                    subtotal = totalPrice[i].quantity * totalPrice[i].product.offer_price
                                }
                            } else {
                                subtotal = totalPrice[i].quantity * totalPrice[i].product.offer_price
                            }
                        } else if (totalPrice[i].product.isProOfferActive === true) {
                            subtotal = totalPrice[i].quantity * totalPrice[i].product.productoffer_price
                        } else {
                            subtotal = totalPrice[i].quantity * totalPrice[i].product.productprice
                        }

                        total = subtotal + total
                    }

                    resolve(total)
                } else {
                    resolve(0)
                }
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
                            product: 1,
                            subTotal: { $multiply: ['$quantity', '$product.productprice'] },
                            offerSubTotal: { $multiply: ['$quantity', '$product.offer_price'] },
                            proOfferSubTotal: { $multiply: ['$quantity', '$product.productoffer_price'] }
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
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ username: passObj.username })
            bcrypt.compare(passObj.currentPass, user.password).then((status) => {

                if (status) {


                    bcrypt.hash(passObj.newPass, 10).then((pass) => {
                        passObj.newPass = pass

                        db.get().collection(collection.USERS_COLLECTION).updateOne({ username: passObj.username }, { $set: { password: passObj.newPass } }).then((data) => {
                            response.status = true

                            resolve(response)
                        })

                    })

                } else {


                    response.status = false
                    response.errormsg = "Invalid Password"

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
    placeOrderCOD: (order, products, totalPrice, address, user) => {
        return new Promise((resolve, reject) => {

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

                resolve(orderId)
            })
        })
    },
    placeOrderOnline: (order, products, totalPrice, address, user) => {
        return new Promise((resolve, reject) => {

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

                let orderId = ObjectId(data.insertedId).toString()

                resolve(orderId)
            })
        })
    },
    deletePendingOrder: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).deleteMany({ status: 'pending' })
            resolve()
        })
    },
    clearUserCart: (user) => {
        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(user) }, { $set: { 'products': [] } })
            resolve()
        })
    },
    placeOrderDirect: (order, products, totalPrice, address, user) => {

        let proObj = {
            item: objectId(products),
            quantity: 1
        }
        return new Promise((resolve, reject) => {

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

                resolve(orderId)
            })
        })
    },
    userWalletClear: (userId) => {
        return new Promise(async (req, res) => {
            db.get().collection(collection.USERS_COLLECTION).updateOne(
                {
                    _id: objectId(userId)
                },
                {
                    $set: { wallet: 0 }
                }
            )
        })
    },
    getOrder: (userId) => {

        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match: { userId: objectId(userId) }
                    },
                    {
                        $sort: { date: -1 }
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

            resolve(user)
        })
    },
    getOrderedProduct: (oredrId) => {

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

        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId
            }
            instance.orders.create(options, function (err, order) {
                resolve(order)
            })
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            let hmac = crypto.createHmac('sha256', 'XmQRWY1GycJfrZEdtSVHRhY2')

            hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest("hex")

            if (hmac == details['payment[razorpay_signature]']) {

                resolve()
            } else {

                reject()
            }
        })
    },
    changePayementStatus: (orderId) => {

        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, { $set: { status: 'placed' } })

            resolve()
        })
    },
    getSearchProducts: (value) => {

        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match: {
                            $or: [
                                { productcategory: { $regex: value, $options: 'i' } },
                                { productsubcategory: { $regex: value, $options: 'i' } },
                                { productname: { $regex: value, $options: 'i' } },
                                { producttitle: { $regex: value, $options: 'i' } },
                                { productdiscription: { $regex: value, $options: 'i' } }
                            ]
                        }
                    },
                    {
                        $match: { status: true }
                    }
                ]
            ).toArray()

            resolve(products)
        })
    },
    applyCoupon: (couponCode, userId) => {

        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPONS_COLLECTION).aggregate(
                [
                    {
                        $match: { code: couponCode }
                    }
                ]
            ).toArray()
            response.coupon = null
            if (coupon[0]) {

                response.coupon = coupon[0]
                let user = await db.get().collection(collection.USERS_COLLECTION).findOne({ _id: objectId(userId) })
                /* checking this user this coupon used or not */
                response.err = null
                for (i = 0; i < user.coupon.length; i++) {

                    if (user.coupon[i] === couponCode) {
                        response.err = 1 /* user already used this coupon */
                    }
                }
            }
            resolve(response)
        })
    },
    addCouponToUser: (userId, coupon) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.USERS_COLLECTION).updateOne(
                {
                    _id: objectId(userId)
                },
                {
                    $push: { coupon: coupon }
                }
            ).then((e) => {

            })
            resolve()

        })
    }
}