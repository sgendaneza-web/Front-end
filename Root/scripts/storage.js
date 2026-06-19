const TRANSACTIONS_KEY = "campuscash_transactions";
const SETTINGS_KEY = "campuscash_settings";

export function saveTransactions(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

export function loadTransactions() {
  try {
    return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || null;
  } catch {
    return null;
  }
}