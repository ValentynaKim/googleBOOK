var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require('body-parser');
var request = require('request');
var PORT = process.env.PORT || 3001;
var app = express();


// set the app up with bodyparser
app.use(bodyParser());

// Database configuration
var databaseUrl = process.env.MONGODB_URI || "books_db";
var collections = ["books"];

// Hook mongojs config to db variable
var db = mongojs(databaseUrl, collections);

// Log any mongojs errors to console
db.on("error", function (error) {
    console.log("Database Error:", error);
});

//allow the api to be accessed by other apps
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    next();
});

app.get("/", (req,res) => {
    res.send("server is working")
})


app.post("/getBookInfo", (req, res) => {
    let book = req.body.book
    request('https://www.googleapis.com/books/v1/volumes?q=' + book + "&projection=full&filter=ebooks", function (error, response, body) {
        if (error) {
            console.log(error)
            res.json({ error: true })
        } else {
            res.json(JSON.parse(body))
        }
    });
});

app.post("/saveBook", (req, res) => {
    var valid = true;
    if (valid) {
        let saved_book = req.body.saved_book;
        db.books.insert(saved_book, function (error, saved_book) {
            if (error) {
                res.send(error);
            } else {
                res.json(saved_book);
            }
        })
    } else {
        res.json({
            error: 'data was not valid'
        })
    }
})

app.get("/getBooks", function (req, res) {
    db.books.find({}, function (books, error) {
        if (error) {
            res.send(error)
        } else {
            res.send(books)
        }
    })
})

app.post("/deleteBook", (req, res) => {
    let id = req.body.id
    console.log(id)
    db.books.remove({
        "_id": mongojs.ObjectID(id)
    }, function (error, removed) {
        if (error) {
            res.send(error);
        } else {
            res.json(id);
        }
    });
})



// Listen on port 3001
app.listen(PORT, function () {
    console.log('🌎 ==> Now listening on PORT %s! Visit http://localhost:%s in your browser!', PORT, PORT);
});