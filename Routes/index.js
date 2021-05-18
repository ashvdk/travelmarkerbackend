const routes = require('express').Router();
const dbconnection = require('../dbconnection');
const verifytoken = require('../verifytoken');

routes.get('/', (req, res) => {
  res.send('<h1>is ready</h1>');
})

routes.get('/getuserdetails/:uid', verifytoken, (req, res) => {
  const { uid } = req.params;
  dbconnection.connect(err => {
    const collection = dbconnection.db("TravelLocationExplorer").collection("users");
    collection.findOne({ "_id": uid }, function (err, user) {
      if (err) console.log(err);
      if (!user) {
        res.status(200).send({ message: "NO_USERNAME_FOUND" });
      }
      else {
        res.status(200).send({ message: "USERNAME_FOUND" });
      }
    });
  });
});

routes.post('/user', verifytoken, (req, res) => {

  const { uid, email, displayName, username } = req.body;
  dbconnection.connect(err => {
    const collection = dbconnection.db("TravelLocationExplorer").collection("users");
    collection.findOne({ "_id": uid }, function (err, user) {
      if (err) console.log(err);
      if (!user) {
        var userObj = { _id: uid, email, displayName, username };
        collection.insertOne(userObj, function (err, result) {
          if (err) console.log(err);
          if (result) res.status(200).send({ message: "Successful" });
        });
      }
      else {
        res.status(200).send({ message: "Successful" });
      }

    });
    // dbconnection.close();
  });
});

routes.get('/user/:uid', verifytoken, (req, res) => {
  const { uid } = req.params;
  dbconnection.connect(err => {
    const usercollection = dbconnection.db("TravelLocationExplorer").collection("users");
    const locationscollection = dbconnection.db("TravelLocationExplorer").collection("locations");
    usercollection.findOne({ "_id": uid }, function (err, user) {
      if (user) {
        console.log(user);
        locationscollection.find({ uid: uid }, async function (err, result) {
          var myResult = await result.toArray();
          var finalResultObject = {
            user,
            locations: myResult
          };
          res.status(200).send({ message: 'Successful', result: finalResultObject });
        })
      }
      else {
        res.status(422).send({ message: "no user found" });
      }
    });
    // collection.aggregate([
    //   {
    //     $lookup:
    //     {
    //       from: 'locations',
    //       localField: "_id",
    //       foreignField: "uid",
    //       as: 'locationdetails'
    //     }
    //   }
    // ]).toArray(function (err, user) {
    //   if (err) console.log(err);
    //   if (user) {
    //     console.log(user[0]);
    //     res.status(200).send(user[0]);
    //   }
    //   else {
    //     res.status(401).send({ "fault": { "faultstring": "User not found" } });
    //   }
    // });
  });
})

routes.post('/user/:uid/location', verifytoken, (req, res) => {
  const { uid } = req.params;
  const { name, description, coordinates, category, city } = req.body;
  dbconnection.connect(err => {
    const collection = dbconnection.db("TravelLocationExplorer").collection("locations");
    var locationObj = {
      name,
      uid,
      description,
      "opens at": "9AM to 6PM",
      location: { type: "Point", coordinates: coordinates.split(", ") },
      category,
      city
    };
    collection.insertOne(locationObj, function (err, result) {
      if (err) res.status(400).send('Error');
      if (result) {
        console.log('Saved');
        console.log('inserted record', result.ops[0]);
        res.status(200).send({ message: 'Successful', result: [result.ops[0]] });
      }
    });
    // dbconnection.close();
  });
});

routes.get('/searchusername/:username', verifytoken, (req, res) => {
  const { username } = req.params;
  console.log(username);
  dbconnection.connect(async err => {
    const usercollection = dbconnection.db("TravelLocationExplorer").collection("users");
    usercollection.find({ "username": username }).limit(5).toArray(function (err, result) {
      if (err) throw err;
      res.status(200).send({ message: 'Successful', result });
    });

  });
});

routes.post('/user/addfollowing', verifytoken, (req, res) => {
  const { uid, followerid } = req.body;

  dbconnection.connect(err => {
    const relationshipcollection = dbconnection.db("TravelLocationExplorer").collection("relationship");
    var relationshipObj = {
      uid,
      followerid
    };
    relationshipcollection.insertOne(relationshipObj, function (err, result) {
      if (err) res.status(400).send('Error');
      if (result) {

        console.log('inserted record', result.ops[0]);
        res.status(200).send({ message: 'Successful', result: "Following" });
      }
    });
  });

});

routes.get('/user/:uid/checkrelationship/:followerid', verifytoken, (req, res) => {
  const { uid, followerid } = req.params;
  dbconnection.connect(err => {
    const relationshipcollection = dbconnection.db("TravelLocationExplorer").collection("relationship");
    relationshipcollection.findOne({ "uid": uid, followerid: followerid }, function (err, result) {
      if (result) {
        console.log(result);
        res.status(200).send({ message: 'Successful', result: "Following" });
      } else {
        res.status(200).send({ message: 'Not Successful', result: "Follow" });
      }
    });
  });
});

module.exports = routes;