/* ===================================================
   CityCare Hospital - Frontend JavaScript
   ---------------------------------------------------
   Handles:
   - Doctor listing & search
   - Booking appointments (UI only)
   - User authentication modals (frontend validation)
   - Contact form behavior
   ---------------------------------------------------
   Integration Note for Backend (Django):
   LocalStorage parts will be replaced with real API calls.
   =================================================== */


// ===================================================
// 1. Doctor Data (Temporary)
// ===================================================
const doctors = [
  { name: "Dr. John Smith", specialty: "Cardiologist", location: "12 Health Avenue, Sharada Phase 2, Kano, Nigeria", fee: 8000, img: "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80&w=387" },
  { name: "Dr. Lisa Morgan", specialty: "Dermatologist", location: "20 Court Road, Sabon Gari, Kano, Nigeria", fee: 8000, img: "https://images.unsplash.com/photo-1666886573553-453e9cdbd967?auto=format&fit=crop&q=80&w=387" },
  { name: "Dr. Blessing Ogechi", specialty: "Neurologist", location: "31 BUK New Site, Kano, Nigeria", fee: 8000, img: "https://images.unsplash.com/photo-1563116046-563efc1eab55?auto=format&fit=crop&q=80&w=386" },
  { name: "Dr. Umar Musa", specialty: "Pediatrician", location: "261 Ahmadu Bello Way, Nasarawa GRA Kano, Nigeria", fee: 8000, img: "https://images.unsplash.com/photo-1582895361887-24daa40c8667?auto=format&fit=crop&q=80&w=941" },
  { name: "Dr. Aisha Muhammed", specialty: "Orthopedic", location: "158B Al-madina plaza, Zoo Road, Kano, Nigeria", fee: 8000, img: "https://images.unsplash.com/photo-1678695972687-033fa0bdbac9?auto=format&fit=crop&q=80&w=420" },
  { name: "Dr. Joseph Fagbola", specialty: "Gynecologist", location: "12 Avenue, Haji camp, Kano, Nigeria", fee: 8000, img: "https://images.unsplash.com/photo-1666887360742-974c8fce8e6b?auto=format&fit=crop&q=60&w=500" },
  { name: "Dr. Ali Sale", specialty: "Neurologist", location: "129 Health, Zaria Road, Kano, Nigeria", fee: 8000, img: "https://images.unsplash.com/photo-1560856218-0da41ac7c66a?auto=format&fit=crop&q=60&w=500" },
  { name: "Dr. Larry George", specialty: "Cardiologist", location: "129 Kundila Sheka, Kano, Nigeria", fee: 8000, img: "https://images.unsplash.com/photo-1642736468880-b6adf66bdd50?auto=format&fit=crop&q=80&w=870" },
  { name: "Dr. Adebayo Olamide", specialty: "Gynecologist", location: "Tarauni, Kano, Nigeria", fee: 8000, img: "https://images.unsplash.com/photo-1672655412906-8e10ba6ee373?auto=format&fit=crop&q=80&w=786" }
];

// ===================================================
// 2. Render Doctors & Filter
// ===================================================
const doctorsContainer = document.getElementById("doctorsContainer");
const specialtyFilter = document.getElementById("specialtyFilter");

(function initSpecialties() {
  const specs = [...new Set(doctors.map(d => d.specialty))];
  specialtyFilter.innerHTML = `<option value="">All Specialties</option>`;
  specs.forEach(spec => {
    const opt = document.createElement("option");
    opt.value = spec;
    opt.textContent = spec;
    specialtyFilter.appendChild(opt);
  });
  renderDoctors(doctors);
})();

function renderDoctors(list) {
  doctorsContainer.innerHTML = "";
  list.forEach(doc => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${doc.img}" alt="${doc.name}">
      <h3>${doc.name}</h3>
      <p>${doc.specialty}</p>
      <p>${doc.location}</p>
      <p class="fee">Fee: ₦${doc.fee}</p>
      <button type="button" onclick="openBookingModal('${doc.name}')">Book Appointment</button>
    `;
    doctorsContainer.appendChild(card);
  });
}

function applyDoctorSearch() {
  const search = (document.getElementById("doctorSearch").value || "").toLowerCase();
  const filter = specialtyFilter.value;
  const filtered = doctors.filter(d =>
    (d.name.toLowerCase().includes(search) || d.specialty.toLowerCase().includes(search)) &&
    (filter === "" || d.specialty === filter)
  );
  renderDoctors(filtered);
}

function resetDoctorFilters() {
  document.getElementById("doctorSearch").value = "";
  specialtyFilter.value = "";
  renderDoctors(doctors);
}

// ===================================================
// 3. Booking & Confirmation
// ===================================================
let currentDoctor = null;
let selectedSlot = null;

function openBookingModal(docName) {
  const user = JSON.parse(localStorage.getItem("citycareUser"));
  if (!user) {
    window.pendingDoctor = docName;
    window.pendingBooking = true;
    openModal(registerModal);
    return;
  }

  currentDoctor = doctors.find(d => d.name === docName);
  if (!currentDoctor) return;

  const modal = document.getElementById("bookingModal");
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  document.getElementById("modalDocName").textContent = `Book Appointment with ${currentDoctor.name}`;
  document.getElementById("modalDocShort").textContent = currentDoctor.name;
  document.getElementById("modalSpec").textContent = currentDoctor.specialty;
  document.getElementById("modalAvatar").src = currentDoctor.img;
  document.getElementById("modalFee").textContent = `Fee: ₦${currentDoctor.fee}`;
  document.getElementById("modalLocation").textContent = currentDoctor.location;

  document.getElementById("bookingFormSection").style.display = "flex";
  document.getElementById("receiptSection").style.display = "none";

  const slotsDiv = document.getElementById("modalSlots");
  slotsDiv.innerHTML = "";
  selectedSlot = null;
  document.getElementById("modalSelectedSlot").textContent = "Time: —";

  const slots = ["09:00 AM", "10:00 AM", "1:30 PM", "16:00 PM", "20:00 PM"];
  slots.forEach(time => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot-btn";
    btn.textContent = time;
    btn.onclick = () => selectSlot(time, btn);
    slotsDiv.appendChild(btn);
  });
}

function selectSlot(slot, btn) {
  selectedSlot = slot;
  document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("modalSelectedSlot").textContent = `Time: ${slot}`;
}

function confirmModalBooking() {
  // Get all values
  const nameInput = document.getElementById("patientName");
  const numberInput = document.getElementById("patientNumber");
  const dateInput = document.getElementById("modalDate");
  const reasonInput = document.getElementById("modalReason");
  const typeInput = document.getElementById("modalType");

  const name = nameInput.value.trim();
  const number = numberInput.value.trim();
  const date = dateInput.value;
  const reason = reasonInput.value.trim();
  const type = typeInput.value;

  // Clear previous errors
  document.querySelectorAll(".error-text").forEach(el => el.remove());

  let hasError = false;

  // Helper function to show error under input
  function showError(input, message) {
    const error = document.createElement("small");
    error.className = "error-text";
    error.style.color = "red";
    error.style.fontSize = "13px";
    error.style.marginTop = "3px";
    error.textContent = message;
    input.insertAdjacentElement("afterend", error);
    hasError = true;
  }

  // Validation checks
  if (!name) showError(nameInput, "Please enter your name.");
  if (!number) showError(numberInput, "Please enter your phone number.");
  if (!date) showError(dateInput, "Please select a date.");
  if (!selectedSlot) {
    const slotsDiv = document.getElementById("modalSlots");
    const error = document.createElement("small");
    error.className = "error-text";
    error.style.color = "red";
    error.style.fontSize = "13px";
    error.textContent = "Please select a time slot.";
    slotsDiv.insertAdjacentElement("afterend", error);
    hasError = true;
  }

  if (hasError) return; // Stop form submission if there are errors

  // Proceed if no errors
  const booking = {
    doctor: currentDoctor.name,
    specialty: currentDoctor.specialty,
    location: currentDoctor.location,
    patient: name,
    number,
    date,
    time: selectedSlot,
    type,
    reason,
    fee: currentDoctor.fee
  };

  let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  appointments.push(booking);
  localStorage.setItem("appointments", JSON.stringify(appointments));

  showConfirmationModal(booking);
}


function showConfirmationModal(booking) {
  const modal = document.getElementById("bookingModal");
  document.getElementById("rPatient").textContent = booking.patient;
  document.getElementById("rDoctor").textContent = booking.doctor;
  document.getElementById("rSpec").textContent = booking.specialty;
  document.getElementById("rLocation").textContent = booking.location;
  document.getElementById("rDate").textContent = booking.date;
  document.getElementById("rTime").textContent = booking.time;
  document.getElementById("rType").textContent = booking.type;
  document.getElementById("rNumber").textContent = booking.number;
  document.getElementById("rReason").textContent = booking.reason || "N/A";
  document.getElementById("rFee").textContent = `₦${booking.fee}`;

  document.getElementById("bookingFormSection").style.display = "none";
  document.getElementById("receiptSection").style.display = "block";
}

function closeBookingModal() {
  document.getElementById("bookingModal").style.display = "none";
}

// ===================================================
// 4. Authentication
// ===================================================
const registerModal = document.getElementById("modal-register");
const loginModal = document.getElementById("modal-login");
const registerOpenBtns = document.querySelectorAll("#register-open");
const loginOpenBtns = document.querySelectorAll("#login-open");
const modalCloseBtns = document.querySelectorAll("[data-close]");
const switchToLogin = document.getElementById("switch-to-login");
const switchToRegister = document.getElementById("switch-to-register");

registerOpenBtns.forEach(btn => btn.addEventListener("click", () => openModal(registerModal)));
loginOpenBtns.forEach(btn => btn.addEventListener("click", () => openModal(loginModal)));
modalCloseBtns.forEach(btn => btn.addEventListener("click", e => closeModal(document.getElementById(e.target.getAttribute("data-close")))));
switchToLogin.addEventListener("click", () => { closeModal(registerModal); openModal(loginModal); });
switchToRegister.addEventListener("click", () => { closeModal(loginModal); openModal(registerModal); });

function openModal(modal) { modal.style.display = "flex"; }
function closeModal(modal) { modal.style.display = "none"; }

// Register
document.getElementById("register-form").addEventListener("submit", e => {
  e.preventDefault();
  const firstname = e.target.firstname.value.trim();
  const lastname = e.target.lastname.value.trim();
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  const users = JSON.parse(localStorage.getItem("citycareUsers")) || [];
  if (users.some(u => u.email === email)) {
    alert("Account already exists.");
    return;
  }

  const newUser = { firstname, lastname, email, password };
  users.push(newUser);
  localStorage.setItem("citycareUsers", JSON.stringify(users));
  localStorage.setItem("citycareUser", JSON.stringify(newUser));

  closeModal(registerModal);
  showUserLoggedIn(newUser);
  alert(`Welcome, ${firstname}!`);
  if (window.pendingBooking) continuePendingBooking();
});

// Login
document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  const users = JSON.parse(localStorage.getItem("citycareUsers")) || [];
  const found = users.find(u => u.email === email && u.password === password);
  if (!found) return alert("Invalid credentials.");

  localStorage.setItem("citycareUser", JSON.stringify(found));
  closeModal(loginModal);
  showUserLoggedIn(found);
  alert(`Welcome back, ${firstname}!`);
  if (window.pendingBooking) continuePendingBooking();
});

// ===================================================
// 5. Show Logged-In User (Desktop + Mobile)
// ===================================================
function showUserLoggedIn(user) {
  const headerAuth = document.querySelector(".auth-buttons");
  const drawerAuth = document.querySelector(".drawer-auth");

  // Desktop
  headerAuth.innerHTML = `
    <div class="user-menu">
      <span id="patientNameHeader">👤 ${user.firstname} ${user.lastname}</span>
      <button id="logout-btn" class="btn logout-btn">Logout</button>
    </div>
  `;

  // Mobile Drawer
  drawerAuth.innerHTML = `
    <div class="user-menu">
      <span id="patientNameHeaderMobile">${user.firstname} ${user.lastname}</span>
      <button id="logout-btn-mobile" class="btn logout-btn">Logout</button>
    </div>
  `;

  // Logout both
  document.getElementById("logout-btn").addEventListener("click", logoutUser);
  document.getElementById("logout-btn-mobile").addEventListener("click", logoutUser);
}

function logoutUser() {
  localStorage.removeItem("citycareUser");
  location.reload();
}

window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("citycareUser"));
  if (user) showUserLoggedIn(user);
});

// ===================================================
// 6. Pending Booking Resume
// ===================================================
function continuePendingBooking() {
  if (window.pendingDoctor) {
    openBookingModal(window.pendingDoctor);
    window.pendingDoctor = null;
    window.pendingBooking = false;
  }
}

// ===================================================
// 7. Navigation
// ===================================================
const menuBtn = document.getElementById('menuBtn');
const navDrawer = document.getElementById('navDrawer');
const closeDrawer = document.getElementById('closeDrawer');
const navOverlay = document.getElementById('navOverlay');

menuBtn.addEventListener('click', () => {
  navDrawer.classList.add('active');
  navOverlay.classList.add('active');
});

closeDrawer.addEventListener('click', closeMenu);
navOverlay.addEventListener('click', closeMenu);

function closeMenu() {
  navDrawer.classList.remove('active');
  navOverlay.classList.remove('active');
}

// Auto close drawer when resizing back to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMenu();
  }
});

/* ===================================================
   8 DOWNLOAD RECEIPT FUNCTION
   ---------------------------------------------------
   Converts the confirmation receipt section to an image
   and downloads it to the user's device.
=================================================== */
function downloadReceipt() {
  const receiptSection = document.getElementById("receiptSection");

  if (!receiptSection) {
    console.error("Receipt section not found!");
    return;
  }

  // Disable button temporarily to prevent multiple clicks
  const downloadBtn = document.querySelector(".download-btn");
  downloadBtn.disabled = true;
  downloadBtn.textContent = "Downloaded";

  html2canvas(receiptSection, { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.download = "CityCare_ Doctor_Appointment_Receipt.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    // Re-enable button
    downloadBtn.disabled = false;
    downloadBtn.textContent = "Download Receipt";
  }).catch(err => {
    console.error("Error generating receipt:", err);
    alert("Failed to download receipt. Please try again.");
    downloadBtn.disabled = false;
    downloadBtn.textContent = "Download Receipt";
  });
}

