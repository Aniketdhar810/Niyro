// src/controllers/approvalsController.js
// Handles approvals in users/{uid}/approvals.
// Actions: listPending, approve, reject.
// On approve/reject, can trigger side effects (e.g., sending the Gmail draft).

import { db } from '../lib/firestoreClient.js';
import { getAccessToken } from '../lib/tokenProvider.js';
import { logActivity } from '../lib/activityLogger.js';
import { sendMessage } from '../lib/gmailClient.js';

export async function listPending(req, res) {
  try {
    const uid = req.user.uid;
    const snap = await db
      .collection('users')
      .doc(uid)
      .collection('approvals')
      .where('status', '==', 'pending')
      .get();

    const approvals = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, approvals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function approve(req, res) {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    const approvalRef = db.collection('users').doc(uid).collection('approvals').doc(id);
    const snap = await approvalRef.get();
    if (!snap.exists) return res.status(404).json({ success: false, error: 'Approval not found' });
    const approval = snap.data();

    // If it's a negotiation draft, send the email via Gmail API
    if (approval.type === 'negotiation' && approval.draftContent && approval.recipient) {
      try {
        await sendMessage(uid, {
          to: approval.recipient,
          subject: `Regarding: ${approval.taskTitle || 'Task'}`,
          body: approval.draftContent,
        });
      } catch (emailErr) {
        console.error('Failed to send negotiation email:', emailErr.message);
        return res.status(502).json({ success: false, error: 'Approval accepted, but email sending failed.' });
      }
    }

    await approvalRef.update({ status: 'approved', updatedAt: new Date().toISOString() });
    await logActivity(uid, 'approval_granted', { approvalId: id, type: approval.type });
    res.json({ success: true, message: 'Approved' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function reject(req, res) {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    const approvalRef = db.collection('users').doc(uid).collection('approvals').doc(id);
    const snap = await approvalRef.get();
    if (!snap.exists) return res.status(404).json({ success: false, error: 'Approval not found' });

    await approvalRef.update({ status: 'rejected', updatedAt: new Date().toISOString() });
    await logActivity(uid, 'approval_rejected', { approvalId: id });
    res.json({ success: true, message: 'Rejected' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
