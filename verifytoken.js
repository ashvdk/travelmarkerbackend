const { request } = require('express');
const firebaseadmin = require('./firebase');

module.exports = (request, response, next) => {
  if(request.headers.authorization){
    firebaseadmin.verifyIdToken(request.headers.authorization).then((decodedToken) => {
      const uid = decodedToken.uid;
      next();
    })
    .catch((error) => {
      response.status(401).send({"fault":{"faultstring":"Invalid access token"}});
    });
    
  }
  else{
    response.status(401).send({"fault":{"faultstring":"Invalid access token"}});
  }
  
}