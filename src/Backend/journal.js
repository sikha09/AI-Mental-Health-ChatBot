const db = require('./db');

// ── GET: Fetch all journal entries for a user ─────────────────────────
const getJournals = (req, res) => {
    const userId = req.user.id;
    const sql = `SELECT id, title, content, mood, ai_insight, created_at, updated_at
                 FROM journals WHERE user_id = ? ORDER BY created_at DESC`;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching journals:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch journals' });
        }
        return res.json({ success: true, journals: results });
    });
};

// ── POST: Create a new journal entry ──────────────────────────────────
const createJournal = (req, res) => {
    const userId = req.user.id;
    const { title, content, mood, ai_insight } = req.body;

    if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const sql = `INSERT INTO journals (user_id, title, content, mood, ai_insight) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [userId, title, content, mood || null, ai_insight || null], (err, result) => {
        if (err) {
            console.error('Error creating journal:', err);
            return res.status(500).json({ success: false, message: 'Failed to save journal entry' });
        }
        return res.status(201).json({
            success: true,
            message: 'Journal saved!',
            journalId: result.insertId
        });
    });
};

// ── PUT: Update an existing journal entry ─────────────────────────────
const updateJournal = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, content, mood, ai_insight } = req.body;

    const sql = `UPDATE journals SET title=?, content=?, mood=?, ai_insight=?, updated_at=NOW()
                 WHERE id=? AND user_id=?`;
    db.query(sql, [title, content, mood || null, ai_insight || null, id, userId], (err, result) => {
        if (err) {
            console.error('Error updating journal:', err);
            return res.status(500).json({ success: false, message: 'Failed to update journal entry' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Journal not found or unauthorized' });
        }
        return res.json({ success: true, message: 'Journal updated!' });
    });
};

// ── DELETE: Remove a journal entry ────────────────────────────────────
const deleteJournal = (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    db.query('DELETE FROM journals WHERE id=? AND user_id=?', [id, userId], (err, result) => {
        if (err) {
            console.error('Error deleting journal:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete journal entry' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Journal not found or unauthorized' });
        }
        return res.json({ success: true, message: 'Journal deleted!' });
    });
};

module.exports = { getJournals, createJournal, updateJournal, deleteJournal };
