import cron from 'node-cron';
import fetch from 'node-fetch';
import { db } from '../lib/firestoreClient.js';
import { callGemini } from '../lib/geminiClient.js';
import logger from '../lib/logger.js';

export function startDailyBriefingCron() {
  // Run at 08:00 AM every day
  // You can adjust the timezone if needed, or iterate per user timezone
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running Daily Briefing Job...');
    try {
      const usersSnap = await db.collection('users').get();
      
      for (const userDoc of usersSnap.docs) {
        const uid = userDoc.id;
        const userData = userDoc.data();
        
        // Check if daily briefing is enabled and Telegram is connected
        if (userData?.notificationPrefs?.dailyBriefing === false) continue;
        if (!userData?.connectedChannels?.telegram) continue;
        
        const chatId = userData.integrations?.telegram?.chatId;
        if (!chatId) continue;
        
        // Fetch tasks
        const todayStr = new Date().toISOString().split('T')[0];
        const tasksSnap = await db.collection('users').doc(uid).collection('tasks')
          .where('status', '!=', 'done')
          .get();
          
        const todayTasks = [];
        const overdueTasks = [];
        
        tasksSnap.forEach(t => {
          const taskData = t.data();
          if (taskData.dueAt) {
            const taskDate = taskData.dueAt.split('T')[0];
            if (taskDate === todayStr) {
              todayTasks.push(taskData.title);
            } else if (new Date(taskData.dueAt) < new Date()) {
              overdueTasks.push(taskData.title);
            }
          }
        });
        
        if (todayTasks.length === 0 && overdueTasks.length === 0) {
          // Send a chill message
          await sendTelegramMessage(chatId, "☕ Good morning! You have no tasks due today or overdue. Have a great day!");
          continue;
        }
        
        // Use Gemini to generate a summary
        const prompt = `Write a short, punchy morning briefing for the user. 
Tasks due today: ${todayTasks.length > 0 ? todayTasks.join(', ') : 'None'}
Overdue tasks: ${overdueTasks.length > 0 ? overdueTasks.join(', ') : 'None'}

Make it encouraging but firm. Limit to 3 short sentences. No markdown formatting.`;

        let summaryText;
        try {
          const res = await callGemini(prompt, { structured: false });
          summaryText = res.trim();
        } catch (err) {
          logger.error(`Failed to generate Gemini summary for uid ${uid}:`, err);
          summaryText = `Good morning! You have ${todayTasks.length} tasks due today and ${overdueTasks.length} overdue tasks. Let's get to work!`;
        }
        
        await sendTelegramMessage(chatId, summaryText);
      }
    } catch (e) {
      logger.error('Failed to run daily briefing cron job:', e);
    }
  });
  
  logger.info('Daily Briefing cron job scheduled.');
}

async function sendTelegramMessage(chatId, text) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  } catch (err) {
    logger.error('Failed to send telegram daily briefing:', err);
  }
}
