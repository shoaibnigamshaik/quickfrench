'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, RotateCcw, Trophy, BookOpen, Check, X, Keyboard, Edit3 } from 'lucide-react';

interface Question {
  word: string;
  correct: string;
  options: string[];
}

interface Adjective {
  word: string;
  meaning: string;
}

const FrenchAdjectivesQuiz = () => {
  const adjectives: Adjective[] = [
    {"word": "agréable", "meaning": "pleasant"},
    {"word": "faux / fausse", "meaning": "false"},
    {"word": "amical(e)", "meaning": "friendly"},
    {"word": "fort(e)", "meaning": "strong"},
    {"word": "amusant(e)", "meaning": "funny"},
    {"word": "froid(e)", "meaning": "cold"},
    {"word": "animé(e)", "meaning": "lively"},
    {"word": "général(e)", "meaning": "general"},
    {"word": "approprié(e)", "meaning": "appropriate"},
    {"word": "génial(e)", "meaning": "great"},
    {"word": "beau / belle", "meaning": "beautiful"},
    {"word": "gentil(le)", "meaning": "kind"},
    {"word": "bête", "meaning": "stupid"},
    {"word": "grand(e)", "meaning": "big"},
    {"word": "plus grand(e)", "meaning": "bigger"},
    {"word": "le / la plus grand(e)", "meaning": "biggest"},
    {"word": "bon(ne)", "meaning": "good"},
    {"word": "gratuit(e)", "meaning": "free"},
    {"word": "bruyant(e)", "meaning": "noisy"},
    {"word": "impoli(e)", "meaning": "rude"},
    {"word": "chaud(e)", "meaning": "hot"},
    {"word": "important(e)", "meaning": "important"},
    {"word": "clair(e)", "meaning": "clear"},
    {"word": "impossible", "meaning": "impossible"},
    {"word": "confortable", "meaning": "comfortable"},
    {"word": "intelligent(e)", "meaning": "intelligent"},
    {"word": "correct(e)", "meaning": "correct"},
    {"word": "inutile", "meaning": "useless"},
    {"word": "de valeur", "meaning": "valuable"},
    {"word": "isolé(e)", "meaning": "isolated"},
    {"word": "dernier / dernière", "meaning": "last"},
    {"word": "léger / légère", "meaning": "light"},
    {"word": "différent(e)", "meaning": "different"},
    {"word": "lent(e)", "meaning": "slow"},
    {"word": "difficile", "meaning": "difficult"},
    {"word": "libre", "meaning": "free"},
    {"word": "disponible", "meaning": "available"},
    {"word": "lourd(e)", "meaning": "heavy"},
    {"word": "douillet / douillette", "meaning": "cozy"},
    {"word": "malheureux / malheureuse", "meaning": "unhappy"},
    {"word": "doux / douce", "meaning": "soft"},
    {"word": "marrant(e)", "meaning": "funny"},
    {"word": "drôle", "meaning": "funny"},
    {"word": "mauvais(e) / plus mauvais(e)", "meaning": "bad"},
    {"word": "meilleur(e) / le / la meilleur(e)", "meaning": "best"},
    {"word": "ennuyeux / ennuyeuse", "meaning": "boring"},
    {"word": "énorme", "meaning": "huge"},
    {"word": "mince", "meaning": "thin"},
    {"word": "étroit(e)", "meaning": "narrow"},
    {"word": "mobile", "meaning": "mobile"},
    {"word": "exact(e)", "meaning": "exact"},
    {"word": "moderne", "meaning": "modern"},
    {"word": "facile", "meaning": "easy"},
    {"word": "mou / molle", "meaning": "soft"},
    {"word": "faible", "meaning": "weak"},
    {"word": "mouillé(e)", "meaning": "wet"},
    {"word": "fantastique", "meaning": "fantastic"},
    {"word": "nécessaire", "meaning": "necessary"}
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [quizComplete, setQuizComplete] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [quizMode, setQuizMode] = useState<'multiple-choice' | 'typing'>('multiple-choice');
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [showModeSelector, setShowModeSelector] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate quiz questions
  useEffect(() => {
    if (quizMode) {
      generateQuestions();
    }
  }, [quizMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showModeSelector || quizComplete) return;
      
      if (quizMode === 'multiple-choice') {
        // Number keys 1-4 for multiple choice
        if (['1', '2', '3', '4'].includes(e.key) && !showResult) {
          const index = parseInt(e.key) - 1;
          if (questions[currentQuestion]?.options[index]) {
            handleAnswerSelect(questions[currentQuestion].options[index]);
          }
        }
      } else if (quizMode === 'typing') {
        // Enter to submit typed answer
        if (e.key === 'Enter' && typedAnswer.trim() && !showResult) {
          handleTypedSubmit();
        }
      }
      
      // Space or Enter to go to next question (when result is shown)
      if ((e.key === ' ' || e.key === 'Enter') && showResult) {
        e.preventDefault();
        nextQuestion();
      }
      
      // R to restart quiz
      if (e.key.toLowerCase() === 'r' && (quizComplete || showResult)) {
        resetQuiz();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showResult, quizComplete, currentQuestion, questions, typedAnswer, showModeSelector, quizMode]);

  // Focus input in typing mode
  useEffect(() => {
    if (quizMode === 'typing' && inputRef.current && !showResult) {
      inputRef.current.focus();
    }
  }, [currentQuestion, quizMode, showResult]);

  const generateQuestions = () => {
    const shuffled = [...adjectives].sort(() => Math.random() - 0.5);
    const quizQuestions: Question[] = shuffled.slice(0, 10).map(word => {
      const otherOptions = adjectives
        .filter(adj => adj.meaning !== word.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(adj => adj.meaning);
      
      const options = [word.meaning, ...otherOptions].sort(() => Math.random() - 0.5);
      
      return {
        word: word.word,
        correct: word.meaning,
        options: options
      };
    });
    setQuestions(quizQuestions);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (answer === questions[currentQuestion].correct) {
      setScore(score + 1);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
    } else {
      setStreak(0);
    }
  };

  const handleTypedSubmit = () => {
    if (showResult || !typedAnswer.trim()) return;
    
    const correct = questions[currentQuestion].correct.toLowerCase();
    const typed = typedAnswer.toLowerCase().trim();
    
    // Check for exact match or close match
    const isCorrect = correct === typed || 
                     correct.includes(typed) || 
                     typed.includes(correct) ||
                     // Handle common variations
                     typed.replace(/[^a-z]/g, '') === correct.replace(/[^a-z]/g, '');
    
    setSelectedAnswer(typedAnswer);
    setShowResult(true);
    
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      setMaxStreak(Math.max(maxStreak, streak + 1));
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setTypedAnswer('');
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setTypedAnswer('');
    setShowResult(false);
    setQuizComplete(false);
    setStreak(0);
    setMaxStreak(0);
    setShowModeSelector(true);
  };

  const startQuiz = (mode: 'multiple-choice' | 'typing') => {
    setQuizMode(mode);
    setShowModeSelector(false);
    generateQuestions();
  };

  const getScoreColor = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (showModeSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Quiz Mode</h1>
              <p className="text-gray-600">Select how you'd like to practice French adjectives</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => startQuiz('multiple-choice')}
                className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 transform hover:scale-105 text-left"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-4">
                  <Keyboard className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Multiple Choice</h3>
                <p className="text-gray-600 mb-4">Select from 4 options</p>
                <div className="text-sm text-gray-500">
                  <div>• Use keys 1-4 to select</div>
                  <div>• Space/Enter for next</div>
                  <div>• R to restart</div>
                </div>
              </button>
              
              <button
                onClick={() => startQuiz('typing')}
                className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all duration-200 transform hover:scale-105 text-left"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl mb-4">
                  <Edit3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Type Answer</h3>
                <p className="text-gray-600 mb-4">Type the English meaning</p>
                <div className="text-sm text-gray-500">
                  <div>• Type your answer</div>
                  <div>• Enter to submit</div>
                  <div>• Space for next question</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border border-gray-100">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
              <p className="text-gray-600">Great job learning French adjectives</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="text-3xl font-bold text-indigo-600 mb-2">{score}</div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="text-3xl font-bold text-green-600 mb-2">{Math.round((score / questions.length) * 100)}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">{maxStreak}</div>
                <div className="text-sm text-gray-600">Best Streak</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className={`text-2xl font-bold ${getScoreColor()}`}>
                {score >= 8 ? 'Excellent!' : score >= 6 ? 'Good job!' : 'Keep practicing!'}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                Press R to restart or click the button below
              </div>
              <button
                onClick={resetQuiz}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-lg border border-gray-100 mb-4">
            <BookOpen className="h-5 w-5 text-indigo-600 mr-2" />
            <span className="text-sm font-semibold text-gray-700">
              French Adjectives Quiz - {quizMode === 'multiple-choice' ? 'Multiple Choice' : 'Typing Mode'}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Test Your Knowledge</h1>
          <p className="text-gray-600">
            {quizMode === 'multiple-choice' ? 
              'Use keys 1-4 to select answers quickly' : 
              'Type the English meaning of each French adjective'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Streak: {streak}</span>
              <span className="text-sm font-semibold text-indigo-600">Score: {score}</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Question */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">What does this mean?</h2>
            <div className="text-4xl font-bold text-white bg-gradient-to-r from-purple-500 to-purple-600 bg-opacity-30 rounded-2xl py-6 px-8 inline-block">
              {questions[currentQuestion]?.word}
            </div>
          </div>

          {/* Options */}
          <div className="p-8">
            {quizMode === 'multiple-choice' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {questions[currentQuestion]?.options.map((option: string, index: number) => {
                  let buttonClass = "w-full p-6 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 text-left font-semibold";
                  
                  if (showResult) {
                    if (option === questions[currentQuestion].correct) {
                      buttonClass += " bg-green-50 border-green-500 text-green-700";
                    } else if (option === selectedAnswer && option !== questions[currentQuestion].correct) {
                      buttonClass += " bg-red-50 border-red-500 text-red-700";
                    } else {
                      buttonClass += " bg-gray-50 border-gray-300 text-gray-500";
                    }
                  } else {
                    buttonClass += " bg-gray-50 border-gray-300 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          <span className="text-indigo-600 font-bold mr-3">{index + 1}</span>
                          {option}
                        </span>
                        {showResult && option === questions[currentQuestion].correct && (
                          <Check className="h-5 w-5 text-green-600" />
                        )}
                        {showResult && option === selectedAnswer && option !== questions[currentQuestion].correct && (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mb-8">
                <div className="max-w-md mx-auto">
                  <input
                    ref={inputRef}
                    type="text"
                    value={typedAnswer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypedAnswer(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleTypedSubmit()}
                    disabled={showResult}
                    placeholder="Type the English meaning..."
                    className="w-full p-6 text-lg text-gray-800 border-2 border-gray-300 rounded-2xl focus:border-indigo-500 focus:outline-none transition-colors duration-200"
                  />
                  {!showResult && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={handleTypedSubmit}
                        disabled={!typedAnswer.trim()}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Submit (Enter)
                      </button>
                    </div>
                  )}
                </div>
                
                {showResult && (
                  <div className="mt-6 text-center">
                    <div className="max-w-md mx-auto p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Your answer:</div>
                      <div className="font-semibold text-gray-800 mb-3">{selectedAnswer}</div>
                      <div className="text-sm text-gray-600 mb-2">Correct answer:</div>
                      <div className="font-semibold text-green-700">{questions[currentQuestion].correct}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Next Button */}
            {showResult && (
              <div className="text-center">
                <div className="mb-6">
                  {(quizMode === 'multiple-choice' && selectedAnswer === questions[currentQuestion].correct) ||
                   (quizMode === 'typing' && questions[currentQuestion].correct.toLowerCase().includes(selectedAnswer.toLowerCase().trim())) ? (
                    <div className="text-green-600 font-semibold text-lg">
                      ✓ Correct! Great job!
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold text-lg">
                      ✗ Incorrect. The correct answer is "{questions[currentQuestion].correct}"
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Press Space or Enter to continue
                </div>
                <button
                  onClick={nextQuestion}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrenchAdjectivesQuiz;