import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Dot
} from 'recharts';
import { getMoodAnalytics } from '../../services/chatService';
import { EMOTION_COLORS } from '../../config/constants';
import './MoodTracker.css';

const MoodTracker = ({ compact = false }) => {
  const [data, setData] = useState({ trend: [], summary: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await getMoodAnalytics();
        setData(analytics);
      } catch (err) {
        console.error("Failed to load mood analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Map mood labels to numeric values for the line chart
  const moodMap = {
    'Normal': 3,
    'Stress': 2,
    'Anxiety': 1,
    'Depression': 0,
    'Suicidal': -1,
    'Bipolar': 1.5,
    'Personality disorder': 1.5
  };

  const trendData = data.trend.map(item => ({
    ...item,
    score: moodMap[item.mood] || 3,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    pointColor: EMOTION_COLORS[item.mood]?.bg || '#3b82f6'
  }));

  if (loading) {
    return <div className="mood-tracker-loading">Loading your mood analytics...</div>;
  }

  // Specialized dot to highlight mood colors on the line
  const CustomizedDot = (props) => {
    const { cx, cy, payload } = props;
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={6}
        fill={payload.pointColor}
        stroke="#111827"
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
      />
    );
  };

  return (
    <div className={`mood-tracker-container ${compact ? 'compact' : ''}`}>
      {!compact && (
        <header className="mood-header">
          <h1>Your Mood Analytics</h1>
          <p>Visulization of Your Mood(Blue: Good, Red: Suicidal, Black: Depressed, Orange: Anxiety)</p>
        </header>
      )}

      <div className="stats-grid">
        <div className="chart-card trend-card">
          {!compact && <h3>Emotion Trend</h3>}
          {!compact && <p className="chart-subtitle">Smooth daily emotional fluctuations</p>}
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={compact ? 250 : 350}>
              <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#1f2937" /* Soft dark grid */
                />
                <XAxis
                  dataKey="displayDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  hide
                  domain={[-1.5, 4]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '10px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    color: '#f1f5f9'
                  }}
                  formatter={(value, name, props) => [props.payload.mood, 'Mood']}
                />
                <Line
                  type="monotone" /* Smooth curved line as in the image */
                  dataKey="score"
                  stroke="#3b82f6" /* Premium blue trend line */
                  strokeWidth={4}
                  dot={<CustomizedDot />}
                  activeDot={{ r: 8, fill: '#fff' }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {!compact && (
        <div className="mood-insights">
          <h3>Insights</h3>
          {data.summary.length > 0 ? (
            <ul>
              <li>Your path shows a concentration in <strong>{data.summary.reduce((prev, current) => (prev.value > current.value) ? prev : current).mood}</strong> states.</li>
              <li>Tracking trends over several weeks gives you a better understanding of emotional patterns.</li>
            </ul>
          ) : (
            <p>Please continue your sessions to build more insights!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
