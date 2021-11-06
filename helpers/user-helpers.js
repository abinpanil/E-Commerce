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
            
            let response = {}
            let user = await db.get().collection(collection.USERS_COLLECTION).findOne({username:userData.username})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        response.user = user
                        response.status = true
                        response.errormsg=""
                        resolve(response)
                    }else{
                        console.log("log fail");
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
    }
}