const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
module.exports = {

    doSignup:(userData)=>{
        console.log(userData);
        return new Promise(async(resolve,reject)=>{
            userData.password = await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USERS_COLLECTION).insertOne(userData).then((data)=>{
                resolve(data)
            })
        })
        
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({username:userData.username})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        response.user = user
                        response.status = true
                        resolve(response)
                    }else{
                        console.log("log fail");
                        resolve({status:false})
                    }
                })
            }else{
                resolve({status:false})
            }
        })
    }
}