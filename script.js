import { ru } from './languages/ru.js';
import { el } from './languages/el.js';

const translations = { ru, el };
let currentLanguage = 'ru';
let currentQuestion = 0;
let score = 0;
let userAnswers = [];
let timer = 0;
let timerId = null;
let isTestCompleted = false;

const startScreen = document.getElementById('start-screen');
const quizContent = document.getElementById('quiz-content');
const questionNumber = document.getElementById('question-number');
const progressBar = document.getElementById('progress-bar');
const questionImage = document.getElementById('question-image');
const questionText = document.getElementById('question-text');
const answersContainer = document.getElementById('answers');
const result = document.getElementById('result');
const timerDisplay = document.getElementById('timer');
const timerLabel = document.getElementById('timer-label');
const langRuBtn = document.getElementById('lang-ru');
const langElBtn = document.getElementById('lang-el');
const themeToggle = document.getElementById('theme-toggle');
const quizTitle = document.getElementById('quiz-title');
const startBtn = document.getElementById('start-btn');
const continueBtn = document.getElementById('continue-btn');
const resetBtn = document.getElementById('reset-btn');
const skipBtn = document.getElementById('skip-btn');
const toStartBtn = document.getElementById('to-start-btn');
const controlBar = document.getElementById('control-bar');
const controls = document.getElementById('controls');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const modalContinue = document.getElementById('modal-continue');
const modalRestart = document.getElementById('modal-restart');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');

// Форматирование времени
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Запуск таймера
function startTimer() {
  if (!timerId) {
    timerId = setInterval(() => {
      timer++;
      timerDisplay.textContent = formatTime(timer);
    }, 1000);
  }
}

// Остановка таймера
function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

// Сброс состояния теста
function resetState() {
  currentQuestion = 0;
  score = 0;
  userAnswers = [];
  timer = 0;
  timerDisplay.textContent = formatTime(timer);
  isTestCompleted = false;
  localStorage.removeItem('quizProgress');
}

// Загрузка прогресса
function loadProgress() {
  const progress = JSON.parse(localStorage.getItem('quizProgress'));
  if (progress) {
    currentQuestion = progress.currentQuestion;
    score = progress.score;
    userAnswers = progress.userAnswers;
    currentLanguage = progress.currentLanguage;
    timer = progress.timer || 0;
    isTestCompleted = progress.isTestCompleted || false;
    if (!isTestCompleted) {
      showModal();
    } else {
      updateStartScreen();
    }
  } else {
    updateStartScreen();
  }
}

// Показ модального окна
function showModal() {
  modalText.textContent = translations[currentLanguage].ui.modalText;
  modalContinue.textContent = translations[currentLanguage].ui.modalContinue;
  modalRestart.textContent = translations[currentLanguage].ui.modalRestart;
  modal.style.display = 'flex';
}

// Сохранение прогресса
function saveProgress() {
  const progress = { currentQuestion, score, userAnswers, currentLanguage, timer, isTestCompleted };
  localStorage.setItem('quizProgress', JSON.stringify(progress));
}

// Обновление начального экрана
function updateStartScreen() {
  quizTitle.textContent = translations[currentLanguage].ui.title;
  startBtn.textContent = translations[currentLanguage].ui.start;

  const progress = JSON.parse(localStorage.getItem('quizProgress'));
  if (progress && !progress.isTestCompleted) {
    continueBtn.style.display = 'block';
    continueBtn.textContent = translations[currentLanguage].ui.continue;
  } else {
    continueBtn.style.display = 'none';
  }

  startScreen.style.display = 'block';
  quizContent.style.display = 'none';
  controlBar.style.display = 'none';
  modal.style.display = 'none';
}

// Начало квиза
function startQuiz() {
  resetState();
  startScreen.style.display = 'none';
  modal.style.display = 'none';
  quizContent.style.display = 'block';
  controlBar.style.display = 'flex';
  startTimer();
  loadQuestion();
}

// Продолжить тест
function continueQuiz() {
  startScreen.style.display = 'none';
  modal.style.display = 'none';
  quizContent.style.display = 'block';
  controlBar.style.display = 'flex';
  startTimer();
  loadQuestion();
}

// Загрузка вопроса
function loadQuestion() {
  const questions = translations[currentLanguage].questions;
  if (currentQuestion >= questions.length) {
    showResult();
    return;
  }

  const question = questions[currentQuestion];
  questionNumber.textContent = translations[currentLanguage].ui.questionNumber
    .replace('{current}', currentQuestion + 1)
    .replace('{total}', questions.length);
  questionImage.src = question.image;
  questionText.textContent = question.text;
  answersContainer.innerHTML = '';

  question.answers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.textContent = `${index + 1}. ${answer}`;
    button.onclick = () => checkAnswer(index);
    answersContainer.appendChild(button);
  });

  updateProgressBar();
  updateControls();
  timerLabel.textContent = translations[currentLanguage].ui.timerLabel;
  timerDisplay.textContent = formatTime(timer);
}

// Обновление шкалы прогресса
function updateProgressBar() {
  progressBar.innerHTML = '';
  const questions = translations[currentLanguage].questions;
  questions.forEach((_, index) => {
    const circle = document.createElement('span');
    circle.classList.add('progress-circle');
    if (index < userAnswers.length) {
      const answer = userAnswers[index];
      circle.classList.add(answer.isCorrect ? 'correct' : answer.skipped ? 'skipped' : 'incorrect');
    }
    progressBar.appendChild(circle);
  });
}

// Проверка ответа
function checkAnswer(selectedIndex) {
  const questions = translations[currentLanguage].questions;
  const question = questions[currentQuestion];
  const isCorrect = selectedIndex === question.correct;
  if (isCorrect) {
    score++;
  }
  userAnswers.push({ selectedIndex, isCorrect, skipped: false });

  const buttons = answersContainer.querySelectorAll('button');
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.correct) button.classList.add('correct');
    else if (index === selectedIndex) button.classList.add('incorrect');
  });

  saveProgress();
  setTimeout(() => {
    currentQuestion++;
    loadQuestion();
  }, 1000);
}

// Пропуск вопроса
function skipQuestion() {
  userAnswers.push({ selectedIndex: null, isCorrect: false, skipped: true });
  saveProgress();
  setTimeout(() => {
    currentQuestion++;
    loadQuestion();
  }, 1000);
}

// Показ результатов
function showResult() {
  stopTimer();
  questionImage.style.display = 'none';
  questionText.style.display = 'none';
  answersContainer.style.display = 'none';
  progressBar.style.display = 'none';
  questionNumber.style.display = 'none';
  controlBar.style.display = 'none';
  controls.style.display = 'none';

  const total = translations[currentLanguage].questions.length;
  const percent = Math.round((score / total) * 100);

  const resultSummary = document.createElement('div');
  resultSummary.classList.add('result-summary');

  const header = document.createElement('p');
  header.textContent = translations[currentLanguage].ui.result.split('!')[0] + '!';
  header.style.fontSize = '24px';
  header.style.marginBottom = '10px';

  const scoreItem = document.createElement('div');
  scoreItem.classList.add('result-item', 'score');
  scoreItem.innerHTML = '✅ ' + translations[currentLanguage].ui.scoreLabel + `${score} из ${total}`;

  const percentItem = document.createElement('div');
  percentItem.classList.add('result-item', 'percent');
  percentItem.innerHTML = '📊 ' + `${percent}${translations[currentLanguage].ui.percentLabel}%`;

  const timeItem = document.createElement('div');
  timeItem.classList.add('result-item', 'time');
  timeItem.innerHTML = '⏱️ ' + translations[currentLanguage].ui.timeLabel + `${formatTime(timer)}`;

  resultSummary.appendChild(header);
  resultSummary.appendChild(scoreItem);
  resultSummary.appendChild(percentItem);
  resultSummary.appendChild(timeItem);

  const resultContainer = document.createElement('div');
  resultContainer.classList.add('result-container');

  translations[currentLanguage].questions.forEach((question, index) => {
    const answer = userAnswers[index] || { selectedIndex: null, isCorrect: false, skipped: true };
    const resultItem = document.createElement('div');
    resultItem.classList.add('result-item');
    resultItem.classList.add(answer.isCorrect ? 'correct' : answer.skipped ? 'skipped' : 'incorrect');

    const img = document.createElement('img');
    img.src = question.image;
    img.alt = `Вопрос ${index + 1}`;
    img.onclick = () => {
      lightboxImage.src = question.image;
      lightbox.style.display = 'flex';
    };

    const text = document.createElement('div');
    text.innerHTML = `
      <p><strong>Вопрос ${index + 1}:</strong> ${question.text}</p>
      <p>${translations[currentLanguage].ui.yourAnswer}${answer.selectedIndex !== null ? question.answers[answer.selectedIndex] : 'Пропущено'}</p>
      <p>${translations[currentLanguage].ui.correctAnswer}${question.answers[question.correct]}</p>
      <p>${translations[currentLanguage].ui.explanationLabel}${question.explanation}</p>
    `;

    resultItem.appendChild(img);
    resultItem.appendChild(text);
    resultContainer.appendChild(resultItem);
  });

  const restartButton = document.createElement('button');
  restartButton.textContent = translations[currentLanguage].ui.restart;
  restartButton.classList.add('restart-fixed');
  restartButton.onclick = restartQuiz;

  result.innerHTML = '';
  result.appendChild(resultSummary);
  result.appendChild(resultContainer);
  result.appendChild(restartButton);

  isTestCompleted = true;
  saveProgress();
}

// Перезапуск квиза
function restartQuiz() {
  resetState();
  questionImage.style.display = 'block';
  questionText.style.display = 'block';
  answersContainer.style.display = 'flex';
  progressBar.style.display = 'flex';
  questionNumber.style.display = 'block';
  controlBar.style.display = 'flex';
  controls.style.display = 'flex';
  result.innerHTML = '';
  startTimer();
  loadQuestion();
}

// Обновление кнопок управления
function updateControls() {
  skipBtn.textContent = translations[currentLanguage].ui.skip;
  resetBtn.textContent = translations[currentLanguage].ui.reset;
  toStartBtn.textContent = translations[currentLanguage].ui.back;
}

// Сброс квиза
function resetQuiz() {
  stopTimer();
  restartQuiz();
}

// Возврат на начальный экран
function goToStart() {
  stopTimer();
  updateStartScreen();
}

// Переключение языка
function switchLanguage(lang) {
  currentLanguage = lang;
  if (startScreen.style.display === 'block') {
    updateStartScreen();
  } else if (modal.style.display === 'flex') {
    modalText.textContent = translations[currentLanguage].ui.modalText;
    modalContinue.textContent = translations[currentLanguage].ui.modalContinue;
    modalRestart.textContent = translations[currentLanguage].ui.modalRestart;
  } else if (result.textContent) {
    showResult();
  } else {
    loadQuestion();
    timerLabel.textContent = translations[currentLanguage].ui.timerLabel;
    updateControls();
  }
  saveProgress();
}

// Переключение темы
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  themeToggle.querySelector('.icon').textContent = isDark ? '🌙' : '☀️';
}

// Закрытие лайтбокса
lightboxClose.onclick = () => {
  lightbox.style.display = 'none';
};
lightbox.onclick = (e) => {
  if (e.target === lightbox) lightbox.style.display = 'none';
};

// Клавиатурная навигация
document.addEventListener('keydown', (e) => {
  if (quizContent.style.display === 'block' && !result.textContent) {
    const buttons = answersContainer.querySelectorAll('button:not(:disabled)');
    if (e.key >= '1' && e.key <= '4' && buttons[e.key - 1]) {
      buttons[e.key - 1].click();
    } else if (e.key.toLowerCase() === 'r') {
      resetQuiz();
    } else if (e.key.toLowerCase() === 's') {
      skipQuestion();
    } else if (e.key.toLowerCase() === 'b') {
      goToStart();
    }
  }
});

// События
startBtn.addEventListener('click', startQuiz);
continueBtn.addEventListener('click', continueQuiz);
resetBtn.addEventListener('click', resetQuiz);
skipBtn.addEventListener('click', skipQuestion);
toStartBtn.addEventListener('click', goToStart);
modalContinue.addEventListener('click', continueQuiz);
modalRestart.addEventListener('click', () => {
  localStorage.removeItem('quizProgress');
  modal.style.display = 'none';
  updateStartScreen();
});
langRuBtn.addEventListener('click', () => switchLanguage('ru'));
langElBtn.addEventListener('click', () => switchLanguage('el'));
themeToggle.addEventListener('click', toggleTheme);

// Старт
loadProgress();