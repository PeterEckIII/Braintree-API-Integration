var braintree = require("braintree");


initializeBraintree = function() {
    var form = document.querySelector("#card-form");
    var token = "";

    braintree.client.create({
        authorization: "CLIENT_AUTHORIZATION"
    }, function (clientError, clientInstance) {
        if (clientError) {
            console.log(clientError);
            // Handle error
            return;
        }
        braintree.hostedFields.create({
            client: clientInstance,
            styles: {},
            fields: {
                number: {
                    selector: "#card-number",
                    palceholder: "5430 6950 0294 9750"
                },
                expirationMonth: {
                    selector: "#exp-month",
                    placeholder: "MM"
                },
                expirationYear: {
                    selector: "#exp-year",
                    placeholder: "YYYY"
                },
                cvv: {
                    selector: "#cvv",
                    placeholder: "456"
                },
                postalCode: {
                    selector: "#postal-code",
                    placeholder: "12345"
                },
                amount: {
                    selector: "#amount",
                    placeholder: "0.0"
                }
            }
        }, function (hostedFieldsError, hostedFieldsInstance) {
            if (hostedFielsdError) {
                console.log(hostedFieldsError)
                // Handle error
                return;
            }
            submit.removeAttribute("disable");

            form.addEventListener("submit", function (event) {
                event.preventDefault();

                hostedFieldsInstance.tokenize(function (tokenizeError, payload) {
                    if (tokenizeError) {
                        console.log(tokenizeError);
                        // Handle error
                        return;
                    }
                    console.log("The nonce is: " + payload.nonce);
                    document.querySelector("#nonce").value = payload.nonce;
                    form.submit();
                });
            }, false);
        });
    });
}


