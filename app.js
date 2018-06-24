var express         = require("express"),
    session         = require("express-session"),
    braintree       = require("braintree"),
    bodyParser      = require("body-parser"),
    path            = require("path"),
    routes          = require("./routes/index.js"),
    flash           = require("connect-flash"),
    app             = express();


// Setting up the app
app.use(session({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: true
}));

app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(express.static(__dirname + "/public"));
app.use(routes);

app.use(function(req, res, next) {
    res.locals.error = req.flash("error");
    next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.listen(process.env.PORT || 3000, function(req, res) {
    console.log("Started the server...");
});

module.exports = app;
