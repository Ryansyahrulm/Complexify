import { initNavbar } from '../components/navbar.js';
import { initFooter } from '../components/footer.js';

initNavbar({ activePage: 'materi' });
initFooter();

let topicsContent = {};
const topicOrder = ['pendahuluan', 'prasyarat', 'definisi', 'pangkat_j', 'operasi_dasar', 'diagram_argand', 'bentuk_kutub', 'contoh_soal'];
let currentTopicIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all(topicOrder.map(async (topic) => {
        try {
            const response = await fetch(`./src/data/topics/${topic}.html`);
            if (response.ok) {
                topicsContent[topic] = await response.text();
            } else {
                console.error(`Gagal memuat materi ${topic}`);
                topicsContent[topic] = `<p class="text-error">Gagal memuat materi ${topic}.</p>`;
            }
        } catch (e) {
            console.error(`Error loading ${topic}:`, e);
        }
    }));

    const sidebarButtons = document.querySelectorAll('.topic-btn');
    const contentArea = document.getElementById('content-area');
    const prevBtnContainer = document.getElementById('prev-btn-container');
    const nextBtnContainer = document.getElementById('next-btn-container');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarEl = document.getElementById('materi-sidebar');
    if (sidebarToggle && sidebarEl) {
        sidebarToggle.addEventListener('click', () => {
            const isOpen = sidebarEl.classList.toggle('is-open');
            sidebarToggle.classList.toggle('is-open', isOpen);
        });

        document.addEventListener('click', (e) => {
            if (
                sidebarEl.classList.contains('is-open') &&
                !sidebarEl.contains(e.target) &&
                !sidebarToggle.contains(e.target)
            ) {
                sidebarEl.classList.remove('is-open');
                sidebarToggle.classList.remove('is-open');
            }
        });
    }

    function updateContent(topicId, scrollToId = null) {
        currentTopicIndex = topicOrder.indexOf(topicId);

        const subtopicButtons = document.querySelectorAll('.subtopic-btn');
        subtopicButtons.forEach(btn => {
            if (btn.dataset.topic === topicId) {
                btn.classList.add('active');
                btn.style.color = '#fff';
                btn.style.fontWeight = '600';
            } else {
                btn.classList.remove('active');
                btn.style.color = '';
                btn.style.fontWeight = '';
            }
        });

        if (contentArea.dataset.currentTopic !== topicId) {
            contentArea.classList.add('fade-out');

            setTimeout(() => {
                contentArea.innerHTML = topicsContent[topicId];
                contentArea.dataset.currentTopic = topicId;
                contentArea.classList.remove('fade-out');

                updateNavButtons();

                if (window.MathJax) {
                    MathJax.typesetPromise();
                }

                if (scrollToId) {
                    setTimeout(() => {
                        const targetEl = document.getElementById(scrollToId);
                        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 50);
                }
            }, 300);
        } else {
            if (scrollToId) {
                const targetEl = document.getElementById(scrollToId);
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        if (window.innerWidth < 768 && sidebarEl && sidebarToggle) {
            sidebarEl.classList.remove('is-open');
            sidebarToggle.classList.remove('is-open');
        }
    }

    function updateNavButtons() {
        if (currentTopicIndex > 0) {
            const prevTopic = topicOrder[currentTopicIndex - 1];
            const prevTitle = prevTopic.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            prevBtnContainer.innerHTML = `
                <button onclick="window.goToTopic('${prevTopic}')" class="materi-nav__prev">
                    <span class="svg-icon" aria-hidden="true" style="-webkit-mask-image: url('./src/Assets/icons/arrow_back.svg'); mask-image: url('./src/Assets/icons/arrow_back.svg');"></span>
                    <span>Kembali ke ${prevTitle}</span>
                </button>
            `;
        } else {
            prevBtnContainer.innerHTML = '<div></div>';
        }

        if (currentTopicIndex < topicOrder.length - 1) {
            const nextTopic = topicOrder[currentTopicIndex + 1];
            const nextTitle = nextTopic.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            nextBtnContainer.innerHTML = `
                <button onclick="window.goToTopic('${nextTopic}')" class="materi-nav__next">
                    <span>Lanjut ke ${nextTitle}</span>
                    <span class="svg-icon" aria-hidden="true" style="-webkit-mask-image: url('./src/Assets/icons/arrow_forward.svg'); mask-image: url('./src/Assets/icons/arrow_forward.svg');"></span>
                </button>
            `;
        } else {
            nextBtnContainer.innerHTML = `
                <button onclick="window.location.href='kuis.html'" class="materi-nav__next materi-nav__next--finish">
                    <span>Mulai Kuis</span>
                    <span class="svg-icon" aria-hidden="true" style="-webkit-mask-image: url('./src/Assets/icons/quiz.svg'); mask-image: url('./src/Assets/icons/quiz.svg');"></span>
                </button>
            `;
        }
    }

    window.goToTopic = (topicId) => {
        updateContent(topicId);
    };

    const groupButtons = document.querySelectorAll('.topic-group-btn');
    groupButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.closest('.sidebar-item-group');
            const dropdown = group.querySelector('.dropdown-content');
            if (dropdown) {
                const isOpen = dropdown.classList.toggle('open');
                btn.classList.toggle('open', isOpen);
                btn.setAttribute('aria-expanded', isOpen);
            }
        });
    });

    const subtopicButtons = document.querySelectorAll('.subtopic-btn');
    subtopicButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const clickedTopic = btn.dataset.topic;
            if (contentArea.dataset.currentTopic !== clickedTopic) {
                updateContent(clickedTopic);
            }
        });
    });

    updateContent(topicOrder[0]);
});