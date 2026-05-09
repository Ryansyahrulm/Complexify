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
  { name: 'Wijdan Maula Hidayat', role: 'Presiden', photo: '#' },
  { name: 'Ryan Syahrul Muharam', role: 'Presiden', photo: '#' },
  { name: 'Fahmi Miftahudin', role: 'Presiden', photo: '#' },
  { name: 'Muhammad Rizki Fadlillah', role: 'Presiden', photo: '#' },
  { name: 'Muhammad Syakirul Yaqzhan', role: 'Presiden', photo: '#' },
  { name: 'Wahyu Aldhy Rachmansyah', role: 'Presiden', photo: '#' },
  { name: 'Alfidi Rahadianto', role: 'Presiden', photo: '#' }
];

const teamContainer = document.getElementById('team-grid');
if (teamContainer) {
  teamContainer.innerHTML = '';

  teamMembers.forEach((member, index) => {
    teamContainer.innerHTML += `
      <article class="glass-card team-card reveal" id="tim-alif">
        <div class="team-card__avatar-wrap">
          <div class="team-card__glow" aria-hidden="true"></div>
          <div class="team-card__avatar">
            <img src="${member.photo}" alt="${member.name}" loading="lazy" width="160" height="160" />
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
