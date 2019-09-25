$(document).ready(function () {
    var EMPTY = "";
    var NULL = null;

    /**
     * Call ussd application by sending ussd necessary inputs.
     */
    $("#sendUssdRequest").on("click", function (e) {
        e.preventDefault();
        var input = $("#input").val();
        var newRequest = setNewRequest(input);
        var sessionid = setSessionId();
        var data = {
            cellid: "3G2343",
            sessionid: String(sessionid),
            newRequest: String(newRequest),
            input: String(input),
            msisdn: "250784070610"
        }
        if (input == EMPTY) {
            alert("Please dial short code");
        } else {
            sendUssdRequest(data);
        }
    });

    /**
     * onClick Cancel button reset ussd simulator
     */
    $("#cancelUssdRequest").on("click", function (e) {
        e.preventDefault();
        resetUssdSimulator();
    });

    /**
     * Send USSD Request to USSD Application
     * @param data
     */
    function sendUssdRequest(data) {
        $.ajax({
            type: "GET",
            url: "http://localhost:8000/ussd/request",
            crossDomain: true,
            data: data,
            success: function (result, status, xhr) {
                var Freeflow = xhr.getResponseHeader("Freeflow");
                if (Freeflow == "FC") {
                    clearInput();
                    setUssdMessage(result);
                } else if (Freeflow == "FB") {
                    setUssdMessage(result);
                    clearLocalstorage();
                    clearInput();
                    clearUssdSession();
                } else {
                    console.log(xhr);
                    console.log(Freeflow);
                    console.log("Some error occured");
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    }


    /**
     * Generation Dummy Ussd session
     * @returns {string}
     */
    function setSessionId() {
        var sessionid;
        if (localStorage.getItem('sessionid') === NULL) {
            var current_datetime = new Date();
            var formated_datetime = current_datetime.getFullYear() + (current_datetime.getMonth() + 1) + current_datetime.getDate() + current_datetime.getHours() + current_datetime.getMinutes() + current_datetime.getSeconds();
            console.log("setSessionId::formated_datetime = " + formated_datetime);
            localStorage.setItem('sessionid', formated_datetime);
            sessionid = localStorage.getItem('sessionid');
        } else {
            sessionid = localStorage.getItem('sessionid');
        }
        return sessionid;
    }

    /**
     * Set newRequest:
     *  1 = begin ussd navigation
     *  2 = continue ussd navigation
     *
     * @param ussdInput
     * @returns {string}
     */
    function setNewRequest(ussdInput) {
        var newRequest = EMPTY;
        if (localStorage.getItem('newRequest') === NULL) {
            var request = EMPTY;
            if (ussdInput.endsWith("#") && ussdInput.startsWith("*")) {
                request = "1";
            } else {
                localStorage.removeItem("newRequest");
                request = "0";
            }
            localStorage.setItem('newRequest', request);
            newRequest = localStorage.getItem('newRequest');
        } else {
            localStorage.removeItem("newRequest");
            localStorage.setItem('newRequest', "0");
            newRequest = localStorage.getItem('newRequest');
        }
        return newRequest;
    }

    /**
     * Clear local storage
     */
    function clearLocalstorage() {
        localStorage.clear();
    }

    /**
     * remove ussd session id in local storage
     */
    function clearUssdSession() {
        localStorage.removeItem("sessionid");
    }

    /**
     * clear ussd input form field
     */
    function clearInput() {
        $("#input").val(EMPTY);
    }
    /**
     * clear ussd message textarea field
     */
    function clearUssdMessage() {
        $("#ussdMessage").val(EMPTY);
    }

    /**
     * update ussd message textarea field with new message
     */
    function setUssdMessage(message) {
        clearUssdMessage();
        $("#ussdMessage").val(message);
    }

    /**
     * reset ussd simulator by cleaning local storage, forms and reloading page
     */
    function resetUssdSimulator() {
        clearUssdMessage();
        clearInput();
        clearLocalstorage();
        location.reload();
    }
});