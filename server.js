// require important things
var express = require("express");
var app = express();
var mongo = require("mongodb").MongoClient;

// declare variables
var connection = "mongodb://d0na1d:Trump@ds121015.mlab.com:21015/shorten";
var port = process.env.PORT || 8080;
var response = {};
app.use(express.static(__dirname));

// render home page with directions
app.get("/", (req, res, next) => {
  res.sendFile("index.html");
  next();
});

// send user to webpage from database
app.get("/redirect/:query", (req, res, next) => {
  var s = "redirect/" + req.params.query;
  var sendto = "";
  mongo.connect(connection, (err, db) => {
      if (err) throw err;
      var collection = db.collection("xxx");
      collection.findOne({ "shorter": s }, (err, result) => {
        if (err) throw err;
        sendto = "http://" + result.original;
        return res.redirect(sendto);
      });
    db.close();
  });
});
// store webpage in database
app.get("/:query(*)", (req, res, next) => {
  var url = req.params.query;
  if (url == "favicon.ico") {
    return;
  }
  var stamp = new Date().getTime();
  var reg = new RegExp(/\S+[.]\S\S+/);
  var space = new RegExp(/ /g);
  if (reg.test(url) && !space.test(url) && !url.includes("http:") && !url.includes("https:")) {
    response = { original: url, shorter: "redirect/" + stamp };
    mongo.connect(connection, (err, db) => {
      if (err) throw err;
      var collection = db.collection("xxx");
      collection.insert(response, (err, stuff) => {
        if (err) throw err;
        console.log("Successfully added " + response.original + " to database.");
      });
    db.close();
  });
  } else {
    response = "Error -- check URL for proper formatting!";
  }
  res.send(response);
  next();
});

// always use port 8080 on c9.io
app.listen(port, () => {
  console.log("We're listening for your URL requests on port " + port + "!");
});
