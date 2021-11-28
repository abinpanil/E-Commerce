const db = require('../config/connection')
const collection = require('../config/collections')
const objectId = require('mongodb').ObjectId;
const { response } = require('express');
const { ObjectId } = require('bson');
const { promiseImpl } = require('ejs');

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
            console.log(findCategory);
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
                console.log("true");
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
                    $set:{status:false}
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
                    $set:{status:false}
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
                    $set:{status:false}
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

            resolve(product)
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
                        $match:{status:true}
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
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(data.orderId) }, { $set: { status: data.status } })
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
        console.log(type);
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
                        $match:{status:'delivered'}
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
            console.log(totalSales);
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
            console.log(totalOrder);
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
            console.log(totalProducts);
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
            console.log(completedOrder);
            resolve(completedOrder[0].status)
        })
    },
    getPendingOrder: () => {
        return new Promise(async (resolve, reject) => {
            let pendingOrder = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match: { status: 'pending' }
                    },
                    {
                        $group: {
                            _id: null,
                            status: { $sum: 1 }
                        }
                    }
                ]
            ).toArray()
            console.log(pendingOrder);
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
            console.log(cancelOrder);
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
            console.log(latestOrders);
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
            console.log(salesOfLastWeekData);
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
            console.log(salesOfLastWeekData);
            resolve(salesOfLastWeekData)

        })
    },
    getCategories:()=>{
        return new Promise(async(resolve,reject)=>{
            let data = await db.get().collection(collection.PRODUCTS_COLLECTION).aggregate(
                [
                    {
                        $group:{
                            _id:'$productcategory',
                            count:{$sum:1}
                        }
                    }
                ]
            ).toArray()
            let categorydata = []
            let categories = []
            for(let i = 0 ; i<data.length;i++){
                categorydata.push(data[i].count)
                categories.push(data[i]._id)
            }
            cat = {
                catData : categorydata,
                catNames : categories
            }
            console.log(categories);
            console.log(categorydata);
            resolve(cat)
        })
    },
    getOrdersStatus:()=>{
        return new Promise(async(resolve,reject)=>{
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
                    $match: { status:'cancel' }
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
                    $match: { status:'pending' }
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
                    $match: { status:'placed' }
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
                    $match: { status:'confirm' }
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
                    $match: { status:'delivered' }
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
                placed : placedOrder,
                cancel : cancelOrder,
                pending : pendingOrder,
                delivered : deliveredOrder,
                confirm : confirmOrder
            }
            
            resolve(orderData)
        })
    },
    getSalesData:()=>{
        return new Promise(async(resolve,reject)=>{
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
                    $group: { _id: { $dayOfYear: '$date' }, count: { $sum:'$totalPrice'} }
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
    addCoupon:(couponDetails)=>{
        couponDetails.status = true
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.COUPONS_COLLECTION).insertOne(couponDetails)
            resolve(couponDetails)
        })
    },
    getCoupon:()=>{
        return new Promise(async(resolve,reject)=>{
            let coupons = await db.get().collection(collection.COUPONS_COLLECTION).aggregate(
                [
                    {
                        $match:{status:true}
                    }
                ]
            ).toArray()
            resolve(coupons)
        })
    },
    deleteCoupon:(id)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection(collection.COUPONS_COLLECTION).updateOne(
                {
                    _id:objectId(id)
                },
                {
                    $set:{status:false}
                }
                )
            resolve()
        })
    }
}