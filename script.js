/*
    CITYCARE HOSPITAL - FRONTEND SCRIPT (PROJECT)
   ---------------------------------------------------
   DEVELOPER: MUHAMMED FARUQ
   LAST UPDATED: October 2025

   DESCRIPTION:
     This JavaScript file powers all the interactive 
     features of the CityCare Hospital web application. 
     It manages doctor listings, appointment booking, 
     user authentication, and patient session handling. 
     Designed for a smooth, responsive, and user-friendly 
     hospital booking experience — all running entirely 
     on the frontend using HTML, CSS, and JavaScript.

   MODULES:
     1. Doctor Search & Filter
     2. Booking Modal & Appointment Validation
     3. User Authentication (Register / Login)
     4. Logged-in UI Handling
     5. Navigation Drawer (Responsive)
     6. Resume Pending Bookings
     7. Receipt Download (as Image)  
   ----------------------------------------------------
*/


/* 1. DOCTOR SEARCH & FILTER */

// Search doctors
function applyDoctorSearch() {
  const search = document.getElementById("doctorSearch").value.toLowerCase();
  const filter = document.getElementById("specialtyFilter").value.toLowerCase();
  const cards = document.querySelectorAll(".doctor-card");
  
  let visibleCount = 0; //Count how many doctors are visible

  cards.forEach(card => {
    const name = card.querySelector("h3").textContent.toLowerCase();
    const specialty = card.querySelector(".specialty").textContent.toLowerCase();
    const matchesSearch = name.includes(search) || specialty.includes(search);
    const matchesFilter = filter === "" || specialty.includes(filter);
    const isVisible = matchesSearch && matchesFilter;
    
    card.style.display = isVisible ? "block" : "none";
    if (isVisible) visibleCount++;
  });

  // Check if no doctors match the search
  let message = document.getElementById("noDoctorMessage");

  if (!message) {
    message = document.createElement("p");
    message.id = "noDoctorMessage";
    message.textContent = "No doctors found.";
    message.style.textAlign = "center";
    message.style.marginTop = "20px";
    message.style.color = "#666";
    document.getElementById("doctorsContainer").appendChild(message);
  }

  // Show or hide the message based on results
  message.style.display = visibleCount === 0 ? "block" : "none";
}


// Reset filters and show all doctors
function resetDoctorFilters() {
  document.getElementById("doctorSearch").value = "";
  document.getElementById("specialtyFilter").value = "";
  document.querySelectorAll(".doctor-card").forEach(card => card.style.display = "block");
}

// Load specialties into dropdown and restore user session
window.addEventListener("DOMContentLoaded", () => {
  const specialties = [...new Set([...document.querySelectorAll(".specialty")].map(s => s.textContent))];
  const specialtyFilter = document.getElementById("specialtyFilter");
  specialtyFilter.innerHTML = `<option value="">All Specialties</option>`;
  specialties.forEach(spec => {
    const opt = document.createElement("option");
    opt.value = spec;
    opt.textContent = spec;
    specialtyFilter.appendChild(opt);
  });

  const user = JSON.parse(localStorage.getItem("citycareUser"));
  if (user) showUserLoggedIn(user);
});


/* 2. BOOKING & CONFIRMATION */
let currentDoctor = null;
let selectedSlot = null;

// Open booking modal 
function openBookingModal(docName, fee) {
  const user = JSON.parse(localStorage.getItem("citycareUser"));
  if (!user) {
    // Ask user to register first
    window.pendingDoctor = docName;
    window.pendingBooking = true;
    openModal(registerModal);
    return;
  }

  // Get doctor details from HTML
  const card = [...document.querySelectorAll(".doctor-card")]
    .find(c => c.querySelector("h3").textContent === docName);

  

  const specialty = card.querySelector(".specialty").textContent;
  const location = card.querySelector("p:nth-of-type(2)").textContent;
  const img = card.querySelector("img").src;

  const modal = document.getElementById("bookingModal");
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");

  document.getElementById("modalDocName").textContent = `Book Appointment with ${docName}`;
  document.getElementById("modalDocShort").textContent = docName;
  document.getElementById("modalSpec").textContent = specialty;
  document.getElementById("modalAvatar").src = img;
  document.getElementById("modalFee").textContent = fee;
  document.getElementById("modalLocation").textContent = location;

  document.getElementById("bookingFormSection").style.display = "flex";
  document.getElementById("receiptSection").style.display = "none";

  // Generate time slots
  const slotsDiv = document.getElementById("timeSlots");
  slotsDiv.innerHTML = "";
  selectedSlot = null;
  document.getElementById("modalSelectedSlot").textContent = "Time: —";

  const slots = ["09:00 AM", "10:00 AM", "1:30 PM", "4:00 PM", "8:00 PM"];
  slots.forEach(time => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "slot-btn";
    btn.textContent = time;
    btn.onclick = () => selectSlot(time, btn);
    slotsDiv.appendChild(btn);
  });
}

// Select time slot
function selectSlot(slot, btn) {
  selectedSlot = slot;
  document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("modalSelectedSlot").textContent = `Time: ${slot}`;
}

// Confirm booking and save
function confirmBooking() {
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

  // Clear old errors
  document.querySelectorAll(".error-text").forEach(el => el.remove());
  let hasError = false;

  function showInputError(input, message) {
    const error = document.createElement("small");
    error.className = "error-text";
    error.style.color = "red";
    error.textContent = message;
    input.insertAdjacentElement("afterend", error);
    hasError = true;
  }

  if (!name) showInputError(nameInput, "Please enter your name");
  if (!number) showInputError(numberInput, "Please enter your phone number");
  if (!date) showInputError(dateInput, "Please select a date.");
  if (!selectedSlot) {
    const slotsDiv = document.getElementById("timeSlots");
    const error = document.createElement("small");
    error.className = "error-text";
    error.style.color = "red";
    error.textContent = "Please select a time slot.";
    slotsDiv.insertAdjacentElement("afterend", error);
    hasError = true;
  }

  if (hasError) return;

  // Save booking to localStorage
  const booking = {
    doctor: document.getElementById("modalDocShort").textContent,
    specialty: document.getElementById("modalSpec").textContent,
    location: document.getElementById("modalLocation").textContent,
    patient: name,
    number,
    date,
    time: selectedSlot,
    type,
    reason,
    fee: document.getElementById("modalFee").textContent.replace("Fee: ", ""),
    status: "Pending"
  };

  const appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  appointments.push(booking);
  localStorage.setItem("appointments", JSON.stringify(appointments));

  showConfirmationModal(booking);
}

// Show confirmation receipt
function showConfirmationModal(booking) {
  document.getElementById("rPatient").textContent = booking.patient;
  document.getElementById("rDoctor").textContent = booking.doctor;
  document.getElementById("rSpec").textContent = booking.specialty;
  document.getElementById("rLocation").textContent = booking.location;
  document.getElementById("rDate").textContent = booking.date;
  document.getElementById("rTime").textContent = booking.time;
  document.getElementById("rType").textContent = booking.type;
  document.getElementById("rNumber").textContent = booking.number;
  document.getElementById("rReason").textContent = booking.reason || "N/A";
  document.getElementById("rFee").textContent = booking.fee;

  document.getElementById("bookingFormSection").style.display = "none";
  document.getElementById("receiptSection").style.display = "block";
}

// Close booking modal
function closeBookingModal() {
  document.getElementById("bookingModal").style.display = "none";
}


/* 3. USER AUTHENTICATION (REGISTER / LOGIN) */

const registerModal = document.getElementById("modal-register");
const loginModal = document.getElementById("modal-login");

// Buttons and links for opening/closing modals
const registerOpenBtns = document.querySelectorAll("#register-open");
const loginOpenBtns = document.querySelectorAll("#login-open");
const modalCloseBtns = document.querySelectorAll("[data-close]");
const switchToLogin = document.getElementById("switch-to-login");
const switchToRegister = document.getElementById("switch-to-register");

// Modal open/close functionality
registerOpenBtns.forEach(btn => btn.addEventListener("click", () => openModal(registerModal)));
loginOpenBtns.forEach(btn => btn.addEventListener("click", () => openModal(loginModal)));
modalCloseBtns.forEach(btn => btn.addEventListener("click", e => closeModal(document.getElementById(e.target.getAttribute("data-close")))));
switchToLogin.addEventListener("click", () => { closeModal(registerModal); openModal(loginModal); });
switchToRegister.addEventListener("click", () => { closeModal(loginModal); openModal(registerModal); });

function openModal(modal) { modal.style.display = "flex"; }
function closeModal(modal) { modal.style.display = "none"; }


// REGISTER FUNCTION //
document.getElementById("register-form").addEventListener("submit", e => {
  e.preventDefault();

  // Get user input
  const firstname = e.target.firstname.value.trim();
  const lastname = e.target.lastname.value.trim();
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  // Get error message 
  const firstnameError = document.getElementById("firstname-error");
  const lastnameError = document.getElementById("lastname-error");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");

  // Clear any previous error messages
  [firstnameError, lastnameError, emailError, passwordError].forEach(el => el.textContent = "");

  let hasError = false;

  // Validate first name (at least 5 letters)
  if (!firstname) {
    firstnameError.textContent = "Please enter your first name.";
    hasError = true;
  } else if (firstname.length < 5) {
    firstnameError.textContent = "First name must be at least 5 letters.";
    hasError = true;
  }

  // Validate last name (at least 4 letters)
  if (!lastname) {
    lastnameError.textContent = "Please enter your last name.";
    hasError = true;
  } else if (lastname.length < 4) {
    lastnameError.textContent = "Last name must be at least 4 letters.";
    hasError = true;
  }

  // Validate email format
  if (!email) {
    emailError.textContent = "Please enter your email address.";
    hasError = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.textContent = "Please enter a valid email address.";
    hasError = true;
  }

  // Validate password (min 6 characters)
  if (!password) {
    passwordError.textContent = "Please enter your password.";
    hasError = true;
  } else if (password.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters long.";
    hasError = true;
  }

  if (hasError) return; // Stop if there’s any error

  // Check if email already exists
  const users = JSON.parse(localStorage.getItem("citycareUsers")) || [];
  if (users.some(u => u.email === email)) {
    emailError.textContent = "An account already exists with this email.";
    return;
  }

  // Save new user data in localStorage
  const newUser = { firstname, lastname, email, password };
  users.push(newUser);
  localStorage.setItem("citycareUsers", JSON.stringify(users));
  localStorage.setItem("citycareUser", JSON.stringify(newUser));

  // Close modal and show welcome message
  closeModal(registerModal);
  showUserLoggedIn(newUser);
  alert(`Welcome, ${firstname} ${lastname}`);

  // If booking was pending before registration, continue it
  if (window.pendingBooking) continuePendingBooking();
});


// LOGIN FUNCTION //
document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();

  // Get login inputs
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  const emailError = document.getElementById("login-email-error");
  const passwordError = document.getElementById("login-password-error");

  // Clear old errors
  emailError.textContent = "";
  passwordError.textContent = "";

  let hasError = false;

  // Validate email
  if (!email) {
    emailError.textContent = "Please enter your email address.";
    hasError = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailError.textContent = "Please enter a valid email address.";
    hasError = true;
  }

  // Validate password
  if (!password) {
    passwordError.textContent = "Please enter your password.";
    hasError = true;
  } else if (password.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters long.";
    hasError = true;
  }

  if (hasError) return; // Stop if invalid input

  // Check if user exists and credentials match
  const users = JSON.parse(localStorage.getItem("citycareUsers")) || [];
  const foundUser = users.find(u => u.email === email && u.password === password);

  if (!foundUser) {
    passwordError.textContent = "Invalid email or password.";
    return;
  }

  // Store logged-in user and update UI
  localStorage.setItem("citycareUser", JSON.stringify(foundUser));
  closeModal(loginModal);
  showUserLoggedIn(foundUser);

  alert(`Welcome back, ${foundUser.firstname}!`);

  // Continue any pending booking
  if (window.pendingBooking) continuePendingBooking();
});

/* 4. LOGGED-IN USER DISPLAY */
function showUserLoggedIn(user) {
  const headerAuth = document.querySelector(".auth-buttons");
  const drawerAuth = document.querySelector(".drawer-auth");

  headerAuth.innerHTML = `
    <div class="user-menu">
      <span id="patientNameHeader">👤 ${user.firstname} ${user.lastname}</span>
      <button id="logout-btn" class="btn logout-btn">Logout</button>
    </div>
  `;

  drawerAuth.innerHTML = `
    <div class="user-menu">
      <span id="patientNameHeaderMobile">${user.firstname} ${user.lastname}</span>
      <button id="logout-btn-mobile" class="btn logout-btn">Logout</button>
    </div>
  `;

  document.getElementById("logout-btn").addEventListener("click", logoutUser);
  document.getElementById("logout-btn-mobile").addEventListener("click", logoutUser);
}

function logoutUser() {
  localStorage.removeItem("citycareUser");
  location.reload();
}


/* 5. RESUME PENDING BOOKING */
function continuePendingBooking() {
  if (window.pendingDoctor) {
    openBookingModal(window.pendingDoctor);
    window.pendingDoctor = null;
    window.pendingBooking = false;
  }
}


/* 6. NAVIGATION DRAWER (MOBILE) */
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

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMenu();
  }
});


/* 7. SAVE RECEIPT */
function saveReceipt() {
  const receiptSection = document.getElementById("receiptSection");
  if (!receiptSection) return alert("Receipt section not found!");

  const saveBtn = document.querySelector(".save-btn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saved";

  html2canvas(receiptSection, { scale: 2 })
    .then(canvas => {
      const link = document.createElement("a");
      link.download = "CityCare_Appointment_Receipt.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Receipt";
    })
    .catch(() => {
      alert("Failed to save receipt. Please try again.");
      downloadBtn.disabled = false;
      downloadBtn.textContent = "Save Receipt";
    });
}
