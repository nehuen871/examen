const http = require('http');
const $ = require('jquery');

const hostname = '127.0.0.1';
const port = 3000;

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'test_1';

const server = http.createServer((req, res) => {
  switch(req.method) {
    case "GET":
        responseDataGet(res,req.method);
        break;
    case "POST":
        responseDataPost(res,req);
        break;
    case "DELETE":
        responseData(res,req.method);
        break;
    default:
        responseData(res,req.method);
  } 
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function responseDataPost(res,request){
  processPost(request, response, function() {
    console.log(request.post);
    // Use request.post here

    response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
    response.end();
  });
}

function responseDataGet(res,metodo){
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Metodo ' + metodo);

    // Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  /*insertDocuments(db, function() {
    client.close();
  });*/

  findDocuments(db, function() {
    client.close();
  });
/*

  insertDocuments(db, function() {
    findDocuments(db, function() {
      client.close();
    });
  });

  insertDocuments(db, function() {
    updateDocument(db, function() {
      client.close();
    });
  });


  insertDocuments(db, function() {
    updateDocument(db, function() {
      removeDocument(db, function() {
        client.close();
      });
    });
  });*/

  client.close();
});

}


const insertDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Insert some documents
  collection.insertMany([
    {a : 1}, {a : 2}, {a : 3}
  ], function(err, result) {
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
}

const findDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Find some documents
  collection.find({}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs)
    callback(docs);
  });
}

/*const findDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Find some documents
  collection.find({'a': 3}).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    console.log(docs);
    callback(docs);
  });
}*/

const updateDocument = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Update document where a is 2, set b equal to 1
  collection.updateOne({ a : 2 }
    , { $set: { b : 1 } }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Updated the document with the field a equal to 2");
    callback(result);
  });
}

const removeDocument = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('documents');
  // Delete document where a is 3
  collection.deleteOne({ a : 3 }, function(err, result) {
    assert.equal(err, null);
    assert.equal(1, result.result.n);
    console.log("Removed the document with the field a equal to 3");
    callback(result);
  });
}

function processPost(request, response, callback) {
  var queryData = "";
  if(typeof callback !== 'function') return null;

  if(request.method == 'POST') {
      request.on('data', function(data) {
          queryData += data;
          if(queryData.length > 1e6) {
              queryData = "";
              response.writeHead(413, {'Content-Type': 'text/plain'}).end();
              request.connection.destroy();
          }
      });

      request.on('end', function() {
          request.post = querystring.parse(queryData);
          callback();
      });

  } else {
      response.writeHead(405, {'Content-Type': 'text/plain'});
      response.end();
  }
}