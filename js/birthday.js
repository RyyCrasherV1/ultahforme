// Birthday v3 system with multi-track music

const playlist = [
    "https://files.catbox.moe/sa2522.mp3",
    "https://files.catbox.moe/1foud6.mp3"
];

let currentTrack = 0;
let birthdayMusic = new Audio(playlist[currentTrack]);
birthdayMusic.volume = 1.0;

birthdayMusic.addEventListener("ended", () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    birthdayMusic.src = playlist[currentTrack];
    birthdayMusic.play();
});

// attach click handler on balloon if exists
document.addEventListener("DOMContentLoaded", ()=>{
    const b=document.getElementById("mainBalloon");
    if(b){
        b.addEventListener("click", ()=>{
            birthdayMusic.currentTime=0;
            birthdayMusic.play();
        });
    }
});

console.log("Birthday system v3 with multi music loaded");
