import React, { useState, useEffect } from 'react';
import './ProgressScreen.css';

const ProgressScreen = ({ userId }) => {
  const [progressData, setProgressData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

  useEffect(() => {
    if (userId) {
      fetchProgressData();
      fetchPerformanceData();
    }
  }, [userId]);

  const fetchProgressData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/progress-tracking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setProgressData(data);
      } else {
        setError(data.message || 'Failed to fetch progress data');
      }
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Unable to load progress data. Please check your connection.');
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/performance-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        setPerformanceData(data);
      } else if (data.status === 'no_data') {
        setPerformanceData({ message: 'No quiz data available yet. Take a quiz to see your progress!' });
      } else {
        setError(data.message || 'Failed to fetch performance data');
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
      setError('Unable to load performance data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getPerformanceLevel = (level) => {
    const levels = {
      'Excellent': { color: '#4CAF50', icon: '🌟' },
      'Good': { color: '#2196F3', icon: '👍' },
      'Fair': { color: '#FF9800', icon: '📚' },
      'Needs Improvement': { color: '#F44336', icon: '📖' }
    };
    return levels[level] || { color: '#757575', icon: '📊' };
  };

  if (loading) {
    return (
      <div className="progress-screen">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-screen">
        <div className="error-container">
          <h3>⚠️ Error Loading Progress</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="progress-screen">
        <div className="error-container">
          <h3>🔐 Please Log In</h3>
          <p>You need to be logged in to view your progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="progress-screen">
      <div className="progress-header">
        <h2>📊 Your Learning Progress</h2>
      </div>

      {/* Progress Tracking Section */}
      {progressData && (
        <div className="progress-card">
          <h3>🎯 Test Readiness</h3>
          <div className="progress-circle-container">
            <div 
              className="progress-circle"
              style={{ 
                background: `conic-gradient(${getProgressColor(progressData.progress_percentage)} ${progressData.progress_percentage * 3.6}deg, #e0e0e0 0deg)` 
              }}
            >
              <div className="progress-inner">
                <span className="progress-percentage">{progressData.progress_percentage}%</span>
                <span className="progress-label">Ready</span>
              </div>
            </div>
          </div>
          
          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-label">Current Score:</span>
              <span className="stat-value">{progressData.current_score}/100</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Passing Score:</span>
              <span className="stat-value">{progressData.passing_score}/100</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Points Needed:</span>
              <span className="stat-value">{progressData.points_needed}</span>
            </div>
          </div>

          {progressData.ready_for_test ? (
            <div className="ready-badge">
              🎉 You're ready for the real test!
            </div>
          ) : (
            <div className="not-ready-badge">
              📚 Keep studying to reach the passing score
            </div>
          )}
        </div>
      )}

      {/* Performance Analysis Section */}
      {performanceData && performanceData.performance_summary && (
        <div className="performance-card">
          <h3>📈 Performance Analysis</h3>
          
          <div className="performance-overview">
            <div className="performance-level">
              <span className="level-icon">
                {getPerformanceLevel(performanceData.performance_summary.performance_level).icon}
              </span>
              <span 
                className="level-text"
                style={{ color: getPerformanceLevel(performanceData.performance_summary.performance_level).color }}
              >
                {performanceData.performance_summary.performance_level}
              </span>
            </div>
          </div>

          <div className="performance-stats">
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-label">Latest Score:</span>
                <span className="stat-value">{performanceData.performance_summary.latest_score}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average Score:</span>
                <span className="stat-value">{performanceData.performance_summary.average_score}</span>
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-label">Total Tests:</span>
                <span className="stat-value">{performanceData.performance_summary.total_tests}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Trend:</span>
                <span className="stat-value">
                  {performanceData.improvement_trend === 'improving' ? '📈 Improving' : '📊 Stable'}
                </span>
              </div>
            </div>
          </div>

          {performanceData.weak_areas && performanceData.weak_areas.length > 0 && (
            <div className="weak-areas">
              <h4>🎯 Areas to Focus On:</h4>
              <div className="weak-areas-list">
                {performanceData.weak_areas.map((area, index) => (
                  <span key={index} className="weak-area-tag">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Data Message */}
      {performanceData && performanceData.message && (
        <div className="no-data-card">
          <h3>🚀 Get Started</h3>
          <p>{performanceData.message}</p>
          <button className="take-quiz-button">
            Take Your First Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressScreen;
