// =========================
//  REYY ULTIMATE BIRTHDAY V4
// =========================

// === CONFIG ===
const birthdayDate = new Date("2025-04-07T00:00:00"); // <-- tanggal ultah Reyy
const music1 = new Audio("audio/music1.mp3"); // musik pertama
const music2 = new Audio("audio/music2.mp3"); // musik kedua

music1.volume = 1.0;
music2.volume = 1.0;

// auto lanjut musik
music1.onended = () => {
    music2.currentTime = 0;
    music2.play();
};

music2.onended = () => {
    music1.currentTime = 0;
    music1.play();
};

// =========================
//  COUNTDOWN SYSTEM
// =========================
function startCountdown(){
    const countdownBox = document.createElement("div");
    countdownBox.id = "countdown-box";
    countdownBox.style.position = "fixed";
    countdownBox.style.top = "20px";
    countdownBox.style.left = "50%";
    countdownBox.style.transform = "translateX(-50%)";
    countdownBox.style.color = "#00ff80";
    countdownBox.style.fontSize = "20px";
    countdownBox.style.fontWeight = "bold";
    countdownBox.style.zIndex = "9999";
    countdownBox.style.textShadow = "0 0 10px #00ff80";
    document.body.appendChild(countdownBox);

    setInterval(() => {
        const now = new Date();
        const diff = birthdayDate - now;

        if(diff <= 0){
            countdownBox.innerHTML = "🎉 Selamat Ulang Tahun Reyy!!! 🎉";
            return;
        }

        let days = Math.floor(diff / (1000*60*60*24));
        let hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
        let minutes = Math.floor((diff % (1000*60*60)) / (1000*60));
        let seconds = Math.floor((diff % (1000*60)) / 1000);

        countdownBox.innerHTML = `
            🤍 Menuju ulang tahun Reyy:  
            ${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik
        `;
    }, 1000);
}

// =========================
//  BALLOON SYSTEM
// =========================
function spawnBalloons(){
    const container = document.createElement("div");
    container.id = "balloon-container";
    container.style.position = "fixed";
    container.style.top = "0";
    container.style.left = "0";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.pointerEvents = "none";
    container.style.zIndex = "999";
    document.body.appendChild(container);

    setInterval(() => {
        const balloon = document.createElement("img");
        balloon.src = "img/balloon.png"; // gambar balon kamu
        balloon.style.position = "absolute";
        balloon.style.width = "70px";
        balloon.style.left = Math.random()*90 + "%";
        balloon.style.bottom = "-120px";
        balloon.style.pointerEvents = "auto"; 
        balloon.style.cursor = "pointer";
        balloon.style.filter = "drop-shadow(0 0 10px #00ff80)";

        let speed = Math.random()*3 + 2;

        balloon.onclick = () => {
            playBirthdayMusic();
            balloon.remove();
        };

        container.appendChild(balloon);

        let up = setInterval(() => {
            let pos = parseFloat(balloon.style.bottom);
            if(pos > 900){
                balloon.remove();
                clearInterval(up);
            } else {
                balloon.style.bottom = (pos + speed) + "px";
            }
        }, 30);

    }, 800);
}

// =========================
//  MUSIC STARTER
// =========================
function playBirthdayMusic(){
    if(!music1.paused || !music2.paused) return; // agar tidak double play
    music1.currentTime = 0;
    music1.play();
}


// =========================
//  START ALL SYSTEM
// =========================
window.onload = () => {
    spawnBalloons();
    startCountdown();
};
