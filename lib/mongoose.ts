import mongoose from 'mongoose';

let isConnected :boolean=false;

export const connectToDatabase= async ()=>{
    mongoose.set('strictQuery',true)

    if(!process.env.MONGODB_URL) return console.log("Missing MONGODB_URL")


    if(isConnected){
       return  console.log('Mongo Db Connected')
    }
    try{
     await mongoose.connect(process.env.MONGODB_URL,{
        dbName:'askdevs'
     })

     isConnected =true;
     console.log('MongoDB connected')
    }catch(error){
      console.log(error)
    }
}