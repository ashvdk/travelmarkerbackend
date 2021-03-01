const routes = require('express').Router();
const dbconnection = require('../dbconnection');
const verifytoken = require('../verifytoken');

routes.get('/',(req,res) => {
  res.send('<h1>is ready</h1>');
})

routes.post('/user', verifytoken, (req, res) => {
  const { uid, email, displayName } = req.body;
  dbconnection.connect(err => {
    const collection = dbconnection.db("TravelLocationExplorer").collection("users");
    collection.findOne({ "_id": uid },function(err, user){
      if (err) console.log(err);
      if(!user){
        var userObj = { _id: uid, email, displayName };
        collection.insertOne(userObj, function(err, result) {
          if (err) console.log(err);
          if(result) res.status(200).send('Successful');
        });
      }
      res.status(200).send('Successful');
    });
    // dbconnection.close();
  });
});

routes.get('/user/:uid', verifytoken, (req, res) => {
  const { uid } = req.params;
  dbconnection.connect(err => {
    const collection = dbconnection.db("TravelLocationExplorer").collection("users");
    collection.aggregate([
      { $lookup:
        {
          from: 'locations',
          localField: "_id",
          foreignField: "uid",
          as: 'locationdetails'
        }
      }
    ]).toArray(function(err, user) {
      if (err) console.log(err);
      if(user){
        console.log(user[0]);
        res.status(200).send(user[0]);
      }
      else {
        res.status(401).send({"fault":{"faultstring":"User not found"}});
      }
    });
    // dbconnection.close();
  });
})

routes.post('/user/:uid/location', verifytoken, (req, res) => {
  const { uid } = req.params;
  const { name, description, coordinates, category,city } = req.body;
  dbconnection.connect(err => {
    const collection = dbconnection.db("TravelLocationExplorer").collection("locations");
    var locationObj = {
        name,
        uid,
        description,
        "opens at": "9AM to 6PM",
        location: { type: "Point",  coordinates: coordinates.split(", ") },
        category,
      city
    };
    collection.insertOne(locationObj, function(err, result) {
      if (err) res.status(400).send('Error');
      if(result) {
        console.log('Saved');
        console.log('inserted record', result.ops[0]);
        res.status(200).send({message: 'Successful', result: [result.ops[0]]});
      }
    });
    // dbconnection.close();
  });
});

module.exports = routes;