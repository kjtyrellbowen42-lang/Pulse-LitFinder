// script.js — rewritten for Firebase v9 + v10 syntax

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

// UI elements
const authScreen = document.getElementById("auth-screen");
const homeScreen = document.getElementById("home-screen");
const createEventScreen = document.getElementById("create-event-screen");
const eventsScreen = document.getElementById("events-screen");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const eventsList = document.getElementById("events-list");

// Button listeners
document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("signup-btn").addEventListener("click", signup);
document.getElementById("logout-btn").addEventListener("click", logout);
document.getElementById("create-party-btn").addEventListener("click", showCreateEvent);
document.getElementById("view-parties-btn").addEventListener("click", loadEvents);
document.getElementById("post-party-btn").addEventListener("click", createEvent);
document.getElementById("back-from-create").addEventListener("click", goHome);
document.getElementById("back-from-events").addEventListener("click", goHome);

// Login
async function login() {
const email = emailInput.value.trim();
const password = passwordInput.value;
if (!email || !password) return alert("Enter email & password.");

try {
await signInWithEmailAndPassword(auth, email, password);
switchScreen(homeScreen);
} catch (err) {
alert(err.message);
}
}

// Sign up
async function signup() {
const email = emailInput.value.trim();
const password = passwordInput.value;
if (!email || !password) return alert("Enter email & password.");

try {
await createUserWithEmailAndPassword(auth, email, password);
switchScreen(homeScreen);
} catch (err) {
alert(err.message);
}
}

// Logout
async function logout() {
await signOut(auth);
switchScreen(authScreen);
}

// Screen switching
function switchScreen(screen) {
[authScreen, homeScreen, createEventScreen, eventsScreen]
.forEach(s => s.classList.add("hidden"));

screen.classList.remove("hidden");
}

function showCreateEvent() {
switchScreen(createEventScreen);
}

// Create event
async function createEvent() {
const name = document.getElementById("event-name").value.trim();
const location = document.getElementById("event-location").value.trim();
const time = document.getElementById("event-time").value;

if (!name || !location || !time) return alert("Fill all fields!");

try {
await addDoc(collection(db, "events"), {
name,
location,
time,
createdAt: serverTimestamp(),
user: auth.currentUser?.uid ?? null
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

// Load events
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
const data = doc.data();
const createdAt = data.createdAt?.toDate().toLocaleString() ?? "Unknown";

const card = document.createElement("div");
card.className = "event-card";
card.innerHTML = `
<h3>${escapeHtml(data.name)}</h3>
<p><b>Location:</b> ${escapeHtml(data.location)}</p>
<p><b>Time:</b> ${escapeHtml(data.time)}</p>
<p class="muted"><small>Posted: ${createdAt}</small></p>
`;
eventsList.appendChild(card);
});

} catch (err) {
eventsList.innerHTML = `<p>Error loading: ${escapeHtml(err.message)}</p>`;
}
}

// Back to home
function goHome() {
switchScreen(homeScreen);
}

// Auth state listener
onAuthStateChanged(auth, user => {
switchScreen(user ? homeScreen : authScreen);
});

// Security formatting
function escapeHtml(str) {
return String(str ?? "").replace(/[&<>"'`=\/]/g, s => ({
"&": "&amp;",
"<": "&lt;",
">": "&gt;",
"\"": "&quot;",
"'": "&#39;",
"/": "&#x2F;",
"`": "&#x60;",
"=": "&#x3D;"
})[s]);
}
