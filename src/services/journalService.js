import { getAuthToken } from './authService';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Fetch all journal entries for the logged-in user
export const getJournals = async () => {
    const res = await fetch(`${API_BASE}/api/journals`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch journals');
    return res.json();
};

// Save a new journal entry (with optional AI insight & mood)
export const createJournal = async ({ title, content, mood, ai_insight }) => {
    const res = await fetch(`${API_BASE}/api/journals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, content, mood, ai_insight })
    });
    if (!res.ok) throw new Error('Failed to save journal');
    return res.json();
};

// Update an existing journal entry by ID
export const updateJournal = async (id, { title, content, mood, ai_insight }) => {
    const res = await fetch(`${API_BASE}/api/journals/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, content, mood, ai_insight })
    });
    if (!res.ok) throw new Error('Failed to update journal');
    return res.json();
};

// Delete a journal entry by ID
export const deleteJournal = async (id) => {
    const res = await fetch(`${API_BASE}/api/journals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete journal');
    return res.json();
};

