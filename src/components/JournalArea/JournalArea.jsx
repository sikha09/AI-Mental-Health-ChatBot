import { useState, useEffect } from 'react';
import { getJournals, createJournal, deleteJournal } from '../../services/journalService';
import { sendMessage } from '../../services/chatService';
import './JournalArea.css';

const MOODS = [
    { label: 'Happy' },
    { label: 'Sad' },
    { label: 'Anxious' },
    { label: 'Angry' },
    { label: 'Calm' },
    { label: 'Tired' },
    { label: 'Grateful' },
    { label: 'Numb' },

];

export default function JournalArea() {
    const [journals, setJournals] = useState([]);
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [isWriting, setIsWriting] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => {
        fetchJournals();
    }, []);

    const fetchJournals = async () => {
        try {
            setIsLoading(true);
            const data = await getJournals();
            setJournals(data.journals || []);
        } catch (err) {
            setError('Could not load journals. Please log in to use this feature.');
        } finally {
            setIsLoading(false);
        }
    };

    const startNewEntry = () => {
        setSelectedJournal(null);
        setTitle('');
        setContent('');
        setMood(null);
        setError(null);
        setIsWriting(true);
    };

    const viewEntry = (journal) => {
        setSelectedJournal(journal);
        setIsWriting(false);
    };



    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            setError('Please fill in both a title and your journal entry.');
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            await createJournal({ title, content, mood: mood?.label });
            await fetchJournals();
            setIsWriting(false);
            setTitle('');
            setContent('');
            setMood(null);
        } catch {
            setError('Failed to save your entry. Please make sure you are logged in.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteJournal(id);
            setJournals(prev => prev.filter(j => j.id !== id));
            if (selectedJournal?.id === id) setSelectedJournal(null);
            setConfirmDelete(null);
        } catch {
            setError('Failed to delete entry.');
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };


    // ── Writing View ───────────────────────────────────────────────────
    if (isWriting) {
        return (
            <div className="journal-area">
                <div className="journal-write-view">
                    <div className="journal-write-header">
                        <button className="journal-back-btn" onClick={() => setIsWriting(false)}>← Back</button>
                        <h2 className="journal-write-title">New Entry</h2>
                        <span className="journal-date-label">{formatDate(new Date())}</span>
                    </div>

                    {error && <div className="journal-error">{error}</div>}

                    <input
                        className="journal-title-input"
                        placeholder="Give your entry a title..."
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        maxLength={100}
                    />

                    {/* Mood Selector */}
                    <div className="mood-selector">
                        <span className="mood-label">How are you feeling?</span>
                        <div className="mood-pills">
                            {MOODS.map(m => (
                                <button
                                    key={m.label}
                                    className={`mood-pill ${mood?.label === m.label ? 'selected' : ''}`}
                                    onClick={() => setMood(mood?.label === m.label ? null : m)}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <textarea
                        className="journal-content-input"
                        placeholder="Write freely... This is your safe space. Express your thoughts, feelings, and experiences without judgment. ✨"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={12}
                    />


                    <div className="journal-write-actions">
                        <button className="journal-cancel-btn" onClick={() => setIsWriting(false)}>Cancel</button>
                        <button className="journal-save-btn" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Entry'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Read / Detail View ────────────────────────────────────────────
    if (selectedJournal) {
        return (
            <div className="journal-area">
                <div className="journal-detail-view">
                    <div className="journal-detail-header">
                        <button className="journal-back-btn" onClick={() => setSelectedJournal(null)}>← All Entries</button>
                        <button className="journal-delete-btn" onClick={() => setConfirmDelete(selectedJournal.id)}>Delete</button>
                    </div>
                    <h1 className="journal-detail-title">{selectedJournal.title}</h1>
                    <div className="journal-detail-meta">
                        <span className="journal-detail-date">{formatDate(selectedJournal.created_at)}</span>
                        {selectedJournal.mood && <span className="journal-detail-mood">
                            {selectedJournal.mood}
                        </span>}
                    </div>
                    <div className="journal-detail-content">{selectedJournal.content}</div>

                    {confirmDelete === selectedJournal.id && (
                        <div className="confirm-delete-box">
                            <p>Are you sure you want to delete this entry? This cannot be undone.</p>
                            <button onClick={() => handleDelete(selectedJournal.id)} className="confirm-delete-yes">Yes, delete</button>
                            <button onClick={() => setConfirmDelete(null)} className="confirm-delete-no">Cancel</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ── Main List View ────────────────────────────────────────────────
    return (
        <div className="journal-area">
            <div className="journal-list-view">
                <div className="journal-list-header">
                    <div className="journal-header-top">
                        <div>
                            <h1 className="journal-main-title">📓 My Journal</h1>
                            <p className="journal-main-sub">Your private space to reflect, grow, and heal.</p>
                        </div>
                        <button className="new-entry-btn" onClick={startNewEntry}>+ New Entry</button>
                    </div>
                </div>

                {isLoading && <div className="journal-loading">Loading your entries...</div>}
                {error && <div className="journal-error">{error}</div>}

                {!isLoading && journals.length === 0 && (
                    <div className="journal-empty">
                        <div className="journal-empty-icon"></div>
                        <h3>Your journal is empty.</h3>
                        <p>Start writing your first entry today. One thought at a time.</p>
                        <button className="new-entry-btn" onClick={startNewEntry}>Write Your First Entry</button>
                    </div>
                )}

                <div className="journal-grid">
                    {journals.map(journal => (
                        <div key={journal.id} className="journal-card" onClick={() => viewEntry(journal)}>
                            <div className="journal-card-header">
                                <span className="journal-card-date">{formatDate(journal.created_at)}</span>
                                {journal.mood && <span className="journal-card-mood">{journal.mood}</span>}
                            </div>
                            <h3 className="journal-card-title">{journal.title}</h3>
                            <p className="journal-card-preview">
                                {journal.content.substring(0, 120)}{journal.content.length > 120 ? '...' : ''}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
