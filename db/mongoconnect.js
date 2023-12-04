const mongoose = require('mongoose');
const {config} =require("../config/secret")

main().catch(err => console.log(err));

async function main() {
    mongoose.set('strictQuery' , false);
    
  await mongoose.connect(`mongodb+srv://${config.userDb}:${config.passDb}@cluster0.quhogj6.mongodb.net/toysProject`);
  // await mongoose.connect(`mongodb+srv://slb:slb123@cluster0.quhogj6.mongodb.net/toysProject`);
  console.log("mongo connect toys-project")

  
}