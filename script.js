import { auth, db } from "./firebase-config.js";
import {
signInWithEmailAndPassword,
createUserWithEmailAndPassword,
signOut,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
collection,
addDoc,
getDocs,
query,
orderBy,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Simple UI wiring and Firebase interactions
// Elements
var authScreen = document.getElementById("auth-screen");
var homeScreen = document.getElementById("home-screen");
var createEventScreen = document.getElementById("create-event-screen");
var eventsScreen = document.getElementById("events-screen");

var emailInput = document.getElementById("email");
var passwordInput = document.getElementById("password");
var eventsList = document.getElementById("events-list");

// Buttons
document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("signup-btn").addEventListener("click", signup);
document.getElementById("logout-btn").addEventListener("click", logout);
document.getElementById("create-party-btn").addEventListener("click", showCreateEvent);
document.getElementById("view-parties-btn").addEventListener("click", loadEvents);
document.getElementById("post-party-btn").addEventListener("click", createEvent);
document.getElementById("back-from-create").addEventListener("click", goHome);
document.getElementById("back-from-events").addEventListener("click", goHome);

// Auth handlers
function login() {
var email = emailInput.value.trim();
var password = passwordInput.value;
if (!email || !password) return alert("Please enter email and password.");

signInWithEmailAndPassword(auth, email, password)
.then(() => switchScreen(homeScreen))
.catch(err => alert(err.message));
}

function signup() {
var email = emailInput.value.trim();
var password = passwordInput.value;
if (!email || !password) return alert("Please enter email and password.");

createUserWithEmailAndPassword(auth, email, password)
.then(() => switchScreen(homeScreen))
.catch(err => alert(err.message));
}

function logout() {
signOut(auth).then(() => switchScreen(authScreen));
}

// Screen switching
function switchScreen(screen) {
authScreen.classList.add("hidden");
homeScreen.classList.add("hidden");
createEventScreen.classList.add("hidden");
eventsScreen.classList.add("hidden");
screen.classList.remove("hidden");
}

function showCreateEvent() { switchScreen(createEventScreen); }

async function createEvent() {
var name = document.getElementById("event-name").value.trim();
var location = document.getElementById("event-location").value.trim();
var time = document.getElementById("event-time").value;

if (!name || !location || !time) { alert("Please fill all fields."); return; }

try {
await addDoc(collection(db, "events"), {
name,
location,
time,
createdAt: serverTimestamp()
});
alert("Party created!");
document.getElementById("event-name").value = "";
document.getElementById("event-location").value = "";
document.getElementById("event-time").value = "";
switchScreen(homeScreen);
} catch (err) {
alert(err.message);
}
}

async function loadEvents() {
switchScreen(eventsScreen);
eventsList.innerHTML = "<p>Loading...</p>";

try {
const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
const querySnapshot = await getDocs(q);

eventsList.innerHTML = "";
if (querySnapshot.empty) {
eventsList.innerHTML = "<p>No parties yet.</p>";
return;
}

querySnapshot.forEach(doc => {
var data = doc.data();
var createdAt = data.createdAt?.toDate().toLocaleString() ?? "—";

var card = document.createElement("div");
card.className = "event-card";
card.innerHTML =
"<h3>" + escapeHtml(data.name) + "</h3>" +
"<p><b>Location:</b> " + escapeHtml(data.location) + "</p>" +
"<p><b>Time:</b> " + escapeHtml(data.time) + "</p>" +
"<p class='muted'><small>Posted: " + createdAt + "</small></p>";
eventsList.appendChild(card);
});

} catch (err) {
eventsList.innerHTML = "<p>Error loading events: " + escapeHtml(err.message) + "</p>";
}
}

function goHome() { switchScreen(homeScreen); }

// Keep UI in sync with auth state
onAuthStateChanged(auth, function(user){
if (user) switchScreen(homeScreen);
else switchScreen(authScreen);
});

// Prevent injected HTML
function escapeHtml(str) {
if (!str) return "";
return String(str).replace(/[&<>"'`=\/]/g, s => ({
"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"
})[s]);
}
