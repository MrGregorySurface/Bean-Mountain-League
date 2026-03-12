// ======================
// COUNTDOWN
// ======================
const draftDate = new Date("August 26, 2026 19:00:00").getTime();

setInterval(function () {
  const now = new Date().getTime();
  const distance = draftDate - now;

  if (distance < 0) {
    document.getElementById("countdown").innerHTML = "DRAFT DAY!";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("countdown").innerHTML =
    `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`;
}, 1000);


// ======================
// TEAM MANAGEMENT
// ======================
document.addEventListener("DOMContentLoaded", loadTeams);

// EVENT DELEGATION
document.addEventListener("click", function (e) {
  const card = e.target.closest(".team-card");
  if (!card) return;

  if (e.target.classList.contains("edit-btn")) {
    if (verifyPin(card)) handleEdit(card);
  }

  if (e.target.classList.contains("reset-btn")) {
    if (verifyPin(card)) handleReset(card);
  }

  if (e.target.classList.contains("delete-btn")) {
    if (verifyPin(card)) handleDelete(card);
  }
});

// ======================
// IMAGE UPLOAD
// ======================
document.addEventListener("click", async function (e) {
  const logo = e.target.closest(".team-logo");
  if (!logo) return;

  const card = logo.closest(".team-card");

  // Must verify PIN before changing image
  const verified = await verifyPin(card);
  if (!verified) return;

  const fileInput = card.querySelector(".logo-upload");
  fileInput.click();
});

document.addEventListener("change", function (e) {
  if (!e.target.classList.contains("logo-upload")) return;

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    const card = e.target.closest(".team-card");
    const img = card.querySelector(".team-logo");
    img.src = event.target.result;
    saveTeams();
  };

  reader.readAsDataURL(file);
});


// ======================
// PIN VERIFICATION
// ======================
function verifyPin(card) {
  let pin = card.dataset.pin;

  // No PIN yet → create one
  if (!pin) {
    const newPin = prompt("Create a 4-digit PIN for this team:");

    if (!/^\d{4}$/.test(newPin)) {
      alert("PIN must be exactly 4 digits.");
      return false;
    }

    card.dataset.pin = newPin;
    saveTeams();
    alert("PIN created successfully!");
    return true;
  }

  // PIN exists → verify
  const entered = prompt("Enter your 4-digit PIN:");

  if (entered !== pin) {
    alert("Incorrect PIN.");
    return false;
  }

  return true;
}


// ======================
// BUTTON ACTIONS
// ======================
function handleEdit(card) {
  const teamName = prompt("Team Name:", card.querySelector("h3").innerText);
  const ownerName = prompt("Owner Username:", card.querySelector("p").innerText);
  const logoUrl = prompt("Logo URL:", card.querySelector("img").src);

  if (teamName) card.querySelector("h3").innerText = teamName;
  if (ownerName) card.querySelector("p").innerText = ownerName;
  if (logoUrl) card.querySelector("img").src = logoUrl;

  saveTeams();
}

function handleReset(card) {
  if (!confirm("Reset this team card?")) return;

  card.querySelector("h3").innerText = "Team Name";
  card.querySelector("p").innerText = "Owner Username";
  card.querySelector("img").src = "https://via.placeholder.com/120";

  delete card.dataset.pin;
  saveTeams();
}

function handleDelete(card) {
  if (!confirm("Delete this team permanently?")) return;

  card.remove();
  saveTeams();
}


// ======================
// SAVE / LOAD
// ======================
function saveTeams() {
  const cards = document.querySelectorAll(".team-card");
  const data = [];

  cards.forEach(card => {
    data.push({
      teamName: card.querySelector("h3").innerText,
      ownerName: card.querySelector("p").innerText,
      logo: card.querySelector("img").src,
      pin: card.dataset.pin || null
    });
  });

  localStorage.setItem("teams", JSON.stringify(data));
}

function loadTeams() {
  const saved = JSON.parse(localStorage.getItem("teams"));
  if (!saved) return;

  const grid = document.querySelector(".team-grid");
  grid.innerHTML = "";

  saved.forEach(team => {
    const card = document.createElement("div");
    card.classList.add("team-card");
    if (team.pin) card.dataset.pin = team.pin;

    card.innerHTML = `
      <div class="logo-container">
  <img src="${team.logo}" class="team-logo">
  <input type="file" class="logo-upload" accept="image/*" hidden>
</div>
      <div class="team-info">
        <h3>${team.teamName}</h3>
        <p>${team.ownerName}</p>
      </div>
      <button class="edit-btn">Edit</button>
      <button class="reset-btn">Reset</button>
      <button class="delete-btn">Delete</button>
    `;

    grid.appendChild(card);
  });
}


// ======================
// ADD TEAM
// ======================
document.getElementById("add-team-btn").addEventListener("click", function () {
  const grid = document.querySelector(".team-grid");

  const card = document.createElement("div");
  card.classList.add("team-card");

  card.innerHTML = `
    <div class="logo-container">
  <img src="https://via.placeholder.com/120" class="team-logo">
  <input type="file" class="logo-upload" accept="image/*" hidden>
</div>
    <div class="team-info">
      <h3>Team Name</h3>
      <p>Owner Username</p>
    </div>
    <button class="edit-btn">Edit</button>
    <button class="reset-btn">Reset</button>
    <button class="delete-btn">Delete</button>
  `;

  grid.appendChild(card);
  saveTeams();
});