import React, { useState, useEffect } from 'react';
import './App.css';

/** Caesar cipher encryption */
const encryptData = (text, secretKey) => {
  if (!/^-?\d+$/.test(secretKey)) return '';

  const shift = parseInt(secretKey, 10);
  return text
    .split('')
    .map((char) => {
      if (char >= 'a' && char <= 'z') {
        return String.fromCharCode(((char.charCodeAt(0) - 97 + shift + 26) % 26) + 97);
      } else if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode(((char.charCodeAt(0) - 65 + shift + 26) % 26) + 65);
      }
      return char;
    })
    .join('');
};

/** Caesar cipher decryption */
const decryptData = (encryptedText, secretKey) => {
  if (!/^-?\d+$/.test(secretKey)) {
    throw new Error('Secret key must be a valid integer number.');
  }

  const shift = parseInt(secretKey, 10);
  return encryptedText
    .split('')
    .map((char) => {
      if (char >= 'a' && char <= 'z') {
        return String.fromCharCode(((char.charCodeAt(0) - 97 - shift + 26) % 26) + 97);
      } else if (char >= 'A' && char <= 'Z') {
        return String.fromCharCode(((char.charCodeAt(0) - 65 - shift + 26) % 26) + 65);
      }
      return char;
    })
    .join('');
};

/** Mini-game phrases */
const phrases = [
  'HELLO WORLD',
  'REACT IS FUN',
  'OPENAI GPT',
  'CAESAR CIPHER',
  'JAVASCRIPT',
  'ENCRYPTION',
  'SECRET MESSAGE',
  'MINI GAME MODE',
  'HAVE FUN',
  'CODE CHALLENGE',
];

/** Helper to shift uppercase chars */
const shiftChar = (char, shift, base) => {
  if (char < 'A' || char > 'Z') return char;
  const index = char.charCodeAt(0) - base;
  return String.fromCharCode(((index + shift + 26) % 26) + base);
};

const encryptCaesar = (text, shift) => {
  return text
    .toUpperCase()
    .split('')
    .map((ch) => shiftChar(ch, shift, 65))
    .join('');
};

function App() {
  // Dark mode with persistence
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // Mode toggle: 'normal' or 'game'
  const [mode, setMode] = useState('normal');

  // Normal mode states
  const [decryptionKey, setDecryptionKey] = useState('');
  const [plainContent, setPlainContent] = useState('');
  const [encryptedContent, setEncryptedContent] = useState('');
  const [decryptedContent, setDecryptedContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mini-game states
  const [level, setLevel] = useState(1);
  const [keyGuess, setKeyGuess] = useState('');
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [encryptedPhrase, setEncryptedPhrase] = useState('');
  const [shiftUsed, setShiftUsed] = useState(0);
  const [gameMessage, setGameMessage] = useState('');
  const [score, setScore] = useState(0);

  // New state to show guessed phrase when correct
  const [showGuessedPhrase, setShowGuessedPhrase] = useState('');

  // Apply dark mode class & save preference
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    document.documentElement.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Start or restart mini-game puzzle based on level
  const startPuzzle = () => {
    const phraseIndex = Math.min(level - 1, phrases.length - 1);
    const phrase = phrases[phraseIndex];
    const shift = ((level * 3) % 25) + 1; // shift 1-25 cycling
    const encrypted = encryptCaesar(phrase, shift);
    setCurrentPhrase(phrase);
    setEncryptedPhrase(encrypted);
    setShiftUsed(shift);
    setKeyGuess('');
    setGameMessage('');
    setShowGuessedPhrase(''); // Clear guessed phrase on new puzzle
  };

  // Reset mini-game puzzle on level change or mode switch
  useEffect(() => {
    if (mode === 'game') {
      startPuzzle();
    }
  }, [level, mode]);

  // Mini-game submit handler
  const handleGameSubmit = (e) => {
    e.preventDefault();
    const guessedKey = parseInt(keyGuess, 10);
    if (isNaN(guessedKey)) {
      setGameMessage('Please enter a valid integer key guess.');
      setShowGuessedPhrase('');
      return;
    }
    if (guessedKey === shiftUsed) {
      setScore((s) => s + 1);
      setGameMessage(`🎉 Correct! The shift was ${shiftUsed}. Next puzzle loading...`);
      setShowGuessedPhrase(`The phrase was: "${currentPhrase}"`); // Show guessed phrase here
      setTimeout(() => setLevel((l) => l + 1), 1500);
    } else {
      setGameMessage('❌ Wrong key! Try again.');
      setShowGuessedPhrase('');
    }
  };

  // Normal mode handlers
  const handlePlainContentChange = (e) => {
    setPlainContent(e.target.value);
    setEncryptedContent('');
    setDecryptedContent('');
    setErrorMessage('');
  };

  const handleDecryptionKeyChange = (e) => {
    setDecryptionKey(e.target.value);
    setErrorMessage('');
    setDecryptedContent('');
  };

  // Clipboard helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      {/* Top controls */}
      <header className="app-header">
        <button
          onClick={() => setDarkMode((d) => !d)}
          className="dark-mode-toggle-btn"
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>

        <select
          aria-label="Select mode"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value);
            // reset errors and states on mode change
            setErrorMessage('');
            setGameMessage('');
            setDecryptionKey('');
            setPlainContent('');
            setEncryptedContent('');
            setDecryptedContent('');
            setKeyGuess('');
            setScore(0);
            setLevel(1);
            setShowGuessedPhrase('');
          }}
          className="mode-select"
        >
          <option value="normal">Normal Mode</option>
          <option value="game">Mini-Game Mode</option>
        </select>
      </header>

      <main className="app-container">
        {mode === 'normal' && (
          <div className="card">
            <h1>Encrypt / Decrypt Message (Caesar Cipher)</h1>

            <textarea
              placeholder="Enter plain content to encrypt"
              value={plainContent}
              onChange={handlePlainContentChange}
              rows={4}
              spellCheck={false}
              disabled={isProcessing}
              className="text-input"
            />

            <input
              type="text"
              placeholder="Enter secret key (number)"
              value={decryptionKey}
              onChange={handleDecryptionKeyChange}
              spellCheck={false}
              disabled={isProcessing}
              className="text-input"
            />

            <button
              className="btn-primary"
              onClick={() => {
                setErrorMessage('');

                if (!plainContent.trim() || !decryptionKey.trim()) {
                  setErrorMessage('Please enter plain content and a secret key.');
                  return;
                }

                if (!/^-?\d+$/.test(decryptionKey.trim())) {
                  setErrorMessage('Secret key must be a valid integer number.');
                  return;
                }

                setIsProcessing(true);

                setTimeout(() => {
                  const encrypted = encryptData(plainContent.trim(), decryptionKey.trim());

                  if (encrypted) {
                    setEncryptedContent(encrypted);
                    setDecryptedContent('');
                  } else {
                    setErrorMessage('Encryption failed. Make sure the key is a number.');
                  }

                  setIsProcessing(false);
                }, 200);
              }}
              disabled={isProcessing || !plainContent.trim() || !decryptionKey.trim()}
            >
              {isProcessing ? 'Encrypting...' : 'Encrypt'}
            </button>

            {encryptedContent && (
              <div className="result-container">
                <h3>
                  Encrypted Content{' '}
                  <button
                    onClick={() => copyToClipboard(encryptedContent)}
                    title="Copy encrypted text"
                    className="copy-btn"
                  >
                    📋
                  </button>
                </h3>
                <textarea
                  value={encryptedContent}
                  readOnly
                  rows={3}
                  spellCheck={false}
                  disabled={isProcessing}
                  className="text-output"
                />
              </div>
            )}

            <textarea
              placeholder="Paste encrypted content here to decrypt"
              value={encryptedContent}
              onChange={(e) => {
                setEncryptedContent(e.target.value);
                setDecryptedContent('');
                setErrorMessage('');
              }}
              rows={4}
              spellCheck={false}
              disabled={isProcessing}
              className="text-input"
            />

            <button
              className="btn-primary"
              onClick={() => {
                setErrorMessage('');

                if (!encryptedContent.trim() || !decryptionKey.trim()) {
                  setErrorMessage('Please enter encrypted content and a secret key.');
                  return;
                }

                if (!/^-?\d+$/.test(decryptionKey.trim())) {
                  setErrorMessage('Secret key must be a valid integer number.');
                  return;
                }

                setIsProcessing(true);

                setTimeout(() => {
                  try {
                    const decrypted = decryptData(encryptedContent.trim(), decryptionKey.trim());
                    setDecryptedContent(decrypted);
                  } catch (error) {
                    setErrorMessage(error.message);
                    setDecryptedContent('');
                  }

                  setIsProcessing(false);
                }, 200);
              }}
              disabled={isProcessing || !encryptedContent.trim() || !decryptionKey.trim()}
            >
              {isProcessing ? 'Decrypting...' : 'Decrypt'}
            </button>

            {decryptedContent && (
              <div className="result-container">
                <h3>
                  Decrypted Content{' '}
                  <button
                    onClick={() => copyToClipboard(decryptedContent)}
                    title="Copy decrypted text"
                    className="copy-btn"
                  >
                    📋
                  </button>
                </h3>
                <textarea
                  value={decryptedContent}
                  readOnly
                  rows={3}
                  spellCheck={false}
                  disabled={isProcessing}
                  className="text-output"
                />
              </div>
            )}

            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        )}

        {mode === 'game' && (
          <div className="card game-card">
            <h1>Mini-Game Mode: Guess the Caesar Cipher Key</h1>

            <p className="encrypted-phrase">
              Encrypted Phrase: <strong>{encryptedPhrase}</strong>
            </p>

            <form onSubmit={handleGameSubmit} className="game-form">
              <input
                type="number"
                placeholder="Enter your key guess (number)"
                value={keyGuess}
                onChange={(e) => setKeyGuess(e.target.value)}
                className="text-input"
                spellCheck={false}
                autoFocus
                required
              />
              <button type="submit" className="btn-primary">
                Submit Guess
              </button>
            </form>

            {gameMessage && <p className="game-message">{gameMessage}</p>}

            {showGuessedPhrase && (
              <p className="guessed-word-message">{showGuessedPhrase}</p>
            )}

            <p className="score-level">
              Level: <strong>{level}</strong> | Score: <strong>{score}</strong>
            </p>
          </div>
        )}
      </main>

      {/* Styles */}
      <style jsx="true">{`
        body {
          background-color: #f0f0f0;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          transition: background-color 0.3s ease, color 0.3s ease;
          user-select: none;
          margin: 0;
          padding: 0;
        }

        .dark-mode body,
        .dark-mode html {
          background-color: #1e1e1e;
          color: #cfcfcf;
        }

        .app-header {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: #007acc;
          color: white;
          align-items: center;
          user-select: none;
        }

        .dark-mode .app-header {
          background: #005a9e;
        }

        .dark-mode-toggle-btn {
          cursor: pointer;
          background: transparent;
          border: none;
          font-size: 16px;
          color: inherit;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .dark-mode-toggle-btn:hover {
          background-color: rgba(255, 255, 255, 0.15);
        }

        .mode-select {
          font-size: 16px;
          padding: 4px 8px;
          border-radius: 4px;
          border: none;
          user-select: none;
          cursor: pointer;
          background-color: white;
          color: #007acc;
          font-weight: 600;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .dark-mode .mode-select {
          background-color: #222;
          color: #cfcfcf;
        }

        .app-container {
          max-width: 720px;
          margin: 40px auto;
          padding: 0 16px 40px;
        }

        .card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 14px rgb(0 0 0 / 0.1);
          user-select: text;
        }

        .dark-mode .card {
          background: #252526;
          box-shadow: 0 4px 14px rgb(255 255 255 / 0.1);
        }

        h1 {
          margin-top: 0;
          font-weight: 700;
          font-size: 28px;
          user-select: text;
        }

        .text-input {
          width: 100%;
          padding: 10px 14px;
          font-size: 16px;
          margin: 12px 0;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-family: monospace;
          user-select: text;
          box-sizing: border-box;
          transition: border-color 0.3s ease;
        }

        .dark-mode .text-input {
          background: #1e1e1e;
          border-color: #555;
          color: #cfcfcf;
        }

        .text-output {
          width: 100%;
          font-family: monospace;
          padding: 10px 14px;
          font-size: 16px;
          margin: 12px 0;
          border-radius: 6px;
          border: 1px solid #ccc;
          resize: vertical;
          background: #f9f9f9;
          user-select: text;
          box-sizing: border-box;
        }

        .dark-mode .text-output {
          background: #1e1e1e;
          border-color: #555;
          color: #cfcfcf;
        }

        .btn-primary {
          background-color: #007acc;
          color: white;
          border: none;
          padding: 12px 20px;
          font-size: 16px;
          border-radius: 6px;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.3s ease;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #005a9e;
        }

        .btn-primary:disabled {
          background-color: #a0a0a0;
          cursor: not-allowed;
        }

        .result-container {
          margin-top: 20px;
        }

        .error-message {
          color: #c00;
          margin-top: 12px;
          font-weight: 700;
          user-select: none;
        }

        .copy-btn {
          cursor: pointer;
          border: none;
          background: transparent;
          font-size: 16px;
          margin-left: 8px;
          user-select: none;
        }

        /* Mini-game styles */

        .game-card {
          user-select: none;
        }

        .encrypted-phrase {
          font-size: 20px;
          margin: 16px 0;
          font-weight: 600;
          user-select: text;
        }

        .game-form {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .game-message {
          font-weight: 700;
          margin-top: 12px;
          text-align: center;
          user-select: none;
          color: ${darkMode ? '#b5f2a1' : '#258e27'};
        }

        .guessed-word-message {
          margin-top: 12px;
          font-weight: 600;
          text-align: center;
          color: ${darkMode ? '#f0c674' : '#b5651d'};
          user-select: none;
        }

        .score-level {
          margin-top: 24px;
          font-size: 16px;
          text-align: center;
          user-select: none;
        }
      `}</style>
    </>
  );
}

export default App;
