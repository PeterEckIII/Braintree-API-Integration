var express = require("express"),
    router = express.Router({ mergeParams: true });


router.get("/", function (req, res) {
    res.render("home");
});

// Send client token to the client
router.get("/checkout", function (req, res) {
    gateway.clientToken.generate({}, function (error, response) {
        var clientToken = response.clientToken;
        if (error) {
            req.flash("error", "There was a problem processing the request. Please reload the page and try again");
            console.log(error);
        }
        res.render("checkout", {
            clientToken: clientToken
        });
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
            req.flash("error", "There was a problem registering you. Please ensure you entered the correct information");
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
                    req.flash("error", "There was a problem processing the transaction. Please ensure your payment information is correct and try again");
                    console.log("Transaction error: " + transactionError);
                }
            });
            res.render("confirmation");
        }
    });
});

module.exports = router;