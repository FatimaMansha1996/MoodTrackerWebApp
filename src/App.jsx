import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [entry, setEntry] = useState("");           // Journal input
  const [currentMood, setCurrentMood] = useState(""); // Selected mood
  const [currentQuote, setCurrentQuote] = useState(""); // Quote text
  const [currentAuthor, setCurrentAuthor] = useState(""); // Quote author
  const [entries, setEntries] = useState([]);      // Saved entries

  // Load saved entries from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("happyJournalEntries")) || [];
    setEntries(saved);
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("happyJournalEntries", JSON.stringify(entries));
  }, [entries]);

  // Fetch a quote from QuoteSlate API
  const fetchQuote = async () => {
    try {
      const res = await fetch("https://quoteslate.vercel.app/api/quotes/random");
      const data = await res.json();
      setCurrentQuote(data.quote);
      setCurrentAuthor(data.author);
    } catch (error) {
      console.error("Quote fetch error:", error);
      setCurrentQuote("Could not fetch a thoughtful quote right now.");
      setCurrentAuthor("");
    }
  };

  // Called when user selects a mood
  const selectMood = (mood) => {
    setCurrentMood(mood);
    setCurrentQuote("");
    setCurrentAuthor("");
    fetchQuote(); // fetch new quote for selected mood
  };

  // Save journal entry
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!entry.trim()) return;

    const newEntry = {
      mood: currentMood,
      text: entry,
      quote: currentQuote,
      author: currentAuthor,
      date: new Date().toLocaleDateString()
    };

    setEntries([newEntry, ...entries]);
    setEntry("");
    setCurrentQuote("");
    setCurrentAuthor("");
    setCurrentMood("");
  };

  return (
    <div className="container">
     <h1>🌟 Daily Mood Tracker</h1>

      {/* Mood buttons */}
      <div className="mood-buttons">
        <button onClick={() => selectMood("Happy")}>😊 Happy</button>
        <button onClick={() => selectMood("Neutral")}>😐 Neutral</button>
        <button onClick={() => selectMood("Sad")}>☹️ Sad</button>
      </div>

      {/* Fetched Quote */}
      {currentQuote && (
        <div className="quote">
          “{currentQuote}”
          {currentAuthor && <span> — {currentAuthor}</span>}
        </div>
      )}

      {/* Journal Entry Form */}
      {currentMood && (
        <form onSubmit={handleSubmit} className="form">
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write something about your day..."
          />
          <button type="submit">Save Entry</button>
        </form>
      )}

      {/* Saved Entries */}
      <div className="entries">
        {entries.length === 0 && <p>No entries yet. Start today!</p>}
        {entries.map((e, i) => (
          <div key={i} className={`entry ${e.mood.toLowerCase()}`}>
            <p>“{e.quote}”{e.author && <span> — {e.author}</span>}</p>
            <p>{e.text}</p>
            <small>{e.mood} — {e.date}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
