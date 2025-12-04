const API_BASE = "http://localhost:4000";

let currentUser = JSON.parse(localStorage.getItem("user")) || null;

// Elements
const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const statusEl = document.getElementById("status");
const postBtn = document.getElementById("post-btn");
const achievementInput = document.getElementById("achievement-input");
const feedEl = document.getElementById("feed");

function updateUI() {
  if (currentUser) {
    statusEl.textContent = `Innlogget som ${currentUser.email}`;
    logoutBtn.style.display = "inline-block";
    postBtn.disabled = false;
  } else {
    statusEl.textContent = "Ikke innlogget";
    logoutBtn.style.display = "none";
    postBtn.disabled = true;
  }
}

// ---------------- AUTH ----------------

async function api(path, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, options);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "En feil oppstod");
  }

  return res.json();
}

signupBtn.addEventListener("click", async () => {
  try {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      statusEl.textContent = "Fyll ut e-post og passord";
      statusEl.style.color = "red";
      return;
    }

    const user = await api("/api/signup", "POST", { email, password });

    currentUser = user;
    localStorage.setItem("user", JSON.stringify(user));

    statusEl.textContent = "Bruker laget og innlogget!";
    statusEl.style.color = "green";

    updateUI();
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.style.color = "red";
  }
});

loginBtn.addEventListener("click", async () => {
  try {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const user = await api("/api/login", "POST", { email, password });

    currentUser = user;
    localStorage.setItem("user", JSON.stringify(user));

    statusEl.textContent = "Logget inn!";
    statusEl.style.color = "green";

    updateUI();
  } catch (err) {
    statusEl.textContent = err.message;
    statusEl.style.color = "red";
  }
});

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("user");
  updateUI();
  statusEl.textContent = "Logget ut";
  statusEl.style.color = "black";
});

// ---------------- POST ACHIEVEMENT ----------
