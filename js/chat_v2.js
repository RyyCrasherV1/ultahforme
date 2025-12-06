import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue, child, get, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Admins (owner+admin) - owner will also be admin by higher privilege in DB
const OWNER_EMAIL = "ryyxiaoyan@gmail.com";
const ADMINS = ["ryyxiaoyan@gmail.com","rafkaikhwansyah0@gmail.com"];

// helper: sanitize email to key
function emailKey(email){ return email.replace(/\./g, "_"); }

// elements
const btnSignIn = document.getElementById("btnSignIn");
const btnSignOut = document.getElementById("btnSignOut");
const signedAs = document.getElementById("signedAs");
const chatBox = document.getElementById("chatBox");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const onlineList = document.getElementById("onlineList");
const adminPanel = document.getElementById("adminPanel");
const targetEmailInput = document.getElementById("targetEmail");
const recentActions = document.getElementById("recentActions");

let CURRENT_USER = null;
let CURRENT_ROLE = "member";

// sign in/out
btnSignIn.addEventListener("click", ()=> signInWithPopup(auth, provider).catch(e=>alert(e.message)));
btnSignOut.addEventListener("click", ()=> signOut(auth));

onAuthStateChanged(auth, user=>{
  if(user){
    CURRENT_USER = user;
    signedAs.innerText = `Signed as: ${user.email}`;
    btnSignIn.style.display="none";
    btnSignOut.style.display="inline-block";
    // set user online
    set(ref(db, "online/"+emailKey(user.email)), {email:user.email, ts:Date.now()});
    // ensure user record exists
    const uref = ref(db, "users/"+emailKey(user.email));
    get(uref).then(snap=>{
      if(!snap.exists()){
        set(uref, {role: user.email===OWNER_EMAIL ? "owner" : "member", createdAt:Date.now()});
      }
    });
    loadUserRole(user.email);
    adminPanel.style.display = isAdminRole(CURRENT_ROLE) ? "block" : "none";
  } else {
    CURRENT_USER = null;
    signedAs.innerText = "Not signed in";
    btnSignIn.style.display="inline-block";
    btnSignOut.style.display="none";
    adminPanel.style.display="none";
  }
});

// load role from db
function loadUserRole(email){
  const key = emailKey(email);
  onValue(ref(db, "users/"+key+"/role"), snap=>{
    if(snap.exists()) CURRENT_ROLE = snap.val();
    else CURRENT_ROLE = "member";
    adminPanel.style.display = isAdminRole(CURRENT_ROLE) ? "block" : "none";
    renderOnlineList(); // update badges
  });
}

// send message with role & checks
let lastSent = 0;
sendBtn.addEventListener("click", sendMsg);
msgInput.addEventListener("keypress", e=>{ if(e.key==='Enter') sendMsg(); });

function sendMsg(){
  if(!CURRENT_USER){ alert("Please sign in first"); return; }
  const text = msgInput.value.trim();
  if(!text) return;
  const now = Date.now();
  if(now - lastSent < 800){ alert("Slow down"); return; }
  lastSent = now;
  const userEmail = CURRENT_USER.email;
  // check banned/muted
  get(ref(db, "users/"+emailKey(userEmail))).then(snap=>{
    const role = snap.exists() && snap.val().role ? snap.val().role : "member";
    if(role === "banned"){ alert("You are banned"); return; }
    const payload = { user: userEmail, role: role, message: text, time: now };
    push(ref(db, "chat"), payload);
    msgInput.value = "";
  });
}

// render incoming messages
onChildAdded(ref(db, "chat"), snap=>{
  const d = snap.val();
  const key = snap.key;
  renderMessage(d, key);
});

function roleBadge(role){
  const map = {
    owner: ['👑','role-owner'],
    admin: ['🛡️','role-admin'],
    moderator: ['🔧','role-moderator'],
    vip: ['⭐','role-vip'],
    member: ['✔','role-member'],
    muted: ['🤐','role-muted'],
    banned: ['⛔','role-banned']
  };
  return map[role] || ['','role-member'];
}

function renderMessage(d, key){
  // if muted and viewer is not admin then do not show
  const viewer = CURRENT_USER ? CURRENT_USER.email : null;
  const viewerRole = CURRENT_ROLE;
  if(d.role === "muted" && !(isAdminRole(viewerRole) || viewer===d.user)) return;
  const msg = document.createElement("div");
  msg.className = "msg " + (d.role==="admin"||d.role==="owner" ? "admin" : "user");
  if(viewer===d.user) msg.className += " own";
  const [emoji, cls] = roleBadge(d.role || "member");
  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `<span class="name">${d.user}</span> <span class="role-badge ${cls}">${emoji} ${d.role||'member'}</span> <span style="opacity:.6;margin-left:8px;font-size:12px">${new Date(d.time).toLocaleTimeString()}</span>`;
  msg.appendChild(meta);
  const body = document.createElement("div");
  body.innerHTML = d.message;
  msg.appendChild(body);

  // delete button for admins/owner
  if(CURRENT_USER && isAdminRole(CURRENT_ROLE)){
    const del = document.createElement("button");
    del.className = "del-btn";
    del.textContent = "Delete";
    del.onclick = ()=>{ remove(ref(db, "chat/"+key)); };
    msg.appendChild(del);
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// online list render
function renderOnlineList(){
  onValue(ref(db, "online"), snap=>{
    const list = snap.exists() ? snap.val() : {};
    onlineList.innerHTML = "";
    Object.values(list).forEach(u=>{
      const li = document.createElement("li");
      const key = emailKey(u.email);
      // get role
      get(ref(db, "users/"+key+"/role")).then(s=>{
        const role = s.exists()?s.val():"member";
        const [emoji, cls] = roleBadge(role);
        li.innerHTML = `<strong>${u.email}</strong> <span class="role-badge ${cls}">${emoji} ${role}</span>`;
      });
      onlineList.appendChild(li);
    });
  });
}

// admin helpers
function isAdminRole(role){ return role==="admin" || role==="owner"; }
window.setUserRole = function(email, role){
  if(!CURRENT_USER) return alert("Login as admin first");
  // only owner or admin can change roles; admin cannot change owner role
  get(ref(db,"users/"+emailKey(CURRENT_USER.email))).then(snap=>{
    const myRole = snap.exists()?snap.val().role:"member";
    if(!isAdminRole(myRole) && myRole!=="owner") return alert("Insufficient permissions");
    // apply role
    if(role==="unban") role="member";
    set(ref(db, "users/"+emailKey(email)), {role: role, updatedAt: Date.now()});
    recentActions.innerHTML = `Set ${email} => ${role}`;
  });
};
window.setUserRoleFromInput = function(role){
  const email = document.getElementById("targetEmail").value.trim();
  if(!email) return alert("Enter email");
  setUserRole(email, role);
};

// cleanup online on disconnect (best-effort)
window.addEventListener("beforeunload", ()=>{
  if(CURRENT_USER) remove(ref(db, "online/"+emailKey(CURRENT_USER.email)));
});

// expose some functions for console
window._debug = { setUserRole };

// initial render of online list
renderOnlineList();
