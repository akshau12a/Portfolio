window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loadingScreen');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 500);
        }
    }, 800);
});

const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    updateActiveNav();
});

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
    });
});

function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 100) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === current);
    });
}

class TypeWriter {
    constructor(element, words, wait = 2500) {
        this.element = element;
        this.words = words;
        this.wait = wait;
        this.wordIndex = 0;
        this.txt = '';
        this.isDeleting = false;
        this.type();
    }

    type() {
        const current = this.wordIndex % this.words.length;
        const fullTxt = this.words[current];
        this.txt = this.isDeleting
            ? fullTxt.substring(0, this.txt.length - 1)
            : fullTxt.substring(0, this.txt.length + 1);
        this.element.textContent = this.txt;
        let typeSpeed = this.isDeleting ? 40 : 80;
        if (!this.isDeleting && this.txt === fullTxt) {
            typeSpeed = this.wait;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.wordIndex++;
            typeSpeed = 300;
        }
        setTimeout(() => this.type(), typeSpeed);
    }
}

function setupReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    document.querySelectorAll('.section-header, .info-card, .skill-card, .project-card, .cert-card, .video-card, .timeline-item, .contact-info, .contact-form-wrapper').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
}

function animateCounter(element, target, suffix = '+') {
    let current = 0;
    const increment = Math.max(target / 40, 1);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');

function openLightbox(src) {
    lightboxImage.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

document.getElementById('lightboxClose').addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
});

const videoModal = document.getElementById('videoModal');
const videoContainer = document.getElementById('videoContainer');

function openVideoModal(url, type) {
    let html = '';
    if (type === 'youtube') {
        const videoId = extractYouTubeId(url);
        html = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allowfullscreen allow="autoplay"></iframe>`;
    } else if (type === 'vimeo') {
        html = `<iframe src="https://player.vimeo.com/video/${url.split('/').pop()}?autoplay=1" allowfullscreen allow="autoplay"></iframe>`;
    } else {
        html = `<video controls autoplay><source src="${url}" type="video/mp4"></video>`;
    }
    videoContainer.innerHTML = html;
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    videoModal.classList.remove('active');
    videoContainer.innerHTML = '';
    document.body.style.overflow = '';
}

document.getElementById('videoModalClose').addEventListener('click', closeVideoModal);
videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });

function extractYouTubeId(url) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : url;
}

function openPdfModal(pdfUrl, title) {
    document.getElementById('pdfModalTitle').textContent = title;
    document.getElementById('pdfIframe').src = pdfUrl;
    document.getElementById('pdfModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePdfModal() {
    document.getElementById('pdfModal').classList.remove('active');
    document.getElementById('pdfIframe').src = '';
    document.body.style.overflow = '';
}

document.getElementById('pdfModalClose').addEventListener('click', closePdfModal);
document.getElementById('pdfModal').addEventListener('click', (e) => { if (e.target.id === 'pdfModal') closePdfModal(); });

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function setupSkillFilter() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            document.querySelectorAll('.skill-card').forEach(card => {
                card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
            });
        });
    });
}

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('sendMessageBtn');
    const statusEl = document.getElementById('formStatus');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    const data = {
        name: document.getElementById('contactName').value,
        email: document.getElementById('contactEmailInput').value,
        subject: document.getElementById('contactSubject').value,
        message: document.getElementById('contactMessage').value,
        request_type: document.getElementById('requestType').value
    };
    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            showToast('Message sent successfully!', 'success');
            statusEl.textContent = 'Message sent! I\'ll get back to you soon.';
            statusEl.className = 'form-status success';
            document.getElementById('contactForm').reset();
        } else {
            throw new Error();
        }
    } catch {
        showToast('Failed to send. Please try again.', 'error');
        statusEl.textContent = 'Failed to send. Please try again.';
        statusEl.className = 'form-status error';
    }
    btn.innerHTML = original;
    btn.disabled = false;
});

async function downloadResume() {
    try {
        const res = await fetch('/api/resume-url');
        const data = await res.json();
        if (data.url) {
            fetch('/api/track-download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ info: navigator.userAgent })
            });
            window.open(data.url, '_blank');
            showToast('Resume download started!', 'success');
        } else {
            showToast('Resume not uploaded yet. Please contact Akshay directly.', 'info');
        }
    } catch {
        showToast('Could not load resume.', 'error');
    }
}

document.getElementById('downloadResume').addEventListener('click', downloadResume);
document.getElementById('downloadResumeNav').addEventListener('click', downloadResume);

function renderSkills(skills) {
    const grid = document.getElementById('skillsGrid');
    const defaultSkills = [
        { name: 'SAP UI5', category: 'sap', proficiency: 92, icon: 'fas fa-cube' },
        { name: 'SAP Fiori', category: 'sap', proficiency: 90, icon: 'fas fa-cubes' },
        { name: 'SAP BTP', category: 'sap', proficiency: 86, icon: 'fas fa-cloud' },
        { name: 'SAP CAP/CDS', category: 'sap', proficiency: 85, icon: 'fas fa-server' },
        { name: 'OData V2/V4', category: 'sap', proficiency: 90, icon: 'fas fa-exchange-alt' },
        { name: 'SAP HANA Cloud', category: 'sap', proficiency: 82, icon: 'fas fa-database' },
        { name: 'Python', category: 'backend', proficiency: 92, icon: 'fab fa-python' },
        { name: 'FastAPI', category: 'backend', proficiency: 92, icon: 'fas fa-bolt' },
        { name: 'Node.js', category: 'backend', proficiency: 85, icon: 'fab fa-node-js' },
        { name: 'REST APIs', category: 'backend', proficiency: 92, icon: 'fas fa-plug' },
        { name: 'JWT / OAuth2', category: 'backend', proficiency: 88, icon: 'fas fa-shield-alt' },
        { name: 'RSA Cryptography', category: 'backend', proficiency: 80, icon: 'fas fa-lock' },
        { name: 'JavaScript', category: 'frontend', proficiency: 88, icon: 'fab fa-js-square' },
        { name: 'TypeScript', category: 'frontend', proficiency: 82, icon: 'fab fa-js-square' },
        { name: 'React', category: 'frontend', proficiency: 78, icon: 'fab fa-react' },
        { name: 'Next.js', category: 'frontend', proficiency: 76, icon: 'fab fa-react' },
        { name: 'HTML5 / CSS3', category: 'frontend', proficiency: 90, icon: 'fab fa-html5' },
        { name: 'Docker', category: 'devops', proficiency: 82, icon: 'fab fa-docker' },
        { name: 'Nginx', category: 'devops', proficiency: 72, icon: 'fas fa-server' },
        { name: 'Git', category: 'devops', proficiency: 88, icon: 'fab fa-git-alt' },
        { name: 'Cloud Foundry', category: 'devops', proficiency: 84, icon: 'fas fa-cloud-upload-alt' },
        { name: 'PostgreSQL', category: 'database', proficiency: 86, icon: 'fas fa-database' },
        { name: 'Redis', category: 'database', proficiency: 75, icon: 'fas fa-memory' },
        { name: 'Supabase', category: 'database', proficiency: 80, icon: 'fas fa-database' },
        { name: 'SAP HANA', category: 'database', proficiency: 82, icon: 'fas fa-database' },
        { name: 'Gemini AI', category: 'ai', proficiency: 80, icon: 'fas fa-brain' },
        { name: 'Vector Embeddings', category: 'ai', proficiency: 76, icon: 'fas fa-project-diagram' },
        { name: 'Semantic Search', category: 'ai', proficiency: 76, icon: 'fas fa-search' },
    ];

    const data = skills.length ? skills : defaultSkills;

    grid.innerHTML = data.map(skill => `
        <div class="skill-card" data-category="${skill.category || 'other'}">
            <div class="skill-icon"><i class="${skill.icon || 'fas fa-code'}"></i></div>
            <div class="skill-name">${skill.name}</div>
            <div class="skill-bar"><div class="skill-fill" data-width="${skill.proficiency}"></div></div>
            <div class="skill-percentage">${skill.proficiency}%</div>
        </div>
    `).join('');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target.querySelector('.skill-fill');
                if (fill) setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 200);
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.skill-card').forEach(card => observer.observe(card));
    setupSkillFilter();
}

function renderExperience(experiences) {
    const timeline = document.getElementById('timeline');
    const defaultExp = [
        {
            company: 'VASPP — Value Added Software Products and People',
            role: 'SAP UI5 Developer',
            description: 'Designed and developed enterprise SAP applications including the Material Data Management dashboard using SAP UI5 MVC architecture and Fiori design principles. Implemented CAP backend with OData V4 services and SAP HANA Cloud persistence. Built external customer self-registration portal with OTP authentication, bypassing BTP login for external users. Contributed to 6+ enterprise-grade applications across client projects. Deployed on SAP BTP Cloud Foundry.',
            start_date: 'Nov 2025',
            end_date: null,
            is_current: true
        },
        {
            company: 'VASPP — Value Added Software Products and People',
            role: 'Backend Developer',
            description: 'Built AI-powered HR Resource Management System using FastAPI and PostgreSQL. Implemented vector embeddings and Gemini AI for intelligent candidate matching with semantic similarity scoring. Designed RSA-encrypted authentication for industrial IoT systems. Built JWT/OAuth2 authentication with role-based access control. Containerized multi-service applications using Docker, docker-compose, and Nginx.',
            start_date: 'Nov 2025',
            end_date: null,
            is_current: true
        },

    ];

    const data = experiences.length ? experiences : defaultExp;

    timeline.innerHTML = data.map(exp => {
        const endDate = exp.is_current ? 'Present' : (exp.end_date || '');
        const badge = exp.is_current ? '<span class="current-badge">Current</span>' : '';
        return `
            <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${exp.start_date} — ${endDate}</div>
                    <div class="timeline-company">${exp.company}${badge}</div>
                    <div class="timeline-role">${exp.role}</div>
                    <p class="timeline-description">${exp.description || ''}</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    const empty = document.getElementById('projectsEmpty');
    const defaultProjects = [
        {
            title: 'MDM — Material Data Management Dashboard',
            description: 'Enterprise SAP application modernizing the MM01 material creation process on SAP BTP. Built 6 SAPUI5 applications including Rule Engine, Create Material, Manage, Approval, and Dashboard. Integrated with SAP S/4HANA via OData APIs with multi-level approval workflows and role-based authorization.',
            tech_stack: 'SAP UI5,SAP CAP,SAP BTP,OData V4,SAP HANA Cloud,SAP DMS,Cloud Foundry',
            live_url: '',
            github_url: '',
            image_url: ''
        },
        {
            title: 'CDM — External Customer Self-Registration Portal',
            description: 'Standalone SAP portal enabling external customers to register without SAP BTP access. Solved the complex challenge of proxying BTP authentication for external users. Implemented OTP email verification, dynamic form rendering with runtime OData field configuration, and GSTIN/PAN/IFSC real-time validation.',
            tech_stack: 'SAP UI5,Node.js,Express.js,OData,SAP BTP,ABAP,SAP Gateway',
            live_url: '',
            github_url: '',
            image_url: ''
        },
        {
            title: 'AI-Powered HR Resource Management System',
            description: 'Full-stack AI platform for candidate tracking, resume parsing, and intelligent job matching. Built async FastAPI backend with Gemini AI and vector embeddings for semantic candidate matching. Automated resume extraction from PDF, DOCX, and PPTX with background job processing using ARQ and Redis.',
            tech_stack: 'FastAPI,Next.js,PostgreSQL,Redis,Gemini AI,Vector Embeddings,Docker,Nginx',
            live_url: '',
            github_url: '',
            image_url: ''
        },
        {
            title: 'Industrial IoT Safety Test Automation Backend',
            description: 'FastAPI backend proxying the DGUV Ineo Remote-Master industrial testing platform. Automated RSA-encrypted authentication using OAEP SHA-1, eliminating all manual token steps. Built JWT/OAuth2 with admin and customer role scoping, hourly APScheduler sync, and comprehensive pytest coverage.',
            tech_stack: 'Python,FastAPI,RSA Cryptography,JWT,OAuth2,Docker,PostgreSQL,pytest',
            live_url: '',
            github_url: '',
            image_url: ''
        }
    ];

    const data = projects.length ? projects : defaultProjects;

    if (!data.length) {
        grid.style.display = 'none';
        empty.style.display = '';
        return;
    }

    empty.style.display = 'none';
    grid.style.display = '';
    grid.innerHTML = data.map(project => {
        const imageHtml = project.image_url
            ? `<div class="project-image-wrapper">
                    <img src="${project.image_url}" alt="${project.title}" class="project-image" loading="lazy">
                    <div class="project-overlay">
                        ${project.live_url ? `<a href="${project.live_url}" target="_blank" class="overlay-btn"><i class="fas fa-external-link-alt"></i></a>` : ''}
                        ${project.github_url ? `<a href="${project.github_url}" target="_blank" class="overlay-btn"><i class="fab fa-github"></i></a>` : ''}
                    </div>
                </div>`
            : `<div class="project-placeholder"><i class="fas fa-project-diagram"></i></div>`;

        const techTags = project.tech_stack
            ? project.tech_stack.split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('')
            : '';

        return `
            <div class="project-card">
                ${imageHtml}
                <div class="project-info">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tech">${techTags}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderCertificates(certs) {
    const grid = document.getElementById('certificatesGrid');
    const empty = document.getElementById('certsEmpty');
    if (!certs.length) { grid.style.display = 'none'; empty.style.display = ''; return; }
    empty.style.display = 'none';
    grid.style.display = '';

    const INITIAL_LIMIT = 3;
    let showingAll = false;

    function buildCertHtml(cert) {
        let actions = '';
        if (cert.pdf_url) {
            actions += `<button onclick="event.stopPropagation(); openPdfModal('${cert.pdf_url}', '${cert.title.replace(/'/g, "\\'")}')" class="cert-action-btn view-pdf"><i class="fas fa-expand"></i> Full View</button>`;
        }
        if (cert.credential_url) {
            actions += `<a href="${cert.credential_url}" target="_blank" onclick="event.stopPropagation()" class="cert-action-btn verify"><i class="fas fa-external-link-alt"></i> Verify</a>`;
        }
        if (!cert.pdf_url && !cert.credential_url && cert.image_url) {
            actions += `<button onclick="event.stopPropagation(); openLightbox('${cert.image_url}')" class="cert-action-btn view-pdf"><i class="fas fa-expand"></i> View</button>`;
        }

        let imageHtml = '';
        if (cert.image_url) {
            imageHtml = `<div class="cert-image-wrapper" onclick="openLightbox('${cert.image_url}')">
                    <img src="${cert.image_url}" alt="${cert.title}" class="cert-image" loading="lazy">
                    <div class="cert-badge"><i class="fas fa-award"></i></div>
                </div>`;
        } else if (cert.pdf_url) {
            imageHtml = `<div class="cert-pdf-preview" onclick="openPdfModal('${cert.pdf_url}', '${cert.title.replace(/'/g, "\\'")}')">
                    <iframe src="${cert.pdf_url}#toolbar=0&navpanes=0&scrollbar=0" class="cert-pdf-frame" loading="lazy"></iframe>
                    <div class="cert-pdf-overlay">
                        <i class="fas fa-search-plus"></i>
                        <span>Click to expand</span>
                    </div>
                    <div class="cert-badge"><i class="fas fa-award"></i></div>
                </div>`;
        } else {
            imageHtml = `<div class="cert-placeholder"><i class="fas fa-certificate"></i></div>`;
        }

        return `
            <div class="cert-card">
                ${imageHtml}
                <div class="cert-info">
                    <h3 class="cert-title">${cert.title}</h3>
                    <p class="cert-issuer">${cert.issuer}</p>
                    <p class="cert-date">${cert.date_obtained}</p>
                    ${actions ? `<div class="cert-actions">${actions}</div>` : ''}
                </div>
            </div>
        `;
    }

    function renderList() {
        const visible = showingAll ? certs : certs.slice(0, INITIAL_LIMIT);
        grid.innerHTML = visible.map(buildCertHtml).join('');
    }

    renderList();

    let toggleBtn = document.getElementById('certToggleBtn');
    if (toggleBtn) toggleBtn.remove();

    if (certs.length > INITIAL_LIMIT) {
        const btnWrapper = document.createElement('div');
        btnWrapper.id = 'certToggleBtn';
        btnWrapper.style.textAlign = 'center';
        btnWrapper.style.marginTop = '32px';
        btnWrapper.innerHTML = `
            <button class="btn btn-outline" id="viewMoreCerts">
                <span>View All ${certs.length} Certificates</span>
                <i class="fas fa-chevron-down"></i>
            </button>
        `;
        grid.parentElement.insertBefore(btnWrapper, grid.nextSibling);

        document.getElementById('viewMoreCerts').addEventListener('click', function() {
            showingAll = !showingAll;
            renderList();
            this.innerHTML = showingAll
                ? '<span>Show Less</span><i class="fas fa-chevron-up"></i>'
                : `<span>View All ${certs.length} Certificates</span><i class="fas fa-chevron-down"></i>`;
        });
    }
}

function renderVideos(videos) {
    const grid = document.getElementById('videosGrid');
    const empty = document.getElementById('videosEmpty');

    if (!videos.length) {
        grid.style.display = 'none';
        empty.style.display = '';
        return;
    }

    empty.style.display = 'none';
    grid.style.display = '';
    grid.innerHTML = videos.map(video => {
        let thumbHtml;
        if (video.thumbnail_url) {
            thumbHtml = `<div class="video-thumbnail-wrapper"><img src="${video.thumbnail_url}" class="video-thumbnail" loading="lazy"><div class="video-play-btn"><i class="fas fa-play"></i></div></div>`;
        } else if (video.video_type === 'youtube') {
            const videoId = extractYouTubeId(video.video_url);
            thumbHtml = `<div class="video-thumbnail-wrapper"><img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" class="video-thumbnail" loading="lazy"><div class="video-play-btn"><i class="fas fa-play"></i></div></div>`;
        } else {
            thumbHtml = `<div class="video-thumb-placeholder"><i class="fas fa-video"></i><div class="video-play-btn"><i class="fas fa-play"></i></div></div>`;
        }
        return `
            <div class="video-card" onclick="openVideoModal('${video.video_url}', '${video.video_type}')">
                ${thumbHtml}
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">${video.description || ''}</p>
                </div>
            </div>
        `;
    }).join('');
}

async function loadData() {
    try {
        const profile = await fetch('/api/profile').then(r => r.json());

        const name = profile.name || 'Akshay Poojary';
        document.getElementById('heroName').textContent = name;
        document.getElementById('navName').textContent = name.split(' ')[0];
        document.getElementById('footerName').textContent = name.split(' ')[0];
        document.title = `${name} | Full Stack Developer`;

        const bio = profile.bio || 'Akshay is a full stack developer with 1+ years of hands-on experience building both client-facing and internal products across SAP and open-source ecosystems. He has worked on enterprise SAP applications, AI-enabled platforms, modern web interfaces, and scalable backend systems. He enjoys solving real business problems through clean architecture, practical engineering, and continuous learning.';
        document.getElementById('heroBio').textContent = bio;
        document.getElementById('aboutBio').textContent = bio;

        if (profile.title) document.getElementById('aboutTitle').textContent = profile.title;
        if (profile.location) document.getElementById('aboutLocation').textContent = profile.location;
        if (profile.availability !== 'open') document.getElementById('availabilityBadge').style.display = 'none';

        if (profile.avatar_url) {
            document.getElementById('heroAvatar').src = profile.avatar_url;
            document.getElementById('heroAvatar').style.display = '';
            document.getElementById('avatarPlaceholder').style.display = 'none';
        }

        const roles = [
            profile.title || 'Full Stack Developer',
            'SAP UI5 Developer',
            'Backend Engineer',
            'Solution Engineer'
        ];
        new TypeWriter(document.getElementById('typedText'), roles, 2500);

        const [projects, certificates, videos, skills, experience] = await Promise.all([
            fetch('/api/projects').then(r => r.json()).catch(() => []),
            fetch('/api/certificates').then(r => r.json()).catch(() => []),
            fetch('/api/videos').then(r => r.json()).catch(() => []),
            fetch('/api/skills').then(r => r.json()).catch(() => []),
            fetch('/api/experience').then(r => r.json()).catch(() => [])
        ]);

        renderSkills(skills);
        renderExperience(experience);
        renderProjects(projects);
        renderCertificates(certificates);
        renderVideos(videos);

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(document.getElementById('statProjects'), projects.length || 4, '+');
                    animateCounter(document.getElementById('statCerts'), certificates.length || 8, '+');
                    document.getElementById('statYears').textContent = '1+';
                    statsObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(document.getElementById('heroStats'));
        setupReveal();
        fetch('/api/track-visit', { method: 'POST' });

    } catch (err) {
        console.error('Error loading data:', err);
        new TypeWriter(document.getElementById('typedText'), ['Full Stack Developer', 'SAP UI5 Developer', 'Backend Engineer', 'Solution Engineer'], 2500);
        renderSkills([]);
        renderExperience([]);
        renderProjects([]);
        setupReveal();
    }
}

document.getElementById('currentYear').textContent = new Date().getFullYear();
loadData();

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        lightbox.classList.remove('active');
        closeVideoModal();
        closePdfModal();
        document.body.style.overflow = '';
    }
});

let chatHistory = [];
let isChatOpen = false;

function toggleChat() {
    isChatOpen = !isChatOpen;
    const win = document.getElementById('chatbotWindow');
    document.getElementById('chatIcon').style.display = isChatOpen ? 'none' : 'block';
    document.getElementById('chatCloseIcon').style.display = isChatOpen ? 'block' : 'none';
    document.getElementById('chatNotification').style.display = 'none';
    if (isChatOpen) {
        win.classList.add('open');
        document.getElementById('chatInput').focus();
    } else {
        win.classList.remove('open');
    }
}

document.getElementById('chatbotToggle').addEventListener('click', toggleChat);

function handleChatKeyPress(event) {
    if (event.key === 'Enter') sendChatMessage();
}

function sendSuggestion(text) {
    document.getElementById('chatInput').value = text;
    sendChatMessage();
}

function addMessage(content, role) {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    div.innerHTML = `
        <div class="msg-avatar"><i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'}"></i></div>
        <div class="msg-bubble">${formatMessage(content)}</div>
    `;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function formatMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^• (.*$)/gm, '<li>$1</li>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/(<li>[\s\S]*<\/li>)/g, '<ul>$1</ul>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^(.+)$/, '<p>$1</p>');
}

function addTypingIndicator() {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-message bot';
    div.id = 'typingIndicator';
    div.innerHTML = `<div class="msg-avatar"><i class="fas fa-robot"></i></div><div class="msg-bubble chat-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const message = input.value.trim();
    if (!message) return;

    const suggestions = document.querySelector('.chat-suggestions');
    if (suggestions) suggestions.remove();

    addMessage(message, 'user');
    chatHistory.push({ role: 'user', content: message });
    input.value = '';
    sendBtn.disabled = true;
    addTypingIndicator();

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: chatHistory.slice(-8) })
        });
        const data = await res.json();
        removeTypingIndicator();
        if (data.response) {
            addMessage(data.response, 'bot');
            chatHistory.push({ role: 'assistant', content: data.response });
        }
    } catch {
        removeTypingIndicator();
        addMessage('Connection error. Please try again or contact Akshay at apooj56@gmail.com', 'bot');
    }

    sendBtn.disabled = false;
    input.focus();
}

setTimeout(() => {
    if (!isChatOpen) {
        document.getElementById('chatNotification').style.display = 'flex';
    }
}, 4000);

const STORY_SCENES = [
    {
        emoji: '👋',
        year: 'WHO AM I',
        title: "Hi, I'm Akshay Poojary",
        subtitle: "A Full Stack Developer from Bengaluru, India passionate about building impactful digital products.",
        highlights: ['📍 Bengaluru', '💼 Open to Opportunities', '🎯 1+ Years Experience']
    },
    {
        emoji: '🎓',
        year: '2019 – 2023',
        title: "The Foundation",
        subtitle: "Completed my Bachelor of Engineering in Computer Science from Mangalore Institute of Technology and Engineering (MITE) — where my journey with code began.",
        highlights: ['BE — Computer Science', 'MITE Mangalore', 'Karnataka']
    },
    {
        emoji: '🏔️',
        year: '2024 – 2025',
        title: "Level Up at IIT Mandi",
        subtitle: "Earned a Minor Degree in Computer Science from IIT Mandi — an intensive 1-year program deepening my expertise in advanced CS concepts.",
        highlights: ['IIT Mandi', 'Minor Degree', 'Advanced CSE']
    },
    {
        emoji: '💼',
        year: 'JUN 2023 — PRESENT',
        title: "Building at VASPP",
        subtitle: "Currently a Full Stack Developer at VASPP — building enterprise SAP applications and modern AI-powered platforms across two very different technology worlds.",
        highlights: ['SAP UI5 Developer', 'Backend Engineer', 'Solution Engineer']
    },
    {
        emoji: '🚀',
        year: 'PROJECTS',
        title: "4 Products Shipped",
        subtitle: "From enterprise SAP dashboards to AI-powered HR systems and RSA-encrypted IoT backends — I take complete ownership from requirement to deployment.",
        highlights: ['MDM Dashboard 🟢 Live', 'CDM Portal 🟢 Live', 'AI HR System ✅ Completed', 'IoT Backend 🔵 In Progress']
    },
    {
        emoji: '⚡',
        year: 'MY STACK',
        title: "Two Worlds, One Engineer",
        subtitle: "I bridge enterprise SAP technologies with modern open-source full-stack development — a rare combination that lets me solve any business problem end-to-end.",
        highlights: ['SAP UI5 / Fiori', 'FastAPI / Python', 'React / Next.js', 'Gemini AI', 'Docker / Cloud', 'PostgreSQL']
    },
    {
        emoji: '🎯',
        year: 'WHAT NEXT',
        title: "Let's Build Something Great",
        subtitle: "I'm actively exploring roles where I can grow, contribute, and make a real impact. If you liked my story — let's connect.",
        highlights: [ '📅 3 Month Notice', '🌍 Bangalore / Remote'],
        isFinal: true
    }
];

let currentScene = 0;
let storyTimer = null;
let progressTimer = null;
const SCENE_DURATION = 6500;

function skipWelcome() {
    const overlay = document.getElementById('welcomeOverlay');
    overlay.style.animation = 'welcomeFadeIn 0.4s ease reverse';
    setTimeout(() => {
        overlay.classList.add('hidden');
        localStorage.setItem('welcomeSeen', 'true');
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, 400);
}

function openChatFromWelcome() {
    const overlay = document.getElementById('welcomeOverlay');
    overlay.style.animation = 'welcomeFadeIn 0.4s ease reverse';
    setTimeout(() => {
        overlay.classList.add('hidden');
        localStorage.setItem('welcomeSeen', 'true');
        window.scrollTo({ top: 0, behavior: 'instant' });
        setTimeout(() => {
            if (!isChatOpen) toggleChat();
        }, 300);
    }, 400);
}

function playStory() {
    const overlay = document.getElementById('welcomeOverlay');
    overlay.classList.add('hidden');
    localStorage.setItem('welcomeSeen', 'true');
    window.scrollTo({ top: 0, behavior: 'instant' });
    const storyOverlay = document.getElementById('storyOverlay');
    storyOverlay.classList.add('active');
    currentScene = 0;
    showScene();
}

function showScene() {
    if (currentScene >= STORY_SCENES.length) {
        closeStory();
        return;
    }

    const scene = STORY_SCENES[currentScene];
    const sceneEl = document.getElementById('storyScene');
    const progressBar = document.getElementById('storyProgressBar');

    const highlightsHtml = scene.highlights.map(h => `<span class="scene-highlight">${h}</span>`).join('');

    let finalActionsHtml = '';
    if (scene.isFinal) {
        finalActionsHtml = `
            <div class="scene-final-actions">
                <button class="scene-action-btn primary" onclick="closeStoryAndChat()">
                    <i class="fas fa-comments"></i> Chat with Me
                </button>
                <a href="#contact" class="scene-action-btn secondary" onclick="closeStory()">
                    <i class="fas fa-envelope"></i> Contact Me
                </a>
                <a href="mailto:apooj56@gmail.com" class="scene-action-btn secondary">
                    <i class="fas fa-paper-plane"></i> Email Directly
                </a>
            </div>
        `;
    }

    sceneEl.innerHTML = `
        <div class="scene-emoji">${scene.emoji}</div>
        <div class="scene-year">${scene.year}</div>
        <h2 class="scene-title">${scene.title}</h2>
        <p class="scene-subtitle">${scene.subtitle}</p>
        <div class="scene-highlights">${highlightsHtml}</div>
        ${finalActionsHtml}
    `;

    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';

    setTimeout(() => {
        progressBar.style.transition = `width ${SCENE_DURATION}ms linear`;
        progressBar.style.width = '100%';
    }, 50);

    clearTimeout(storyTimer);
    if (!scene.isFinal) {
        storyTimer = setTimeout(() => {
            currentScene++;
            showScene();
        }, SCENE_DURATION);
    }
}

function skipStory() {
    clearTimeout(storyTimer);
    currentScene++;
    showScene();
}

function closeStory() {
    clearTimeout(storyTimer);
    const overlay = document.getElementById('storyOverlay');
    overlay.classList.remove('active');
    currentScene = 0;
}

function closeStoryAndChat() {
    closeStory();
    setTimeout(() => {
        if (!isChatOpen) toggleChat();
    }, 400);
}

document.addEventListener('keydown', (e) => {
    const storyOverlay = document.getElementById('storyOverlay');
    if (storyOverlay && storyOverlay.classList.contains('active')) {
        if (e.key === 'Escape') closeStory();
        if (e.key === 'ArrowRight' || e.key === ' ') skipStory();
    }
});