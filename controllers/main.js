function initializeBraintree() {
    var form = document.querySelector("#card-form");
    var submit = document.querySelector("#pay-button");
    var nonce = document.querySelector("#nonce");
    console.log(nonce);

    braintree.client.create({
        authorization: "sandbox_t4qgfw7s_7nzxrq4pc2ttg38j",
    }, function (clientError, clientInstance) {
        if (clientError) {
            // Handle error
            console.log("Client error!");
            return;
        }
        var options = {
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
        }
        braintree.hostedFields.create(options, function (hostedFieldsError, hostedFieldsInstance) {
            if (hostedFieldsError) {
                console.error(hostedFieldsError);
                return;
            }

            submit.removeAttribute("disabled");

            form.addEventListener("submit", function (event) {
                event.preventDefault();

                hostedFieldsInstance.tokenize(function (tokenizeError, payload) {
                    if (tokenizeError) {
                        console.error(tokenizeError);
                        return;
                    }
                    document.querySelector("#nonce").value = payload.nonce;
                    form.submit(payload.nonce);
                });
            }, false);
        });
    });
}