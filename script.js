/* ===================================================
    CITYCARE HOSPITAL - FRONTEND SCRIPT
   ---------------------------------------------------
   AUTHOR: MUHAMMED FARUQ
   LAST UPDATED: October 2025

   DESCRIPTION:
     This file manages all frontend interactions and UI
     behaviors for the CityCare Hospital web application.

   MODULES:
     1. Doctor Listing & Search
     2. Appointment Booking (UI + Validation)
     3. User Authentication (Register / Login)
     4. Logged-in UI Handling
     5. Navigation Drawer (Responsive Menu)
     6. Appointment Resume (Pending Booking)
     7. Receipt Download (Save as Image)

   NOTE:
     - All data is handled on the client-side using LocalStorage.
     - Designed for frontend demonstration purposes only.
   =================================================== */


/* ===================================================
   1. DOCTOR DATA (STATIC)
   ---------------------------------------------------
   Static list of available doctors. Each doctor object
   contains name, specialty, clinic address, fee, and image.
=================================================== */
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


/* ===================================================
   2. DOCTOR LISTING & FILTER
   ---------------------------------------------------
   Handles:
   - Displaying all doctor cards on the homepage.
   - Searching by name or specialty.
   - Filtering by specific specialty.
=================================================== */
const doctorsContainer = document.getElementById("doctorsContainer");
const specialtyFilter = document.getElementById("specialtyFilter");

// Initialize specialties and populate dropdown
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

// Render doctor cards dynamically
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

// Search and filter doctors
function applyDoctorSearch() {
  const search = (document.getElementById("doctorSearch").value || "").toLowerCase();
  const filter = specialtyFilter.value;
  const filtered = doctors.filter(d =>
    (d.name.toLowerCase().includes(search) || d.specialty.toLowerCase().includes(search)) &&
    (filter === "" || d.specialty === filter)
  );
  renderDoctors(filtered);
}

// Reset search and filters
function resetDoctorFilters() {
  document.getElementById("doctorSearch").value = "";
  specialtyFilter.value = "";
  renderDoctors(doctors);
}


/* ===================================================
   3. BOOKING & CONFIRMATION
   ---------------------------------------------------
   Handles:
   - Opening booking modal with doctor details.
   - Selecting time slots.
   - Validating form inputs.
   - Displaying receipt confirmation.
=================================================== */
let currentDoctor = null;
let selectedSlot = null;

// Open booking modal for selected doctor
function openBookingModal(docName) {
  const user = JSON.parse(localStorage.getItem("citycareUser"));
  if (!user) {
    // If user is not logged in, prompt registration
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

  // Fill doctor info in modal
  document.getElementById("modalDocName").textContent = `Book Appointment with ${currentDoctor.name}`;
  document.getElementById("modalDocShort").textContent = currentDoctor.name;
  document.getElementById("modalSpec").textContent = currentDoctor.specialty;
  document.getElementById("modalAvatar").src = currentDoctor.img;
  document.getElementById("modalFee").textContent = `Fee: ₦${currentDoctor.fee}`;
  document.getElementById("modalLocation").textContent = currentDoctor.location;

  // Reset booking sections
  document.getElementById("bookingFormSection").style.display = "flex";
  document.getElementById("receiptSection").style.display = "none";

  // Generate available time slots
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

// Highlight selected time slot
function selectSlot(slot, btn) {
  selectedSlot = slot;
  document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("modalSelectedSlot").textContent = `Time: ${slot}`;
}

// Validate booking form inputs and show receipt
function confirmModalBooking() {
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

  // Clear previous validation messages
  document.querySelectorAll(".error-text").forEach(el => el.remove());
  let hasError = false;

  // Utility to display inline error messages
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

  // Field validation checks
  if (!name) showError(nameInput, "Please enter your name.");
  if (!number) showError(numberInput, "Please enter your phone number.");
  if (!date) showError(dateInput, "Please select a date.");
  if (!selectedSlot) {
    const slotsDiv = document.getElementById("modalSlots");
    const error = document.createElement("small");
    error.className = "error-text";
    error.style.color = "red";
    error.textContent = "Please select a time slot.";
    slotsDiv.insertAdjacentElement("afterend", error);
    hasError = true;
  }

  if (hasError) return; // Stop submission if any field is empty

  // Save booking in localStorage
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

  const appointments = JSON.parse(localStorage.getItem("appointments")) || [];
  appointments.push(booking);
  localStorage.setItem("appointments", JSON.stringify(appointments));

  showConfirmationModal(booking);
}

// Display booking confirmation receipt
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
  document.getElementById("rFee").textContent = `₦${booking.fee}`;

  document.getElementById("bookingFormSection").style.display = "none";
  document.getElementById("receiptSection").style.display = "block";
}

// Close booking modal
function closeBookingModal() {
  document.getElementById("bookingModal").style.display = "none";
}

/* ===================================================
   4. USER AUTHENTICATION (REGISTER & LOGIN)
   ---------------------------------------------------
   Handles:
   - Registering new users
   - Logging in existing users
   - Updating UI when user is logged in
   - Basic LocalStorage-based session
=================================================== */

// --- Modal References ---
const registerModal = document.getElementById("modal-register");
const loginModal = document.getElementById("modal-login");

// --- Modal Buttons ---
const registerOpenBtns = document.querySelectorAll("#register-open");
const loginOpenBtns = document.querySelectorAll("#login-open");
const modalCloseBtns = document.querySelectorAll("[data-close]");
const switchToLogin = document.getElementById("switch-to-login");
const switchToRegister = document.getElementById("switch-to-register");

// --- Open / Close Modals ---
registerOpenBtns.forEach(btn => btn.addEventListener("click", () => openModal(registerModal)));
loginOpenBtns.forEach(btn => btn.addEventListener("click", () => openModal(loginModal)));
modalCloseBtns.forEach(btn => btn.addEventListener("click", e => closeModal(document.getElementById(e.target.getAttribute("data-close")))));
switchToLogin.addEventListener("click", () => { closeModal(registerModal); openModal(loginModal); });
switchToRegister.addEventListener("click", () => { closeModal(loginModal); openModal(registerModal); });

function openModal(modal) { modal.style.display = "flex"; }
function closeModal(modal) { modal.style.display = "none"; }


// --- REGISTER FUNCTION ---
document.getElementById("register-form").addEventListener("submit", e => {
  e.preventDefault();

  const firstname = e.target.firstname.value.trim();
  const lastname = e.target.lastname.value.trim();
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  const users = JSON.parse(localStorage.getItem("citycareUsers")) || [];

  // Prevent duplicate account
  if (users.some(u => u.email === email)) {
    alert("Account already exists with this email.");
    return;
  }

  // Save new user
  const newUser = { firstname, lastname, email, password };
  users.push(newUser);
  localStorage.setItem("citycareUsers", JSON.stringify(users));
  localStorage.setItem("citycareUser", JSON.stringify(newUser));

  closeModal(registerModal);
  showUserLoggedIn(newUser);
  alert(`Welcome, ${firstname}!`);
  if (window.pendingBooking) continuePendingBooking();
});


// --- LOGIN FUNCTION ---
document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();

  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();

  const users = JSON.parse(localStorage.getItem("citycareUsers")) || [];
  const found = users.find(u => u.email === email && u.password === password);

  if (!found) {
    alert("Invalid credentials. Please check your email and password.");
    return;
  }

  localStorage.setItem("citycareUser", JSON.stringify(found));
  closeModal(loginModal);
  showUserLoggedIn(found);
  alert(`Welcome back, ${found.firstname}!`);
  if (window.pendingBooking) continuePendingBooking();
});


/* ===================================================
   5. LOGGED-IN USER DISPLAY (DESKTOP + MOBILE)
   ---------------------------------------------------
   Updates header and mobile drawer to show:
   - Logged-in user’s name
   - Logout button (works across both views)
=================================================== */
function showUserLoggedIn(user) {
  const headerAuth = document.querySelector(".auth-buttons");
  const drawerAuth = document.querySelector(".drawer-auth");

  // --- Desktop header ---
  headerAuth.innerHTML = `
    <div class="user-menu">
      <span id="patientNameHeader">👤 ${user.firstname} ${user.lastname}</span>
      <button id="logout-btn" class="btn logout-btn">Logout</button>
    </div>
  `;

  // --- Mobile drawer ---
  drawerAuth.innerHTML = `
    <div class="user-menu">
      <span id="patientNameHeaderMobile">${user.firstname} ${user.lastname}</span>
      <button id="logout-btn-mobile" class="btn logout-btn">Logout</button>
    </div>
  `;

  // --- Add logout functionality ---
  document.getElementById("logout-btn").addEventListener("click", logoutUser);
  document.getElementById("logout-btn-mobile").addEventListener("click", logoutUser);
}

// --- Logout function ---
function logoutUser() {
  localStorage.removeItem("citycareUser");
  location.reload(); // Refresh page to reset UI
}

// --- On page load, check for saved user session ---
window.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("citycareUser"));
  if (user) showUserLoggedIn(user);
});


/* ===================================================
   6. RESUME PENDING BOOKING
   ---------------------------------------------------
   If a patient tries to book a doctor before logging in,
   once they successfully log in, the pending booking 
   will automatically reopen.
=================================================== */
function continuePendingBooking() {
  if (window.pendingDoctor) {
    openBookingModal(window.pendingDoctor);
    window.pendingDoctor = null;
    window.pendingBooking = false;
  }
}


/* ===================================================
   7. NAVIGATION DRAWER (MOBILE MENU)
   ---------------------------------------------------
   Handles opening/closing of the navigation drawer 
   on mobile and auto-closes when resizing to desktop.
=================================================== */
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

// Automatically close drawer when switching to desktop view
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMenu();
  }
});


/* ===================================================
   8. DOWNLOAD RECEIPT
   ---------------------------------------------------
   Converts the appointment confirmation receipt into
   an image (PNG) and downloads it to the user’s device.
=================================================== */
function downloadReceipt() {
  const receiptSection = document.getElementById("receiptSection");

  if (!receiptSection) {
    console.error("Receipt section not found!");
    return;
  }

  const downloadBtn = document.querySelector(".download-btn");
  downloadBtn.disabled = true;
  downloadBtn.textContent = "Downloading...";

  html2canvas(receiptSection, { scale: 2 })
    .then(canvas => {
      const link = document.createElement("a");
      link.download = "CityCare_Appointment_Receipt.png";
      link.href = canvas.toDataURL("image/png");
      link.click();

      // Reset button after download
      downloadBtn.disabled = false;
      downloadBtn.textContent = "Download Receipt";
    })
    .catch(err => {
      console.error("Error generating receipt:", err);
      alert("Failed to download receipt. Please try again.");
      downloadBtn.disabled = false;
      downloadBtn.textContent = "Download Receipt";
    });
}
