$(document).ready(function () {

    let EMPTY = "";
    let NULL = null;
    let id = EMPTY;
    let APPLICATION_URL = "http://localhost:8000/ussd/request";
    let HTTP_METHOD = "GET";


    let content = $("#content");
    let input = $("#input");
    let sendBtn = $("#sendUssdRequest");
    let cancelBtn = $("#cancelUssdRequest");
    let okBtn = $("#okBtn");
    let deleteBtn = $("#delete");
    let items = $(".item");
    let responseMessage = $("#ussdResponseMessage");

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
        //const currentContent = content.html();
        if (content.html().length > 0) {
            // let deleted = currentContent.slice(0, -1);
            // content.html(deleted);
            content.html("");
            // console.log(deleted);
        }
    });

    modal();


// Modal - JS
    function modal() {

        let modalClass = document.getElementsByClassName('modal')[0],
            trigger = document.getElementsByClassName('modal-trigger')[0],
            close = document.getElementsByClassName('modal__close'); // we loops this to catch the different closers


        let closeModal = function () {
            modalClass.classList.remove('modal--show');
            modalClass.classList.add('modal--hide');
            // Remove hide class after animation is done
            let afterAnimation = function () {
                modalClass.classList.remove('modal--hide');
            };
            // This listens for the CSS animations to finish and then hides the modal
            modalClass.addEventListener("webkitAnimationEnd", afterAnimation, false);
            modalClass.addEventListener("oAnimationEnd", afterAnimation, false);
            modalClass.addEventListener("msAnimationEnd", afterAnimation, false);
            modalClass.addEventListener("animationend", afterAnimation, false);
        };

        // Open the modal 
        trigger.onclick = function () {
            let userKeyboardInput = content.html();
            if (userKeyboardInput === "*123#") {
                let newRequest = setNewRequest(userKeyboardInput);
                let sessionId = setSessionId();
                let data = {
                    cellid: "3G2343",
                    sessionid: String(sessionId),
                    newRequest: newRequest,
                    input: userKeyboardInput,
                    msisdn: "250788313531"
                };
                if (fileExists(APPLICATION_URL, data) === true) {
                    sendUssdRequest(data);
                    modalClass.classList.add('modal--show');
                } else {
                    alert("External Application Down");
                }

            } else if (userKeyboardInput.length === 0) {
                alert("Dial short code *123#");
            } else {
                alert("UNKNOWN APPLICATION");
            }
        };

        // Close the modal with any element with class 'modal__close'
        for (let i = 0; i < close.length; i++) {
            close[i].onclick = function () {
                closeModal();
            };
        }

        // Click outside of the modal and close it
        window.onclick = function (e) {
            if (e.target === modalClass) {
                closeModal();
            }
        };

        // Use the escape key to close modal
        document.onkeyup = function (e) {
            e = e || window.event;
            if (modalClass.classList.contains('modal--show')) {
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
            type: HTTP_METHOD,
            url: APPLICATION_URL,
            crossDomain: true,
            data: data,
            success: function (result, status, xhr) {
                let Freeflow = xhr.getResponseHeader("Freeflow");
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
        let sessionid;
        if (localStorage.getItem('sessionid') === NULL) {
            let current_datetime = new Date();
            let formated_datetime = current_datetime.getFullYear() + (current_datetime.getMonth() + 1) + current_datetime.getDate() + current_datetime.getHours() + current_datetime.getMinutes() + current_datetime.getSeconds();
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
     * @param userKeyboardInput
     * @returns {string}
     */
    function setNewRequest(userKeyboardInput) {
        let newRequest;
        if (localStorage.getItem('newRequest') === NULL) {
            let request;
            if (userKeyboardInput.endsWith("#") && userKeyboardInput.startsWith("*")) {
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
        let newRequest = setNewRequest(input.val());
        let sessionid = setSessionId();
        let data = {
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

    /**
     * Check if URL exists
     *
     * @param url link to be test
     * @param requestData option data
     */
    function fileExists(url, requestData) {
        let exists = false;
        $.ajax({
            type: "HEAD",
            url: url,
            crossDomain: true,
            data: requestData,
            success: function (result, status, xhr) {
                if (status === 200) {
                    exists = true;
                    return exists;
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    }
});