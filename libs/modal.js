
$(document).ready(function () {

    var EMPTY = "";
    var NULL = null;
    var id = EMPTY;
    var USSD_URL = "http://localhost:8000/ussd/request";
    var USSD_METHOD = "GET";


    var content = $("#content");
    var input = $("#input");
    var sendBtn = $("#sendUssdRequest");
    var cancelBtn = $("#cancelUssdRequest");
    var okBtn = $("#okBtn");
    var deleteBtn = $("#delete");
    var items = $(".item");
    var responseMessage = $("#ussdResponseMessage");

    /**
     * Hide Ok Button
     */
    okBtn.hide();

    /**
     * Handle the keypad dialing
     * 
     * @param {event} e 
     */
    items.on("click", function (e) {
        id = e.target.id;
        if (id === "star") {
            content.append("*");
        } else if (id === "hash") {
            content.append("#");
        } else {
            content.append(id);
        }
    });

    /**
     * Delete dial number on keypad 
     * 
     * @param {event} e
     */
    deleteBtn.on("click", function (e) {
        e.preventDefault();
        var currentContent = $("#content").html();
        if (currentContent.length > 0) {
            var deleted = currentContent.slice(0, -1);
            content.html(deleted);
            console.log(deleted);
        }
    });

    modal();



// Modal - JS
    function modal() {

        var modal = document.getElementsByClassName('modal')[0],
                trigger = document.getElementsByClassName('modal-trigger')[0],
                close = document.getElementsByClassName('modal__close'); // we loops this to catch the different closers


        closeModal = function () {
            modal.classList.remove('modal--show');
            modal.classList.add('modal--hide');
            // Remove hide class after animation is done
            afterAnimation = function () {
                modal.classList.remove('modal--hide');
            };
            // This listens for the CSS animations to finish and then hides the modal
            modal.addEventListener("webkitAnimationEnd", afterAnimation, false);
            modal.addEventListener("oAnimationEnd", afterAnimation, false);
            modal.addEventListener("msAnimationEnd", afterAnimation, false);
            modal.addEventListener("animationend", afterAnimation, false);
        };

        // Open the modal 
        trigger.onclick = function () {
            var input = content.html();
            if (input === "*909#") {
                var newRequest = setNewRequest(input);
                var sessionid = setSessionId();
                var data = {
                    cellid: "3G2343",
                    sessionid: String(sessionid),
                    newRequest: newRequest,
                    input: input,
                    msisdn: "250784070610"
                };
                sendUssdRequest(data);
                modal.classList.add('modal--show');
            } else if (input.length === 0) {
                alert("Dial short code *909#");
            } else {
                alert("UNKNOWN APPLICATION");
            }
        };

        // Close the modal with any element with class 'modal__close'
        for (var i = 0; i < close.length; i++) {
            close[i].onclick = function () {
                closeModal();
            };
        }

        // Click outside of the modal and close it
        window.onclick = function (e) {
            if (e.target === modal) {
                closeModal();
            }
        };

        // Use the escape key to close modal
        document.onkeyup = function (e) {
            e = e || window.event;
            if (modal.classList.contains('modal--show')) {
                if (e.keyCode === 27) {
                    closeModal();
                }
            }
        };

    }

    /**
     * Send USSD Request to USSD Application
     * 
     * @param data
     */
    function sendUssdRequest(data) {
        $.ajax({
            type: USSD_METHOD,
            url: USSD_URL,
            crossDomain: true,
            data: data,
            success: function (result, status, xhr) {
                var Freeflow = xhr.getResponseHeader("Freeflow");
                if (Freeflow === "FC") {
                    clearInput();
                    setUssdMessage(result);
                } else if (Freeflow === "FB") {
                    setUssdMessage(result);
                    clearLocalstorage();
                    clearInput();
                    showOkBtn(true);
                    input.prop('disabled', true);
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
     * 
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
     *  0 = continue ussd navigation
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
        input.val(EMPTY);
    }

    /**
     * clear ussd message textarea field
     */
    function clearUssdMessage() {
        responseMessage.html(EMPTY);
    }

    /**
     * update ussd message textarea field with new message
     * 
     * @param {string} message 
     */
    function setUssdMessage(message) {
        clearUssdMessage();
        responseMessage.html(message.replace(/\n/g, "<br />"));
    }

    /**
     * reset ussd simulator by cleaning local storage, forms and reloading page
     */
    function resetUssdSimulator() {
        showOkBtn(false);
        clearUssdMessage();
        clearInput();
        clearLocalstorage();
    }

    /**
     * Call ussd application by sending ussd necessary inputs.
     * 
     * @param {event} e 
     */
    sendBtn.on("click", function (e) {
        e.preventDefault();
        var newRequest = setNewRequest(input.val());
        var sessionid = setSessionId();
        var data = {
            cellid: "3G2343",
            sessionid: String(sessionid),
            newRequest: String(newRequest),
            input: String(input.val()),
            msisdn: "250784070610"
        };
        if (input.val() === EMPTY) {
            alert("Cannot submit empty field");
        } else {
            sendUssdRequest(data);
        }
    });

    /**
     * onClick Cancel button reset ussd simulator
     * 
     * @param {event} e 
     */
    cancelBtn.on("click", function (e) {
        e.preventDefault();
        input.prop('disabled', false);
        resetUssdSimulator();
    });

    /**
     * onClick ok bottun reset ussd simulator
     * 
     * @param {event} e 
     */
    okBtn.on("click", function (e) {
        e.preventDefault();
        input.prop('disabled', false);
        resetUssdSimulator();
    });

    /**
     * Toggle OkBtn
     * 
     * @param {type} ok
     * @returns {undefined}
     */
    function showOkBtn(ok) {
        if (ok === true) {
            sendBtn.hide();
            cancelBtn.hide();
            okBtn.show();
        } else {
            sendBtn.show();
            cancelBtn.show();
            okBtn.hide();
        }
    }
});