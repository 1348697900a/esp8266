import { MongoClient } from "mongodb";

const connectMongoDB = async(url) => {
    const client = new MongoClient(url);
    
    try{
        await client.connect();
        console.log('success connected MongoDB!');
    }catch(e) {
        throw new Error("connected db fail...");
    }
    return client;
}
export default connectMongoDB;