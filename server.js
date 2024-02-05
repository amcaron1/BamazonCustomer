//  Loads environment variables from a .env file into process.env
require('dotenv').config()
// express handles web requests (GET, POST, etc)
var express = require("express");
// During execution, morgan logs requests to bash
var logger = require("morgan");
// mysql stores the database
var mysql = require("mysql2");

// Initializes PORT
var PORT = process.env.PORT || 3000;

// Initializes express
var app = express();

// Sets morgan to development mode
app.use(logger("dev"));
// Parses POST or PUT requests as strings or arrays
app.use(express.urlencoded({ extended: true }));
// Parses POST or PUT requests as JSON
app.use(express.json());
// Identifies "public" as a folder for express to use to find static files for the application
app.use(express.static("public"));

// Sets up the database connection parameters
if (process.env.JAWSDB_URL) {
    var connection = mysql.createPool(process.env.JAWSDB_URL);
} else {
    var connection = mysql.createPool({
        host: process.env.dbHost,
        port: process.env.dbPort,
        user: process.env.dbUser,
        password: process.env.dbPassword,
        database: process.env.dbDatabase
    });
}

 //sets up the sever
app.listen(PORT, function () {
    console.log(`App running on port ${PORT}`);
});

// Selects all of the products from the products table 
app.get("/products", function (req, res) {
    console.log('displayProducts')
    connection.query("SELECT item_id, product_name, price, stock_quantity FROM products", function (err, sql_res) {
        if (err) {
            throw err;
        }

        // Converts the SQL response to JSON
        res.json(sql_res);
    })
})

// Selects the stock_quantity of the specified item
// The item id can be accessed via "/:id" and req.params.id or req.query.id
app.get("/product_info/:id", function (req, res) {
    connection.query("SELECT stock_quantity FROM products WHERE item_id = " + req.params.id, function (err, sql_res) {

        //// Optional way of accessing the item id
        ////connection.query("SELECT stock_quantity FROM products WHERE item_id =" + req.query.id, function (err, sql_res) {

        if (err) throw err;

        res.json(sql_res);
    })
}) 

// Updates quantity and product sales in the database
app.post("/product_update", function (req, res) {    
    connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - " + req.body.orderQuantity + ", product_sales = product_sales + " + req.body.cost + " WHERE item_id = " + req.body.orderID, function (err, sql_res) {
            if (err) throw err;
            res.json(sql_res);
        })
})
