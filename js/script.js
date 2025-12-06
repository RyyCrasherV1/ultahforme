// Animasi Menulis
const texts = [
    "DEVELOPER",
    "TRUEE HEAVANLY DEMON GOD",
    "PROGAMER"
];

let speed = 100;
let textIndex = 0;
let charcterIndex = 0;
const textElements = document.querySelector(".typewriter-text");

function typeWriter() {
    if (charcterIndex < texts[textIndex].length) {
        textElements.innerHTML += texts[textIndex].charAt(charcterIndex);
        charcterIndex++;
        setTimeout(typeWriter, speed);
    } else {
        setTimeout(eraseText, 1000);
    }
}

function eraseText() {
    if (textElements.innerHTML.length > 0) {
        textElements.innerHTML = textElements.innerHTML.slice(0, -1);
        setTimeout(eraseText, 50);
    } else {
        textIndex = (textIndex + 1) % texts.length;
        charcterIndex = 0;
        setTimeout(typeWriter, 500);
    }
}

window.onload = typeWriter;


// ====== SOUND SYSTEM ======
const menuOpenSound = new Audio("/audio/menu-open.mp3");
const menuCloseSound = new Audio("/audio/menu-close.mp3");

// Menu buka
function hamburg() {
    const navbar = document.querySelector(".dropdown");
    navbar.style.transform = "translateY(0px)";
    menuOpenSound.currentTime = 0;
    menuOpenSound.play();
}

// Menu tutup
function cancel() {
    const navbar = document.querySelector(".dropdown");
    navbar.style.transform = "translateY(-500px)";
    menuCloseSound.currentTime = 0;
    menuCloseSound.play();
}
// === SIDE MENU TOGGLE ===
function toggleSideMenu() {
    const menu = document.getElementById("sideMenu");
    menu.classList.toggle("show");
}
