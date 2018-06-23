var form = document.querySelector("#card-form");
var submit = document.querySelector('input[type="submit"]');
var nonce = document.querySelector("#nonce");

function initializeBraintree() {
    braintree.client.create({
        authorization: "sandbox_t4qgfw7s_7nzxrq4pc2ttg38j",
    }, function (clientError, clientInstance) {
        if (clientError) {
            // Handle error
            console.log("Client error!");
            return;
        }
        braintree.hostedFields.create({
            client: clientInstance,
            fields: {
                number: {
                    selector: "#card-number",
                    placeholder: "4111 1111 1111 1111"
                },
                cvv: {
                    selector: "#cvv",
                    placeholder: "750"
                },
                expirationDate: {
                    selector: "#expiration-date",
                    placeholder: "12/2021"
                },
                postalCode: {
                    selector: "#postal-code",
                    placeholder: "60606"
                }
            }
        }, function (hostedFieldsError, hostedFieldsInstance) {
            if (hostedFieldsError) {
                // Handle error
                console.log("Hosted Fields Error!");
                return;
            }
            submit.removeAttribute("disabled");
            form.addEventListener("submit", function (event) {
                event.preventDefault();

                hostedFieldsInstance.tokenize(function (tokenizeError, payload) {
                    if (tokenizeError) {
                        // Handle error
                        console.log("Tokenize Error!");
                        return;
                    }
                    console.log("The nonce is: " + payload.nonce);
                    nonce.setAttribute("value", payload.nonce);
                });
            }, false);
        });
    });
}