import { auth, db, firebaseConfig } from "./firebase-config.js";

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

console.log("🔥 Firebase Loaded");
console.log("API KEY:", firebaseConfig.apiKey);

// -------------------------------------
// Elements
// -------------------------------------
const authScreen = document.getElementById("auth-screen");
const homeScreen = document.getElementById("home-screen");
const createEventScreen = document.getElementById("create-event-screen");
const eventsScreen = document.getElementById("events-screen");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const eventsList = document.getElementById("events-list");

// Buttons
document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("signup-btn").addEventListener("click", signup);
document.getElementById("logout-btn").addEventListener("click", logout);
document.getElementById("create-party-btn").addEventListener("click", showCreateEvent);
document.getElementById("view-parties-btn").addEventListener("click", loadEvents);
document.getElementById("post-party-btn").addEventListener("click", createEvent);
document.getElementById("back-from-create").addEventListener("click", goHome);
document.getElementById("back-from-events").addEventListener("click", goHome);

// -------------------------------------
// Auth: LOGIN
// -------------------------------------
async function login() {
let email = emailInput.value.trim();
let password = passwordInput.value;

if (!email || !password) {
alert("Please enter email and password.");
return;
}

try {
await signInWithEmailAndPassword(auth, email, password);
switchScreen(homeScreen);
} catch (err) {
alert("Login failed: " + err.message);
}
}

// -------------------------------------
// Auth: SIGNUP
// -------------------------------------
async function signup() {
let email = emailInput.value.trim();
let password = passwordInput.value;

if (!email || !password) {
alert("Please enter email and password.");
return;
}

try {
await createUserWithEmailAndPassword(auth, email, password);
switchScreen(homeScreen);
} catch (err) {
alert("Signup failed: " + err.message);
}
}

// -------------------------------------
// Logout
// -------------------------------------
async function logout() {
await signOut(auth);
switchScreen(authScreen);
}

// -------------------------------------
// Screen switching
// -------------------------------------
function switchScreen(screen) {
authScreen.classList.add("hidden");
homeScreen.classList.add("hidden");
createEventScreen.classList.add("hidden");
eventsScreen.classList.add("hidden");

screen.classList.remove("hidden");
}

function showCreateEvent() {
switchScreen(createEventScreen);
}

// -------------------------------------
// Create new event (party)
// -------------------------------------
async function createEvent() {
let name = document.getElementById("event-name").value.trim();
let location = document.getElementById("event-location").value.trim();
let time = document.getElementById("event-time").value;

if (!name || !location || !time) {
alert("Please fill all fields.");
return;
}

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

// -------------------------------------
// Load events list
// -------------------------------------
async function loadEvents() {
switchScreen(eventsScreen);
eventsList.innerHTML = "<p>Loading...</p>";

try {
const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
const snapshot = await getDocs(q);

eventsList.innerHTML = "";

if (snapshot.empty) {
eventsList.innerHTML = "<p>No parties yet.</p>";
return;
}

snapshot.forEach(doc => {
const data = doc.data();
const createdAt = data.createdAt?.toDate().toLocaleString() ?? "—";

const card = document.createElement("div");
card.className = "event-card";
card.innerHTML = `
<h3>${escapeHtml(data.name)}</h3>
<p><b>Location:</b> ${escapeHtml(data.location)}</p>
<p><b>Time:</b> ${escapeHtml(data.time)}</p>
<p class='muted'><small>Posted: ${createdAt}</small></p>
`;
eventsList.appendChild(card);
});

} catch (err) {
eventsList.innerHTML = `<p>Error loading events: ${escapeHtml(err.message)}</p>`;
}
}

function goHome() {
switchScreen(homeScreen);
}

// -------------------------------------
// Keep UI synced with auth state
// -------------------------------------
onAuthStateChanged(auth, user => {
if (user) switchScreen(homeScreen);
else switchScreen(authScreen);
});

// -------------------------------------
// Prevent HTML injection
// -------------------------------------
function escapeHtml(str) {
if (!str) return "";
return String(str).replace(/[&<>"'`=\/]/g, s => ({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
"\"":"&quot;",
"'":"&#39;",
"/":"&#x2F;",
"`":"&#x60;",
"=":"&#x3D;"
})[s]);
}

// -------------------------------------
// Make Firebase functions available in console
// -------------------------------------
window.auth = auth;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signOut = signOut;
