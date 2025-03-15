import { ru } from './languages/ru.js';
import { el } from './languages/el.js';

const translations = { ru, el };
let currentLanguage = 'ru';
let currentQuestion = 0;
let score = 0;
let userAnswers = [];
let timer = 0;
let timerId = null;
let isPaused = false;

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
const languageSelect = document.getElementById('language-select');
const quizTitle = document.getElementById('quiz-title');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const backBtn = document.getElementById('back-btn');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const modalContinue = document.getElementById('modal-continue');
const modalRestart = document.getElementById('modal-restart');

// Форматирование времени в ЧЧ:ММ:СС
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Загрузка прогресса
function loadProgress() {
  const progress = JSON.parse(localStorage.getItem('quizProgress'));
  if (progress) {
    currentQuestion = progress.currentQuestion;
    score = progress.score;
    userAnswers = progress.userAnswers;
    currentLanguage = progress.currentLanguage;
    timer = progress.timer;
    showModal();
  } else {
    updateStartScreen();
  }
  languageSelect.value = currentLanguage;
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
  const progress = { currentQuestion, score, userAnswers, currentLanguage, timer };
  localStorage.setItem('quizProgress', JSON.stringify(progress));
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

// Пауза/возобновление таймера
function togglePause() {
  if (isPaused) {
    startTimer();
    pauseBtn.textContent = translations[currentLanguage].ui.pause;
    isPaused = false;
  } else {
    stopTimer();
    pauseBtn.textContent = translations[currentLanguage].ui.resume;
    isPaused = true;
  }
}

// Обновление начального экрана
function updateStartScreen() {
  quizTitle.textContent = translations[currentLanguage].ui.title;
  startBtn.textContent = translations[currentLanguage].ui.start;
  startScreen.style.display = 'block';
  quizContent.style.display = 'none';
  modal.style.display = 'none';
}

// Начало квиза
function startQuiz() {
  startScreen.style.display = 'none';
  modal.style.display = 'none';
  quizContent.style.display = 'block';
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
    button.textContent = answer;
    button.onclick = () => checkAnswer(index);
    answersContainer.appendChild(button);
  });

  updateProgressBar();
  updateControls();
  timerLabel.textContent = translations[currentLanguage].ui.timerLabel;
  timerDisplay.textContent = formatTime(timer);
  if (!timerId && !isPaused) startTimer();
}

// Обновление шкалы прогресса
function updateProgressBar() {
  progressBar.innerHTML = '';
  const questions = translations[currentLanguage].questions;
  questions.forEach((_, index) => {
    const circle = document.createElement('span');
    circle.classList.add('progress-circle');
    if (index < userAnswers.length) {
      circle.classList.add(userAnswers[index].isCorrect ? 'correct' : 'incorrect');
    }
    progressBar.appendChild(circle);
  });
}

// Проверка ответа
function checkAnswer(selectedIndex) {
  const questions = translations[currentLanguage].questions;
  const question = questions[currentQuestion];
  const isCorrect = selectedIndex === question.correct;
  if (isCorrect) score++;
  userAnswers.push({ selectedIndex, isCorrect });

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

// Показ результатов
function showResult() {
  stopTimer();
  questionImage.style.display = 'none';
  questionText.style.display = 'none';
  answersContainer.style.display = 'none';
  progressBar.style.display = 'none';
  questionNumber.style.display = 'none';
  document.getElementById('controls').style.display = 'none';

  const total = translations[currentLanguage].questions.length;
  const restartButton = document.createElement('button');
  restartButton.textContent = translations[currentLanguage].ui.restart;
  restartButton.onclick = restartQuiz;

  result.innerHTML = translations[currentLanguage].ui.result
    .replace('{score}', score)
    .replace('{total}', total)
    .replace('{time}', formatTime(timer));
  result.appendChild(document.createElement('br'));
  result.appendChild(restartButton);
}

// Перезапуск квиза
function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  userAnswers = [];
  timer = 0;
  isPaused = false;
  localStorage.removeItem('quizProgress');
  questionImage.style.display = 'block';
  questionText.style.display = 'block';
  answersContainer.style.display = 'flex';
  progressBar.style.display = 'flex';
  questionNumber.style.display = 'block';
  document.getElementById('controls').style.display = 'flex';
  result.innerHTML = '';
  loadQuestion();
}

// Обновление кнопок управления
function updateControls() {
  pauseBtn.textContent = isPaused ? translations[currentLanguage].ui.resume : translations[currentLanguage].ui.pause;
  resetBtn.textContent = translations[currentLanguage].ui.reset;
  backBtn.textContent = translations[currentLanguage].ui.back;
}

// Сброс квиза
function resetQuiz() {
  stopTimer();
  restartQuiz();
}

// Возврат на начальный экран
function goBack() {
  stopTimer();
  updateStartScreen();
}

// События
startBtn.addEventListener('click', startQuiz);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetQuiz);
backBtn.addEventListener('click', goBack);
modalContinue.addEventListener('click', startQuiz);
modalRestart.addEventListener('click', () => {
  localStorage.removeItem('quizProgress');
  modal.style.display = 'none';
  updateStartScreen();
});
languageSelect.addEventListener('change', (e) => {
  currentLanguage = e.target.value;
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
});

// Старт
loadProgress();