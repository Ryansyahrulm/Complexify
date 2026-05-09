import { initNavbar } from '../components/navbar.js';
import { initFooter } from '../components/footer.js';

initNavbar({ activePage: 'kuis' });
initFooter();

let questions = [];
let currentQuestionIndex = 0;
let userAnswers = new Array(10).fill(null);

const DOM = {
    loading: document.getElementById('quiz-loading'),
    container: document.getElementById('quiz-container'),
    results: document.getElementById('results-container'),
    sidebar: document.getElementById('sidebar-container'),

    questionNumber: document.getElementById('question-number-text'),
    questionText: document.getElementById('question-text'),
    optionsGrid: document.getElementById('options-grid'),
    nextBtn: document.getElementById('next-btn'),
    nextBtnText: document.getElementById('next-btn-text'),

    scoreText: document.getElementById('score-text'),
    correctText: document.getElementById('correct-text'),
    wrongText: document.getElementById('wrong-text'),

    reviewList: document.getElementById('results-review-list')
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('./src/data/kuis.json');
        const allQuestions = await response.json();

        const shuffledQuestions = shuffle([...allQuestions]).slice(0, 10);

        questions = shuffledQuestions.map(q => {
            const correctAnswer = q.options[q.correctIndex];
            return {
                ...q,
                correctAnswer,
                shuffledOptions: shuffle([...q.options])
            };
        });

        startQuiz();
    } catch (error) {
        console.error('Failed to load quiz data:', error);
        DOM.loading.innerHTML = '<p class="text-red-400">Gagal memuat kuis. Pastikan server lokal berjalan.</p>';
    }
});

function startQuiz() {
    DOM.loading.classList.add('hidden');
    DOM.container.classList.remove('hidden');

    renderQuestion();

    DOM.nextBtn.addEventListener('click', () => {
        if (userAnswers[currentQuestionIndex] === null) {
            showAlert('Pilih jawaban terlebih dahulu sebelum melanjutkan!', 'warning');
            DOM.optionsGrid.classList.add('shake');
            setTimeout(() => {
                DOM.optionsGrid.classList.remove('shake');
            }, 500);
            return;
        }

        if (currentQuestionIndex < 9) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            submitQuiz();
        }
    });
}

function showAlert(message, type = 'warning') {
    const existingAlert = document.querySelector('.quiz-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = `quiz-alert quiz-alert--${type}`;
    alert.innerHTML = `
        <span class="quiz-alert__icon">${type === 'warning' ? '!' : 'i'}</span>
        <span class="quiz-alert__message">${message}</span>
        <button class="quiz-alert__close">&times;</button>
    `;

    const quizCard = document.querySelector('.quiz-card');
    quizCard.parentNode.insertBefore(alert, quizCard);

    setTimeout(() => {
        alert.classList.add('quiz-alert--show');
    }, 10);

    const closeBtn = alert.querySelector('.quiz-alert__close');
    closeBtn.addEventListener('click', () => {
        alert.classList.remove('quiz-alert--show');
        setTimeout(() => {
            alert.remove();
        }, 300);
    });

    setTimeout(() => {
        if (alert.parentNode) {
            alert.classList.remove('quiz-alert--show');
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        }
    }, 3000);
}

function renderQuestion() {
    const q = questions[currentQuestionIndex];

    DOM.questionNumber.textContent = `Soal ${currentQuestionIndex + 1}/10`;

    DOM.questionText.textContent = q.question;

    DOM.optionsGrid.innerHTML = '';

    const currentAnswer = userAnswers[currentQuestionIndex];

    q.shuffledOptions.forEach((optionText, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';

        const isSelected = currentAnswer === optionText;
        const hasAnswered = currentAnswer !== null;

        let btnCls = 'option-btn';
        let textCls = 'option-text';

        if (hasAnswered) {
            btn.disabled = true;
            if (isSelected) {
                btnCls += ' option-btn--selected';
            } else {
                btnCls += ' option-btn--dimmed';
                textCls += ' option-text--dimmed';
            }
        }

        btn.className = btnCls;

        const textSpan = document.createElement('span');
        textSpan.className = textCls;
        textSpan.textContent = optionText;

        btn.appendChild(textSpan);

        if (isSelected) {
            const checkIcon = document.createElement('span');
            checkIcon.className = 'svg-icon option-check';
            checkIcon.textContent = 'check_circle';
            btn.appendChild(checkIcon);
        }

        if (!hasAnswered) {
            btn.onclick = () => selectOption(optionText);
        }

        DOM.optionsGrid.appendChild(btn);
    });

    if (currentQuestionIndex === 9) {
        DOM.nextBtnText.textContent = "Selesai";
        DOM.nextBtn.classList.add('quiz-nav__next--submit');
        const icon = DOM.nextBtn.querySelector('.svg-icon');
        if (icon) icon.style.webkitMaskImage = "url('./src/Assets/icons/task_alt.svg')";
        icon.style.maskImage = "url('./src/Assets/icons/task_alt.svg')";
        icon.textContent = "";
    } else {
        DOM.nextBtnText.textContent = "Berikutnya";
        DOM.nextBtn.classList.remove('quiz-nav__next--submit');
        const icon = DOM.nextBtn.querySelector('.svg-icon');
        if (icon) icon.style.webkitMaskImage = "url('./src/Assets/icons/arrow_forward.svg')";
        icon.style.maskImage = "url('./src/Assets/icons/arrow_forward.svg')";
        icon.textContent = "";
    }

    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

function selectOption(selectedText) {
    if (userAnswers[currentQuestionIndex] !== null) return;

    userAnswers[currentQuestionIndex] = selectedText;
    renderQuestion();
}

function renderReview() {
    if (!DOM.reviewList) return;
    DOM.reviewList.innerHTML = '';

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const userAnswer = userAnswers[i];
        const isCorrect = (userAnswer === q.correctAnswer);
        const card = document.createElement('div');
        card.className = `results-glass-card results-card ${isCorrect ? 'results-card--correct' : 'results-card--wrong'}`;
        card.innerHTML = `
            <div class="results-card__glow" aria-hidden="true"></div>
            <div class="results-card__body">
                <p class="results-question-text">${i+1}. ${escapeHtml(q.question)}</p>
                <div class="results-options-grid"></div>
                <div class="results-explanation">Penjelasan:</div>
                <div class="results-explanation">${escapeHtml(q.explanation || 'Tidak ada penjelasan untuk soal ini.')}</div>
            </div>
        `;

        const optionsGrid = card.querySelector('.results-options-grid');
        q.shuffledOptions.forEach(optionText => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'results-option-btn results-option';

            const isUserSelected = (userAnswer === optionText);
            const isCorrectAnswer = (q.correctAnswer === optionText);
            if (isCorrectAnswer) {
                optionDiv.classList.add('results-option-btn--correct');
            }
            if (isUserSelected && !isCorrectAnswer) {
                optionDiv.classList.add('results-option-btn--wrong');
            }

            optionDiv.innerHTML = `
                <span class="results-option-text">${escapeHtml(optionText)}</span>
            `;
            optionsGrid.appendChild(optionDiv);
        });

        DOM.reviewList.appendChild(card);
    }

    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

function submitQuiz() {
    const unansweredCount = userAnswers.filter(answer => answer === null).length;
    if (unansweredCount > 0) {
        showAlert(`Anda masih memiliki ${unansweredCount} soal yang belum dijawab! Selesaikan semua soal terlebih dahulu.`, 'warning');
        return;
    }

    let correctCount = 0;

    for (let i = 0; i < 10; i++) {
        if (userAnswers[i] === questions[i].correctAnswer) {
            correctCount++;
        }
    }

    const wrongCount = 10 - correctCount;
    const score = correctCount * 10;

    DOM.scoreText.textContent = '0';
    DOM.correctText.textContent = correctCount;
    DOM.wrongText.textContent = wrongCount;

    DOM.container.classList.add('hidden');
    DOM.results.classList.remove('hidden');

    renderReview();

    let currentScore = 0;
    const interval = setInterval(() => {
        if (currentScore >= score) {
            clearInterval(interval);
            DOM.scoreText.textContent = score;
        } else {
            currentScore += 2;
            DOM.scoreText.textContent = currentScore;
        }
    }, 20);
}