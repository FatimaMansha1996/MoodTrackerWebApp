import { useState, useEffect, useRef } from "react";
import "./index.css";

function App() {
  const [step, setStep] = useState(1);
  const [currentMood, setCurrentMood] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [currentQuote, setCurrentQuote] = useState("");
  const [currentAuthor, setCurrentAuthor] = useState("");
  const [entries, setEntries] = useState([]);

  const [showBreathingChoice, setShowBreathingChoice] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathingText, setBreathingText] = useState("Inhale...");
  const breathingInterval = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("dailyMoodEntries")) || [];
    setEntries(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("dailyMoodEntries", JSON.stringify(entries));
  }, [entries]);

  const moodQuestions = {
    Happy: "What made you smile today?",
    Neutral: "Anything interesting happen today?",
    Sad: "What’s bothering you today?"
  };

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

  const handleMoodSelect = (mood) => {
    setCurrentMood(mood);
    setStep(2);
  };

  const handleAnswerSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;
    fetchQuote();
    setStep(3);
    setShowBreathingChoice(true); // Ask if user wants breathing
  };

  // Start breathing exercise
  const startBreathing = () => {
    setBreathing(true);
    let inhale = true;
    setBreathingText("Inhale...");
    breathingInterval.current = setInterval(() => {
      setBreathingText(inhale ? "Exhale..." : "Inhale...");
      inhale = !inhale;
    }, 4000); // 4s per inhale/exhale
  };

  // Stop breathing exercise
  const stopBreathing = () => {
    clearInterval(breathingInterval.current);
    setBreathing(false);
  };

  const saveEntry = () => {
    const newEntry = {
      mood: currentMood,
      text: userAnswer,
      quote: currentQuote,
      author: currentAuthor,
      date: new Date().toLocaleDateString()
    };
    setEntries([newEntry, ...entries]);
    // Reset
    setStep(1);
    setUserAnswer("");
    setCurrentMood("");
    setCurrentQuote("");
    setCurrentAuthor("");
    setBreathing(false);
  };

  const handleBreathingChoice = (choice) => {
    if (choice === "yes") {
      startBreathing();
      setShowBreathingChoice(false);
    } else {
      setShowBreathingChoice(false);
    }
  };

  return (
    <div className="container">
      <h1>🌟 Daily Mood Tracker</h1>

      {/* Step 1: Mood Selection */}
      {step === 1 && (
        <div className="mood-buttons">
          <button onClick={() => handleMoodSelect("Happy")}>😊 Happy</button>
          <button onClick={() => handleMoodSelect("Neutral")}>😐 Neutral</button>
          <button onClick={() => handleMoodSelect("Sad")}>☹️ Sad</button>
        </div>
      )}

      {/* Step 2: Mood Question */}
      {step === 2 && (
        <form onSubmit={handleAnswerSubmit} className="form">
          <label>{moodQuestions[currentMood]}</label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Write your thoughts here..."
          />
          <button type="submit">Next</button>
        </form>
      )}

      {/* Step 3: Quote + optional breathing */}
      {step === 3 && (
        <div className="quote-step">
          {currentQuote && (
            <div className="quote">
              “{currentQuote}”
              {currentAuthor && <span> — {currentAuthor}</span>}
            </div>
          )}

          {/* Ask user if they want breathing */}
          {showBreathingChoice && (
            <div className="breathing-choice">
              <p>Do you want to do a short breathing exercise to relax?</p>
              <button onClick={() => handleBreathingChoice("yes")}>Yes</button>
              <button onClick={() => handleBreathingChoice("no")}>No</button>
            </div>
          )}

          {/* Breathing animation */}
          {breathing && (
            <div className="breathing-circle">
              <p>{breathingText}</p>
              <button onClick={stopBreathing}>Stop</button>
            </div>
          )}

          {/* Save button */}
          {!showBreathingChoice && !breathing && (
            <button onClick={saveEntry}>Save Entry</button>
          )}
        </div>
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
