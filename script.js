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

  auth.signInWithEmailAndPassword(email, password)
    .then(function() { switchScreen(homeScreen); })
    .catch(function(err){ alert(err.message); });
}

function signup() {
  var email = emailInput.value.trim();
  var password = passwordInput.value;
  if (!email || !password) return alert("Please enter email and password.");

  auth.createUserWithEmailAndPassword(email, password)
    .then(function() { switchScreen(homeScreen); })
    .catch(function(err){ alert(err.message); });
}

function logout() {
  auth.signOut().then(function(){ switchScreen(authScreen); });
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

function createEvent() {
  var name = document.getElementById("event-name").value.trim();
  var location = document.getElementById("event-location").value.trim();
  var time = document.getElementById("event-time").value;

  if (!name || !location || !time) { alert("Please fill all fields."); return; }

  db.collection("events").add({
    name: name,
    location: location,
    time: time,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function(){
    alert("Party created!");
    document.getElementById("event-name").value = "";
    document.getElementById("event-location").value = "";
    document.getElementById("event-time").value = "";
    switchScreen(homeScreen);
  }).catch(function(err){ alert(err.message); });
}

function loadEvents() {
  switchScreen(eventsScreen);
  eventsList.innerHTML = "<p>Loading...</p>";

  db.collection("events")
    .orderBy("createdAt", "desc")
    .get()
    .then(function(snapshot){
      eventsList.innerHTML = "";
      if (snapshot.empty) {
        eventsList.innerHTML = "<p>No parties yet.</p>";
        return;
      }
      snapshot.forEach(function(doc){
        var data = doc.data();
        var createdAt = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : "—";
        var card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = "<h3>"+escapeHtml(data.name)+"</h3>"
                       + "<p><b>Location:</b> "+escapeHtml(data.location)+"</p>"
                       + "<p><b>Time:</b> "+escapeHtml(data.time)+"</p>"
                       + "<p class='muted'><small>Posted: "+createdAt+"</small></p>";
        eventsList.appendChild(card);
      });
    }).catch(function(err){
      eventsList.innerHTML = "<p>Error loading events: "+escapeHtml(err.message)+"</p>";
    });
}

function goHome() { switchScreen(homeScreen); }

// Keep UI in sync with auth state
auth.onAuthStateChanged(function(user){
  if (user) switchScreen(homeScreen);
  else switchScreen(authScreen);
});

// Small utility to prevent injected HTML
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"'`=\/]/g, function(s){
    return ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"
    })[s];
  });
}
