const db = require('../config/connection')
const collection = require('../config/collections')
const objectId = require('mongodb').ObjectId;
const { response } = require('express');
const { ObjectId } = require('bson');

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
                await db.get().collection(collection.CATEGORY_COLLECTION).insertOne({ category: category , subCategory:[]})
                let showCat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category })
               
                resolve(showCat)
            }
        })
    },
    addSubcategory: (categoryObj) => {

        return new Promise(async (resolve, reject)=>{

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
                
            if(data.subCategory){
                console.log("true");
            }else{
                
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
                { $pull: { subCategory:category.subCatName } },
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
    deleteProductcategory:(category)=>{

        return new Promise(async(resolve,reject)=>{
            let productId = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ productcategory: category.catName })
            await db.get().collection(collection.PRODUCTS_COLLECTION).deleteOne({ productcategory: category.catName })
            console.log("hereeeeeeeeeeeeeeeeeeee");
            let objId = ObjectId(productId._id).toString()
            console.log(objId);
            resolve(objId)
        })
    },
    deleteProductSubcategory:(category)=>{

        return new Promise(async(resolve,reject)=>{
            let productId = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ productcategory: category.catName ,  productsubcategory: category.subCatName })
            await db.get().collection(collection.PRODUCTS_COLLECTION).deleteOne({ productcategory: category.catName ,  productsubcategory: category.subCatName })
           
            let objId = ObjectId(productId._id).toString()
            resolve(objId)
        })
    },
    deleteProduct: (id) => {


        return new Promise(async (resolve, reject) => {

            let a = await db.get().collection(collection.PRODUCTS_COLLECTION).deleteOne({ _id: objectId(id) })

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
        
        return new Promise((resolve, reject) => {

            db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(product).then((data) => {

                let objId = ObjectId(data.insertedId).toString()

                resolve(objId)
            })
        })

    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    getOrderforAdmin:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        })
    },
    changeOrderStatus:(data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(data.orderId)},{$set:{status:data.status}})
            resolve()
        })
    },
    addBanner:(data)=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.HOMEPAGE_COLLECTION).insertOne(data).then((data)=>{
                let objId = ObjectId(data.insertedId).toString()
                resolve(objId)
            })
        })
    }
    

}