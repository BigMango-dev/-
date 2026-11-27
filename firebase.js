/* ============================================================================
   FIREBASE 云端同步 — 复用 virtual-fishing-cosmic，独立集合 xiuxian_users & xiuxian_leaderboard
   ============================================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-analytics.js";
import {
  getAuth,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgxl7OC7N3ycTiKwK2fEcXXM2Tl8skZ0Y",
  authDomain: "virtual-fishing-cosmic.firebaseapp.com",
  projectId: "virtual-fishing-cosmic",
  storageBucket: "virtual-fishing-cosmic.firebasestorage.app",
  messagingSenderId: "720230893474",
  appId: "1:720230893474:web:945c6347285343c47694fb",
  measurementId: "G-K8KZC2687R"
};

const USERS_COL = 'xiuxian_users';
const LB_COL = 'xiuxian_leaderboard';

let auth = null;
let db = null;
let currentUser = null;
let cloudReady = false;
let authInProgress = false;
let loadedUid = null;
let lbEntries = [];
let lbStatus = 'local';
let unsubLb = null;

function setSyncStatus(text, dotColor) {
  const t = document.getElementById('sync-text');
  const d = document.getElementById('sync-dot');
  if (t) t.textContent = text;
  if (d) d.className = `w-2 h-2 rounded-full shrink-0 ${dotColor}`;
}

function updateAccountModalUI() {
  const s = window.getGameState ? window.getGameState() : {};
  const isGoogle = Boolean(currentUser && !currentUser.isAnonymous);
  const label = s.displayName || (isGoogle ? currentUser.displayName : '散修');

  const lbl = document.getElementById('account-label');
  const av = document.getElementById('account-avatar');
  const typeEl = document.getElementById('modal-account-type');
  const uidEl = document.getElementById('modal-user-id');
  const gBtn = document.getElementById('btn-modal-google');
  const outBtn = document.getElementById('btn-modal-signout');

  if (lbl) lbl.textContent = label;
  if (av) av.textContent = isGoogle ? '⭐' : '👤';
  if (typeEl) {
    typeEl.textContent = isGoogle
      ? `Google 道友 (${currentUser.email || '已绑定'})`
      : (cloudReady ? '散修游客 (云端已连)' : '散修游客 (本地玉简)');
  }
  if (uidEl) uidEl.textContent = currentUser ? currentUser.uid : 'local-cultivator';
  if (gBtn) gBtn.classList.toggle('hidden', isGoogle);
  if (outBtn) outBtn.classList.toggle('hidden', !isGoogle);
}

function showAuthError(msg) {
  const box = document.getElementById('modal-auth-error');
  if (box) { box.textContent = msg; box.classList.remove('hidden'); }
}
function clearAuthError() {
  const box = document.getElementById('modal-auth-error');
  if (box) box.classList.add('hidden');
}

function subscribeLeaderboard() {
  if (!db || unsubLb) return;
  try {
    const q = query(collection(db, LB_COL), orderBy('score', 'desc'), limit(50));
    unsubLb = onSnapshot(
      q,
      snap => {
        lbEntries = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
        lbStatus = 'live';
        if (window.onLeaderboardUpdate) window.onLeaderboardUpdate();
      },
      err => {
        console.warn('Leaderboard error:', err);
        lbStatus = 'error';
        if (window.onLeaderboardUpdate) window.onLeaderboardUpdate();
      }
    );
  } catch (_) {
    lbStatus = 'error';
  }
}

async function saveToCloud(showFeedback = false) {
  if (!db || !currentUser || !cloudReady || !window.getGameState) {
    if (showFeedback && window.showToast) window.showToast('💾 已保存至本地玉简。', 'emerald');
    return;
  }
  try {
    setSyncStatus('同步中...', 'bg-cyan-400');
    const s = window.getGameState();
    const now = Date.now();
    await setDoc(doc(db, USERS_COL, currentUser.uid), { ...s, updatedAt: now }, { merge: true });

    const score = (s.prestige || 0) * 1000000 + (s.realmIdx || 0) * 100 + (s.subIdx || 0);
    try {
      await setDoc(doc(db, LB_COL, currentUser.uid), {
        uid: currentUser.uid,
        displayName: s.displayName || (currentUser.displayName ? currentUser.displayName.slice(0, 18) : '青云散修'),
        prestige: s.prestige || 0,
        realmIdx: s.realmIdx || 0,
        subIdx: s.subIdx || 0,
        stones: Math.floor(s.stones || 0),
        physiqueCount: Array.isArray(s.physiques) ? s.physiques.length : 0,
        totalTicks: s.totalTicks || 0,
        isGoogle: !currentUser.isAnonymous,
        score,
        updatedAt: now
      }, { merge: true });
    } catch (_) {}

    setSyncStatus('云端已同步', 'bg-emerald-400');
    if (showFeedback && window.showToast) window.showToast('☁️ 玉简与金榜已同步至云端！', 'emerald');
  } catch (err) {
    console.error('Cloud save error:', err);
    setSyncStatus('本地模式', 'bg-amber-400');
    if (showFeedback && window.showToast) window.showToast(`云端暂不可用 (${err.code || 'err'})，已存本地。`, 'amber');
  }
}

async function loadFromCloud(user, force = false) {
  if (!db || !user) return;
  if (!force && loadedUid === user.uid && cloudReady) {
    updateAccountModalUI();
    return;
  }
  cloudReady = false;
  loadedUid = user.uid;
  try {
    setSyncStatus('读取云端...', 'bg-cyan-400');
    const snap = await getDoc(doc(db, USERS_COL, user.uid));
    if (snap.exists()) {
      if (window.applyCloudState) window.applyCloudState(snap.data());
      cloudReady = true;
      setSyncStatus('云端已同步', 'bg-emerald-400');
    } else {
      const s = window.getGameState ? window.getGameState() : null;
      if (s && user.displayName && (!s.displayName || s.displayName === '青云散修')) {
        s.displayName = user.displayName.slice(0, 18);
      }
      cloudReady = true;
      await saveToCloud(false);
    }
  } catch (err) {
    console.error('Cloud load error:', err);
    cloudReady = false;
    setSyncStatus('本地模式', 'bg-amber-400');
    showAuthError(`读取云端存档失败 (${err.code || 'error'})，请检查 Firestore Rules 是否已添加 xiuxian_users。`);
  }
  updateAccountModalUI();
  subscribeLeaderboard();
}

async function handleGoogleSignIn() {
  if (authInProgress) return;
  clearAuthError();
  if (!auth) { showAuthError('Firebase 未能初始化，请检查网络。'); return; }
  authInProgress = true;
  cloudReady = false;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const res = await signInWithPopup(auth, provider);
    currentUser = res.user;
    await loadFromCloud(currentUser, true);
    if (window.showToast) window.showToast(`✅ 已登录 Google 账号：${currentUser.email || '道友'}`, 'emerald');
  } catch (err) {
    if (err.code === 'auth/popup-blocked') {
      try { await signInWithRedirect(auth, provider); return; } catch (_) {}
    }
    showAuthError(`Google 登录未完成 (${err.code || '已取消'})，本地玉简安全无恙。`);
    if (currentUser) cloudReady = true;
  } finally {
    authInProgress = false;
    updateAccountModalUI();
  }
}

async function handleSignOutToGuest() {
  clearAuthError();
  if (!auth) return;
  try {
    cloudReady = false;
    loadedUid = null;
    await signOut(auth);
    const res = await signInAnonymously(auth);
    currentUser = res.user;
    if (window.showToast) window.showToast('👤 已切换为散修游客模式。', 'cyan');
    await loadFromCloud(currentUser, true);
  } catch (err) {
    showAuthError(`切换失败 (${err.code || 'error'})，请刷新页面重试。`);
  }
}

window.CloudSync = {
  isReady: () => Boolean(cloudReady && db && currentUser),
  save: saveToCloud,
  updateUI: updateAccountModalUI,
  getUid: () => (currentUser ? currentUser.uid : 'local-me'),
  getLeaderboard: () => lbEntries,
  getLeaderboardStatus: () => lbStatus
};

async function initFirebaseCloud() {
  document.getElementById('btn-modal-google')?.addEventListener('click', handleGoogleSignIn);
  document.getElementById('btn-modal-signout')?.addEventListener('click', handleSignOutToGuest);
  try {
    const app = initializeApp(firebaseConfig);
    try { getAnalytics(app); } catch (_) {}
    auth = getAuth(app);
    db = getFirestore(app);
    try {
      const redir = await getRedirectResult(auth);
      if (redir && redir.user) currentUser = redir.user;
    } catch (_) {}
    onAuthStateChanged(auth, async user => {
      currentUser = user;
      if (user) {
        if (!authInProgress) await loadFromCloud(user, false);
      } else {
        cloudReady = false;
        loadedUid = null;
        updateAccountModalUI();
      }
    });
    if (!auth.currentUser) await signInAnonymously(auth);
  } catch (err) {
    console.warn('Firebase fallback:', err);
    cloudReady = false;
    setSyncStatus('本地模式', 'bg-amber-400');
    updateAccountModalUI();
  }
}

initFirebaseCloud();
