import { db } from '../lib/firestoreClient.js';
import { generateRecommendations } from '../agents/recommendationsAgent.js';
import { extractPatterns } from '../agents/memoryAgent.js';
import logger from '../lib/logger.js';

export async function getRecommendations(req, res) {
  try {
    const uid = req.user.uid;
    const now = new Date().toISOString();
    
    // Fetch active recommendations
    const recsSnap = await db.collection('users').doc(uid).collection('recommendations')
      .where('expiresAt', '>', now)
      .get();
      
    const recommendations = [];
    recsSnap.forEach(doc => {
      if (doc.id !== '_meta') {
        recommendations.push(doc.data());
      }
    });
    
    // Fetch AI Memory patterns
    const memorySnap = await db.collection('users').doc(uid).collection('aiMemory').get();
    const memoryPatterns = [];
    memorySnap.forEach(doc => {
      memoryPatterns.push(doc.data());
    });

    // Fetch meta doc for generatedAt
    const metaDoc = await db.collection('users').doc(uid).collection('recommendations').doc('_meta').get();
    const generatedAt = metaDoc.exists ? metaDoc.data().generatedAt : null;
    
    let nextRefreshAvailable = null;
    if (generatedAt) {
      nextRefreshAvailable = new Date(new Date(generatedAt).getTime() + 6 * 3600000).toISOString();
    }
    
    res.json({
      success: true,
      recommendations,
      memoryPatterns,
      generatedAt,
      nextRefreshAvailable
    });
  } catch (error) {
    logger.error(`Error getting recommendations for uid=${req.user?.uid}:`, error);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
}

export async function refreshRecommendations(req, res) {
  try {
    const uid = req.user.uid;
    
    // Check cooldown
    const metaDoc = await db.collection('users').doc(uid).collection('recommendations').doc('_meta').get();
    if (metaDoc.exists) {
      const { generatedAt } = metaDoc.data();
      if (generatedAt) {
        const nextAvailable = new Date(generatedAt).getTime() + 6 * 3600000;
        if (Date.now() < nextAvailable) {
          return res.status(429).json({
            success: false,
            error: 'Please wait before refreshing recommendations',
            nextRefreshAvailable: new Date(nextAvailable).toISOString()
          });
        }
      }
    }
    
    // Generate new ones
    // Run both agents in parallel to save time
    const [recommendations, memoryPatterns] = await Promise.all([
      generateRecommendations(uid),
      extractPatterns(uid)
    ]);
    
    res.json({ success: true, recommendations, memoryPatterns });
  } catch (error) {
    logger.error(`Error refreshing recommendations for uid=${req.user?.uid}:`, error);
    res.status(500).json({ success: false, error: 'Failed to refresh recommendations' });
  }
}
