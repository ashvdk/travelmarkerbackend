var express = require('express'); 
var bodyParser = require('body-parser');
const { dbconnection } = require('./dbconnection');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/', routes);

var port = process.env.PORT || 6000; 
app.listen(port, () => {
  console.log(`Server is listening at port ${port}`);
});