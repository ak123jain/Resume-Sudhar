import mongoose from "mongoose";

const connectDB = async() =>{
    try {
        const response = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.MONGO_DB_NAME}`, )
        console.log(`MongoDB connected: ${response.connection.host}`);
        
    } catch (error) {
        console.log(" akash : " , error);
        process.exit(1)
    }

    
}

export default connectDB