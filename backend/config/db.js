import mysql from 'mysql2'
const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    database: 'hr_policy_db'

})
db.connect((err)=>{
    if(err){

        console.log("problem in connecting database",err)
    }else{
        console.log('database connected successfully')
    }
})

export default db;