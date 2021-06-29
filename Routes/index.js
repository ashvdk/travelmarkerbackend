const routes = require('express').Router();
const dbconnection = require('../dbconnection');
const verifytoken = require('../verifytoken');
var ObjectID = require('mongodb').ObjectID;

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

  const { uid, email, displayName, username, photoURL, gender, description } = req.body;
  //console.log(photoURL);
  dbconnection.connect(err => {
    const collection = dbconnection.db("TravelLocationExplorer").collection("users");
    collection.find({ "username": username }).toArray(function (err, result) {
      if (err) throw err;
      //console.log(result);
      if (result.length > 0) {
        res.status(409).send({ message: "username already exists" });
      }
      else {
        var userObj = { _id: uid, email, displayName, username, photoURL, gender, description };
        collection.insertOne(userObj, function (err, result) {
          if (err) throw err;
          if (result) res.status(200).send({ message: "Successful" });
        });
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
routes.get('/user/:uid/getallclubs', verifytoken, (req, res) => {
  const { uid } = req.params;
  dbconnection.connect(err => {
    const collection = dbconnection.db("TravelLocationExplorer").collection("clubs");
    collection.find({ "uid": uid }).toArray(function (err, result) {
      if (err) throw err;
      //console.log(result);

      res.status(200).send({ message: 'Successful', result: [...result] });

    });
  });
});
routes.post('/user/:uid/createclub', verifytoken, (req, res) => {
  const { uid } = req.params;
  const newclub = req.body;
  dbconnection.connect(err => {
    const collection = dbconnection.db("TravelLocationExplorer").collection("clubs");
    var newclubobject = {
      ...newclub,
      uid
    };

    collection.insertOne(newclubobject, function (err, result) {
      if (err) res.status(400).send('Error');
      if (result) {
        console.log('Saved');
        console.log('inserted record', result.ops[0]);
        res.status(200).send({ message: 'Successful', result: result.ops[0] });
      }
    });

  });
});

routes.post('/user/:uid/location', verifytoken, (req, res) => {
  const { uid } = req.params;
  const { caption, locations, optimalCoordinates, optimalZoom } = req.body;
  dbconnection.connect(err => {
    const collection = dbconnection.db("TravelLocationExplorer").collection("locations");
    var locationObj = {
      caption,
      locations,
      uid,
      optimalCoordinates,
      optimalZoom
    };

    collection.insertOne(locationObj, function (err, result) {
      if (err) res.status(400).send('Error');
      if (result) {
        console.log('Saved');
        console.log('inserted record', result.ops[0]);
        res.status(200).send({ message: 'Successful', result: [result.ops[0]] });
      }
    });

  });
});

routes.get('/search', verifytoken, async (req, res) => {
  const { q, uid, option } = req.query;
  let finalresult = [];
  dbconnection.connect(async err => {
    const db = dbconnection.db("TravelLocationExplorer");
    async function getsearchedusername() {
      const usercollection = db.collection("users");
      return new Promise((resolve, reject) => {
        usercollection.find({ "username": q, _id: { $ne: uid } }).limit(5).toArray(function (err, result) {
          if (err)
            throw err;
          resolve(result);
          // finalresult = [...finalresult, ...result];
          // console.log(finalresult);
        });
      })
    }
    async function searchclub() {
      const clubscollection = db.collection("clubs");
      return new Promise((resolve, reject) => {
        clubscollection.createIndex({ clubname: "text", clubcategory: "text", clubdescription: "text" });
        clubscollection.find({ $text: { $search: q }, uid: { $ne: uid } }).toArray(function (err, result) {
          if (err)
            throw err;
          console.log(result);
          resolve(result)
        });
      })
    }
    if (option == "clubs") {
      let getclubresults = await searchclub();
      finalresult = [...finalresult, ...getclubresults];
    }
    else if (option == "people") {
      let getusername = await getsearchedusername();
      finalresult = [...finalresult, ...getusername];
    }
    res.status(200).send({ message: 'Successful', result: finalresult });
  });
});

routes.post('/user/addfollowing', verifytoken, (req, res) => {
  const { uid, followerid } = req.body;

  dbconnection.connect(err => {
    const relationshipcollection = dbconnection.db("TravelLocationExplorer").collection("relationship");
    var relationshipObj = {
      iam_uid: uid,
      followinghim_uid: followerid
    };
    relationshipcollection.insertOne(relationshipObj, function (err, result) {
      if (err) res.status(400).send('Error');
      if (result) {

        console.log('inserted record', result.ops[0]);
        res.status(200).send({ message: 'Successful', result: result.ops[0]['_id'] });
      }
    });
  });

});

routes.get('/user/:uid/getfollowersandfollwing', verifytoken, (req, res) => {
  const { uid } = req.params;
  dbconnection.connect(err => {
    const relationshipcollection = dbconnection.db("TravelLocationExplorer").collection("relationship");
    relationshipcollection.aggregate([
      { $match: { "followinghim_uid": uid } },
      {
        $lookup: {
          from: "users",
          localField: "iam_uid",
          foreignField: "_id",
          as: "users"
        }
      }
    ]).toArray(function (err, results) {
      res.status(200).send({ message: 'Successful', result: results });
      //console.log(results);
    })
    // relationshipcollection.find({ $or: [{ "iam_uid": uid }, { "followinghim_uid": uid }] }).toArray(function (err, result) {
    //   console.log(result);
    // })
  });
});

routes.get('/user/:uid/checkrelationship/:followerid', verifytoken, (req, res) => {
  const { uid, followerid } = req.params;
  dbconnection.connect(err => {
    const relationshipcollection = dbconnection.db("TravelLocationExplorer").collection("relationship");
    relationshipcollection.findOne({ "iam_uid": uid, followinghim_uid: followerid }, function (err, result) {
      if (result) {
        console.log(result);
        res.status(200).send({ message: 'Successful', result: result['_id'] });
      } else {
        res.status(400).send({ message: 'Not Successful' });
      }
    });
  });
});

routes.delete('/deletefollowing', verifytoken, (req, res) => {
  const id = req.query['_id'];

  dbconnection.connect(async err => {
    const relationshipcollection = dbconnection.db("TravelLocationExplorer").collection("relationship");
    const _id = new ObjectID(id);
    relationshipcollection.deleteOne({ _id: _id }, function (err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      res.status(200).send({ message: "Successful" });
    });
  });
});

module.exports = routes;