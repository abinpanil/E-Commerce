const db = require('../config/connection')
const collection = require('../config/collections')
const objectId = require('mongodb').ObjectId;
const { response } = require('express');
const { ObjectId } = require('bson');
const { promiseImpl } = require('ejs');
const { ORDER_COLLECTION } = require('../config/collections');

module.exports = {

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let usersList = await db.get().collection(collection.USERS_COLLECTION).find().toArray()

            resolve(usersList)
        })
    },
    addCategory: (categoryObj) => {

        return new Promise(async (resolve, reject) => {

            let category = categoryObj.category

            let findCategory = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category })
            if (findCategory) {

                let showCat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category })
                resolve(showCat)
            } else {
                await db.get().collection(collection.CATEGORY_COLLECTION).insertOne({ category: category, subCategory: [] })
                let showCat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category })

                resolve(showCat)
            }
        })
    },
    addSubcategory: (categoryObj) => {

        return new Promise(async (resolve, reject) => {

            let category = categoryObj.category
            let subCategory = categoryObj.subcategory
            await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ category: category }, { $addToSet: { subCategory: { $each: [subCategory] } } })
            let showCat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category })
            resolve(showCat)

        })



    },
    getCategory: () => {

        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            if (data.subCategory) {
            } else {
            }
            resolve(data)
        })
    },
    getSubCategory: (cat) => {

        return new Promise(async (resolve, reject) => {
            let subCat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: cat.category })

            resolve(subCat)
        })
    },
    deleteSubCategory: (category) => {

        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.CATEGORY_COLLECTION).updateOne(
                { category: category.catName },
                { $pull: { subCategory: category.subCatName } },
            );

            resolve()
        })

    },
    deleteCategory: (category) => {


        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ category: category.catName })

            resolve()
        })


    },
    deleteProductcategory: (category) => {

        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateMany(
                {
                    productcategory: category.catName
                },
                {
                    $set: { status: false }
                }
            )
            resolve()
        })
    },
    deleteProductSubcategory: (category) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateMany(
                {
                    productcategory: category.catName, productsubcategory: category.subCatName
                },
                {
                    $set: { status: false }
                }
            )
            resolve()
        })
    },
    deleteProduct: (id) => {


        return new Promise(async (resolve, reject) => {

            await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                {
                    _id: objectId(id)
                },
                {
                    $set: { status: false }
                }
            )

            resolve()
        })


    },
    updateProduct: (data) => {

        data.productquantity = parseInt(data.productquantity)
        data.productprice = parseInt(data.productprice)

        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: objectId(data.id) }, { $set: { productname: data.productname, productdiscription: data.productdiscription, productprice: data.productprice, productquantity: data.productquantity, productsize: data.productsize, productcolour: data.productcolour, productcategory: data.productcategory, productsubcategory: data.productsubcategory } })

            console.log(product);
            // let objId = ObjectId(product.insertedId).toString()

            resolve()
        })
    },
    blockUser: (userId) => {
        return new Promise(async (resolve, reject) => {

            let userCheck = await db.get().collection(collection.USERS_COLLECTION).findOne({ _id: objectId(userId) })

            if (userCheck.isActive == "Block") {
                db.get().collection(collection.USERS_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { isActive: "Unblock", blockStatus: "Block" } }).then((data) => {
                    console.log("Blocked");
                    resolve({ bloked: false });
                }).catch((err) => {
                    reject(err)
                })
            } else {
                db.get().collection(collection.USERS_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { isActive: "Block", blockStatus: "Active" } }).then((data) => {
                    console.log("unBlocked");
                    resolve({ bloked: true });
                }).catch((err) => {
                    reject(err)
                })
            }
        })
    },
    editProductGet: (id) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: objectId(id) })
            resolve(editpr)
        })
    },

    addProduct: (product) => {
        product.productquantity = parseInt(product.productquantity)
        product.productprice = parseInt(product.productprice)
        product.status = true
        product.createAt = new Date()
        product.offer_price = null
        product.productoffer_price = null
        product.isOfferActive = false
        product.isProOfferActive = false
        product.sales = 0

        return new Promise((resolve, reject) => {

            db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(product).then((data) => {

                let objId = ObjectId(data.insertedId).toString()

                resolve(objId)
            })
        })

    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match: { status: true }
                    }
                ]
            ).toArray()
            resolve(products)
        })
    },
    getOrderforAdmin: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $sort: { date: -1 }
                    }
                ]
            ).toArray()
            resolve(orders)
        })
    },
    changeOrderStatus: (data) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(data.orderId) }, { $set: { status: data.status } })
            if (data.status === 'delivered') {
                let order = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                    [
                        {
                            $match: {
                                _id: objectId(data.orderId)
                            }
                        },
                        {
                            $unwind: '$products'
                        },
                        {
                            $project: {
                                item: '$products.item',
                                quantity: '$products.quantity'
                            }
                        }
                    ]
                ).toArray()
                for (i = 0; i < order.length; i++) {
                    let product = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: order[i].item })

                    let sale = product.sales + order[i].quantity

                    db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id: order[i].item }, { $set: { sales: sale } })
                }
            }
            resolve()
        })
    },
    addBanner: (data) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.HOMEPAGE_COLLECTION).insertOne(data).then((data) => {
                let objId = ObjectId(data.insertedId).toString()
                resolve(objId)
            })
        })
    },
    getHomeData: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.HOMEPAGE_COLLECTION).aggregate().toArray()
            resolve(data)
        })
    },
    deleteBanner: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.HOMEPAGE_COLLECTION).deleteOne({ _id: objectId(id) })
            resolve()
        })
    },
    getReportData: (type) => {
        const numberOfDays = type === 'Daily' ? 1 : type === 'Weekly' ? 7 : type === 'Monthly' ? 30 : type === 'Yearly' ? 365 : 0
        const dayOfYear = (date) =>
            Math.floor(
                (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
            )
        return new Promise(async (resolve, reject) => {
            let report = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match: {
                            date: { $gte: new Date(new Date() - numberOfDays * 60 * 60 * 24 * 1000) }
                        }
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
                    },
                    {
                        $sort: { date: -1 }
                    }
                ]
            ).toArray()
            resolve(report)
        })
    },
    getTotalSales: () => {
        return new Promise(async (resolve, reject) => {
            let totalSales = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match: { status: 'delivered' }
                    },
                    {
                        $project: { total: { $sum: '$totalPrice' } }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$total' }
                        }
                    }
                ]
            ).toArray()
            resolve(totalSales[0].total)
        })
    },
    getTotalOrder: () => {
        return new Promise(async (resolve, reject) => {
            let totalOrder = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $group: {
                            _id: null,
                            total: { $sum: 1 }
                        }
                    }
                ]
            ).toArray()
            resolve(totalOrder[0].total)
        })
    },
    getTotalProducts: () => {
        return new Promise(async (resolve, reject) => {
            let totalProducts = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $group: {
                            _id: null,
                            productname: { $sum: 1 }
                        }
                    }
                ]
            ).toArray()
            resolve(totalProducts[0].productname)
        })
    },
    getCompletedOrder: () => {
        return new Promise(async (resolve, reject) => {
            let completedOrder = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match: { status: 'delivered' }
                    },
                    {
                        $group: {
                            _id: null,
                            status: { $sum: 1 }
                        }
                    }
                ]
            ).toArray()
            resolve(completedOrder[0].status)
        })
    },
    getPendingOrder: () => {
        return new Promise(async (resolve, reject) => {
            let pendingOrder = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match: { status: 'placed' }
                    },
                    {
                        $group: {
                            _id: null,
                            status: { $sum: 1 }
                        }
                    }
                ]
            ).toArray()
            resolve(pendingOrder[0].status)
        })
    },
    getCancellOrder: () => {
        return new Promise(async (resolve, reject) => {
            let cancelOrder = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match: { status: 'cancel' }
                    },
                    {
                        $group: {
                            _id: null,
                            status: { $sum: 1 }
                        }
                    }
                ]
            ).toArray()
            resolve(cancelOrder[0].status)
        })
    },
    getLastOrder: () => {
        return new Promise(async (resolve, reject) => {
            let latestOrders = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
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
                    },
                    {
                        $sort: { date: -1 }
                    },
                    {
                        $limit: 5
                    }
                ]
            ).toArray()
            resolve(latestOrders)
        })
    },
    getWeeklyUsers: async () => {
        const dayOfYear = (date) =>
            Math.floor(
                (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
            )
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection(collection.USERS_COLLECTION).aggregate([
                {
                    $match: {
                        date: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                {
                    $group: { _id: { $dayOfYear: '$date' }, count: { $sum: 1 } }
                },
            ]).toArray()
            const thisday = dayOfYear(new Date())
            let salesOfLastWeekData = []
            for (let i = 0; i < 8; i++) {
                let count = data.find((d) => d._id === thisday + i - 7)

                if (count) {
                    salesOfLastWeekData.push(count.count)
                } else {
                    salesOfLastWeekData.push(0)
                }
            }
            resolve(salesOfLastWeekData)

        })
    },
    getWeeklySales: () => {
        const dayOfYear = (date) =>
            Math.floor(
                (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
            )
        return new Promise(async (resolve, reject) => {
            const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                {
                    $group: { _id: { $dayOfYear: '$date' }, count: { $sum: 1 } }
                },
            ]).toArray()
            const thisday = dayOfYear(new Date())
            let salesOfLastWeekData = []
            for (let i = 0; i < 8; i++) {
                let count = data.find((d) => d._id === thisday + i - 7)

                if (count) {
                    salesOfLastWeekData.push(count.count)
                } else {
                    salesOfLastWeekData.push(0)
                }
            }
            resolve(salesOfLastWeekData)

        })
    },
    getCategories: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $group: {
                            _id: '$productcategory',
                            count: { $sum: 1 }
                        }
                    }
                ]
            ).toArray()
            let categorydata = []
            let categories = []
            for (let i = 0; i < data.length; i++) {
                categorydata.push(data[i].count)
                categories.push(data[i]._id)
            }
            cat = {
                catData: categorydata,
                catNames: categories
            }
            resolve(cat)
        })
    },
    getOrdersStatus: () => {
        return new Promise(async (resolve, reject) => {
            const dayOfYear = (date) =>
                Math.floor(
                    (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
                )
            const cancel = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                {
                    $match: { status: 'cancel' }
                },
                {
                    $group: { _id: { $dayOfYear: '$date' }, count: { $sum: 1 } }
                }
            ]).toArray()
            const thisday = dayOfYear(new Date())
            let cancelOrder = []
            for (let i = 0; i < 8; i++) {
                let count = cancel.find((d) => d._id === thisday + i - 7)

                if (count) {
                    cancelOrder.push(count.count)
                } else {
                    cancelOrder.push(0)
                }
            }

            const pending = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                {
                    $match: { status: 'pending' }
                },
                {
                    $group: { _id: { $dayOfYear: '$date' }, count: { $sum: 1 } }
                }
            ]).toArray()

            let pendingOrder = []
            for (let i = 0; i < 8; i++) {
                let count = pending.find((d) => d._id === thisday + i - 7)

                if (count) {
                    pendingOrder.push(count.count)
                } else {
                    pendingOrder.push(0)
                }
            }

            const placed = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                {
                    $match: { status: 'placed' }
                },
                {
                    $group: { _id: { $dayOfYear: '$date' }, count: { $sum: 1 } }
                }
            ]).toArray()

            let placedOrder = []
            for (let i = 0; i < 8; i++) {
                let count = placed.find((d) => d._id === thisday + i - 7)

                if (count) {
                    placedOrder.push(count.count)
                } else {
                    placedOrder.push(0)
                }
            }

            const confirm = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                {
                    $match: { status: 'confirm' }
                },
                {
                    $group: { _id: { $dayOfYear: '$date' }, count: { $sum: 1 } }
                }
            ]).toArray()

            let confirmOrder = []
            for (let i = 0; i < 8; i++) {
                let count = confirm.find((d) => d._id === thisday + i - 7)

                if (count) {
                    confirmOrder.push(count.count)
                } else {
                    confirmOrder.push(0)
                }
            }

            const delivered = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },

                {
                    $match: { status: 'delivered' }
                },
                {
                    $group: { _id: { $dayOfYear: '$date' }, count: { $sum: 1 } }
                }
            ]).toArray()

            let deliveredOrder = []
            for (let i = 0; i < 8; i++) {
                let count = delivered.find((d) => d._id === thisday + i - 7)

                if (count) {
                    deliveredOrder.push(count.count)
                } else {
                    deliveredOrder.push(0)
                }
            }

            let orderData = {
                placed: placedOrder,
                cancel: cancelOrder,
                pending: pendingOrder,
                delivered: deliveredOrder,
                confirm: confirmOrder
            }

            resolve(orderData)
        })
    },
    getSalesData: () => {
        return new Promise(async (resolve, reject) => {
            const dayOfYear = (date) =>
                Math.floor(
                    (date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
                )
            const total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        date: { $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000) },
                    },
                },
                {
                    $group: { _id: { $dayOfYear: '$date' }, count: { $sum: '$totalPrice' } }
                }
            ]).toArray()
            const thisday = dayOfYear(new Date())
            let totalSales = []
            for (let i = 0; i < 8; i++) {
                let count = total.find((d) => d._id === thisday + i - 6)

                if (count) {
                    totalSales.push(count.count)
                } else {
                    totalSales.push(0)
                }
            }
            resolve(totalSales)
        })
    },
    addCoupon: (couponDetails) => {
        couponDetails.discount = parseInt(couponDetails.discount)
        couponDetails.min_amount = parseInt(couponDetails.min_amount)
        couponDetails.Max_use = parseInt(couponDetails.Max_use)
        couponDetails.status = true
        return new Promise(async (resolve, reject) => {
            let valid = await db.get().collection(collection.COUPONS_COLLECTION).findOne({code:couponDetails.code})
            if(valid){
                response.err = 1
                resolve(response)
            }else{
                
                let id = await db.get().collection(collection.COUPONS_COLLECTION).insertOne(couponDetails)
                let objId = ObjectId(id.insertedId).toString()
                couponDetails.id = objId
                resolve(couponDetails)
            }
            
        })
    },
    getCoupon: () => {
        return new Promise(async (resolve, reject) => {
            let coupons = await db.get().collection(collection.COUPONS_COLLECTION).aggregate(
                [
                    {
                        $match: { status: true }
                    }
                ]
            ).toArray()
            resolve(coupons)
        })
    },
    deleteCoupon: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.COUPONS_COLLECTION).deleteOne(
                {
                    _id: objectId(id)
                }
            )
            resolve()
        })
    },
    addCategoryOffer: (obj) => {
        obj.categoryoffer_expiredate = new Date(obj.categoryoffer_expiredate)
        obj.categoryoffer_discount = parseInt(obj.categoryoffer_discount)
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match: { productcategory: obj.offer_category }
                    }
                ]
            ).toArray()
            for (let i = 0; i < products.length; i++) {
                offer = products[i].productprice * obj.categoryoffer_discount / 100
                offer_price = products[i].productprice - offer
                products[i].offer_price = offer_price

                await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                    {
                        _id: objectId(products[i]._id)
                    },
                    {
                        $set: { offer_price: products[i].offer_price, categoryoffer_discount: obj.categoryoffer_discount, categoryoffer_expiredate: obj.categoryoffer_expiredate, categoryoffer_description: obj.categoryoffer_description, isOfferActive: true }
                    }
                )
            }

            await db.get().collection(collection.CATEGORY_COLLECTION).updateOne(
                {
                    category: obj.offer_category
                },
                {
                    $set: { categoryoffer_discount: obj.categoryoffer_discount, categoryoffer_expiredate: obj.categoryoffer_expiredate, categoryoffer_description: obj.categoryoffer_description, isOfferActive: true }
                }
            )
            resolve();

        })
    },
    getOfferCategory: () => {
        return new Promise(async (resolve, reject) => {
            let offerCategory = await db.get().collection(collection.CATEGORY_COLLECTION).aggregate(
                [
                    {
                        $match: { isOfferActive: true }
                    }
                ]
            ).toArray()
            resolve(offerCategory)
        })
    },
    deleteCategoryOffer: (category) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.CATEGORY_COLLECTION).updateOne(
                {
                    category: category
                },
                {
                    $set: { categoryoffer_discount: "", categoryoffer_expiredate: "", categoryoffer_description: "", isOfferActive: false }
                }
            )
            await db.get().collection(collection.PRODUCTS_COLLECTION).updateMany(
                {
                    productcategory: category
                },
                {
                    $set: { offer_price: null, categoryoffer_discount: "", categoryoffer_expiredate: "", categoryoffer_description: "", isOfferActive: false }
                }
            )
            resolve()
        })
    },
    getOrderSortedRange: (from, to) => {
        return new Promise(async (resolve, reject) => {
            // const data = await ORDER.aggregate([{$match:{$and:[{date:{$gte:new Date(from)}},{date:{$lte:new Date(to)}}]}},
            const data = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match: { $and: [{ date: { $lte: new Date(to) } }, { date: { $gte: new Date(from) } }] }
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
                    },
                    {
                        $sort: { date: -1 }
                    }
                ]
            ).toArray()
            resolve(data)
        })
    },
    getProductforOffer: (data) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match: { productcategory: data.category, productsubcategory: data.subCategory, isProOfferActive: false }
                    }
                ]
            ).toArray()
            resolve(products)
        })
    },
    addProductOffer: (data) => {
        data.productoffer_discount = parseInt(data.productoffer_discount)
        data.productoffer_expiredate = new Date(data.productoffer_expiredate)
        return new Promise(async (resolve, reject) => {

            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: objectId(data.id) })

            offer = product.productprice * data.productoffer_discount / 100
            offer_price = product.productprice - offer
            data.productoffer_price = offer_price

            await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                {
                    _id: objectId(data.id)
                },
                {
                    $set: { isProOfferActive: true, productoffer_discount: data.productoffer_discount, productoffer_expiredate: data.productoffer_expiredate, productoffer_description: data.productoffer_description, productoffer_price: data.productoffer_price }
                }
            )
            let offerProduct = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match: { _id: objectId(data.id) }
                    }
                ]
            ).toArray()
            resolve(offerProduct[0])

        })
    },
    getActiveOfferProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match: { isProOfferActive: true }
                    }
                ]
            ).toArray()
            resolve(products)
        })
    },
    deleteProductOffer: (proId) => {
        return new Promise(async (resolve, reject) => {

            db.get().collection(collection.PRODUCTS_COLLECTION).updateOne(
                {
                    _id: objectId(proId)
                },
                {
                    $set: { isProOfferActive: false, productoffer_discount: '', productoffer_expiredate: '', productoffer_description: '', productoffer_price: null }
                }
            )
            resolve()
        })
    },
    topSellingProducts: () => {
        return new Promise(async (resolve, reject) => {
            let report = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $match:{status:true}
                    },
                    {
                        $sort: { sales: -1 }
                    }
                ]
            ).toArray()
            resolve(report)
        })
    },
    transactionReport: () => {
        return new Promise(async (resolve, reject) => {
            let report = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $sort: { date: -1 }
                    }
                ]
            ).toArray()
            resolve(report)
        })
    },
    getSearchedProductForProOffer:(proName)=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({
                productname:{$regex:proName,$options:'i'}
            }).toArray()
            if(products.length){
                resolve(products)
            }else{
                products = await db.get().collection(collection.PRODUCTS_COLLECTION).find({
                    producttitle:{$regex:proName,$options:'i'}
                }).toArray()
                resolve(products)
            }
            
            
        })
    },
    checExpire: () => {
        return new Promise(async (resolve, reject) => {
            let today = new Date()
            let coupon = await db.get().collection(collection.COUPONS_COLLECTION).aggregate().toArray()
            if (coupon.length) {
                for (i = 0; i < coupon.length; i++) {
                    if (coupon[i].date < today) {

                        db.get().collection(collection.COUPONS_COLLECTION).deleteOne(
                            {
                                _id: coupon[i]._id
                            }
                        )
                    }
                }
            }
            let categoryOffer = await db.get().collection(collection.CATEGORY_COLLECTION).aggregate().toArray()

            if (categoryOffer.length) {

                for (i = 0; i < categoryOffer.length; i++) {

                    if (categoryOffer[i].isOfferActive === true) {
                        if (categoryOffer[i].categoryoffer_expiredate < today) {
                            db.get().collection(collection.CART_COLLECTION).updateMany(
                                {
                                    _id: categoryOffer[i]._id
                                },
                                {
                                    $set: { categoryoffer_discount: "", categoryoffer_expiredate: "", categoryoffer_description: "", isOfferActive: false }
                                }
                            )
                            db.get().collection(collection.PRODUCTS_COLLECTION).updateMany(
                                {
                                    productcategory: categoryOffer[i].category
                                },
                                {
                                    $set: { offer_price: null, categoryoffer_discount: "", categoryoffer_expiredate: "", categoryoffer_description: "", isOfferActive: false }
                                }
                            )
                        }
                    }
                }
            }
            let proOffer = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate().toArray()

            if (proOffer.length) {

                for (i = 0; i < proOffer.length; i++) {

                    if (proOffer[i].isProOfferActive === true) {

                        if (proOffer[i].productoffer_expiredate < today) {

                            db.get().collection(collection.PRODUCTS_COLLECTION).updateMany(
                                {
                                    _id: proOffer[i]._id
                                },
                                {
                                    $set: { isProOfferActive: false, productoffer_discount: '', productoffer_expiredate: '', productoffer_description: '', productoffer_price: null }
                                }
                            )
                        }
                    }
                }
            }

            resolve()
        })
    }
}