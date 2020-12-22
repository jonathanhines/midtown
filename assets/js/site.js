var navInput, headerElement;
window.addEventListener('load', function () {
    navInput = document.getElementById("nav-trigger");
    headerElement = document.getElementById("site-header");
    updateNavigationHeader();
});

function handleHamburgerClick() {
    updateNavigationHeader();
};

function updateNavigationHeader() {
    if(navInput.checked) {
        headerElement.classList.add("nav-open");
    } else {
        headerElement.classList.remove("nav-open");
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("nav-trigger").checked = false;
});