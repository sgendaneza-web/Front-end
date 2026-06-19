import { subscribe, transactions, addTransaction, removeTransaction, updateTransaction, replaceTransactions, settings, saveAndSetSettings } from "./state.js";
import { validateTransaction } from "./validators.js";
import { compileRegex, highlight } from "./search.js";
import { loadSettings, saveSettings } from "./storage.js";

// Budget cap
const budgetInput = document.getElementById("budget-cap");
const budgetStatus = document.getElementById("budget-status");
const progressBar = document.getElementById("progress-bar");


// ============================================================
// SECTION NAVIGATION
// ============================================================

const sections = document.querySelectorAll("main section");
const navLinks = document.querySelectorAll("nav a");
const sidebar = document.getElementById("sidebar");

function showSection(targetId) {
  sections.forEach(section => {
    section.classList.add("hidden");
  });

  const target = document.getElementById(targetId);
  if (target) {
    target.classList.remove("hidden");
  }

  // Highlight active nav link
  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${targetId}`) {
      link.classList.add("active");
    }
  });

  // Re-render dashboard and chart when navigating to it
  if (targetId === "dashboard") {
    renderDashboard(transactions);
    drawTrendChart(transactions);
  }
}

navLinks.forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    const targetId = link.getAttribute("href").slice(1);
    showSection(targetId);
  });
});

// Shortcut buttons on Home page
document.querySelectorAll(".nav-shortcut").forEach(btn => {
  btn.addEventListener("click", () => {
    showSection(btn.dataset.target);
  });
});

// Escape key cancels edit
document.addEventListener("keydown", e => {
  if (e.key === "Escape") cancelEdit();
});

// ============================================================
// SETUP FLOW
// ============================================================

const setupForm = document.getElementById("setup-form");
const skipBtn = document.getElementById("skip-setup-btn");
const housingSelect = document.getElementById("setup-housing");
const rentGroup = document.getElementById("rent-group");

// Show/hide rent field based on housing choice
housingSelect.addEventListener("change", () => {
  if (housingSelect.value === "yes") {
    rentGroup.classList.remove("hidden");
  } else {
    rentGroup.classList.add("hidden");
  }
});

function completeSetup(settingsData) {
  sidebar.classList.remove("hidden");
  updateHomeGreeting(settingsData ? settingsData.name : "");
  populateSettingsForm(settingsData);
  showSection("home");
}

setupForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("setup-name").value.trim();
  if (!name) {
    document.getElementById("setup-name-error").textContent = "Please enter your name.";
    return;
  }

  const income = document.getElementById("setup-income").value.trim();
  if (income && !/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(income)) {
    document.getElementById("setup-income-error").textContent = "Please enter a valid amount.";
    return;
  }

  const newSettings = {
    name,
    period: document.getElementById("setup-period").value,
    startDate: document.getElementById("setup-start").value,
    endDate: document.getElementById("setup-end").value,
    income: income || "0",
    currency: document.getElementById("setup-currency").value,
    housing: document.getElementById("setup-housing").value,
    rent: document.getElementById("setup-rent").value.trim() || "0"
  };

  saveAndSetSettings(newSettings);
  completeSetup(newSettings);
});

skipBtn.addEventListener("click", () => {
  completeSetup(null);
});

// On page load — check if setup already done
const savedSettings = loadSettings();
if (savedSettings) {
  completeSetup(savedSettings);
} else {
  showSection("setup");
}

// ============================================================
// HOME GREETING
// ============================================================

function updateHomeGreeting(name) {
  const nameEl = document.getElementById("home-name");
  if (nameEl) nameEl.textContent = name || "there";
}

// ============================================================
// SETTINGS FORM
// ============================================================

function populateSettingsForm(s) {
  if (!s) return;
  const f = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };
  f("settings-name", s.name);
  f("settings-period", s.period);
  f("settings-start", s.startDate);
  f("settings-end", s.endDate);
  f("settings-income", s.income);
  f("settings-currency", s.currency);
  f("settings-housing", s.housing);
  f("settings-rent", s.rent);

  const rentGroup = document.getElementById("settings-rent-group");
  if (s.housing === "yes") {
    rentGroup.classList.remove("hidden");
  } else {
    rentGroup.classList.add("hidden");
  }
}

document.getElementById("settings-housing").addEventListener("change", () => {
  const val = document.getElementById("settings-housing").value;
  const rg = document.getElementById("settings-rent-group");
  if (val === "yes") {
    rg.classList.remove("hidden");
  } else {
    rg.classList.add("hidden");
  }
});

document.getElementById("settings-form").addEventListener("submit", event => {
  event.preventDefault();

  const income = document.getElementById("settings-income").value.trim();
  if (income && !/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(income)) {
    document.getElementById("settings-income-error").textContent = "Please enter a valid amount.";
    return;
  }
  document.getElementById("settings-income-error").textContent = "";

  const updated = {
    name: document.getElementById("settings-name").value.trim(),
    period: document.getElementById("settings-period").value,
    startDate: document.getElementById("settings-start").value,
    endDate: document.getElementById("settings-end").value,
    income,
    currency: document.getElementById("settings-currency").value,
    housing: document.getElementById("settings-housing").value,
    rent: document.getElementById("settings-rent").value.trim() || "0"
  };

  saveAndSetSettings(updated);
  updateHomeGreeting(updated.name);

  const successBox = document.getElementById("settings-success");
  successBox.classList.remove("hidden");
  setTimeout(() => successBox.classList.add("hidden"), 3000);
});

// Load seed data button
document.getElementById("load-seed-btn").addEventListener("click", async () => {
  if (!confirm("This will add 10 sample transactions. Continue?")) return;
  try {
    const res = await fetch("seed.json");
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Invalid seed file");
    // Add createdAt/updatedAt if missing
    const now = new Date().toISOString();
    const seeded = data.map(t => ({
      ...t,
      createdAt: t.createdAt || now,
      updatedAt: t.updatedAt || now
    }));
    replaceTransactions(seeded);
    alert("Sample data loaded!");
  } catch {
    alert("Could not load seed.json — make sure you are using Live Server.");
  }
});

// Clear all data
document.getElementById("clear-data-btn").addEventListener("click", () => {
  if (!confirm("This will delete ALL your transactions and settings. Are you sure?")) return;
  localStorage.clear();
  location.reload();
});

// ============================================================
// ADD / EDIT TRANSACTION FORM
// ============================================================

const transactionForm = document.getElementById("transaction-form");
const errorBox = document.getElementById("form-error");
const successBox = document.getElementById("form-success");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const editIdInput = document.getElementById("edit-id");
const formTitle = document.getElementById("form-title");

transactionForm.addEventListener("submit", event => {
  event.preventDefault();

  const data = {
    description: document.getElementById("description").value.trim(),
    amount: document.getElementById("amount").value.trim(),
    category: document.getElementById("category").value,
    type: document.getElementById("type").value,
    date: document.getElementById("date").value
  };

  const errors = validateTransaction(data);

  // Show inline field errors
  document.getElementById("desc-error").textContent =
    errors.find(e => e.toLowerCase().includes("description")) || "";
  document.getElementById("amount-error").textContent =
    errors.find(e => e.toLowerCase().includes("amount")) || "";
  document.getElementById("date-error").textContent =
    errors.find(e => e.toLowerCase().includes("date")) || "";
  document.getElementById("cat-error").textContent =
    errors.find(e => e.toLowerCase().includes("category")) || "";

  if (errors.length > 0) {
    errorBox.textContent = errors[0];
    errorBox.classList.remove("hidden");
    successBox.classList.add("hidden");
    return;
  }

  errorBox.classList.add("hidden");

  const editId = editIdInput.value;

  if (editId) {
    // Edit mode
    updateTransaction(editId, data);
    successBox.textContent = "Transaction updated!";
  } else {
    // Add mode
    addTransaction(data);
    successBox.textContent = "Transaction added!";
  }

  successBox.classList.remove("hidden");
  setTimeout(() => successBox.classList.add("hidden"), 3000);

  transactionForm.reset();
  cancelEdit();
});

function startEdit(id) {
  const t = transactions.find(tx => String(tx.id) === String(id));
  if (!t) return;

  editIdInput.value = t.id;
  document.getElementById("description").value = t.description;
  document.getElementById("amount").value = t.amount;
  document.getElementById("category").value = t.category;
  document.getElementById("type").value = t.type;
  document.getElementById("date").value = t.date;

  formTitle.textContent = "Edit Transaction";
  submitBtn.textContent = "Save Changes";
  cancelEditBtn.classList.remove("hidden");

  showSection("add");
  document.getElementById("description").focus();
}

function cancelEdit() {
  editIdInput.value = "";
  transactionForm.reset();
  formTitle.textContent = "Add Transaction";
  submitBtn.textContent = "Add Transaction";
  cancelEditBtn.classList.add("hidden");
  errorBox.classList.add("hidden");
  // Clear inline errors
  ["desc-error", "amount-error", "date-error", "cat-error"].forEach(id => {
    document.getElementById(id).textContent = "";
  });
}

cancelEditBtn.addEventListener("click", cancelEdit);

// ============================================================
// TRANSACTIONS TABLE
// ============================================================

function getCurrency() {
  const s = loadSettings();
  return s ? s.currency : "RWF";
}

function renderTransactions(txns) {
  const tbody = document.getElementById("transactions-body");
  const searchValue = document.getElementById("search-input").value;
  const ignoreCase = document.getElementById("ignore-case").checked;
  const regex = compileRegex(searchValue, ignoreCase);

  const filtered = txns.filter(t => {
    if (!regex) return true;
    regex.lastIndex = 0;
    return regex.test(t.description) || regex.test(t.category);
  });

  const noResults = document.getElementById("no-results");
  if (filtered.length === 0) {
    noResults.classList.remove("hidden");
  } else {
    noResults.classList.add("hidden");
  }

  tbody.innerHTML = "";

  filtered.forEach((t, index) => {
    if (regex) regex.lastIndex = 0;

    const row = document.createElement("tr");
    if (index === 0 && searchValue === "") row.classList.add("new-row");

    row.innerHTML = `
      <td>${highlight(t.description, regex ? new RegExp(regex.source, regex.flags) : null)}</td>
      <td>${getCurrency()} ${Number(t.amount).toLocaleString()}</td>
      <td>${t.category}</td>
      <td><span class="badge badge-${t.type}">${t.type}</span></td>
      <td>${t.date}</td>
      <td>
        <button class="btn-edit" data-id="${t.id}" aria-label="Edit ${t.description}">Edit</button>
        <button class="btn-delete" data-id="${t.id}" aria-label="Delete ${t.description}">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

subscribe(renderTransactions);
renderTransactions(transactions);

// Delete handler
document.addEventListener("click", event => {
  if (event.target.classList.contains("btn-delete")) {
    const id = event.target.dataset.id;
    const t = transactions.find(tx => String(tx.id) === String(id));
    if (!t) return;
    if (!confirm(`Delete "${t.description}"?`)) return;
    removeTransaction(id);
  }
  if (event.target.classList.contains("btn-edit")) {
    startEdit(event.target.dataset.id);
  }
});

// Search
document.getElementById("search-input").addEventListener("input", () => renderTransactions(transactions));
document.getElementById("ignore-case").addEventListener("change", () => renderTransactions(transactions));

// Sorting
let sortDirections = { date: 1, desc: 1, amount: 1 };

document.getElementById("sort-date").addEventListener("click", () => {
  sortDirections.date *= -1;
  transactions.sort((a, b) => sortDirections.date * (new Date(a.date) - new Date(b.date)));
  renderTransactions(transactions);
});

document.getElementById("sort-desc").addEventListener("click", () => {
  sortDirections.desc *= -1;
  transactions.sort((a, b) => sortDirections.desc * a.description.localeCompare(b.description));
  renderTransactions(transactions);
});

document.getElementById("sort-amount").addEventListener("click", () => {
  sortDirections.amount *= -1;
  transactions.sort((a, b) => sortDirections.amount * (Number(a.amount) - Number(b.amount)));
  renderTransactions(transactions);
});

// Export JSON
document.getElementById("export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "campuscash-transactions.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import JSON
document.getElementById("import-file").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);

      // Validate structure
      if (!Array.isArray(data)) throw new Error("Must be an array");
      const requiredKeys = ["description", "amount", "category", "date"];
      const valid = data.every(item =>
        requiredKeys.every(key => key in item)
      );
      if (!valid) throw new Error("Missing required fields");

      replaceTransactions(data);
      alert(`Imported ${data.length} transactions successfully.`);
    } catch (err) {
      alert(`Invalid JSON file: ${err.message}`);
    }
  };
  reader.readAsText(file);
  event.target.value = ""; // reset so same file can be re-imported
});

// ============================================================
// DASHBOARD
// ============================================================

function renderDashboard(txns) {
  let income = 0;
  let expenses = 0;
  const categories = {};

  txns.forEach(t => {
    const amount = Number(t.amount);
    if (t.type === "income") {
      income += amount;
    } else {
      expenses += amount;
    }
    if (t.type === "expense") {
      categories[t.category] = (categories[t.category] || 0) + amount;
    }
  });

  const balance = income - expenses;
  const currency = getCurrency();

  // Animate count-up
  animateValue("income", income, currency);
  animateValue("expenses", expenses, currency);
  animateValue("total", balance, currency);

  // Top category
  let topCategory = "None";
  let max = 0;
  Object.entries(categories).forEach(([cat, total]) => {
    if (total > max) { max = total; topCategory = cat; }
  });
  const topEl = document.getElementById("top-category");
  if (topEl) topEl.textContent = topCategory;

  // Category bars
  renderCategoryBars(categories, expenses, currency);

  // Update budget status
  updateBudgetStatus(expenses);
}

function animateValue(elementId, target, currency) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const start = 0;
  const duration = 600;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = start + (target - start) * easeOut(progress);
    el.textContent = `${currency} ${current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function renderCategoryBars(categories, totalExpenses, currency) {
  const container = document.getElementById("category-bars");
  if (!container) return;

  // Keep h3
  container.innerHTML = "<h3>Spending by Category</h3>";

  if (Object.keys(categories).length === 0) {
    container.innerHTML += '<p style="color:#777;font-size:0.88rem;">No expense data yet.</p>';
    return;
  }

  Object.entries(categories).forEach(([cat, amount]) => {
    const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
    const row = document.createElement("div");
    row.className = "cat-bar-row";
    row.innerHTML = `
      <div class="cat-bar-label">
        <span>${cat}</span>
        <span>${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div class="cat-bar-track">
        <div class="cat-bar-fill" style="width: 0%" data-pct="${pct.toFixed(1)}"></div>
      </div>
    `;
    container.appendChild(row);
  });

  // Animate bars after DOM insertion
  requestAnimationFrame(() => {
    document.querySelectorAll(".cat-bar-fill").forEach(bar => {
      bar.style.width = bar.dataset.pct + "%";
    });
  });
}

subscribe(renderDashboard);
renderDashboard(transactions);


function updateBudgetStatus(expensesArg) {
  const cap = Number(budgetInput.value) || 0;
  if (cap === 0) {
    budgetStatus.textContent = "";
    progressBar.style.width = "0%";
    return;
  }

  let expenses = expensesArg;
  if (expenses === undefined) {
    expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }

  const pct = Math.min((expenses / cap) * 100, 100);
  progressBar.style.width = pct + "%";

  const currency = getCurrency();
  const diff = cap - expenses;

  if (diff >= 0) {
    budgetStatus.textContent = `Remaining: ${currency} ${diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    budgetStatus.className = "";
    budgetStatus.setAttribute("aria-live", "polite");
    progressBar.className = "progress-bar" + (pct > 75 ? " warning" : "");
  } else {
    budgetStatus.textContent = `Budget exceeded by ${currency} ${Math.abs(diff).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}!`;
    budgetStatus.className = "exceeded";
    budgetStatus.setAttribute("aria-live", "assertive");
    progressBar.className = "progress-bar exceeded";

    // Shake animation on exceeded
    progressBar.classList.remove("shake");
    void progressBar.offsetWidth; // reflow to restart animation
    progressBar.classList.add("shake");
  }
}

budgetInput.addEventListener("input", () => updateBudgetStatus());
subscribe(() => updateBudgetStatus());

// ============================================================
// 7-DAY TREND CHART (Canvas)
// ============================================================

function drawTrendChart(txns) {
  const canvas = document.getElementById("trend-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth || 600;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Build last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const totals = days.map(day =>
    txns
      .filter(t => t.date === day && t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)
  );

  const maxVal = Math.max(...totals, 1);
  const padL = 50, padR = 20, padT = 20, padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const step = chartW / 6;

  // Background
  ctx.fillStyle = "#f9fbfb";
  ctx.fillRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = "#e8f0f0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
  }

  // Points
  const points = totals.map((val, i) => ({
    x: padL + i * step,
    y: padT + chartH - (val / maxVal) * chartH
  }));

  // Gradient fill under line
  const gradient = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  gradient.addColorStop(0, "rgba(44, 122, 123, 0.25)");
  gradient.addColorStop(1, "rgba(44, 122, 123, 0)");

  ctx.beginPath();
  ctx.moveTo(points[0].x, padT + chartH);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(points[points.length - 1].x, padT + chartH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = "#2c7a7b";
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Dots
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#2c7a7b";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // X axis labels (day abbreviations)
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  ctx.fillStyle = "#888";
  ctx.font = "11px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  days.forEach((dateStr, i) => {
    const dayName = dayLabels[new Date(dateStr + "T00:00:00").getDay()];
    ctx.fillText(dayName, points[i].x, H - padB + 18);
  });

  // Y axis labels
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i++) {
    const val = maxVal - (maxVal / 4) * i;
    const y = padT + (chartH / 4) * i;
    ctx.fillText(val > 999 ? (val / 1000).toFixed(1) + "k" : val.toFixed(0), padL - 6, y + 4);
  }
}

subscribe(() => {
  if (!document.getElementById("dashboard").classList.contains("hidden")) {
    drawTrendChart(transactions);
  }
});

