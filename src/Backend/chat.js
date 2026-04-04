const db = require('./db');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

/**
 * Send a message to the AI model and save the interaction to the database.
 */
const sendMessage = async (req, res) => {
    // CRITICAL FIX: The verifyToken middleware sets req.user.id
    const userId = req.user.id; 
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
    }

    try {
        console.log(`Sending message for user ${userId}: ${message}`);

        // 1. Call the AI Model (Python API on port 5002)
        // Using explicit 127.0.0.1 to avoid IPv6/IPv4 resolution ambiguity
        const aiResponse = await fetch('http://127.0.0.1:5002/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, session_id: `user_${userId}` })
        });

        if (!aiResponse.ok) {
            const errorBody = await aiResponse.text();
            console.error('AI Model Error Body:', errorBody);
            throw new Error(`AI Model error: ${aiResponse.status} - ${errorBody}`);
        }

        const aiData = await aiResponse.json();
        const botResponse = aiData.response;
        const mood = aiData.emotion || 'Normal';

        // 2. Save the interaction to the database
        const sql = `INSERT INTO chat_history (user_id, user_message, bot_response, mood) VALUES (?, ?, ?, ?)`;
        db.query(sql, [userId, message, botResponse, mood], (err, result) => {
            if (err) {
                console.error('DATABASE INSERT ERROR:', err);
                // We still return the response to the user even if DB save fails
            }

            // 3. Return the AI response along with the mood
            return res.json({
                success: true,
                response: botResponse,
                emotion: mood,
                messageId: result ? result.insertId : null
            });
        });

    } catch (error) {
        console.error('Chat controller error:', error);
        return res.status(500).json({ 
            success: false, 
            message: `Failed to get response from AI model. Error: ${error.message}` 
        });
    }
};

/**
 * Fetch the chat history for the logged-in user.
 */
const getChatHistory = (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT id, user_message, bot_response, mood, created_at 
                 FROM chat_history WHERE user_id = ? ORDER BY created_at ASC`;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching chat history:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch history' });
        }
        return res.json({ success: true, history: results });
    });
};

/**
 * Get mood analytics for the last 30 days.
 */
const getMoodAnalytics = (req, res) => {
    const userId = req.user.id;
    
    // Get count of each mood category over time
    const sql = `
        SELECT mood, DATE(created_at) as date, COUNT(*) as count 
        FROM chat_history 
        WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY mood, DATE(created_at)
        ORDER BY DATE(created_at) ASC;
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching mood analytics:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
        }
        
        // Also get a summary of moods for a pie chart
        const summarySql = `
            SELECT mood, COUNT(*) as value 
            FROM chat_history 
            WHERE user_id = ? 
            GROUP BY mood;
        `;
        
        db.query(summarySql, [userId], (summaryErr, summaryResults) => {
            if (summaryErr) {
                return res.json({ success: true, trend: results, summary: [] });
            }
            return res.json({ success: true, trend: results, summary: summaryResults });
        });
    });
};

module.exports = { sendMessage, getChatHistory, getMoodAnalytics };
