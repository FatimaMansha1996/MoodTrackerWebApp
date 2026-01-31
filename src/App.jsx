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
    Sad: "What’s bothering you today?",
  };

  const fetchQuote = async () => {
    try {
      const res = await fetch("https://quoteslate.vercel.app/api/quotes/random");
      const data = await res.json();
      setCurrentQuote(data.quote);
      setCurrentAuthor(data.author);
    } catch (error) {
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
    setShowBreathingChoice(true);
  };

  const startBreathing = () => {
    setBreathing(true);
    let inhale = true;
    setBreathingText("Inhale...");
    breathingInterval.current = setInterval(() => {
      setBreathingText(inhale ? "Exhale..." : "Inhale...");
      inhale = !inhale;
    }, 4000);
  };

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
      date: new Date().toLocaleDateString(),
    };

    setEntries([newEntry, ...entries]);

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
    }
    setShowBreathingChoice(false);
  };

  return (
    <div className="container">
      <h1>🌟 Daily Mood Tracker</h1>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="card step-1">
          <h2>How are you feeling today?</h2>
          <div className="mood-buttons">
            <button className="happy" onClick={() => handleMoodSelect("Happy")}>
              😊 Happy
            </button>
            <button
              className="neutral"
              onClick={() => handleMoodSelect("Neutral")}
            >
              😐 Neutral
            </button>
            <button className="sad" onClick={() => handleMoodSelect("Sad")}>
              ☹️ Sad
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="card step-2">
          <form className="form" onSubmit={handleAnswerSubmit}>
            <label>{moodQuestions[currentMood]}</label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your thoughts here..."
            />
            <button type="submit">Next</button>
          </form>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="card step-3 quote-step">
          {currentQuote && (
            <div className="quote">
              “{currentQuote}”
              {currentAuthor && <span> — {currentAuthor}</span>}
            </div>
          )}

          {showBreathingChoice && (
            <div className="breathing-choice">
              <p>Would you like a short breathing exercise?</p>
              <button onClick={() => handleBreathingChoice("yes")}>Yes</button>
              <button onClick={() => handleBreathingChoice("no")}>No</button>
            </div>
          )}

          {breathing && (
            <div className="breathing-circle">
              <p>{breathingText}</p>
              <button onClick={stopBreathing}>Stop</button>
            </div>
          )}

          {!showBreathingChoice && !breathing && (
            <button onClick={saveEntry}>Save Entry</button>
          )}
        </div>
      )}

      {/* ENTRIES */}
      <div className="entries">
        {entries.length === 0 && <p>No entries yet. Start today 🌱</p>}

        {entries.map((e, i) => (
          <div key={i} className={`entry ${e.mood.toLowerCase()}`}>
            <p>
              “{e.quote}”
              {e.author && <span> — {e.author}</span>}
            </p>
            <p>{e.text}</p>
            <small>
              {e.mood} — {e.date}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
