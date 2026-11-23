// ============================================================================
// TrialEarn — app logic (shared by all site #3 pages).
// Supabase Auth (email) + derived balance (sum of coin_transactions ledger)
// + daily check-in + withdrawal requests + referral link + level display.
// The client NEVER credits coins. Credits come only from the server-side
// offerwall-postback Edge Function after HMAC verification.
// If SUPABASE_URL / SUPABASE_ANON_KEY are not set in config.js, the app
// runs in DEMO mode: pages render, auth/balance show an honest
// "backend not connected yet" state, and no fake balances are shown.
// ============================================================================
(function () {
  const CFG = window.TRIALEARN_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const fmtCoins = (n) => Number(n || 0).toLocaleString("en-US");
  const coinsToUsd = (n) => (Number(n || 0) / (CFG.COINS_PER_DOLLAR || 1000)).toFixed(2);

  let sb = null;
  let user = null;
  let profile = null;

  const backendReady = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
  window.TRIALEARN_BACKEND_READY = backendReady;

  function demoNotice() {
    // Prepend (don't replace): the forms, stats and ledger stay visible so
    // visitors can see how the site works; the banner is the honest part.
    document.querySelectorAll("[data-needs-backend]").forEach((el) => {
      if (el.querySelector(".demo-warn")) return;
      const banner = document.createElement("div");
      banner.className = "warn demo-warn";
      banner.innerHTML =
        "<b>Backend not connected yet.</b> " +
        "Sign-up, balances and withdrawals go live once the shared Supabase " +
        "backend is connected (config.js → SUPABASE_URL / SUPABASE_ANON_KEY). " +
        "Nothing here is a real balance.";
      el.prepend(banner);
    });
  }

  async function init() {
    if (!backendReady) {
      demoNotice();
      const bal = $("#coin-balance");
      if (bal) bal.textContent = "— coins";
      // Demo mode: forms show an honest message instead of submitting.
      document.querySelectorAll("form").forEach((f) => {
        f.addEventListener("submit", (e) => {
          e.preventDefault();
          const msg = f.querySelector("p[id$='-msg']");
          if (msg) msg.textContent = "Backend not connected yet — sign-up/login go live once Supabase is connected.";
        });
      });
      // Demo mode: buttons that otherwise do nothing get an honest message.
      const checkinBtn = $("#checkin-btn");
      if (checkinBtn) {
        checkinBtn.addEventListener("click", () => {
          const msg = $("#checkin-msg");
          if (msg) msg.textContent = "Backend not connected yet — check-ins go live once Supabase is connected.";
        });
      }
      const copyBtn = $("#copy-ref");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          copyBtn.textContent = "Log in to get your link";
        });
      }
      await renderProofs();
      return;
    }
    sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    const { data } = await sb.auth.getSession();
    user = data?.session?.user || null;
    renderAuthArea(); // always render: logged-in OR logged-out, never stale
    if (user) {
      const { data: prof } = await sb
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = prof || null;
      if (window.TRIALEARN_SET_USER) window.TRIALEARN_SET_USER(user.id);
      await refreshBalance();
      renderReferral();
      renderLevel();
      await refreshCheckinState();
      // Hide the mid-page login/signup forms once logged in (rewards.html).
      const authCards = document.getElementById("auth-cards");
      if (authCards) authCards.style.display = "none";
    }
    await renderProofs();
    bindForms();
  }

  // --- Payout proof wall: ONLY real paid withdrawals (admin-inserted rows).
  async function renderProofs() {
    const list = $("#proof-list");
    if (!list) return;
    if (!backendReady) {
      list.innerHTML = '<p class="muted">Payout proofs appear here once the first real withdrawals are paid.</p>';
      return;
    }
    const { data } = await sb
      .from("payout_proofs")
      .select("display_name,amount_usd,method,paid_at")
      .order("paid_at", { ascending: false })
      .limit(30);
    if (!data || !data.length) {
      list.innerHTML = '<p class="muted">No payouts yet — the first paid withdrawals will show up here with real proof. No fake entries, ever.</p>';
      return;
    }
    list.innerHTML = data.map((r) => {
      const when = new Date(r.paid_at).toLocaleDateString();
      return '<div class="offer"><b>' + escapeHtml(r.display_name) + '</b> got paid <span class="pay">$' +
        Number(r.amount_usd).toFixed(2) + '</span> via ' + escapeHtml(r.method) +
        ' <span class="muted">· ' + when + '</span> <span class="badge ok">PAID ✓</span></div>';
    }).join("");
  }

  function renderAuthArea() {
    const area = $("#auth-area");
    if (!area) return;
    if (user) {
      area.innerHTML =
        '<span>' + escapeHtml(user.email) + '</span> ' +
        '<button class="btn ghost" id="logout-btn">Log out</button>';
      $("#logout-btn").addEventListener("click", async () => {
        await sb.auth.signOut();
        location.reload();
      });
    } else {
      // Logged-out state is rendered ONLY once the session check is done
      // (init calls this after getSession), never as a static placeholder.
      area.innerHTML = '<a class="btn ghost" href="rewards.html">Log in</a>';
    }
  }

  async function refreshBalance() {
    const bal = $("#coin-balance");
    const { data, error } = await sb
      .from("user_balances")
      .select("balance_coins")
      .eq("user_id", user.id)
      .single();
    const coins = error ? 0 : data.balance_coins;
    if (bal) bal.textContent = fmtCoins(coins) + " coins ($" + coinsToUsd(coins) + ")";
    const big = $("#balance-big");
    if (big) big.textContent = fmtCoins(coins);
    const usd = $("#balance-usd");
    if (usd) usd.textContent = "$" + coinsToUsd(coins);
    await renderLedger();
  }

  async function renderLedger() {
    const tbl = $("#ledger-body");
    if (!tbl) return;
    const { data } = await sb
      .from("coin_transactions")
      .select("amount_coins,source,created_at,meta")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(25);
    if (!data || !data.length) {
      tbl.innerHTML = '<tr><td colspan="3" class="muted">No earnings yet — complete your first offer to see it here.</td></tr>';
      return;
    }
    tbl.innerHTML = data.map((r) => {
      const sign = r.amount_coins > 0 ? "+" : "";
      const when = new Date(r.created_at).toLocaleString();
      return "<tr><td>" + when + "</td><td>" + escapeHtml(r.source) + "</td><td>" +
        sign + fmtCoins(r.amount_coins) + "</td></tr>";
    }).join("");
  }

  // Grey out the check-in button when today is already claimed, so the
  // page never shows a live "Claim" button next to an "already done"
  // message. Runs after the session is known.
  async function refreshCheckinState() {
    const btn = $("#checkin-btn");
    if (!btn || !user) return;
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await sb.from("daily_checkins")
      .select("coins_awarded, streak").eq("user_id", user.id)
      .eq("checkin_date", today).maybeSingle();
    if (data) {
      btn.disabled = true;
      btn.textContent = "Checked in ✓ +" + data.coins_awarded + " coins";
      const msg = $("#checkin-msg");
      if (msg) msg.textContent = "Already checked in today — come back tomorrow!";
    }
  }

  function renderLevel() {
    const lvl = profile?.level || 1;
    const caps = CFG.LEVEL_CAPS_USD || { 1: 10, 2: 25, 3: 50 };
    const num = $("#level-num");
    if (num) num.textContent = "Lv " + lvl;
    const el = $("#level-info");
    if (el) {
      el.innerHTML =
        "Level <b>" + lvl + "</b> — max $" + caps[lvl] + " per withdrawal. " +
        "Complete " + (CFG.LEVEL_THRESHOLDS_OFFERS?.[2] || 10) + " offers to reach Level 2 ($25/withdrawal), " +
        (CFG.LEVEL_THRESHOLDS_OFFERS?.[3] || 50) + " offers for Level 3 ($50/withdrawal).";
    }
    const bar = $("#level-progress");
    if (bar && profile) {
      const earned = profile.lifetime_coins_earned || 0;
      const next = lvl === 1 ? 10000 : lvl === 2 ? 50000 : 50000;
      bar.style.width = Math.min(100, Math.round((earned / next) * 100)) + "%";
    }
  }

  function renderReferral() {
    const link = $("#referral-link");
    if (link && profile?.referral_code) {
      link.value = CFG.SITE_URL + "/?ref=" + profile.referral_code;
    }
    const pct = $("#referral-pct");
    if (pct) pct.textContent = Math.round((CFG.REFERRAL_PCT || 0.10) * 100) + "%";
  }

  function bindForms() {
    // --- Auth (email + password) ---
    const loginForm = $("#login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = $("#login-email").value.trim();
        const password = $("#login-password").value;
        const msg = $("#login-msg");
        const { error } = await sb.auth.signInWithPassword({ email, password });
        msg.textContent = error ? error.message : "Logged in — redirecting…";
        if (!error) location.href = "rewards.html";
      });
    }
    const signupForm = $("#signup-form");
    if (signupForm) {
      signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = $("#signup-email").value.trim();
        const password = $("#signup-password").value;
        const msg = $("#signup-msg");
        const ref = new URLSearchParams(location.search).get("ref") || null;
        const { data, error } = await sb.auth.signUp({
          email, password, options: { data: { site: "trials" } },
        });
        if (error) { msg.textContent = error.message; return; }
        if (!data.user) { msg.textContent = "Account created! Check your email to confirm, then log in."; return; }
        // The profile row + referral_code are created by the auth.users
        // trigger (see shared fix-checkin-grants.sql). Attribution of a
        // referrer goes through the apply_referral RPC (SECURITY DEFINER).
        if (ref) {
          await sb.rpc("apply_referral", { p_user_id: data.user.id, p_code: ref });
        }
        msg.textContent = "Account created! Check your email to confirm, then log in.";
      });
    }

    // --- Daily check-in ---
    // Server-side via the claim_checkin RPC: one row per user per day, the
    // ledger credit is written by the function. The old code inserted into
    // daily_checkins directly (42501: no GRANT) and then into the ledger
    // (forbidden by RLS by design), and showed "Already checked in" for
    // EVERY error — including the permission error.
    const checkinBtn = $("#checkin-btn");
    if (checkinBtn) {
      checkinBtn.addEventListener("click", async () => {
        if (!user) { location.href = "rewards.html"; return; }
        const msg = $("#checkin-msg");
        const { data, error } = await sb.rpc("claim_checkin", { p_site: "trials" });
        if (error) { msg.textContent = "Check-in failed: " + error.message; return; }
        if (data && data.already) {
          msg.textContent = "Already checked in today — come back tomorrow!";
        } else {
          msg.textContent = "+" + ((data && data.coins) || 10) + " coins! See you tomorrow.";
        }
        checkinBtn.disabled = true;
        checkinBtn.textContent = "Checked in ✓";
        await refreshBalance();
      });
    }

    // --- Withdrawal request ---
    const wdForm = $("#withdraw-form");
    if (wdForm) {
      wdForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!user) { location.href = "rewards.html"; return; }
        const coins = parseInt($("#wd-coins").value, 10);
        const method = $("#wd-method").value;
        const address = $("#wd-address").value.trim();
        const msg = $("#wd-msg");
        const minUsd = method === "paypal"
          ? CFG.WITHDRAW_MIN_PAYPAL_USD : CFG.WITHDRAW_MIN_CRYPTO_USD;
        if (coins < minUsd * (CFG.COINS_PER_DOLLAR || 1000)) {
          msg.textContent = "Minimum is $" + minUsd + " (" + (minUsd * 1000) + " coins) for " + method + ".";
          return;
        }
        const capUsd = (CFG.LEVEL_CAPS_USD || { 1: 10 })[profile?.level || 1];
        if (coins > capUsd * 1000) {
          msg.textContent = "Your level allows max $" + capUsd + " per withdrawal. Level up to raise the cap.";
          return;
        }
        const { data: bal } = await sb.from("user_balances").select("balance_coins").eq("user_id", user.id).single();
        if (!bal || bal.balance_coins < coins) {
          msg.textContent = "Not enough coins yet.";
          return;
        }
        // First withdrawal = no prior approved/paid withdrawal on record.
        const { data: prior } = await sb.from("withdrawals").select("id")
          .eq("user_id", user.id).in("status", ["approved", "paid"]).limit(1);
        const { error } = await sb.from("withdrawals").insert({
          user_id: user.id, amount_coins: coins,
          amount_usd: coins / 1000, method, payout_address: address,
          is_first: !(prior && prior.length),
        });
        msg.textContent = error
          ? error.message
          : "Request received! First withdrawals are manually reviewed within " +
            (CFG.FIRST_WITHDRAWAL_HOLD_HOURS || "24–72h") +
            ". Payouts are batched " + (CFG.PAYOUT_DAYS || "Tue + Fri") + ".";
        if (!error) { await refreshBalance(); }
      });
    }

    // --- Copy referral link ---
    const copyBtn = $("#copy-ref");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const link = $("#referral-link");
        if (link) { link.select(); document.execCommand("copy"); copyBtn.textContent = "Copied!"; }
      });
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
