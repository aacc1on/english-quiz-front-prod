import React, { useState } from "react";

const API = process.env.REACT_APP_API_URL;

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [quizUrl, setQuizUrl] = useState("");
  const [results, setResults] = useState([]);
  const [expandedResults, setExpandedResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    console.log('[ADMIN] Attempting login to:', `${API}/api/admin/login`);
    
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      
      console.log('[ADMIN] Login response status:', res.status);
      
      if (res.ok) {
        console.log('[ADMIN] Login successful');
        setLoggedIn(true);
        setError("");
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Login failed' }));
        console.log('[ADMIN] Login failed:', errorData);
        setError(errorData.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('[ADMIN] Login error:', err);
      setError(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setQuizUrl("");
    
    console.log('[ADMIN] Generating quiz with text length:', text.length);
    
    try {
      const res = await fetch(`${API}/api/admin/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      
      console.log('[ADMIN] Quiz generation response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('[ADMIN] Quiz generated successfully:', data);
        setQuizUrl(data.quizUrl);
        setError("");
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Quiz generation failed' }));
        console.log('[ADMIN] Quiz generation failed:', errorData);
        setError(errorData.error || 'Failed to generate quiz');
      }
    } catch (err) {
      console.error('[ADMIN] Quiz generation error:', err);
      setError(`Error generating quiz: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    
    console.log('[ADMIN] Fetching results');
    
    try {
      const res = await fetch(`${API}/api/admin/results`, {
        credentials: "include",
      });
      
      console.log('[ADMIN] Results response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('[ADMIN] Results fetched:', data.results.length, 'results');
        setResults(data.results);
        setError("");
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch results' }));
        console.log('[ADMIN] Results fetch failed:', errorData);
        setError(errorData.error || 'Failed to fetch results');
      }
    } catch (err) {
      console.error('[ADMIN] Results fetch error:', err);
      setError(`Error fetching results: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandResult = (index) => {
    setExpandedResults(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUsername("");
    setPassword("");
    setText("");
    setQuizUrl("");
    setResults([]);
    setExpandedResults({});
    setError("");
  };

  if (!loggedIn) {
    return (
      <div className="main-container">
        <form onSubmit={handleLogin}>
          <h2>Admin Login</h2>
          {error && <div className="error">Error: {error}</div>}
          
          <input 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
            disabled={loading}
          />
          <input 
            placeholder="Password" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          
          <div className="help-text">
            <p><strong>Default credentials for local development:</strong></p>
            <p>Username: admin</p>
            <p>Password: admin123</p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      
      {error && <div className="error">Error: {error}</div>}
      
      <div className="admin-section">
        <h3>Generate Quiz</h3>
        <form onSubmit={handleGenerateQuiz}>
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="Enter text to generate quiz from... (minimum 20 characters)" 
            required 
            minLength={20}
            rows={6}
            disabled={loading}
          />
          <button type="submit" disabled={loading || text.length < 20}>
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
        </form>
        
        {quizUrl && (
          <div className="success">
            <p>✅ Quiz generated successfully!</p>
            <p>Quiz is ready at: <a href={quizUrl} target="_blank" rel="noopener noreferrer">Quiz Page</a></p>
            <p>Share this link: <code>{window.location.origin}{quizUrl}</code></p>
          </div>
        )}
      </div>
      
      <hr />
      
      <div className="admin-section">
        <h3>Quiz Results</h3>
        <button onClick={fetchResults} disabled={loading}>
          {loading ? "Loading..." : "Show Results"}
        </button>
        
        {results.length > 0 && (
          <div className="results-container">
            <p><strong>Total submissions: {results.length}</strong></p>
            <table className="table-results">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Surname</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Date</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <React.Fragment key={i}>
                    <tr>
                      <td>{i + 1}</td>
                      <td>{r.name}</td>
                      <td>{r.surname}</td>
                      <td>{r.score}/{r.total || 10}</td>
                      <td>{r.percentage}%</td>
                      <td>{new Date(r.date).toLocaleString()}</td>
                      <td>
                        <button 
                          className="details-btn"
                          onClick={() => toggleExpandResult(i)}
                        >
                          {expandedResults[i] ? 'Hide Details' : 'Show Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedResults[i] && r.detailedResults && (
                      <tr>
                        <td colSpan="7">
                          <div className="detailed-results">
                            <h4>Detailed Results for {r.name} {r.surname}</h4>
                            <div className="questions-grid">
                              {r.detailedResults.map((detail, qIndex) => (
                                <div 
                                  key={qIndex} 
                                  className={`question-detail ${detail.isCorrect ? 'correct' : 'incorrect'}`}
                                >
                                  <div className="question-header">
                                    <span className="question-number">Q{detail.questionNumber}</span>
                                    <span className={`status ${detail.isCorrect ? 'correct' : 'incorrect'}`}>
                                      {detail.isCorrect ? '✓ Correct' : '✗ Wrong'}
                                    </span>
                                  </div>
                                  <div className="question-content">
                                    <p><strong>Word:</strong> {detail.word}</p>
                                    <p><strong>Question:</strong> {detail.question}</p>
                                    <p><strong>Student's answer:</strong> 
                                      <span className={detail.isCorrect ? 'correct-answer' : 'wrong-answer'}>
                                        {detail.userAnswer}
                                      </span>
                                    </p>
                                    {!detail.isCorrect && (
                                      <p><strong>Correct answer:</strong> 
                                        <span className="correct-answer">{detail.correctAnswer}</span>
                                      </p>
                                    )}
                                    <div className="all-options">
                                      <strong>All options:</strong>
                                      <ul>
                                        {detail.options.map((option, optIndex) => (
                                          <li key={optIndex} className={
                                            option === detail.correctAnswer ? 'correct-option' : 
                                            option === detail.userAnswer && !detail.isCorrect ? 'wrong-option' : ''
                                          }>
                                            {option}
                                            {option === detail.correctAnswer && ' ✓'}
                                            {option === detail.userAnswer && !detail.isCorrect && ' ✗'}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {results.length === 0 && !loading && (
          <p>No results yet. Generate a quiz and have users complete it to see results here.</p>
        )}
      </div>
    </div>
  );
}