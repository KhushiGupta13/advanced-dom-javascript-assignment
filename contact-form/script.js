// Debounce utility
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const form = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const messageInput = document.getElementById("message");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const messageError = document.getElementById("messageError");

const historyDiv = document.getElementById("messageHistory");

// --- LocalStorage Helpers ---
function getMessages() {
  try {
    return JSON.parse(localStorage.getItem("messages")) || [];
  } catch (e) {
    console.error("Error reading localStorage", e);
    return [];
  }
}

function saveMessages(messages) {
  localStorage.setItem("messages", JSON.stringify(messages));
}

// --- Validation ---
function validateName() {
  if (nameInput.value.trim().length < 2) {
    nameError.textContent = "Name must be at least 2 characters.";
    return false;
  }
  nameError.textContent = "";
  return true;
}

function validateEmail() {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(emailInput.value.trim())) {
    emailError.textContent = "Invalid email format.";
    return false;
  }
  emailError.textContent = "";
  return true;
}

function validateMessage() {
  if (messageInput.value.trim().length < 10) {
    messageError.textContent = "Message must be at least 10 characters.";
    return false;
  }
  messageError.textContent = "";
  return true;
}

// Attach debounced validation
nameInput.addEventListener("input", debounce(validateName, 300));
emailInput.addEventListener("input", debounce(validateEmail, 300));
messageInput.addEventListener("input", debounce(validateMessage, 300));

// --- Render Messages ---
function renderMessages() {
  const messages = getMessages();
  if (messages.length === 0) {
    historyDiv.innerHTML = "No messages yet";
    return;
  }

  historyDiv.innerHTML = "";
  messages.forEach((msg, index) => {
    const div = document.createElement("div");
    div.className = "message-card";
    div.innerHTML = `
      <strong>From: ${msg.name} (${msg.email})</strong>
      <p>${msg.message}</p>
      <small>Sent: ${new Date(msg.time).toLocaleString()}</small>
      <button class="delete-btn" data-index="${index}">Delete</button>
    `;
    historyDiv.appendChild(div);
  });
}

// --- Form Submission ---
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateName() || !validateEmail() || !validateMessage()) return;

  const newMessage = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    message: messageInput.value.trim(),
    time: new Date().toISOString(),
  };

  const messages = getMessages();
  messages.push(newMessage);
  saveMessages(messages);
  renderMessages();

  form.reset();
});

// --- Event Delegation for Delete ---
historyDiv.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index;
    const messages = getMessages();
    messages.splice(index, 1);
    saveMessages(messages);
    renderMessages();
  }
});

// Initial render
renderMessages();
