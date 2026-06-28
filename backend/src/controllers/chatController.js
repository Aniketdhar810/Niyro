// src/controllers/chatController.js
// Simply delegates to the chat agent.

import { chat } from '../agents/chatAgent.js';

export async function postChat(req, res) {
  try {
    const uid = req.user.uid;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: 'message is required' });
    }

    const { reply, citedTaskIds } = await chat(uid, message);
    res.json({ success: true, reply, citedTaskIds });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
