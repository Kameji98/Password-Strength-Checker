function hasLower(s) { return /[a-z]/.test(s); }
function hasUpper(s) { return /[A-Z]/.test(s); }
function hasDigit(s) { return /\d/.test(s); }
function hasSymbol(s) { return /[^A-Za-z0-9]/.test(s); }

function estimateAlphabetSize(pwd) {
  let size = 0;
  if (hasLower(pwd)) size += 26;
  if (hasUpper(pwd)) size += 26;
  if (hasDigit(pwd)) size += 10;
  if (hasSymbol(pwd)) size += 32; // rough bucket for common symbols
  return size || 1;
}

function log2(x) { return Math.log(x) / Math.log(2); }

function estimateEntropyBits(pwd) {
  const A = estimateAlphabetSize(pwd);
  return pwd.length * log2(A);
}

function scorePassword(pwd) {
  const rules = [
    { ok: pwd.length >= 12, text: "At least 12 characters" },
    { ok: hasLower(pwd), text: "Contains lowercase letters" },
    { ok: hasUpper(pwd), text: "Contains uppercase letters" },
    { ok: hasDigit(pwd), text: "Contains digits" },
    { ok: hasSymbol(pwd), text: "Contains symbols" },
    { ok: !/(.)\1\1/.test(pwd), text: "Avoids repeated characters (e.g., aaa)" },
  ];

  let points = 0;
  for (const r of rules) points += r.ok ? 1 : 0;

  if (pwd.length >= 16) points += 1;
  if (pwd.length >= 20) points += 1;

  const max = 9;
  const score = Math.min(max, points);

  return { score, max, rules, entropy: estimateEntropyBits(pwd) };
}

function strengthLabel(score, max) {
  const pct = max === 0 ? 0 : score / max;
  if (pct >= 0.80) return "Strong";
  if (pct >= 0.55) return "Moderate";
  if (pct > 0.0) return "Weak";
  return "—";
}

function render(pwd) {
  const meter = document.getElementById("meter");
  const label = document.getElementById("label");
  const rulesEl = document.getElementById("rules");
  const entropyEl = document.getElementById("entropy");

  if (!pwd) {
    meter.style.width = "0%";
    label.textContent = "—";
    rulesEl.innerHTML = "";
    entropyEl.textContent = "";
    return;
  }

  const r = scorePassword(pwd);
  const pct = Math.round((r.score / r.max) * 100);
  meter.style.width = `${pct}%`;

  label.textContent = strengthLabel(r.score, r.max);
  entropyEl.textContent = `Estimated entropy: ${r.entropy.toFixed(1)} bits`;

  rulesEl.innerHTML = "";
  for (const rule of r.rules) {
    const li = document.createElement("li");
    li.textContent = `${rule.ok ? "✅" : "❌"} ${rule.text}`;
    rulesEl.appendChild(li);
  }
}

function main() {
  const pwd = document.getElementById("pwd");
  const toggle = document.getElementById("toggle");

  toggle.addEventListener("click", () => {
    const isPwd = pwd.type === "password";
    pwd.type = isPwd ? "text" : "password";
    toggle.textContent = isPwd ? "Hide" : "Show";
    pwd.focus();
  });

  pwd.addEventListener("input", () => render(pwd.value));

  render("");
  pwd.focus();
}

main();
