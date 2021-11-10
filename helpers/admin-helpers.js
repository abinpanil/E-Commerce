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
            let subCategory = categoryObj.subcategory
            let findCategory = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category })

            if (findCategory) {

                await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ category: category }, { $addToSet: { subCategory: { $each: [{ name: subCategory }] } } })
                let showCat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category })
                resolve(showCat)

            } else {

                await db.get().collection(collection.CATEGORY_COLLECTION).insertOne({ category: category })
                await db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ category: category }, { $addToSet: { subCategory: { $each: [{ name: subCategory }] } } })
                let showCat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ category: category })
                resolve(showCat)

            }

        })
    },
    getCategory: () => {

        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
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
                { $pull: { subCategory: { name: category.subCatName } } },
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
    deleteProduct: (id) => {


        return new Promise(async (resolve, reject) => {

            let a = await db.get().collection(collection.PRODUCTS_COLLECTION).deleteOne({ _id: objectId(id) })
           
            resolve()
        })


    },
    updateProduct:(data)=>{
        
        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).updateOne({ _id:objectId(data.id)}, {$set:{productname:data.productname, productdiscription:data.productdiscription, productprice:data.productprice, productquantity:data.productquantity, productsize:data.productsize, productcolour:data.productcolour, productcategory:data.productcategory, productsubcategory:data.productsubcategory }})
            
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
    editProductGet:(id)=>{
        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: objectId(id) })
            resolve(editpr)
        })
    },

    addProduct: (product) => {
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
    }

}