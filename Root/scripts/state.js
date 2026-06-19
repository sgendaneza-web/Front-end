import { saveTransactions, loadTransactions, saveSettings, loadSettings } from "./storage.js";

// ========================
// TRANSACTIONS STATE
// ========================
export let transactions = loadTransactions();

const listeners = [];

function notify() {
  saveTransactions(transactions);
  listeners.forEach(fn => fn(transactions));
}

export function subscribe(fn) {
  listeners.push(fn);
}

let idCounter = transactions.length + 1;

function generateId() {
  const padded = String(idCounter++).padStart(4, "0");
  return `txn_${padded}`;
}

export function addTransaction(transaction) {
  transaction.id = generateId();
  transaction.createdAt = new Date().toISOString();
  transaction.updatedAt = new Date().toISOString();
  transactions.push(transaction);
  notify();
}

export function removeTransaction(id) {
  transactions = transactions.filter(t => String(t.id) !== String(id));
  notify();
}

export function updateTransaction(id, updated) {
  const t = transactions.find(t => String(t.id) === String(id));
  if (!t) return;
  Object.assign(t, updated);
  t.updatedAt = new Date().toISOString();
  notify();
}

export function replaceTransactions(newTransactions) {
  transactions = newTransactions;
  idCounter = newTransactions.length + 1;
  notify();
}

// ========================
// SETTINGS STATE
// ========================
export let settings = loadSettings();

export function saveAndSetSettings(newSettings) {
  settings = newSettings;
  saveSettings(settings);
}