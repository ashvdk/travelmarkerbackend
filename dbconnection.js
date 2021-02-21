const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://ashwinvdrk:ct100$ContentPlaceholder@cluster0.fktjd.mongodb.net/TravelLocationExplorer?retryWrites=true&w=majority";
const dbconnection = new MongoClient(uri, { useNewUrlParser: true });
module.exports = dbconnection;