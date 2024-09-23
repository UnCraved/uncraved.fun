document.addEventListener("DOMContentLoaded", function() {
    const nameInput = document.getElementById("name");
    const phoneInput = document.getElementById("phone");
    const signUpBtn = document.getElementById("signUpBtn");
    if (localStorage.getItem("uName") || localStorage.getItem("uPhone")) {
                window.location.href = "index.html";
            }

    // Function to validate phone input
    function validatePhone() {
        const phone = phoneInput.value.trim();

        // Regular expression to allow only digits and '+'
        const phonePattern = /^[0-9+]*$/;

        // Check if phone matches the pattern and length requirements
        const isValid = phonePattern.test(phone) && 
                        ((phone.length >= 10 && phone.length <= 13) || 
                         (phone.length === 13 && phone.includes('+')));

        return isValid;
    }

    // Function to validate the entire form
    function validateForm() {
        const name = nameInput.value.trim();
        const isPhoneValid = validatePhone();

        // Enable button if name is filled and phone is valid
        signUpBtn.disabled = !(name && isPhoneValid);
    }

    // Add event listeners to inputs
    nameInput.addEventListener("input", validateForm);
    phoneInput.addEventListener("input", validateForm);


    // Handle form submission
    document.querySelector("form").addEventListener("submit", function(event) {
        event.preventDefault();
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        if (name && validatePhone()) {
            localStorage.setItem("uName", name);
            localStorage.setItem("uPhone", phone);
            window.location.href = "index.html";
        }
    });
});
