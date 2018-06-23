var express         = require("express"),
    session         = require("express-session"),
    braintree       = require("braintree"),
    flash           = require("connect-flash"),
    bodyParser      = require("body-parser");
    path            = require("path");
    app             = express();


// Setting up the app
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(flash());
app.use(express.static(__dirname + "/public"));

app.use(session({
    secret: "my_secret",
    saveUninitialized: true,
    resave: true
}));

app.use(function(req, res, next) {
    app.locals.error = req.flash("error");
    app.locals.success = req.flash("success");
    next();
})

// Creating gateway with Sandbox credentials
var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "7nzxrq4pc2ttg38j",
    publicKey: "9p82fdb76b85n64w",
    privateKey: "a6fc1c85412a8ee854bcc098e60a31ad"
});

app.get("/", function(req, res) {
    res.render("home");
});

// Send client token to the client
app.get("/checkout", function(req, res) {
    gateway.clientToken.generate({}, function(error, response) {
        var clientToken = response.clientToken;
        if(error) {
            // Handle error
            console.log(error);
        }
        res.render("checkout", { clientToken: clientToken });
    });
});

app.post("/checkout", function(req, res) {
    var nonceFromTheClient = req.body.payment_method_nonce;
    console.log("The nonce is: " + nonceFromTheClient);
    gateway.customer.create({
        firstName: "New",
        lastName: "Customer",
        paymentMethodNonce: nonceFromTheClient,
        options: {
            verifyCard: true,
        }
    }, function(error, result) {
        if(error) {
            console.log("Customer create error");
            return;
        }
        console.log("The customer ID is: " + customerId);

        gateway.transaction.sale({
            amount: "$10",
            paymentMethodNonce: result.customer.paymentMethods[0].token,
            options: {
                submitForSettlement: true,
                storeInVaultOnSuccess: true
            }
        });
    });
    res.render("confirmation");
});

app.listen(3000, function(req, res) {
    console.log("Started the server...");
})

module.exports = app;
