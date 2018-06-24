var express = require("express"),
    braintree = require("braintree"),
    router = express.Router({ mergeParams: true });

// Creating gateway with Sandbox credentials
var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.MERCHANTID,
    publicKey: process.env.PUBLICKEY,
    privateKey: process.env.PRIVATEKEY
});

router.get("/", function (req, res) {
    res.render("home");
});

// Send client token to the client
router.get("/checkout", function (req, res) {
    gateway.clientToken.generate({}, function (error, response) {
        var clientToken = response.clientToken;
        if (error) {
            console.log(error);
        }
        res.render("checkout", { clientToken: clientToken, message: req.flash("error") });
    });
});

router.post("/checkout", function (req, res) {
    var nonceFromTheClient = req.body.payment_method_nonce;

    gateway.customer.create({
        firstName: "New",
        lastName: "Customer",
        paymentMethodNonce: nonceFromTheClient,
        creditCard: {
            options: {
                verifyCard: true,
            }
        }
    }, function (error, result) {
        if (!result.success) {
            console.log("Customer create error. Redirected to checkout page");
            req.flash("error", "There was a problem registering your payment. Please try again");
            res.redirect("/checkout");
        } else {
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
                    console.log("Transaction error: " + transactionError);
                    req.flash("error", "There was an issue with your transaction. Please try again");
                    res.redirect("/checkout");
                }
            });
            res.redirect("/confirmation");
        }
    });
});

router.get("/confirmation", function(req, res) {
    res.render("confirmation");
});

module.exports = router;
