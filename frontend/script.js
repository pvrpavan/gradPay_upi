
// const phoneInput = document.getElementById("phoneNumber");
// const otpSection = document.getElementById("otpSection");
// const sendOtpBtn = document.getElementById("sendOtpBtn");
// const goBack = document.getElementById("goBackButton");
// const inputs = document.querySelectorAll(".otp-box");
// const verifyOtpBtn = document.getElementById("verifyOtpBtn");
// // const countdownEl = document.getElementById("countdown");
// let message = document.getElementById("message");

// const page = document.body.dataset.page;
// let generatedOTP = "123456";
// let countdown = 30;
// let timer;
// let iti;

// if (page === "sign_up_or_login") {
//   iti = window.intlTelInput(phoneInput, {
//     initialCountry: "in",
//     utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js"
//   });
//   verifyOtpBtn.style.cursor = "not-allowed";
//   verifyOtpBtn.disabled = true;
// }


// sendOtpBtn.addEventListener("click", () => {
//   const number = iti.getNumber();
//   if (!iti.isValidNumber()) {
//     alert("Please enter a valid phone number.");
//     return;
//   }

//   message.innerHTML = `<p>OTP sent to ${number} </p>`;
//   message.style.color = "blue";
//   startCountdown();

//   sendOtpBtn.disabled = true;
//   sendOtpBtn.style.cursor = "not-allowed";



//   generatedOTP = "123456";
// });


// // Focus auto-move
// inputs.forEach((input, index) => {
//   input.addEventListener("input", () => {
//     if (input.value.length === 1 && index < inputs.length - 1) {
//       inputs[index + 1].focus();
//     }
//     checkOTPCompletion();
//   });

//   input.addEventListener("keydown", (e) => {
//     if (e.key === "Backspace" && input.value === "" && index > 0) {
//       inputs[index - 1].focus();
//     }
//   });
// });

// // Check if all boxes are filled
// function checkOTPCompletion() {
//   const otpValue = Array.from(inputs).map(input => input.value).join('');
//   if (otpValue.length === 6) {
//     verifyOtpBtn.disabled = false;
//     verifyOtpBtn.style.cursor = "pointer";

//   } else {
//     verifyOtpBtn.disabled = true;
//     verifyOtpBtn.style.cursor = "not-allowed";
//   }
// }

// verifyOtpBtn.addEventListener("click", () => {
//   const enteredOTP = Array.from(inputs).map(input => input.value).join('');
//   // console.log(enteredOTP);
//   if (enteredOTP == generatedOTP) {
//     message.textContent = "OTP Verified Successfully!";
//     message.style.color = "green";
//     verifyOtpBtn.innerText = "Sign In";
//     verifyOtpBtn.onclick = () => {
//       navigateTo("index.html");
//     }

//   } else {
//     message.textContent = "Incorrect OTP. Try again.";
//     message.style.color = "red";
//   }
// });


// // Timer function
// function updateTimer() {
//   countdown--;
//   sendOtpBtn.textContent = countdown;
//   if (countdown <= 0) {
//     clearInterval(timer);
//     sendOtpBtn.textContent = "ReSend OTP";
//     sendOtpBtn.disabled = false;
//     // document.getElementById("timerText").textContent = "Didn't receive code?";
//   }
// }

// function startCountdown() {
//   resendBtn.disabled = true;
//   countdown = 30;
//   countdownEl.textContent = countdown;
//   resendBtn.textContent = `Resend OTP (${countdown}s)`;

//   timer = setInterval(() => {
//     countdown--;
//     countdownEl.textContent = countdown;
//     resendBtn.textContent = `Resend OTP (${countdown}s)`;
//     if (countdown <= 0) {
//       clearInterval(timer);
//       resendBtn.disabled = false;
//       resendBtn.textContent = "Resend OTP";
//     }
//   }, 1000);
// }

// resendBtn.addEventListener("click", () => {
//   generatedOTP = "654321";
//   message.textContent = "OTP resent!";
//   message.style.color = "blue";
//   startCountdown();
// });

// // verifyOtpBtn.addEventListener("click", () => {
// //   if (otpInput.value === generatedOTP) {
// //     message.textContent = "OTP Verified!";
// //     message.style.color = "green";
// //     signInBtn.disabled = false;
// //   } else {
// //     message.textContent = "Invalid OTP!";
// //     message.style.color = "red";
// //     signInBtn.disabled = true;
// //   }
// // });



// // function goBack(){
// //   window.history.back();
// // }

// goBack.addEventListener("click", () => {
//   window.history.back();
// });



















// function navigateTo(page) {
//   window.location.href = page;
// }






// let expenses = [];
// window.onload = () => {
//   const ctx = document.getElementById('expenseChart')?.getContext('2d');
//   if (!ctx) return;

//   window.chart = new Chart(ctx, {
//     type: 'pie',
//     data: {
//       labels: [],
//       datasets: [{
//         label: 'Expenses',
//         data: [],
//         backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#B180D7', '#5AD3D1'],
//       }],
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false
//     }
//   });
// };


// function addExpense() {
//   const desc = document.getElementById('descInput').value.trim();
//   const amount = parseFloat(document.getElementById('amountInput').value.trim());

//   if (!desc || isNaN(amount) || amount <= 0) return;

//   expenses.push({ desc, amount });
//   updateExpenseList();
//   updateChart();

//   document.getElementById('descInput').value = '';
//   document.getElementById('amountInput').value = '';
// }

// function updateExpenseList() {
//   const list = document.getElementById('expenseList');
//   list.innerHTML = '';
//   expenses.forEach(exp => {
//     const li = document.createElement('li');
//     li.innerHTML = `<span>${exp.desc}</span><span>- ₹${exp.amount}</span>`;
//     list.appendChild(li);
//   });
// }

// function updateChart() {
//   if (!chart) return;
//   chart.data.labels = expenses.map(e => e.desc);
//   chart.data.datasets[0].data = expenses.map(e => e.amount);
//   chart.update();
// }


// QrScanner.WORKER_PATH = 'https://unpkg.com/qr-scanner/qr-scanner-worker.min.js';

// const video = document.getElementById('video');
// const result = document.getElementById('scan-result');

// const scanner = new QrScanner(video, (text) => {
//   result.textContent = `QR Code: ${text}`;
//   scanner.stop(); // Stop after one scan
// });

// scanner.start();





// function sendMessage() {
//   const input = document.getElementById("chatInput");
//   const message = input.value.trim();
//   if (message === "") return;

//   const chatBox = document.getElementById("chatBox");

//   const msgDiv = document.createElement("div");
//   msgDiv.className = "message right";
//   msgDiv.textContent = message;

//   chatBox.appendChild(msgDiv);
//   input.value = "";
//   chatBox.scrollTop = chatBox.scrollHeight;
// }






























// ---------- Global Setup ----------
// --- OTP Section ---
const phoneInput = document.getElementById("phoneNumber");
const otpSection = document.getElementById("otpSection");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const goBack = document.getElementById("goBackButton");
const inputs = document.querySelectorAll(".otp-box");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const countdownEl = document.getElementById("countdown");
const resendBtn = document.getElementById("resendBtn");
let message = document.getElementById("message");

const page = document.body.dataset.page;
let generatedOTP = "";
let countdown = 30;
let timer;
let iti;

if (page === "sign_up_or_login" && phoneInput) {
  iti = window.intlTelInput(phoneInput, {
    initialCountry: "in",
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js"
  });
  verifyOtpBtn.style.cursor = "not-allowed";
  verifyOtpBtn.disabled = true;
}

// Send OTP
// Send OTP
if (sendOtpBtn) {
  sendOtpBtn.addEventListener("click", async () => {
    if (!iti) {
      message.textContent = "Phone input not initialized.";
      message.style.color = "red";
      return;
    }
    const number = phoneInput.value.trim();
    if (!iti.isValidNumber()) {
      alert("Please enter a valid phone number.");
      return;
    }
    try {
      console.log(number);
      // Use the same API path for sending OTP
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: number })
      });

      const data = await res.json();
      if (res.status === 200 && data.otp) {
        generatedOTP = data.otp;
        message.innerHTML = `<p>OTP sent to ${number}</p>`;
        message.style.color = "blue";
        startCountdown();
        sendOtpBtn.disabled = true;
        sendOtpBtn.style.cursor = "not-allowed";
      } else {
        message.textContent = "Failed to send OTP.";
        message.style.color = "red";
      }
    } catch (err) {
      message.textContent = "Error sending OTP.";
      message.style.color = "red";
    }
  });
}

// Focus auto-move for OTP boxes
inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
    checkOTPCompletion();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && input.value === "" && index > 0) {
      inputs[index - 1].focus();
    }
  });
});

function checkOTPCompletion() {
  const otpValue = Array.from(inputs).map(input => input.value).join('');
  if (otpValue.length === 6) {
    verifyOtpBtn.disabled = false;
    verifyOtpBtn.style.cursor = "pointer";
  } else {
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.style.cursor = "not-allowed";
  }
}

// Verify OTP
if (verifyOtpBtn) {
  verifyOtpBtn.addEventListener("click", async () => {
    if (!iti) {
      message.textContent = "Phone input not initialized.";
      message.style.color = "red";
      return;
    }

    const phone = phoneInput.value.trim();
    const enteredOTP = Array.from(inputs).map(input => input.value).join('');

    if (enteredOTP.length < 6) {
      message.textContent = "Please enter the full 6-digit OTP.";
      message.style.color = "red";
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: enteredOTP })
      });

      const data = await res.json();
      console.log("OTP Verify Response:", data);

      if (res.status === 200 || res.status === 201) {
        message.textContent = "OTP Verified Successfully!";
        message.style.color = "green";
        verifyOtpBtn.innerText = "Sign In";
        localStorage.setItem("phone", phone);


        // Safely fallback to input phone if not returned in response
        const redirectPhone = data.phone; //|| phone;

        if (data.isNewUser) {
          window.location.href = `create_gradPay_account.html?phone=${redirectPhone}`;
        } else {
          window.location.href = `index.html`;
        }
      } else {
        message.textContent = data.message || "Incorrect OTP. Try again.";
        message.style.color = "red";
      }
    } catch (err) {
      console.error("OTP Verify Error:", err);
      message.textContent = "Error verifying OTP. Please try again.";
      message.style.color = "red";
    }
  });
}


// Timer logic
function updateTimer() {
  countdown--;
  if (countdownEl) countdownEl.textContent = countdown;
  if (resendBtn) resendBtn.textContent = `Resend OTP (${countdown}s)`;
  if (countdown <= 0) {
    clearInterval(timer);
    if (resendBtn) {
      resendBtn.disabled = false;
      resendBtn.textContent = "Resend OTP";
    }
  }
}

function startCountdown() {
  if (resendBtn) resendBtn.disabled = true;
  countdown = 30;
  if (countdownEl) countdownEl.textContent = countdown;
  if (resendBtn) resendBtn.textContent = `Resend OTP (${countdown}s)`;
  timer = setInterval(updateTimer, 1000);
}

// Resend OTP
if (resendBtn) {
  resendBtn.addEventListener("click", async () => {
    if (!iti) {
      message.textContent = "Phone input not initialized.";
      message.style.color = "red";
      return;
    }
    const number = iti.getNumber();
    try {
      // Correct API path
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: number })
      });
      const data = await res.json();
      if (data.success && data.otp) {
        generatedOTP = data.otp;
        message.textContent = "OTP resent!";
        message.style.color = "blue";
        startCountdown();
      } else {
        message.textContent = "Failed to resend OTP.";
        message.style.color = "red";
      }
    } catch (err) {
      message.textContent = "Error resending OTP.";
      message.style.color = "red";
    }
  });
}

// Go back button
if (goBack) {
  goBack.addEventListener("click", () => {
    window.history.back();
  });
}

function navigateTo(page) {
  window.location.href = page;
}
























// --- Expense Tracker ---
let expenses = [];
let chart;
window.addEventListener("DOMContentLoaded", async () => {
  const ctx = document.getElementById('expenseChart')?.getContext('2d');
  if (ctx) {
    chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          label: 'Expenses',
          data: [],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#B180D7', '#5AD3D1'],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

    // Correct API path
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (data.success && Array.isArray(data.expenses)) {
        expenses = data.expenses;
        updateExpenseList();
        updateChart();
      }
    } catch (err) {
      // Optionally show error
    }
  }
});

window.addExpense = async function addExpense() {
  const descInput = document.getElementById('descInput');
  const amountInput = document.getElementById('amountInput');
  if (!descInput || !amountInput) return;

  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());
  if (!desc || isNaN(amount) || amount <= 0) return;

  try {
    // Correct API path
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ desc, amount })
    });
    const data = await res.json();
    if (data.success) {
      expenses.push({ desc, amount });
      updateExpenseList();
      updateChart();
      descInput.value = '';
      amountInput.value = '';
    }
  } catch (err) {
    // Optionally show error
  }
};

function updateExpenseList() {
  const list = document.getElementById('expenseList');
  if (!list) return;
  list.innerHTML = '';
  expenses.forEach(exp => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${exp.desc}</span><span>- ₹${exp.amount}</span>`;
    list.appendChild(li);
  });
}

function updateChart() {
  if (!chart) return;
  chart.data.labels = expenses.map(e => e.desc);
  chart.data.datasets[0].data = expenses.map(e => e.amount);
  chart.update();
}

// --- QR Scanner ---
if (typeof QrScanner !== "undefined") {
  QrScanner.WORKER_PATH = 'https://unpkg.com/qr-scanner/qr-scanner-worker.min.js';
  const video = document.getElementById('video');
  const result = document.getElementById('scan-result');
  if (video && result) {
    const scanner = new QrScanner(video, (text) => {
      result.textContent = `QR Code: ${text}`;
      scanner.stop();
    });
    scanner.start();
  }
}

// --- Chat ---
window.sendMessage = async function sendMessage() {
  const input = document.getElementById("chatInput");
  if (!input) return;
  const msg = input.value.trim();
  if (msg === "") return;

  const chatBox = document.getElementById("chatBox");
  if (!chatBox) return;

  try {
    // Correct API path
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    if (data.success) {
      const msgDiv = document.createElement("div");
      msgDiv.className = "message right";
      msgDiv.textContent = msg;
      chatBox.appendChild(msgDiv);

      if (data.reply) {
        const botDiv = document.createElement("div");
        botDiv.className = "message left";
        botDiv.textContent = data.reply;
        chatBox.appendChild(botDiv);
      }
      input.value = "";
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  } catch (err) {
    // Optionally show error
  }
};