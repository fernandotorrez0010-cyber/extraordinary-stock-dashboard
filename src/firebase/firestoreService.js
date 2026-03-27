// src/firebase/firestoreService.js
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, query, where, orderBy, onSnapshot,
  serverTimestamp, limit, writeBatch, increment,
} from 'firebase/firestore';
import { db } from './config';
import { uploadToCloudinary } from '../utils/cloudinaryService';
import { nanoid } from '../utils/helpers';

// ─── USERS ──────────────────────────────────────────────────────────────────
export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateUser = (uid, data) =>
  updateDoc(doc(db, 'users', uid), data);

export const subscribeToUser = (uid, cb) =>
  onSnapshot(doc(db, 'users', uid), snap => cb({ id: snap.id, ...snap.data() }));

// ─── PLANS ───────────────────────────────────────────────────────────────────
export const getPlans = async () => {
  const snap = await getDocs(query(collection(db, 'plans'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createPlan = (data) =>
  addDoc(collection(db, 'plans'), { ...data, createdAt: serverTimestamp() });

export const updatePlan = (id, data) =>
  updateDoc(doc(db, 'plans', id), data);

export const deletePlan = (id) => deleteDoc(doc(db, 'plans', id));

export const subscribePlans = (cb) =>
  onSnapshot(query(collection(db, 'plans'), orderBy('createdAt', 'desc')), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

// ─── INVESTMENTS ─────────────────────────────────────────────────────────────
export const createInvestment = async (userId, planId, amount, plan) => {
  const batch = writeBatch(db);
  const now = new Date();
  const endDate = new Date(now.getTime() + plan.durationDays * 86400000);
  const ref = doc(collection(db, 'investments'));
  batch.set(ref, {
    userId, planId, amount,
    planName: plan.name,
    roiPercent: plan.roiPercent,
    profit: 0,
    status: 'active',
    startDate: serverTimestamp(),
    endDate,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, 'users', userId), {
    balance: increment(-amount),
    totalInvested: increment(amount),
  });
  // record transaction
  const txRef = doc(collection(db, 'transactions'));
  batch.set(txRef, {
    userId, type: 'investment', amount,
    method: 'balance', status: 'completed',
    reference: nanoid(10).toUpperCase(),
    date: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  await batch.commit();
};

export const getUserInvestments = async (userId) => {
  const snap = await getDocs(query(
    collection(db, 'investments'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllInvestments = async () => {
  const snap = await getDocs(query(collection(db, 'investments'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateInvestment = (id, data) =>
  updateDoc(doc(db, 'investments', id), data);

export const subscribeInvestments = (userId, cb) => {
  const q = userId
    ? query(collection(db, 'investments'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    : query(collection(db, 'investments'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
};

// ─── TRADES ──────────────────────────────────────────────────────────────────
export const getTrades = async () => {
  const snap = await getDocs(query(collection(db, 'trades'), orderBy('date', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const createTrade = (data) =>
  addDoc(collection(db, 'trades'), { ...data, createdAt: serverTimestamp() });

export const updateTrade = (id, data) =>
  updateDoc(doc(db, 'trades', id), data);

export const deleteTrade = (id) => deleteDoc(doc(db, 'trades', id));

export const subscribeTrades = (cb) =>
  onSnapshot(query(collection(db, 'trades'), orderBy('date', 'desc')), snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const createTransaction = (data) =>
  addDoc(collection(db, 'transactions'), {
    ...data,
    reference: nanoid(10).toUpperCase(),
    createdAt: serverTimestamp(),
    date: serverTimestamp(),
  });

export const getUserTransactions = async (userId) => {
  const snap = await getDocs(query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllTransactions = async () => {
  const snap = await getDocs(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateTransaction = async (id, data) => {
  const txSnap = await getDoc(doc(db, 'transactions', id));
  const tx = txSnap.data();
  await updateDoc(doc(db, 'transactions', id), data);
  // if approving deposit, credit user balance
  if (data.status === 'approved' && tx.type === 'deposit') {
    await updateDoc(doc(db, 'users', tx.userId), { balance: increment(tx.amount) });
  }
  // if approving withdrawal, already deducted on request
  if (data.status === 'rejected' && tx.type === 'withdraw') {
    await updateDoc(doc(db, 'users', tx.userId), { balance: increment(tx.amount) });
  }
};

export const subscribeTransactions = (userId, cb) => {
  const q = userId
    ? query(collection(db, 'transactions'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    : query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
};

// ─── WITHDRAWALS (subset of transactions) ─────────────────────────────────────
export const requestWithdrawal = async (userId, amount, method, details) => {
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', userId), { balance: increment(-amount) });
  const txRef = doc(collection(db, 'transactions'));
  batch.set(txRef, {
    userId, type: 'withdraw', amount, method,
    details, status: 'pending',
    reference: nanoid(10).toUpperCase(),
    date: serverTimestamp(), createdAt: serverTimestamp(),
  });
  await batch.commit();
};

// ─── KYC ─────────────────────────────────────────────────────────────────────
export const submitKYC = async (userId, files) => {
  const [idUrl, selfieUrl, addressUrl] = await Promise.all([
    uploadToCloudinary(files.idCard, `kyc/${userId}`),
    uploadToCloudinary(files.selfie, `kyc/${userId}`),
    uploadToCloudinary(files.address, `kyc/${userId}`),
  ]);
  const existing = await getDocs(query(collection(db, 'kyc'), where('userId', '==', userId)));
  if (!existing.empty) {
    await updateDoc(doc(db, 'kyc', existing.docs[0].id), {
      idUrl, selfieUrl, addressUrl, status: 'pending', updatedAt: serverTimestamp(),
    });
  } else {
    await addDoc(collection(db, 'kyc'), {
      userId, idUrl, selfieUrl, addressUrl, status: 'pending',
      createdAt: serverTimestamp(),
    });
  }
};

export const getKYC = async (userId) => {
  const snap = await getDocs(query(collection(db, 'kyc'), where('userId', '==', userId)));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const getAllKYC = async () => {
  const snap = await getDocs(collection(db, 'kyc'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateKYC = (id, data) => updateDoc(doc(db, 'kyc', id), data);

// ─── TICKETS ──────────────────────────────────────────────────────────────────
export const createTicket = (data) =>
  addDoc(collection(db, 'tickets'), { ...data, status: 'open', createdAt: serverTimestamp() });

export const getUserTickets = async (userId) => {
  const snap = await getDocs(query(
    collection(db, 'tickets'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllTickets = async () => {
  const snap = await getDocs(query(collection(db, 'tickets'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const replyTicket = (id, reply) =>
  updateDoc(doc(db, 'tickets', id), { reply, status: 'answered', updatedAt: serverTimestamp() });

export const subscribeTickets = (userId, cb) => {
  const q = userId
    ? query(collection(db, 'tickets'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    : query(collection(db, 'tickets'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const sendNotification = async (data) => {
  if (data.userId === 'all') {
    const users = await getAllUsers();
    const batch = writeBatch(db);
    users.forEach(u => {
      const r = doc(collection(db, 'notifications'));
      batch.set(r, { ...data, userId: u.id, read: false, date: serverTimestamp() });
    });
    await batch.commit();
  } else {
    await addDoc(collection(db, 'notifications'), {
      ...data, read: false, date: serverTimestamp(),
    });
  }
};

export const getUserNotifications = (userId, cb) =>
  onSnapshot(
    query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('date', 'desc')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );

export const markNotificationRead = (id) =>
  updateDoc(doc(db, 'notifications', id), { read: true });

export const markAllRead = async (userId) => {
  const snap = await getDocs(query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  ));
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { read: true }));
  await batch.commit();
};

// ─── REFERRALS ────────────────────────────────────────────────────────────────
export const getReferrals = async (referrerId) => {
  const snap = await getDocs(query(
    collection(db, 'referrals'),
    where('referrerId', '==', referrerId),
    orderBy('date', 'desc')
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── FILE UPLOAD (Cloudinary) ─────────────────────────────────────────────────
// Re-export Cloudinary upload under the same name so all existing callers work
export { uploadToCloudinary as uploadFile } from '../utils/cloudinaryService';

// ─── ADMIN: Assign profit ─────────────────────────────────────────────────────
export const assignProfit = async (userId, amount, note = '') => {
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', userId), {
    profit: increment(amount),
    balance: increment(amount),
  });
  const txRef = doc(collection(db, 'transactions'));
  batch.set(txRef, {
    userId, type: 'profit', amount,
    method: 'system', status: 'completed',
    note, reference: nanoid(10).toUpperCase(),
    date: serverTimestamp(), createdAt: serverTimestamp(),
  });
  await batch.commit();
};
