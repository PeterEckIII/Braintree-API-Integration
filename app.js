var express         = require("express"),
    session         = require("express-session"),
    braintree       = require("braintree"),
    flash           = require("connect-flash"),
    bodyParser      = require("body-parser"),
    path            = require("path"),
    routes          = require("./routes/index.js"),
    controller      = require("./controllers/main.js"),
    app             = express();


// Setting up the app
app.use(session({
    secret: "my_secret",
    saveUninitialized: true,
    resave: true
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(express.static(__dirname + "/public"));
app.use(flash());

app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    next();
});

// Creating gateway with Sandbox credentials
var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.MERCHANTID,
    publicKey: process.env.PUBLICKEY,
    privateKey: process.env.PRIVATEKEY
});

app.listen(process.env.PORT || 3000, function(req, res) {
    console.log("Started the server...");
});

module.exports = app;
