var express         = require("express"),
    session         = require("express-session"),
    braintree       = require("braintree"),
    client          = require("braintree-web/client"),
    hostedFields    = require("braintree-web/hosted-fields"),
    flash           = require("connect-flash"),
    bodyParser      = require("body-parser");
    path            = require("path");
    app             = express();


// Setting up the app
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(flash());
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(__dirname + "/public"));

app.use(session({
    secret: process.env.clientSecret,
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
    merchantId: process.env.merchantID,
    publicKey: process.env.publicKey,
    privateKey: process.env.privateKey
});

app.get("/", function(req, res) {
    res.redirect("/checkout");
});

// Send client token to the client
app.get("/checkout", function(req, res) {
    gateway.clientToken.generate({}, function(generateError, response) {
        if(generateError) {
            // Handle error
            console.log(generateError);
        }
        // res.send(response.clientToken)
        res.render("checkout", {clientToken: response.clientToken});
        console.log(response.clientToken);
    });
});

app.post("/checkout", function(req, res) {
    var transactionError;
    var nonce = req.body.payment_method_nonce;
    var amount = req.body.amount;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;

    gateway.customer.create({
        firstName: firstName,
        lastName: lastName,
        paymentMethodNonce: nonce,
        creditCard: {
            options: {
                verifyCard: true
            }
        }
    }, function(createCustomerError, createCustomerResult) {
        if(createCustomerError) {
            console.log(createCustomerError);
            // Handle error
            return;
        }
        else if (!createCustomerResult.success) {
            console.log("There was an error creating the customer");
        }
        else {

            gateway.transaction.sale({
                amount: amount,
                paymentMethodNonce: nonce,
                options: {
                    verifyCard: true,
                    amount: amount
                }
            }, function (saleError, result) {
                if (result.success) {
                    // Result.transaction for details
                } else {
                    console.log(saleError);
                    // Handle errors
                }
            });
        } 
    });
});

app.listen(3000, function(req, res) {
    console.log("Started the server...");
})

module.exports = app;