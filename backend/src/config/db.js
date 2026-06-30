import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDb = async () => {
    try{
        const conn=await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDb Connected : ${conn.connection.host}`);
        
    }catch(err){
        console.error(`MongoDB Connection Error: ${err.message}`);
        process.exit(1); //1 represents failure 
    }
};

export default connectDb;