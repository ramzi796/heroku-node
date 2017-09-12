var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");

//'mongodb://marilyn:mongo123@ds129024.mlab.com:29024/calorie_counter';
var MONGO_CONNECTION_URL = 'mongodb://ramzi796:ramzi796@ds133044.mlab.com:33044/caloriedb';
var COLLECTION = {
    "fooddetails": "fooddetails",
    "fooddiary": "fooddiary"
};

var app = express();
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5008));

app.set('views', __dirname + '/views');

var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(MONGO_CONNECTION_URL, function (err, database) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    db = database;
    console.log("Database connected to Calorie Counter");
});

// app.get("/app/getFoodList",function(req,res){

//    var a = db.collection(COLLECTION.Calorie).find({});
//    console.log(a);
// });

app.get("/app/getFoodList", function (req, res) {
    db.collection(COLLECTION.fooddetails).find({
    }).toArray(function (err, docs) {
        if (err) {
            handleError(res, err.message, "");
        } else {
            if (docs.length > 0) {
                res.status(200).json(docs);
            } else {
                handleError(res, "");
            }
        }
    });
});


app.get("/app/getPreviousCalories", function (req, res) {
    var moment = require('moment');
    var yest = moment().add(-1, 'days').format('YYYY-MM-DD');
    var myDateTime = yest + "T00:00:00.000Z";

    var filtered = [];

    db.collection(COLLECTION.fooddiary).find({
            "dateConsumed": {
                "$eq": myDateTime
            }
        }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "");
            } else {
                console.log(docs);
                if (docs.length > 0) {
                    for (var i = 0; i < docs.length; i++) {
                        filtered.push(docs[i]);
                    }
                    res.status(200).json(filtered);
                } else {
                    console.log(res)
                }
            }
        });
});

app.get("/app/getFoodData", function (req, res) {
    var moment = require('moment');
    var localTime = moment().format('YYYY-MM-DD'); 
    var myDateTime = localTime + "T00:00:00.000Z";

    var filtered = [];

    db.collection(COLLECTION.fooddiary).find({
            "dateConsumed": {
                "$eq": myDateTime
            }
        }).toArray(function (err, docs) {
            if (err) {
                handleError(res, err.message, "");
            } else {
                console.log(docs);
                if (docs.length > 0) {
                    for (var i = 0; i < docs.length; i++) {
                        filtered.push(docs[i]);
                    }
                    res.status(200).json(filtered);
                } else {
                    console.log(res)
                }
            }
        });
});


app.post("/app/setCalories", function (req, res) {
    var data = req.query;
    var moment = require('moment');
    var localTime = moment().format('YYYY-MM-DD'); // store localTime
    var proposedDate = localTime + "T00:00:00.000Z";

    db.collection(COLLECTION.fooddiary).insertOne({
        "dateConsumed": proposedDate, 
                "calorieData": {
                    "quantity": data.quantity,
                    "timing": data.timing,
                    "calorieCount": data.calorieCount,
                    "foodName": data.foodName
                }
        }).then((resp) => {
            res.status(200).json({
                "success": "Data Successfully inserted"
            });
        }, (er) => {
            handleError(res, er.message, "Error inserting Data");
        });


});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});