const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = 'mongodb+srv://username5263:ThisIsMyDbPass0228@cluster0.2bjd6of.mongodb.net/?retryWrites=true&w=majority';

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
  })
    .then(client => {
      console.log('Connected!');
      _db = client.db();
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
}

const getDb = () => {
  if (_db) {
    return _db;
  }

  throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;