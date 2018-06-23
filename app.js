var express         = require("express"),
    session         = require("express-session"),
    braintree       = require("braintree"),
    flash           = require("connect-flash"),
    bodyParser      = require("body-parser");
    path            = require("path");
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
            req.flash("error", "There was a problem processing the request. Please reload the page and try again");
            console.log(error);
        }
        res.render("checkout", { clientToken: clientToken });
    });
});

app.post("/checkout", function(req, res) {
    var nonceFromTheClient = req.body.payment_method_nonce;

    gateway.customer.create({
        firstName: "New",
        lastName: "Customer",
        paymentMethodNonce: nonceFromTheClient,
        creditCard : {
            options: {
                verifyCard: true,
            }
        }
    }, function(error, result) {
        if (!result.success) {
            console.log("Customer create error. Redirected to checkout page");
            req.flash("error", "There was a problem registering you. Please ensure you entered the correct information");
            res.redirect("/checkout");
        }
        else {
            var customerId = result.customer.id;
            gateway.transaction.sale({
                amount: "29.99",
                customerId: customerId,
                paymentMethodNonce: result.customer.paymentMethods[0].nonce,
                options: {
                    submitForSettlement: true,
                    storeInVaultOnSuccess: true
                }
            }, function (transactionError, transactionResult) {
                if (transactionResult.success) {
                    console.log("Transaction successful!");
                } else {
                    req.flash("error", "There was a problem processing the transaction. Please ensure your payment information is correct and try again");
                    console.log("Transaction error: " + transactionError);
                }
            });
            res.render("confirmation");
        }
    });
});

app.listen(3000, function(req, res) {
    console.log("Started the server...");
});

module.exports = app;
