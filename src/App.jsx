import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from './components/SplitText';
import Lanyard from './components/Lanyard';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [activeProject, setActiveProject] = useState(null); // Toggles inline slide-out
  const [activeSkillIndex, setActiveSkillIndex] = useState(0);

  const sectionsRef = useRef([]);

  // Skills book list data
  const allSkills = [
    // Hard Skills
    { name: 'HTML & CSS', tabLabel: 'HTML/CSS', icon: 'fas fa-laptop-code', iconColor: '#E44D26', val: 7, color: '#FCE4EC', desc: 'Mampu membangun antarmuka web yang rapi, responsif, dan terstruktur dengan baik menggunakan HTML5 semantik dan CSS3 modern.', category: 'Hard Skill' },
    { name: 'JavaScript', tabLabel: 'JS', icon: 'fab fa-js-square', iconColor: '#E5A823', val: 6, color: '#FFF8E1', desc: 'Memahami logika pemrograman JavaScript untuk menambahkan interaktivitas dinamis pada halaman web portofolio.', category: 'Hard Skill' },
    { name: 'Networking', tabLabel: 'Network', icon: 'fas fa-network-wired', iconColor: '#2980B9', val: 8, color: '#E0F7FA', desc: 'Menguasai konsep dasar jaringan, konfigurasi routing & switching, subnetting, serta instalasi infrastruktur jaringan lokal.', category: 'Hard Skill' },
    { name: 'Cloud Computing', tabLabel: 'Cloud', icon: 'fas fa-cloud', iconColor: '#0288D1', val: 7, color: '#E8F5E9', desc: 'Memahami infrastruktur cloud, manajemen virtual machine, deployment aplikasi berbasis cloud, dan alokasi resource komputasi.', category: 'Hard Skill' },
    { name: 'Linux Server', tabLabel: 'Linux', icon: 'fab fa-linux', iconColor: '#111111', val: 7, color: '#ECEFF1', desc: 'Mampu melakukan instalasi dan administrasi server berbasis Linux (Ubuntu/CentOS), konfigurasi web server, database, dan keamanan.', category: 'Hard Skill' },
    { name: 'Figma', tabLabel: 'Figma', icon: 'fab fa-figma', iconColor: '#F24E1E', val: 6, color: '#F3E5F5', desc: 'Dapat merancang wireframe, mockup, dan desain antarmuka pengguna (UI/UX) yang bersih dan intuitif sebelum tahap coding.', category: 'Hard Skill' },
    
    // Soft Skills
    { name: 'Kreativitas', tabLabel: 'Kreatif', icon: 'fas fa-lightbulb', iconColor: '#FFB300', val: 9, color: '#FCE4EC', desc: 'Menghadirkan ide-ide baru yang segar baik dalam desain visual proyek maupun pencarian solusi atas kendala teknis.', category: 'Soft Skill' },
    { name: 'Komunikasi', tabLabel: 'Komunikasi', icon: 'fas fa-comments', iconColor: '#4CAF50', val: 8, color: '#E8F5E9', desc: 'Mampu menyampaikan informasi teknis secara jelas dan berkolaborasi secara lisan maupun tulisan dengan baik.', category: 'Soft Skill' },
    { name: 'Kerja Tim', tabLabel: 'Kerja Tim', icon: 'fas fa-people-carry-box', iconColor: '#3F51B5', val: 8, color: '#E0F7FA', desc: 'Berkontribusi aktif di dalam tim deployment DTP untuk menyelesaikan integrasi server dan kelancaran sistem bersama.', category: 'Soft Skill' },
    { name: 'Manajemen Waktu', tabLabel: 'Waktu', icon: 'fas fa-clock', iconColor: '#E91E63', val: 7, color: '#FFF8E1', desc: 'Dapat membagi tugas akademik dan proyek sekolah secara seimbang agar pengerjaan selesai tepat waktu.', category: 'Soft Skill' },
    { name: 'Detail Oriented', tabLabel: 'Detail', icon: 'fas fa-magnifying-glass', iconColor: '#607D8B', val: 8, color: '#F3E5F5', desc: 'Fokus pada kerapian struktur kode, detail visual desain antarmuka, dan keakuratan data konfigurasi server.', category: 'Soft Skill' },
    { name: 'Problem Solving', tabLabel: 'Problem', icon: 'fas fa-puzzle-piece', iconColor: '#FF5722', val: 7, color: '#E8EAF6', desc: 'Mampu menganalisis masalah teknis, mendiagnosis kegagalan server/routing, dan mencari solusi pemecahan yang efektif.', category: 'Soft Skill' }
  ];

  // Battery Skill helper to render 10 cells
  const renderBatteryCells = (level) => {
    return Array.from({ length: 10 }).map((_, idx) => (
      <span
        key={idx}
        className={`skill-card__cell ${idx < level ? 'filled' : ''}`}
        style={{ transitionDelay: `${idx * 40}ms` }}
      ></span>
    ));
  };

  // Setup Scroll Listeners
  useEffect(() => {
    const handleScroll = () => {
      // 1. Navbar scrolled state
      setNavScrolled(window.scrollY > 50);

      // 2. Active section highlights
      const scrollY = window.scrollY + 120;
      const sections = document.querySelectorAll('section[id]');
      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
          setActiveSection(id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 3. GSAP Scroll Reveal for simple elements
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // 4. Staggered fade in remaining hero parts after title finishes
    gsap.fromTo(
      '.hero__fade-in',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        delay: 0.55, // Snappy entry after the greeting/name split
      }
    );

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 72; // Nav height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const toggleProject = (index) => {
    setActiveProject(activeProject === index ? null : index);
  };

  return (
    <>
      {/* ===================== NAVBAR ===================== */}
      <nav className={`navbar ${navScrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="container navbar__inner">

          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="navbar__hamburger-line"></span>
            <span className="navbar__hamburger-line"></span>
            <span className="navbar__hamburger-line"></span>
          </button>

          <ul className={`navbar__menu ${menuOpen ? 'open' : ''}`} id="navMenu">
            {['home', 'about', 'skills', 'portfolio', 'track-record', 'contact'].map((item) => (
              <li key={item}>
                <a
                  href={`#${item}`}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`navbar__link ${activeSection === item ? 'active' : ''}`}
                >
                  {item === 'track-record' ? 'Track Record' : item.charAt(0).toUpperCase() + item.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div className={`mobile-overlay ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(false)}></div>

      {/* ===================== HERO SECTION ===================== */}
      <section className="hero" id="home">
        {/* Ambient Decorative Background Orbs */}
        <div className="hero__orb hero__orb--1"></div>
        <div className="hero__orb hero__orb--2"></div>
        <div className="hero__orb hero__orb--3"></div>

        <div className="container hero__inner">
          <div className="hero__text">
            <SplitText
              text="Halo, saya"
              className="hero__greeting"
              delay={25}
              duration={0.4}
              textAlign="left"
            />
            <br />
            <SplitText
              text="Nayla Sufiatuz Zahro"
              className="hero__name"
              delay={30}
              duration={0.5}
              textAlign="left"
              tag="h1"
            />
            <p className="hero__tagline hero__fade-in">
              Siswa SMK Telkom Sidoarjo — Jurusan SIJA&nbsp;|&nbsp;Passionate about Cloud Computing &amp; Networking
            </p>
          </div>
          <div className="hero__image hero__fade-in">
            {/* 3D Physics Lanyard */}
            <Lanyard />
          </div>
        </div>
      </section>

      {/* ===================== ABOUT ME ===================== */}
      <section className="about section" id="about">
        <div className="container">
          <h2 className="section__title reveal">Tentang Saya</h2>
          <p className="section__subtitle reveal">Kenali saya lebih dekat</p>

          <div className="about__content">
            <div className="about__image reveal">
              <div className="about__img-wrapper">
                <img src="/assets/images/profile2.jpeg" alt="Nayla Sufiatuz Zahro" />
              </div>
            </div>
            <div className="about__info reveal">
              <p className="about__text">
                Saya <strong>Nayla Sufiatuz Zahro</strong>, siswa kelas 12 di SMK Telkom Sidoarjo jurusan Sistem Informasi Jaringan dan Aplikasi (SIJA). 
                Saya memiliki ketertarikan besar terhadap dunia desain grafis, branding, dan pembuatan Cloud Computing. 
                Sejak dulu, saya selalu terpesona visual desain dan bagaimana data bekerja.
              </p>
              <div className="about__details">
                <div className="about__detail-item">
                  <i className="fas fa-school"></i>
                  <div>
                    <strong>Sekolah</strong>
                    <span>SMK Telkom Sidoarjo</span>
                  </div>
                </div>
                <div className="about__detail-item">
                  <i className="fas fa-network-wired"></i>
                  <div>
                    <strong>Jurusan</strong>
                    <span>Sistem Informasi Jaringan &amp; Aplikasi (SIJA)</span>
                  </div>
                </div>
                <div className="about__detail-item">
                  <i className="fas fa-heart"></i>
                  <div>
                    <strong>Minat</strong>
                    <span>Cloud Computing, Web Dev, Networking</span>
                  </div>
                </div>
                <div className="about__detail-item">
                  <i className="fas fa-bullseye"></i>
                  <div>
                    <strong>Tujuan</strong>
                    <span>Menjadi IT Professional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SKILLS ===================== */}
      <section className="skills section section--alt" id="skills">
        <div className="container">
          <h2 className="section__title reveal">Keahlian</h2>
          <p className="section__subtitle reveal">Klik pembatas halaman di sebelah kanan untuk melihat detail keahlian</p>

          <div className="skills-book reveal">
            {/* The Notebook Page */}
            <div className="skills-book__page" style={{ '--page-accent': allSkills[activeSkillIndex].color }}>
              
              {/* Binder Spiral Holes */}
              <div className="skills-book__binder">
                <div className="binder-ring"></div>
                <div className="binder-ring"></div>
                <div className="binder-ring"></div>
                <div className="binder-ring"></div>
                <div className="binder-ring"></div>
                <div className="binder-ring"></div>
                <div className="binder-ring"></div>
              </div>

              {/* Page content details */}
              <div className="skills-book__content">
                <div className="skills-book__header">
                  <div className="skills-book__badge">{allSkills[activeSkillIndex].category}</div>
                  <div className="skills-book__title-row">
                    <i className={`${allSkills[activeSkillIndex].icon} skill-icon-large`} style={{ color: allSkills[activeSkillIndex].iconColor }}></i>
                    <h3>{allSkills[activeSkillIndex].name}</h3>
                  </div>
                </div>

                <div className="skills-book__body">
                  <p className="skills-book__desc">{allSkills[activeSkillIndex].desc}</p>
                  
                  <div className="skills-book__level-section">
                    <span className="skills-book__level-label">Tingkat Kemampuan:</span>
                    <div className="skill-card__battery">
                      {renderBatteryCells(allSkills[activeSkillIndex].val)}
                    </div>
                    <span className="skills-book__percentage">{allSkills[activeSkillIndex].val * 10}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Sticky Note Tabs (Page Dividers) */}
            <div className="skills-book__tabs">
              {allSkills.map((skill, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSkillIndex(index)}
                  className={`skills-book__tab ${activeSkillIndex === index ? 'active' : ''}`}
                  style={{
                    '--tab-color': skill.color,
                    zIndex: activeSkillIndex === index ? 30 : allSkills.length - index,
                  }}
                >
                  <span className="tab-text">{skill.tabLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== PORTFOLIO ===================== */}
      <section className="portfolio section" id="portfolio">
        <div className="container">
          <h2 className="section__title reveal">Portofolio</h2>
          <p className="section__subtitle reveal">Klik folder untuk menggeser berkas proyek keluar</p>

          <div className="portfolio__projects-list">
            {/* Project 1 */}
            <div className={`portfolio__project-row reveal ${activeProject === 0 ? 'active' : ''}`}>
              <div className="portfolio__folder-wrapper" onClick={() => toggleProject(0)}>
                <div
                  className={`folder ${activeProject === 0 ? 'open' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-expanded={activeProject === 0}
                  style={{
                    '--folder-color': '#A8D5BA',
                    '--folder-back-color': '#8EBD9F',
                    '--paper-1': '#C6A88E',
                    '--paper-2': '#f0f0f0',
                    '--paper-3': '#ffffff',
                  }}
                >
                  <div className="folder__tab"></div>
                  <div className="folder__back">
                    <div className="paper paper-1"></div>
                    <div className="paper paper-2"></div>
                    <div className="paper paper-3"></div>
                    <div className="folder__front"></div>
                    <div className="folder__front right"></div>
                  </div>
                </div>
                <p className="portfolio__folder-label">Front End — Ujian Kenaikan Level</p>
              </div>

              <div className="portfolio__slide-content">
                <div className="project-sheet">
                  <div className="project-sheet__img-container">
                    <img src="/assets/images/project-frontend.png" alt="Front End Ujian Kenaikan Level" />
                  </div>
                  <div className="project-sheet__info">
                    <h3>Front End — Ujian Kenaikan Level</h3>
                    <p>
                      Proyek ini merupakan bagian dari ujian kenaikan level di SMK Telkom Sidoarjo. Saya membangun
                      antarmuka front-end menggunakan HTML, CSS, dan JavaScript dengan pendekatan desain responsif,
                      clean, interaktif, dan modern.
                    </p>
                    <div className="project-sheet__tags">
                      <span>HTML</span><span>CSS</span><span>JavaScript</span><span>Responsive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className={`portfolio__project-row reveal ${activeProject === 1 ? 'active' : ''}`}>
              <div className="portfolio__folder-wrapper" onClick={() => toggleProject(1)}>
                <div
                  className={`folder ${activeProject === 1 ? 'open' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-expanded={activeProject === 1}
                  style={{
                    '--folder-color': '#A8D5BA',
                    '--folder-back-color': '#8EBD9F',
                    '--paper-1': '#C6A88E',
                    '--paper-2': '#f0f0f0',
                    '--paper-3': '#ffffff',
                  }}
                >
                  <div className="folder__tab"></div>
                  <div className="folder__back">
                    <div className="paper paper-1"></div>
                    <div className="paper paper-2"></div>
                    <div className="paper paper-3"></div>
                    <div className="folder__front"></div>
                    <div className="folder__front right"></div>
                  </div>
                </div>
                <p className="portfolio__folder-label">Deployment DTP — HRIS Sinergi Hotel &amp; Villa</p>
              </div>

              <div className="portfolio__slide-content">
                <div className="project-sheet">
                  <div className="project-sheet__img-container">
                    <img src="/assets/images/project-hris.png" alt="HRIS Deployment" />
                  </div>
                  <div className="project-sheet__info">
                    <h3>Deployment DTP — HRIS Sinergi Hotel &amp; Villa</h3>
                    <p>
                      Proyek DTP (Dunia Teknik Profesional) berkolaborasi dengan Sinergi Hotel &amp; Villa untuk men-deploy
                      sistem HRIS. Meliputi konfigurasi server Linux, deployment aplikasi, database setup, dan monitoring
                      kestabilan.
                    </p>
                    <div className="project-sheet__tags">
                      <span>Deployment</span><span>Cloud Computing</span><span>Linux Server</span><span>Networking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TRACK RECORD ===================== */}
      <section className="education section section--alt" id="track-record">
        <div className="container">
          <h2 className="section__title reveal">Track Record selama SMK</h2>
          <p className="section__subtitle reveal">Pengalaman dan keterlibatan saya</p>

          <div className="timeline">
            <div className="timeline__item reveal">
              <div className="timeline__dot"></div>
              <div className="timeline__content">
                <span className="timeline__date">SMK Telkom Sidoarjo</span>
                <h3>Anggota Komisi Disiplin</h3>
                <p>
                  Aktif sebagai anggota Komisi Disiplin di SMK Telkom Sidoarjo, berkontribusi dalam
                  menegakkan tata tertib dan mengawasi kedisiplinan siswa.
                </p>
              </div>
            </div>

            <div className="timeline__item reveal">
              <div className="timeline__dot"></div>
              <div className="timeline__content">
                <span className="timeline__date">DTP Industri</span>
                <h3>Tim Deployment — Project DTP Industri Sinergi Hotel &amp; Villa</h3>
                <p>
                  Tergabung dalam tim deployment untuk proyek DTP industri di Sinergi Hotel &amp; Villa, bertanggung jawab
                  atas konfigurasi dan deployment sistem HRIS di lingkungan produksi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CONTACT ===================== */}
      <section className="contact section" id="contact">
        <div className="container">
          <h2 className="section__title reveal">Hubungi Saya</h2>
          <p className="section__subtitle reveal">Tertarik bekerja sama? Jangan ragu untuk menghubungi!</p>

          <div className="contact__content contact__content--centered">
            <div className="contact__info reveal">
              <div className="contact__info-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:nayla.sufiatuz@email.com">nayla.sufiatuz@email.com</a>
                </div>
              </div>
              <div className="contact__info-item">
                <i className="fas fa-phone"></i>
                <div>
                  <strong>Telepon</strong>
                  <a href="tel:+6281234567890">+62 812-3456-7890</a>
                </div>
              </div>
              <div className="contact__info-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <strong>Lokasi</strong>
                  <span>Sidoarjo, Jawa Timur</span>
                </div>
              </div>

              <div className="contact__socials">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <i className="fab fa-github"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="footer">
        <div className="container footer__inner">
          <p>&copy; 2026 Nayla Sufiatuz Zahro. All rights reserved.</p>
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
            className="footer__back-top"
            aria-label="Kembali ke atas"
          >
            <i className="fas fa-chevron-up"></i>
          </a>
        </div>
      </footer>
    </>
  );
}
