let modal = document.querySelector("#shortCodeInfoModal");
let modalOverlay = document.querySelector("#modal-overlay");
let closeButton = document.querySelector("#close-button");
let openButton = document.querySelector("#open-button");
const envForm = document.querySelector("#env-form")
const envFormModalClose = document.querySelector('#form-modal-close')
const registrationForm = document.querySelector("#shortCodeInformationForm");

registrationForm.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("Form submitted");
});

closeButton.addEventListener("click", function () {
    modal.classList.toggle("closed");
    modalOverlay.classList.toggle("closed");
});

envFormModalClose.addEventListener('click', () => {
    envForm.classList.toggle('form_visible')
})