$(document).ready(function () {

    let EMPTY = "";
    let NULL = null;
    let id = EMPTY;
    let APPLICATION_URL = "http://localhost:8000/ussd/agrigo";
    let HTTP_METHOD = "GET";
    let PHONE_NUMBER = "250788313531";
    let CELL_ID = "3G2343";


    let documentBody = $(document);
    let content = $("#content");
    let input = $("#input");
    let sendBtn = $("#sendUssdRequest");
    let cancelBtn = $("#cancelUssdRequest");
    let okBtn = $("#okBtn");
    let deleteBtn = $("#delete");
    let items = $(".item");
    let responseMessage = $("#ussdResponseMessage");

    /**
     * Handle KeyBoard navigation
     */
    documentBody.keypress(function (event) {
        let popupClass = document.getElementsByClassName('modal')[0];
        // Handle keyboard input when modal is not shown
        if (!popupClass.classList.contains('modal--show')) {
            let keyCode = (event.keyCode ? event.keyCode : event.which);
            if (keyCode === 8) {
                content.empty();
            } else if (keyCode === 13) {
                showModal();
            } else {
                content.append(getKeyBoardInput(event.keyCode));
            }
        }
    });

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
            showModal();
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
                } else if (e.keyCode === 13) {
                    clickSendBtn();
                } else {
                    console.log(e.keyCode);
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
        clickSendBtn();
    });

    function clickSendBtn() {
        let modalWindow = document.getElementsByClassName('modal')[0];
        let newRequest = setNewRequest(input.val());
        let sessionid = setSessionId();
        let data = {
            cellid: CELL_ID,
            sessionid: String(sessionid),
            newRequest: String(newRequest),
            input: String(input.val()),
            msisdn: PHONE_NUMBER
        };
        if (input.val() === EMPTY && modalWindow.classList.contains('modal--show')) {
            alert("Cannot submit empty field");
        } else {
            sendUssdRequest(data);
        }
    }

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
     * Get KeyBoard pressed button input
     *
     * @param keyCode keyCode
     * @returns {string} pressed button
     */
    function getKeyBoardInput(keyCode) {
        let keyValue = "";
        switch (keyCode) {
            case 48:
                keyValue = "0";
                break;
            case 49:
                keyValue = "1";
                break;
            case 50:
                keyValue = "2";
                break;
            case 51:
                keyValue = "3";
                break;
            case 52:
                keyValue = "4";
                break;
            case 53:
                keyValue = "5";
                break;
            case 54:
                keyValue = "6";
                break;
            case 55:
                keyValue = "7";
                break;
            case 56:
                keyValue = "8";
                break;
            case 57:
                keyValue = "9";
                break;
            case 42:
                keyValue = "*";
                break;
            case 35:
                keyValue = "#";
                break;
            default:
                keyValue = null;
                break;
        }
        return keyValue;
    }

    function showModal() {
        // Open the modal
        let modalClass = document.getElementsByClassName('modal')[0];
        let userKeyboardInput = content.html();
        if (userKeyboardInput === "*123#") {
            let newRequest = setNewRequest(userKeyboardInput);
            let sessionId = setSessionId();
            let data = {
                cellid: CELL_ID,
                sessionid: String(sessionId),
                newRequest: newRequest,
                input: userKeyboardInput,
                msisdn: PHONE_NUMBER
            };
            sendUssdRequest(data);
            modalClass.classList.add('modal--show');

        } else if (userKeyboardInput.length === 0) {
            alert("Dial short code *123#");
        } else {
            alert("UNKNOWN APPLICATION");
        }
    }
});