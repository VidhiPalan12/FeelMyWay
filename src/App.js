/* eslint-disable */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

const moods = [
  { emoji: "😄", label: "Happy", color: "#36c3ff" },
  { emoji: "😢", label: "Sad", color: "#ffb3d9" },
  { emoji: "😟", label: "Worried", color: "#ff9b53" },
  { emoji: "😡", label: "Angry", color: "#ff5454" },
  { emoji: "😌", label: "Calm", color: "#7ce56c" },
  { emoji: "😴", label: "Tired", color: "#80d5ff" }
];

const reasons = [
  {
    label: "School",
    emoji: "🏫",  
  },
  {
    label: "Friends",
    emoji: "👯",
    },
  {
    label: "Family",
    emoji: "👨‍👩‍👧",
    },
  {
    label: "Homework",
    emoji: "📚",
    },
  {
    label: "Other",
    emoji: "🤔",
    }
];

const categories = [
  { label: "School", icon: "🏫", color: ["#ffd95f", "#ffaf3d"] },
  { label: "Friends", icon: "👯", color: ["#6ee1ff", "#4e7cff"] },
  { label: "Home", icon: "🏠", color: ["#ff8fd1", "#ff5aa8"] }
];

const creators = [
  {
    name: "Vidhi Palan",
    title: "Project Leader",
    image: "VP",
    description:
      "Passionate about biology, psychology, and learning how people think, behave, and grow. She especially enjoys exploring sleep, conditioning, genetics, and the science behind learning and memory. Beyond academics, she loves turning complex ideas into engaging explanations and creative projects that make science more interesting and accessible to others."
  },
  {
    name: "Alice",
    title: "Team Member",
    image: "A",
    description:
      "Fascinated by neuroscience, psychology, and medicine, especially how the brain shapes the way we think, feel, and learn. She enjoys learning about the brain and body, and creating educational art and writing that makes neuroscience more accessible for younger students. She is curious, creative, and passionate about exploring how the mind works and sharing that knowledge in meaningful, engaging ways."
  },
  {
    name: "Anika Chaurasia",
    title: "Team Member",
    image: "AC",
    description:
      "Interested in psychology and in learning about how people think and feel. She enjoys playing sports, especially in team settings, and values helping others and being someone people can talk to. She is passionate about mental health awareness and wants to support people as they go through social and emotional challenges."
  },
  {
    name: "Anaeka",
    title: "Team Member",
    image: "AN",
    description:
      "A sophomore at Skyline High School, passionate about psychology and design. She enjoys using creativity in projects that enrich people's lives and improve overall mental well-being. In her spare time, she enjoys reading and painting."
  },
  {
    name: "Ekaansh Govil",
    title: "Vice President",
    image: "EG",
    description:
      "Enjoys neuroscience, research, debate, and staying active through workouts and sports like lacrosse and track. He is passionate about mental health and medicine, especially understanding how the brain shapes behavior, and loves helping others navigate challenges in meaningful ways."
  }
];

function convertDriveLink(link) {
  if (typeof link !== "string") return "";

  const trimmedLink = link.trim();
  if (!trimmedLink) return "";

  const driveFileId = extractDriveFileId(trimmedLink);

  if (!driveFileId) {
    return trimmedLink;
  }

  return `https://drive.google.com/uc?export=view&id=${driveFileId}`;
}

function extractDriveFileId(link) {
  if (typeof link !== "string") return "";

  const driveMatch =
    link.match(/https?:\/\/drive\.google\.com\/file\/d\/([^/?\s]+)/i) ||
    link.match(/https?:\/\/drive\.google\.com\/open\?id=([^&\s]+)/i) ||
    link.match(/https?:\/\/drive\.google\.com\/uc\?[^ ]*id=([^&\s]+)/i) ||
    link.match(/https?:\/\/drive\.google\.com\/thumbnail\?[^ ]*id=([^&\s]+)/i) ||
    link.match(/\/file\/d\/([^/?\s]+)/i) ||
    link.match(/[?&]id=([^&\s]+)/i);

  return driveMatch?.[1] || "";
}

function getImageSourceCandidates(link) {
  const normalizedLink = convertDriveLink(link);
  const driveFileId = extractDriveFileId(link);

  if (!driveFileId) {
    return normalizedLink ? [normalizedLink] : [];
  }

  return [
    `https://lh3.googleusercontent.com/d/${driveFileId}=w2000`,
    `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w2000`,
    normalizedLink
  ].filter(Boolean);
}

function shuffleQuestions(questionList) {
  return [...questionList]
    .map((question) => ({ question, sortValue: Math.random() }))
    .sort((a, b) => a.sortValue - b.sortValue)
    .map(({ question }) => question);
}

function shuffleChoices(question) {
  return {
    ...question,
    choices: [...(question.choices || [])]
      .map((choice) => ({ choice, sortValue: Math.random() }))
      .sort((a, b) => a.sortValue - b.sortValue)
      .map(({ choice }) => choice)
  };
}

function getMaxQuestionXp(question) {
  return Math.max(...(question?.choices || []).map((choice) => Number(choice.xp || 0)), 0);
}

function getPiePoint(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describePieSlice(centerX, centerY, radius, startAngle, endAngle) {
  const start = getPiePoint(centerX, centerY, radius, endAngle);
  const end = getPiePoint(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z"
  ].join(" ");
}

export default function App() {
  const [page, setPage] = useState("home");
  const [selectedMood, setSelectedMood] = useState(null);
  const [category, setCategory] = useState(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [scenarios, setScenarios] = useState({});
  const [logs, setLogs] = useState([]);
  const [selectedReason, setSelectedReason] = useState(null);
  const [showAllLogs, setShowAllLogs] = useState(false);
  
  // Game state
  const [questions, setQuestions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [xp, setXp] = useState(0);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [imageAttemptIndex, setImageAttemptIndex] = useState(0);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gamePossibleScore, setGamePossibleScore] = useState(0);

  const SHEET_ID = "1HRUlOpC1QyuL-zhVYVEEmyA-xZ34GCxNySdnigpEK5w";
  const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=Questions&tqx=out:json`;

  // Fetch data from Google Sheets
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const cleaned = text.substring(47).slice(0, -2);
        const json = JSON.parse(cleaned);

        if (json.table && json.table.rows && json.table.cols) {
          const columnIndex = Object.fromEntries(
            json.table.cols.map((col, index) => [col.label, index])
          );

          const getCellValue = (row, label) => {
            const index = columnIndex[label];
            return index === undefined ? undefined : row.c?.[index]?.v;
          };

          const fetchedQuestions = json.table.rows
            .map((row) => ({
              category: getCellValue(row, "category")?.trim(),
              scenario: getCellValue(row, "scenario"),
              choices: [
                {
                  label: getCellValue(row, "choice1"),
                  result: getCellValue(row, "result1"),
                  xp: Number(getCellValue(row, "xp1") || 0)
                },
                {
                  label: getCellValue(row, "choice2"),
                  result: getCellValue(row, "result2"),
                  xp: Number(getCellValue(row, "xp2") || 0)
                },
                {
                  label: getCellValue(row, "choice3"),
                  result: getCellValue(row, "result3"),
                  xp: Number(getCellValue(row, "xp3") || 0)
                },
                {
                  label: getCellValue(row, "choice4"),
                  result: getCellValue(row, "result4"),
                  xp: Number(getCellValue(row, "xp4") || 0)
                }
              ].filter((choice) => choice.label),
              image: getCellValue(row, "image")
            }))
            .filter((question) => question.category && question.scenario);
          
          setQuestions(fetchedQuestions);
          setCurrentQuestion((previousQuestion) => {
            if (!previousQuestion) {
              return previousQuestion;
            }

            const refreshedQuestion = fetchedQuestions.find(
              (question) =>
                question.category === previousQuestion.category &&
                question.scenario === previousQuestion.scenario
            );

            return refreshedQuestion || previousQuestion;
          });
          console.log("Questions loaded:", fetchedQuestions.length);
        }
      } catch (error) {
        console.error("Failed to fetch from Google Sheets:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem("logs") || "[]");
    if (Array.isArray(savedLogs)) {
      setLogs(savedLogs);
    }
  }, []);

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem("logs") || "[]");
    if (Array.isArray(savedLogs)) {
      const sorted = [...savedLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(sorted);
    }
  }, []);

  useEffect(() => {
    setImageAttemptIndex(0);
    setImageLoadFailed(false);
  }, [currentQuestion?.image, currentQuestion?.scenario]);

  const activeScenario = category ? scenarios[category]?.[scenarioIndex] : null;

  // Save log function
  const saveLog = (log) => {
    const existing = JSON.parse(localStorage.getItem("logs") || "[]");
    const updated = [...existing, log]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    localStorage.setItem("logs", JSON.stringify(updated));
    setLogs(updated);
  };

  // Game functions
  const startGame = (categoryName) => {
    if (!questions || questions.length === 0) {
      console.log("No questions loaded yet");
      return;
    }

    const filtered = questions.filter(
      q => q.category?.toLowerCase().trim() === categoryName.toLowerCase()
    );

    console.log("FILTERED:", filtered);

    if (filtered.length === 0) {
      console.log("No questions for category:", categoryName);
      return;
    }

    const shuffledQuestions = shuffleQuestions(filtered).map(shuffleChoices);

    setSelectedCategory(categoryName);
    setGameQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setCurrentQuestion(shuffledQuestions[0]);
    setGameScore(0);
    setGamePossibleScore(shuffledQuestions.reduce((total, question) => total + getMaxQuestionXp(question), 0));
    setResult(null);
    setShowResult(false);
    setPage("question");
  };
  const handleChoice = (choiceIndex) => {
    const selectedChoice = currentQuestion?.choices?.[choiceIndex];
    if (!selectedChoice) return;

    const xpGain = Number(selectedChoice.xp || 0);
    const resultText = selectedChoice.result || "Good choice!";
    const isCorrect = xpGain >= 15;

    setXp(prev => prev + xpGain);
    setGameScore(prev => prev + xpGain);
    setResult({
      text: resultText,
      xpGain,
      isCorrect,
      choiceLetter: String.fromCharCode(65 + choiceIndex),
      questionNumber: currentQuestionIndex + 1,
      totalQuestions: gameQuestions.length
    });
    setShowResult(true);
  };

  const nextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= gameQuestions.length) {
      setShowResult(false);
      setResult(null);
      setPage("gameComplete");
      return;
    }

    setCurrentQuestionIndex(nextIndex);
    setCurrentQuestion(gameQuestions[nextIndex]);
    setShowResult(false);
    setResult(null);
  };

  const playAgain = () => {
    if (!selectedCategory) {
      setPage("home");
      return;
    }

    startGame(selectedCategory);
  };

  const selectMood = (mood) => {
    setSelectedMood(mood);
    setPage("logReason");
  };

  const selectReason = (reason) => {
    setSelectedReason(reason);
    const log = {
      student: "You", // Default student name for local logs
      mood: selectedMood.label,
      reason: reason.label,
      timestamp: new Date().toISOString()
    };
    saveLog(log);
    setPage("logConfirm");
  };

  const confirmLog = () => {
    setPage("home");
    setSelectedReason(null);
  };

  const logAgain = () => {
    if (!selectedMood) return;
    setSelectedReason(null);
    setPage("logReason");
  };

  const openCategory = (label) => {
    startGame(label);
  };

  const openAbout = () => {
    setPage("about");
  };

  const openLogs = () => {
    setPage("logs");
  };

  const chooseAnswer = (choice) => {
    setFeedback(choice);
    setStars((prev) => prev + choice.stars);
    setPage("result");
  };

  const nextScenario = () => {
    const nextIndex = scenarioIndex + 1;
    if (category && scenarios[category]?.[nextIndex]) {
      setScenarioIndex(nextIndex);
      setFeedback(null);
      setPage("scenario");
    } else {
      setPage("home");
      setCategory(null);
      setFeedback(null);
    }
  };

  const happyText = feedback?.stars > 0 ? "Great job!" : "Try again!";
  const showConfetti = page === "question" && showResult && result?.isCorrect;
  const confettiPieces = showConfetti
    ? [...Array(150)].map((_, index) => {
        const type = ['confetti--ribbon', 'confetti--tile', 'confetti--star', 'confetti--dot'][index % 4];
        const width = type === 'confetti--dot' ? 10 + Math.random() * 8 : 8 + Math.random() * 12;
        const height =
          type === 'confetti--ribbon'
            ? 18 + Math.random() * 24
            : type === 'confetti--dot'
              ? width
              : 8 + Math.random() * 12;
        const colors = [
          '#ff6b6b',
          '#ffb703',
          '#5dd39e',
          '#5da9ff',
          '#ff78c8',
          '#8b5cf6',
          '#ff9f1c',
          '#14b8a6'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = `${6 + Math.random() * 88}%`;
        const drift = `${-140 + Math.random() * 280}px`;
        const sway = `${-24 + Math.random() * 48}px`;
        const fallDistance = `${128 + Math.random() * 46}vh`;
        const rotateStart = `${Math.random() * 360}deg`;
        const rotateMid = `${180 + Math.random() * 280}deg`;
        const rotateEnd = `${540 + Math.random() * 420}deg`;
        const scale = (0.82 + Math.random() * 0.5).toFixed(2);
        return (
          <div
            key={index}
            className={`confetti ${type}`}
            style={{
              left,
              top: `${-18 - Math.random() * 22}%`,
              '--piece-width': `${width}px`,
              '--piece-height': `${height}px`,
              '--piece-color': color,
              animationDuration: `${2.2 + Math.random() * 1.2}s`,
              animationDelay: `${Math.random() * 0.35}s`,
              '--drift': drift,
              '--sway': sway,
              '--fall-distance': fallDistance,
              '--rotate-start': rotateStart,
              '--rotate-mid': rotateMid,
              '--rotate-end': rotateEnd,
              '--piece-scale': scale
            }}
          />
        );
      })
    : null;

  const currentImageSources = getImageSourceCandidates(currentQuestion?.image?.toString?.() ?? "");
  const currentImageValue = currentImageSources[imageAttemptIndex] || "";
  const questionProgressText = gameQuestions.length
    ? `Question ${currentQuestionIndex + 1} of ${gameQuestions.length}`
    : "";
  const finalScorePercent = gamePossibleScore
    ? Math.round((gameScore / gamePossibleScore) * 100)
    : 0;
  const moodTotals = moods.map((mood) => ({
    ...mood,
    count: logs.filter((log) => log.mood === mood.label).length
  }));
  const totalMoodLogs = moodTotals.reduce((total, item) => total + item.count, 0);
  let cumulativeMoodCount = 0;
  const moodPieSlices = moodTotals
    .filter((item) => item.count > 0)
    .map((item) => {
      const startAngle = (cumulativeMoodCount / totalMoodLogs) * 360;
      cumulativeMoodCount += item.count;
      const endAngle = (cumulativeMoodCount / totalMoodLogs) * 360;

      return {
        ...item,
        startAngle,
        endAngle,
        percentage: Math.round((item.count / totalMoodLogs) * 100)
      };
    });
  const maxMoodCount = Math.max(...moodTotals.map((item) => item.count), 1);
  const recentReasons = [...logs]
    .slice(0, 4)
    .map((log) => `${moods.find((mood) => mood.label === log.mood)?.emoji || "•"} ${log.reason}`);

  const handleImageError = () => {
    setImageAttemptIndex((previousIndex) => {
      if (previousIndex >= currentImageSources.length - 1) {
        setImageLoadFailed(true);
        return previousIndex;
      }

      return previousIndex + 1;
    });
  };

  return (
    <div className="app">
      {showConfetti && <div className="confettiArea">{confettiPieces}</div>}
      <aside className="sidebar">
        <div className="sidebarHeader">
          <div className="brandLabel">FeelMyWay 🌱</div>
          <div className="xpDisplay">XP: {xp}</div>
        </div>

        <div className="sidebarSection">
          <div className="sectionTitle">How are you feeling?</div>
          <div className="moodPanel">
            {moods.map((mood) => (
              <motion.button
                key={mood.label}
                className={`moodButton ${selectedMood?.label === mood.label ? "selected" : ""}`}
                onClick={() => selectMood(mood)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="moodEmoji">{mood.emoji}</span>
                <span className="moodName">{mood.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="sidebarSection">
          <div className="sectionTitle">Lessons</div>
          <div className="navGrid">
            {categories.map((card) => (
              <motion.button
                key={card.label}
                className="navCard"
                onClick={() => openCategory(card.label)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: `linear-gradient(135deg, ${card.color[0]}, ${card.color[1]})`
                }}
              >
                <div className="navIcon">{card.icon}</div>
                <div className="navLabel">{card.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="sidebarSection">
          <div className="sectionTitle" onClick={openLogs} style={{ cursor: "pointer" }}>My Logs</div>
          <div className="logsList">
            {logs.slice(0, 5).map((log, index) => {
              const moodEmoji = moods.find(m => m.label === log.mood)?.emoji || log.mood;
              const time = log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
              return (
                <div key={index} className="logItem">
                  {moodEmoji} {log.student} — {log.reason} — {time}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="mainPanel">
        <div className="appHeader">
          <div className="appBrand">FeelMyWay 🌱</div>
          <div className="headerNav">
            <div className="headerNavLink" onClick={openLogs}>
              My Logs
            </div>
            <div className="headerNavLink" onClick={openAbout}>
              Who We Are
            </div>
            <div className="appXP">✨ XP: {xp}</div>
          </div>
        </div>

        <div className="mainContent">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              className={`featureCard ${page === "question" ? "questionCard" : ""} ${page === "about" ? "aboutPageCard" : ""} ${page === "question" && showResult ? "resultCard" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            >
            {page === "home" && (
              <div className="homeContent">
                <div className="homeMain">
                  <div>
                    <div className="sectionTitle">How are you feeling?</div>
                    <div className="moodPanel">
                      {moods.map((mood) => (
                        <motion.button
                          key={mood.label}
                          className={`moodButton ${selectedMood?.label === mood.label ? "selected" : ""}`}
                          onClick={() => selectMood(mood)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <span className="moodEmoji">{mood.emoji}</span>
                          <span className="moodName">{mood.label}</span>
                        </motion.button>
                      ))}
                    </div>
                    {selectedMood && (
                      <div className="moodActionRow">
                        <div className="moodSelectedText">
                          {selectedMood.emoji} {selectedMood.label} is selected
                        </div>
                        <motion.button
                          className="primaryButton logAgainButton"
                          whileTap={{ scale: 0.96 }}
                          onClick={logAgain}
                        >
                          Log again
                        </motion.button>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="sectionTitle">Lessons</div>
                    <div className="navGrid">
                      {categories.map((card) => (
                        <motion.button
                          key={card.label}
                          className="navCard"
                          onClick={() => openCategory(card.label)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                          style={{
                            background: `linear-gradient(135deg, ${card.color[0]}, ${card.color[1]})`
                          }}
                        >
                          <div className="navIcon">{card.icon}</div>
                          <div className="navLabel">{card.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <aside className="homeLogs">
                  <div className="sectionTitle" onClick={openLogs} style={{ cursor: "pointer" }}>My Logs</div>
                  <div className="logsList">
                    {logs.length > 0 ? (
                      <>
                        <div className="logItem logSummary" onClick={openLogs} style={{ cursor: "pointer" }}>
                          {logs.length} check-ins
                        </div>
                        {logs.slice(0, showAllLogs ? logs.length : 3).map((log, index) => {
                          const moodEmoji = moods.find(m => m.label === log.mood)?.emoji || log.mood;
                          const timestamp = log.timestamp ? new Date(log.timestamp) : null;
                          const time = timestamp ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                          const date = timestamp ? timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
                          return (
                            <div key={index} className="logItem">
                              {moodEmoji} {log.reason} · {date} {time}
                            </div>
                          );
                        })}
                        {logs.length > 3 && (
                          <motion.button
                            className="primaryButton logsToggleButton"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setShowAllLogs((prev) => !prev)}
                            style={{ width: '100%', marginTop: '8px', maxWidth: '100%' }}
                          >
                            {showAllLogs ? 'Show recent only' : 'See all logs'}
                          </motion.button>
                        )}
                        <motion.button
                          className="primaryButton logsToggleButton"
                          whileTap={{ scale: 0.96 }}
                          onClick={openLogs}
                          style={{ width: '100%', maxWidth: '100%' }}
                        >
                          Mood graphs
                        </motion.button>
                      </>
                    ) : (
                      <div className="logItem" style={{ textAlign: 'center', color: '#9ca3af' }}>
                        No logs yet. Start by selecting a mood!
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            )}

            {page === "logReason" && selectedMood && (
              <div className="logContent">
                <div className="logTitle">Why do you feel {selectedMood.label.toLowerCase()}?</div>
                <div className="reasonPanel">
                  {reasons.map((reason) => (
                    <motion.button
                      key={reason.label}
                      className="reasonButton"
                      onClick={() => selectReason(reason)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      >
  	                      <span className="reasonImageSlot">
  	                        <span className="reasonEmoji">{reason.emoji}</span>
  	                      </span>
                      <span className="reasonLabel">{reason.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {page === "logConfirm" && (
              <div className="confirmContent">
                <div className="confirmMain">
                  <div className="confirmCopy">
                    <div className="confirmBadge">Check-in saved</div>
                    <div className="confirmText">Got it! Thanks for sharing 💛</div>

                    <div className="confirmSummary">
                      <div className="confirmSummaryCard">
                        <div className="confirmSummaryLabel">Feeling</div>
                        <div className="confirmSummaryValue">
                          <span>{selectedMood?.emoji || "💛"}</span>
                          <span>{selectedMood?.label || "Shared"}</span>
                        </div>
                      </div>

                      <div className="confirmSummaryCard">
                        <div className="confirmSummaryLabel">Reason</div>
                        <div className="confirmSummaryValue">
                          <span>{selectedReason?.emoji || "📝"}</span>
                          <span>{selectedReason?.label || "Saved"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="confirmDescription">
                      You did something brave by naming your feeling. Every check-in helps us understand your day a little better.
                    </div>

                    <motion.button
                      className="primaryButton confirmButton"
                      whileTap={{ scale: 0.96 }}
                      onClick={confirmLog}
                    >
                      Continue
                    </motion.button>
                  </div>

                  <div className="confirmIllustration">
                    <div className="confirmIllustrationGlow" />
                    <div className="confirmIllustrationEmoji">{selectedMood?.emoji || "🌤️"}</div>
                    <div className="confirmIllustrationCard">
                      <div className="confirmIllustrationTitle">Nice work checking in</div>
                      <div className="confirmIllustrationText">
                        Small moments of honesty help build big emotional skills.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {page === "question" && currentQuestion && !showResult && (
              <div className="scenarioContent">
                <div className="scenarioPromptBlock">
                  <div className="scenarioEyebrow">{questionProgressText || "Scenario"}</div>
                  <div className="scenarioPrompt">{currentQuestion.scenario}</div>
                </div>

                <div className="scenarioHero">
                  <div className={`imageBox ${currentImageValue && !imageLoadFailed ? "hasImage" : "emptyImage"}`}>
                    {currentImageValue && !imageLoadFailed ? (
                      <img
                        key={currentImageValue}
                        src={currentImageValue}
                        alt="Scenario visual"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="imageLabel">Scenario</div>
                    )}
                  </div>
                </div>

                <div className="choicesArea scenarioChoices">
                  {currentQuestion.choices?.map((choice, index) => (
                    <motion.button
                      key={index}
                      className="choiceButton"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleChoice(index)}
                    >
                      <span className="choiceOption">{String.fromCharCode(65 + index)}</span>
                      <span className="choiceText">{choice.label || 'Answer'}</span>
                    </motion.button>
                  ))}
                </div>

                <div className="resultButtons" style={{ marginTop: '20px' }}>
                  <motion.button
                    className="primaryButton scenarioBackButton"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setPage("home")}
                    style={{ background: '#6b7280' }}
                  >
                    Back to Home
                  </motion.button>
                </div>
              </div>
            )}

            {page === "question" && showResult && result && (
              <div className="resultContent">
                <div className={`resultHero ${result.isCorrect ? 'yay' : 'try'}`}>
                  <div className="resultHeroGlow" />
                  <div className="resultHeroMain">
                    <div className={`resultBadge ${result.isCorrect ? 'yay' : 'try'}`}>
                      {result.isCorrect ? 'Amazing job!' : 'Nice try!'}
                    </div>
	                    <div className="resultText">
	                      {result.isCorrect ? 'That was a kind and thoughtful choice.' : 'Let’s think about a kinder choice together.'}
	                    </div>
	                    <div className="resultProgress">
	                      Question {result.questionNumber} of {result.totalQuestions}
	                    </div>
	                    <div className="resultExplanation">{result.text}</div>

                    <div className="resultStats">
                      <div className="resultStatCard">
                        <div className="resultStatLabel">Your answer</div>
                        <div className="resultStatValue">{result.choiceLetter}</div>
                      </div>
	                      <div className="resultStatCard">
	                        <div className="resultStatLabel">XP this round</div>
	                        <div className="resultStatValue">{result.xpGain > 0 ? `+${result.xpGain}` : '0'}</div>
	                      </div>
	                      <div className="resultStatCard">
	                        <div className="resultStatLabel">Run score</div>
	                        <div className="resultStatValue">{gameScore}</div>
	                      </div>
                    </div>
                  </div>

                  <div className="resultHeroSide">
                    <div className="resultCharacter">{result.isCorrect ? '🎉' : '💡'}</div>
                    <div className="resultMiniCard">
                      <div className="resultMiniTitle">
                        {result.isCorrect ? 'You earned celebration confetti!' : 'You are still learning!'}
                      </div>
                      <div className="resultMiniText">
                        {result.isCorrect
                          ? 'Correct answers help your empathy powers grow.'
                          : 'Every try helps you practice making caring choices.'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="resultButtons">
                  <motion.button
                    className="primaryButton resultNextButton"
                    whileTap={{ scale: 0.96 }}
                    onClick={nextQuestion}
	                  >
	                    {currentQuestionIndex + 1 >= gameQuestions.length ? 'See Score' : 'Next Scenario'}
	                  </motion.button>
                  <motion.button
                    className="primaryButton resultHomeButton"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setPage("home")}
                  >
                    Back to Home
                  </motion.button>
                </div>
	              </div>
	            )}

            {page === "gameComplete" && (
              <div className="gameCompleteContent">
                <div className="gameCompleteHero">
                  <div className="resultBadge yay">Round complete!</div>
                  <div className="gameCompleteTitle">Your score</div>
                  <div className="scoreCircle">
                    <span>{finalScorePercent}%</span>
                  </div>
                  <div className="gameCompleteScore">
                    {gameScore} out of {gamePossibleScore} XP
                  </div>
                  <div className="gameCompleteText">
                    You answered all {gameQuestions.length} {selectedCategory?.toLowerCase()} questions.
                  </div>
                </div>

                <div className="resultButtons">
                  <motion.button
                    className="primaryButton resultNextButton"
                    whileTap={{ scale: 0.96 }}
                    onClick={playAgain}
                  >
                    Play Again
                  </motion.button>
                  <motion.button
                    className="primaryButton resultHomeButton"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setPage("home")}
                  >
                    Back to Home
                  </motion.button>
                </div>
              </div>
            )}

            {page === "about" && (
              <div className="aboutContent">
                <div className="aboutHero">
                  <div className="aboutEyebrow">Who We Are</div>
                  <div className="aboutHeadline">
                    A student-led project helping kids understand feelings with more clarity and confidence.
                  </div>
                  <div className="aboutText">
                    FeelMyWay brings together psychology, neuroscience, and empathy to create a space where emotional learning feels approachable, reflective, and supportive.
                  </div>
                </div>

                <div className="aboutOverview">
                  <div className="aboutMissionCard">
                    <div className="aboutSectionLabel">Mission Statement</div>
                    <div className="aboutMissionText">
                      Our mission is to help younger students recognize emotions, think through social situations, and practice healthier choices in a way that feels engaging, safe, and encouraging.
                    </div>
                  </div>
                </div>

                <div className="aboutTeamSection">
                  <div className="aboutSectionHeader">
                    <div className="aboutSectionTitle">Meet the Team</div>
                    <div className="aboutSectionText">
                      Students leading the project with curiosity, creativity, and a strong commitment to mental health awareness.
                    </div>
                  </div>

                  <div className="teamGrid">
                    {creators.map((creator) => (
                      <div key={creator.name} className="memberCard">
                        <div className="memberTop">
                          <div className="memberAvatar">{creator.image}</div>
                          <div className="memberMeta">
                            <div className="memberName">{creator.name}</div>
                            <div className="memberTitle">{creator.title}</div>
                            {creator.subtitle ? (
                              <div className="memberSubtitle">{creator.subtitle}</div>
                            ) : null}
                          </div>
                        </div>
                        <div className="memberDescription">{creator.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

	                <div className="resultButtons">
	                  <motion.button
	                    className="primaryButton aboutBackButton"
	                    whileTap={{ scale: 0.96 }}
	                    onClick={() => setPage("home")}
	                  >
                    Back to Home
                  </motion.button>
                </div>
              </div>
            )}

            {page === "logs" && (
              <div className="logsAnalyticsPage">
                <div className="logsAnalyticsHero">
                  <div className="aboutEyebrow">My Logs</div>
                  <div className="logsAnalyticsTitle">Mood progress over time</div>
                  <div className="logsAnalyticsText">
                    A quick look at recent check-ins, your most common moods, and the reasons showing up most often.
                  </div>
                </div>

                {logs.length > 0 ? (
                  <>
	                    <div className="logsAnalyticsGrid">
	                      <div className="chartCard chartCardWide">
	                        <div className="chartCardHeader">
	                          <div className="chartCardTitle">Mood Breakdown</div>
	                          <div className="chartCardMeta">{totalMoodLogs} check-ins</div>
	                        </div>
	                        <div className="pieChartWrap">
	                          <svg
	                            className="pieChart"
	                            viewBox="0 0 220 220"
	                            role="img"
	                            aria-label="Mood breakdown pie chart"
	                          >
	                            {moodPieSlices.map((slice) =>
	                              slice.count === totalMoodLogs ? (
	                                <circle
	                                  key={slice.label}
	                                  cx="110"
	                                  cy="110"
	                                  r="92"
	                                  fill={slice.color}
	                                />
	                              ) : (
	                                <path
	                                  key={slice.label}
	                                  d={describePieSlice(110, 110, 92, slice.startAngle, slice.endAngle)}
	                                  fill={slice.color}
	                                  stroke="#ffffff"
	                                  strokeWidth="4"
	                                />
	                              )
	                            )}
	                          </svg>
	                          <div className="pieLegend">
	                            {moodPieSlices.map((slice) => (
	                              <div key={slice.label} className="pieLegendItem">
	                                <span className="pieLegendSwatch" style={{ background: slice.color }} />
	                                <span>{slice.emoji} {slice.label}</span>
	                                <strong>{slice.percentage}%</strong>
	                              </div>
	                            ))}
	                          </div>
	                        </div>
	                      </div>

                      <div className="chartCard">
                        <div className="chartCardHeader">
                          <div className="chartCardTitle">Mood Totals</div>
                          <div className="chartCardMeta">All check-ins</div>
                        </div>
                        <div className="barChart">
                          {moodTotals.map((item) => (
                            <div key={item.label} className="barChartRow">
                              <div className="barChartLabel">
                                <span>{item.emoji}</span>
                                <span>{item.label}</span>
                              </div>
                              <div className="barChartTrack">
                                <div
                                  className="barChartFill"
                                  style={{
                                    width: `${(item.count / maxMoodCount) * 100}%`,
                                    background: item.color
                                  }}
                                />
                              </div>
                              <div className="barChartValue">{item.count}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="logsInsightsRow">
                      <div className="chartCard">
                        <div className="chartCardHeader">
                          <div className="chartCardTitle">Recent Reasons</div>
                          <div className="chartCardMeta">Latest patterns</div>
                        </div>
                        <div className="insightList">
                          {recentReasons.map((reason, index) => (
                            <div key={`${reason}-${index}`} className="insightItem">
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="chartCard">
                        <div className="chartCardHeader">
                          <div className="chartCardTitle">Quick Summary</div>
                          <div className="chartCardMeta">At a glance</div>
                        </div>
                        <div className="summaryStats">
                          <div className="summaryStat">
                            <div className="summaryStatValue">{logs.length}</div>
                            <div className="summaryStatLabel">total logs</div>
                          </div>
                          <div className="summaryStat">
                            <div className="summaryStatValue">
                              {moodTotals.slice().sort((a, b) => b.count - a.count)[0]?.label || "None"}
                            </div>
                            <div className="summaryStatLabel">most common mood</div>
                          </div>
                        </div>
                      </div>
                    </div>

	                    <div className="resultButtons">
	                      <motion.button
	                        className="primaryButton logsBackButton"
	                        whileTap={{ scale: 0.96 }}
	                        onClick={() => setPage("home")}
	                      >
                        Back to Home
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="chartCard emptyAnalyticsCard">
                    <div className="chartCardTitle">No mood data yet</div>
                    <div className="logsAnalyticsText">
                      Start logging moods and this page will turn into a progress dashboard.
                    </div>
	                    <div className="resultButtons">
	                      <motion.button
	                        className="primaryButton logsBackButton"
	                        whileTap={{ scale: 0.96 }}
	                        onClick={() => setPage("home")}
	                      >
                        Back to Home
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
