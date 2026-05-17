import { initNavbar } from '../components/navbar.js';
import { initFooter } from '../components/footer.js';
initNavbar({ activePage: 'tim' });
initFooter();
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // animate once
      }
    });
  },
  { threshold: 0.12 }
);

const teamMembers = [
  { name: 'Wijdan Maula Hidayat', role: 'UI/UX Designer', photo: 'wijdan.jpeg' },
  { name: 'Ryan Syahrul Muharam', role: 'Developer', photo: 'ryan.jpeg' },
  { name: 'Fahmi Miftahudin', role: 'Penyusun Materi & Kuis', photo: 'fahmi.jpeg' },
  { name: 'Muhammad Rizki Fadlillah', role: 'Developer', photo: 'rizki.jpeg' },
  { name: 'Muhammad Syakirul Yaqzhan', role: 'Developer', photo: 'syakirul.jpeg' },
  { name: 'Wahyu Aldhy Rachmansyah', role: 'UI/UX Designer', photo: 'wahyu.jpeg' },
  { name: 'Alfidi Rahadianto', role: 'Penyusun Materi & Kuis', photo: 'alfidi.jpeg' }
];

const teamContainer = document.getElementById('team-grid');
if (teamContainer) {
  teamContainer.innerHTML = '';

  teamMembers.forEach((member, index) => {
    teamContainer.innerHTML += `
      <article class="glass-card team-card reveal">
        <div class="team-card__avatar-wrap">
          <div class="team-card__glow" aria-hidden="true"></div>
          <div class="team-card__avatar">
            <img src="./src/Assets/images/${member.photo}" alt="${member.name}" loading="lazy" width="160" height="160" oncontextmenu="return false;"/>
          </div>
        </div>
        <h2 class="team-card__name">${member.name}</h2>
        <p class="team-card__role">${member.role}</p>
      </article>
    `;
  });
} else {
  console.warn('Element dengan id "team-grid" tidak ditemukan. Card tidak dapat dibuat.');
}

document.querySelectorAll('.reveal').forEach((el) => {
  revealObserver.observe(el);
});
