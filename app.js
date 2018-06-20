var express         = require("express"),
    session         = require("express-session"),
    braintree       = require("braintree"),
    client          = require("braintree-web/client"),
    hostedFields    = require("braintree-web/hosted-fields"),
    flash           = require("connect-flash"),
    bodyParser      = require("body-parser");
    app             = express();


// Setting up the app
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

app.use(session({
    secret: "My_Secret_Session_Code",
    saveUninitialized: true,
    resave: true
}));

app.use(function(req, res, next) {
    app.locals.clientToken = clientToken;
    app.locals.error = req.flash("error");
    app.locals.success = req.flash("success");
    next();
})

// Creating gateway with Sandbox credentials
var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantID: "7nzxrq4pc2ttg38j",
    publicKey: "9p82fdb76b85n64w",
    privateKey: "a6fc1c85412a8ee854bcc098e60a31ad"
});

// Generating clientToken
gateway.clientToken.generate({
    customerId: '123456'
}, function(tokenErr, response) {
    if(tokenErr) {
        // Handle tokenErr
    }
    var clientToken = response.clientToken;
});

// Send client token to the client
app.get("/client_token", function(req, res) {
    gateway.clientToken.generate({}, function(sendErr, response) {
        if(sendErr) {
            // Handle error
        }
        res.send(response.clientToken);
    });
});

module.exports = app;