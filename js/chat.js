import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, get } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const ADMINS = ["ryyxiaoyan@gmail.com","rafkaikhwansyah0@gmail.com"];
let CURRENT_EMAIL = null;

function roleOf(email){
  if(!email) return "guest";
  if(ADMINS.includes(email)) return "admin";
  return "user";
}

// Auth UI handlers
const btnGoogle = document.getElementById('btnGoogle');
const btnSignOut = document.getElementById('btnSignOut');
const userStatus = document.getElementById('userStatus');

btnGoogle && btnGoogle.addEventListener('click', ()=>{
  signInWithPopup(auth, provider).catch(err=>{ alert('Sign-in failed: '+err.message) });
});

btnSignOut && btnSignOut.addEventListener('click', ()=>{
  signOut(auth);
});

// Monitor auth state
onAuthStateChanged(auth, user=>{
  if(user){
    CURRENT_EMAIL = user.email;
    userStatus.textContent = user.email;
    btnGoogle.style.display = 'none';
    btnSignOut.style.display = 'inline-block';
  } else {
    CURRENT_EMAIL = null;
    userStatus.textContent = 'Not signed';
    btnGoogle.style.display = 'inline-block';
    btnSignOut.style.display = 'none';
  }
});

// send message function
window.sendMsg = function(){
  let text=document.getElementById("msgInput").value;
  if(!text.trim()) return;
  const role = roleOf(CURRENT_EMAIL);
  // prevent banned or null? For now allow guest sends with name 'Guest'
  const user = CURRENT_EMAIL || 'Guest';
  push(ref(db,"chat/"),{
    user: user,
    role: role,
    message: text,
    time: Date.now()
  });
  document.getElementById("msgInput").value="";
};

const box=document.getElementById("chatBox");
onChildAdded(ref(db,"chat/"), snap=>{
  let d=snap.val();
  let div=document.createElement("div");
  div.className="bubble "+(d.role||'user');
  // badge
  let badge = '';
  if(d.role==='admin') badge = ' <span class="badge">🛡️ Admin</span>';
  else if(d.role==='owner') badge = ' <span class="badge">👑 Owner</span>';
  else if(d.role==='moderator') badge = ' <span class="badge">🔧 Mod</span>';
  else if(d.role==='vip') badge = ' <span class="badge">⭐ VIP</span>';
  div.innerHTML = `<b>${d.user}</b>${badge}<br>${d.message}`;
  box.appendChild(div);
  box.scrollTop=box.scrollHeight;
});
