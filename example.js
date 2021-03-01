const dbconnection = require('./dbconnection');

// dbconnection.connect(err => {
//   const collection = dbconnection.db("TravelLocationExplorer").collection("users");
//   collection.aggregate([
//     { $lookup:
//       {
//         from: 'locations',
//         pipeline: [
//           { $match: { uid: "GTTWHYcVkLU4B8dlorLTMgmmPi13" } },
//           { $group : { _id : "$city" } }
//         ],
//         as: 'locationdetails'
//       }
//     }
//   ]).toArray(function(err, res) {
//     if (err) throw err;
//     console.log(JSON.stringify(res));
//     dbconnection.close();
//   });
// });