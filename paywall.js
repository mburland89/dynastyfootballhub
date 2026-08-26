// paywall.js — include on any page that requires a subscription
// Usage: <script type="module" src="/paywall.js" data-tier="core"></script>

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA6wnyeb65VHsqNMu9Odxw4H_vzeF1mzYM",
  authDomain: "dynasty-football-hub-d76b0.firebaseapp.com",
  projectId: "dynasty-football-hub-d76b0",
  storageBucket: "dynasty-football-hub-d76b0.firebasestorage.app",
  messagingSenderId: "450779535418",
  appId: "1:450779535418:web:fe5eee57b771e0fbfefd03"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get required tier from script tag
const scripts = document.querySelectorAll('script[src*="paywall"]');
const requiredTier = scripts[scripts.length-1]?.dataset?.tier || 'core';

const tierLevel = { free: 0, core: 1, premium: 2 };

function showPaywall(user) {
  // Hide main content
  document.querySelectorAll('.main, .page-header + div, #rankings-table, .trade-area, #matchup-area').forEach(el => {
    el.style.display = 'none';
  });

  // Show paywall overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = 'max-width:500px;margin:4rem auto;padding:2rem;text-align:center;';
  overlay.innerHTML = `
    <div style="background:#161616;border:1px solid #c0392b;border-radius:16px;padding:3rem 2rem;">
      <div style="font-size:40px;margin-bottom:1rem">🏈</div>
      <div style="font-size:22px;font-weight:800;color:#fff;margin-bottom:0.5rem">Premium Feature</div>
      <div style="font-size:14px;color:#666;margin-bottom:2rem;line-height:1.6">
        This tool requires a <strong style="color:#e87c73">${requiredTier === 'core' ? 'Redraft Core ($3/mo)' : 'Redraft Premium ($7/mo)'}</strong> subscription.
        <br>Dynasty tools are always free.
      </div>
      ${user ? `
        <a href="/pricing.html" style="display:inline-block;background:#c0392b;color:#fff;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;margin-bottom:1rem">
          Upgrade Now
        </a>
        <div style="font-size:13px;color:#555;margin-top:1rem">
          Signed in as ${user.email} · <a href="/account.html" style="color:#c0392b">My Account</a>
        </div>
      ` : `
        <a href="/auth.html?return=${encodeURIComponent(window.location.pathname)}" style="display:inline-block;background:#c0392b;color:#fff;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;margin-bottom:1rem">
          Sign In to Access
        </a>
        <div style="font-size:13px;color:#555;margin-top:1rem">
          No account? <a href="/pricing.html" style="color:#c0392b">See pricing</a>
        </div>
      `}
    </div>`;
  document.body.appendChild(overlay);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    showPaywall(null);
    return;
  }

  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const data = snap.data() || {};
  const userTier = data.tier || 'free';

  if (tierLevel[userTier] < tierLevel[requiredTier]) {
    showPaywall(user);
    return;
  }

  // User has access — add account link to nav
  const navLinks = document.querySelector('.nav-links') || document.querySelector('.nav');
  if (navLinks) {
    const accountLink = document.createElement('a');
    accountLink.href = '/account.html';
    accountLink.style.cssText = 'font-size:13px;color:#c0392b;font-weight:600;text-decoration:none;';
    accountLink.textContent = '👤 My Account';
    navLinks.appendChild(accountLink);
  }
});
