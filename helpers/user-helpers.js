const db = require('../config/connection')
const collection = require('../config/collections')
const objectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt')
module.exports = {

    validate:(userData)=>{
        console.log(userData);
        let userResponse={
            email : "",
            username : "",
            mobile : "",
            block : "",
            status : true
        }

        let emailCheck = true
        let mobileCheck = true
        let usernameCheck = true

        return new Promise(async(resolve,reject)=>{

            let checkEmail = await db.get().collection(collection.USERS_COLLECTION).findOne({email:userData.email})
            if(checkEmail){
                emailCheck = false
                userResponse.email = "Email is already exists"
            }
            let checkUsername = await db.get().collection(collection.USERS_COLLECTION).findOne({username:userData.username})
            if(checkUsername){
                usernameCheck = false
                userResponse.username = "Username is already exists"
            }
            let checkMobile = await db.get().collection(collection.USERS_COLLECTION).findOne({mobile:userData.mobile})
            if(checkMobile){
                mobileCheck = false
                userResponse.mobile = "Mobile Number already exists"
            }
            if(emailCheck && usernameCheck && mobileCheck){
                
                resolve(userResponse)

            }else{
   
                userResponse.status = false
                resolve(userResponse)

            }  
        })
    },

    
    doSignup:(userData)=>{
        
        console.log(userData);
        return new Promise(async(resolve,reject)=>{
    
            userData.password = await bcrypt.hash(userData.password,10)
            userData.isActive = "Block"
            userData.blockStatus = "Active"
            console.log(userData);
            db.get().collection(collection.USERS_COLLECTION).insertOne(userData).then((data)=>{
                
            resolve()
            })
        })
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            
            let response = {}
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({username:userData.username})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        
                        if(user.blockStatus === "Active"){

                            response.user = user
                            response.status = true
                            response.errormsg=""
                            resolve(response)
                        }else{

                            
                            response.status = false
                            response.errormsg="You Blocked by Admin"
                            resolve(response)

                        }

                    }else{
                        
                        response.status = false
                        response.errormsg="Invalid Password"
                        resolve(response)
                    }
                })
            }else{
                response.status = false
                response.errormsg="User not Found"
                resolve(response)
            }
        })
    },
    checkNumber:(number)=>{

        return new Promise(async(resolve,reject)=>{

            let mobRes = {}

            let userNum = await db.get().collection(collection.USERS_COLLECTION).findOne({mobile:number})
            if(userNum){
                mobRes.user = userNum
                mobRes.status = true
                resolve(mobRes)
            }else{
                mobRes.user = userNum
                mobRes.status = false
                resolve(mobRes)
            }
        })
    },
    getProduct:(id)=>{

        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection(collection.PRODUCTS_COLLECTION).findOne({ _id: objectId(id) })
            resolve(product)
        })
    },
    getSubCatProducts:(cat,sub)=>{
        return new Promise(async(resolve,reject)=>{
            let subProduct = await db.get().collection(collection.PRODUCTS_COLLECTION).find({productcategory:cat,productsubcategory:sub}).toArray()
            resolve(subProduct)
        })
    },
    getCatProducts:(cat)=>{
        return new Promise(async(resolve,reject)=>{
            let subProduct = await db.get().collection(collection.PRODUCTS_COLLECTION).find({productcategory:cat}).toArray()
            resolve(subProduct)
        })
    }
}