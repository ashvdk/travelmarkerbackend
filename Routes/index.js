const routes = require('express').Router();
const dbconnection = require('../dbconnection');
const verifytoken = require('../verifytoken');

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
    collection.findOne({ "_id": uid },function(err, user){
      if (err) console.log(err);
      if(!user){
        response.status(401).send({"fault":{"faultstring":"User not found"}});
      } 
      else {
        console.log(user);
        res.status(200).send(user);
      }
      
    });
    // dbconnection.close();
  });
})

module.exports = routes;