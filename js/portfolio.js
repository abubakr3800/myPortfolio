// Portfolio Data and Functionality
class Portfolio {
    constructor() {
        this.data = null;
        this.init();
    }

    async init() {
        try {
            await this.loadData();
            this.populateContent();
            this.setupEventListeners();
            this.setupSmoothScrolling();
            this.createParticles();
            this.setupScrollAnimations();
        } catch (error) {
            console.error('Error initializing portfolio:', error);
        }
    }

    async loadData() {
        try {
            // Get username from URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const username = urlParams.get('user');
            
            if (username) {
                // Load user-specific data with cache-busting
                const response = await fetch(`api/data.php?action=get&username=${username}&t=${Date.now()}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.success) {
                    this.data = result.data;
                } else {
                    throw new Error(result.message || 'Failed to load user data');
                }
            } else {
                // Load default data
                const response = await fetch('data/data.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.data = await response.json();
            }
        } catch (error) {
            console.error('Error loading portfolio data:', error);
            // Fallback data in case JSON loading fails
            this.data = this.getFallbackData();
        }
    }

    getFallbackData() {
        return {
            personal: {
                name: "Ahmed Mohamed Abubakr",
                title: "R&D Engineer | Electronics & Communications",
                location: "Giza, Egypt",
                phone: "01113284597",
                email: "ahmed.mo.abubakr@gmail.com",
                objective: "To obtain an R&D Engineer position where I can apply my academic background in electronics, hands-on experience in analog IC layout design, and practical skills in tools such as Cadence, Proteus, and Altium to contribute to innovation and development in electronic systems.",
                cv:"assets/cv/ahmed-mohamed-abubakr.pdf"
            },
            education: {
                degree: "Bachelor of Electronics and Communications Engineering",
                institution: "Sohag University | Faculty of engineering",
                year: "2023"
            },
            experience: [],
            volunteering: [],
            skills: {
                technical: ["Cadence", "Linux", "Python", "MATLAB/Simulink"],
                teaching: ["Curriculum development", "Student mentoring"],
                languages: ["Fluent English (written/spoken)"]
            },
            projects: {
                electronics: [],
                web: [],
                trainings: []
            }
        };
    }

    populateContent() {
        this.populateHero();
        this.populateAbout();
        this.populateExperience();
        this.populateVolunteering();
        this.populateProjects();
        this.populateSkills();
        this.populateCertificates();
        this.populateContact();
    }

    populateHero() {
        const { personal } = this.data;
        document.getElementById('hero-name').textContent = personal.name;
        document.getElementById('hero-objective').textContent = personal.objective;
        
        // Add typing effect to hero title - use personal title or generate from data
        let title = personal.title;
        
        // If no title is provided, try to generate one from available data
        if (!title) {
            title = this.generateTitleFromData();
        }
        
        // Set the title directly
        const heroTitleElement = document.getElementById('hero-title');
        if (heroTitleElement && title) {
            heroTitleElement.textContent = title;
        }
    }
    
    generateTitleFromData() {
        const { personal, education, experience } = this.data;
        
        // Try to extract profession from experience
        if (experience && experience.length > 0) {
            const latestJob = experience[0];
            if (latestJob.title) {
                return latestJob.title;
            }
        }
        
        // Try to extract from education
        if (education && education.degree) {
            const degree = education.degree.toLowerCase();
            if (degree.includes('engineering')) {
                return 'Engineer';
            } else if (degree.includes('computer')) {
                return 'Computer Scientist';
            } else if (degree.includes('design')) {
                return 'Designer';
            } else if (degree.includes('business')) {
                return 'Business Professional';
            }
        }
        
        // Default fallback
        return 'Professional';
    }

    typeWriter(elementId, text, speed) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Clear any existing typing animation
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        // Clean the text input
        const cleanText = text ? text.toString().trim() : '';
        if (!cleanText) {
            element.textContent = '';
            return;
        }
        
        // Typing effect starting
        
        element.innerHTML = '';
        let i = 0;
        
        const type = () => {
            if (i < cleanText.length) {
                element.innerHTML += cleanText.charAt(i);
                i++;
                this.typingTimeout = setTimeout(type, speed);
            } else {
                // Typing complete
                this.typingTimeout = null;
            }
        };
        
        // Start typing after a short delay
        this.typingTimeout = setTimeout(type, 500);
    }

    populateAbout() {
        const { personal, education } = this.data;
        
        // Education
        document.getElementById('education-degree').textContent = education.degree;
        document.getElementById('education-institution').textContent = education.institution;
        document.getElementById('education-year').textContent = education.year;
        
        // Contact Info
        document.getElementById('location').textContent = personal.location;
        document.getElementById('phone').textContent = personal.phone;
        document.getElementById('email').textContent = personal.email;
        if (personal.cv) {
            document.getElementById('cv-link').innerHTML = `<a href="${personal.cv}" target="_blank" class="btn btn-outline-light text-dark btn-sm mt-2"><i class="fas fa-file-pdf me-2"></i>Download CV</a>`;
        } else {
            document.getElementById('cv-link').innerHTML = '';
        }
    }

    populateExperience() {
        const container = document.getElementById('experience-container');
        const { experience } = this.data;

        experience.forEach((exp, index) => {
            const card = document.createElement('div');
            card.className = 'col-lg-6 col-md-12';
            card.style.animationDelay = `${index * 0.2}s`;
            card.innerHTML = `
                <div class="experience-card" data-aos="fade-up" data-aos-delay="${index * 200}">
                    <h4>${exp.title}</h4>
                    <div class="company">${exp.company}</div>
                    <div class="period">${exp.period}</div>
                    <ul>
                        ${exp.description.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `;
            container.appendChild(card);
        });
    }

    populateVolunteering() {
        const container = document.getElementById('volunteering-container');
        const { volunteering } = this.data;

        volunteering.forEach((vol, index) => {
            const card = document.createElement('div');
            card.className = 'col-lg-6 col-md-12';
            card.style.animationDelay = `${index * 0.2}s`;
            
            let achievementsHtml = '';
            if (vol.achievements) {
                achievementsHtml = `<ul>${vol.achievements.map(item => `<li>${item}</li>`).join('')}</ul>`;
            }

            card.innerHTML = `
                <div class="volunteering-card" data-aos="fade-up" data-aos-delay="${index * 200}">
                    <h4>${vol.title}</h4>
                    <div class="organization">${vol.organization}</div>
                    ${vol.role ? `<div class="role">${vol.role}</div>` : ''}
                    ${achievementsHtml}
                </div>
            `;
            container.appendChild(card);
        });
    }

    populateProjects() {
        const { projects } = this.data;
        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.innerHTML = '';

        // Combine all projects with their categories
        const allProjects = [
            ...projects.electronics.map(project => ({ ...project, category: 'electronics' })),
            ...projects.web.map(project => ({ ...project, category: 'web' })),
            ...projects.trainings.map(project => ({ ...project, category: 'trainings' }))
        ];

        // Create modern project cards
        allProjects.forEach((project, index) => {
            const card = this.createModernProjectCard(project, index);
            projectsGrid.appendChild(card);
        });

        // Initialize GLightbox for all project images
        if (window.GLightbox) {
            // Destroy any existing GLightbox instances
            if (window.currentLightbox) {
                window.currentLightbox.destroy();
            }
        }

        // Setup filter functionality
        setTimeout(() => {
            this.setupProjectFilters();
        }, 100);
    }

    createModernProjectCard(project, index) {
        const card = document.createElement('div');
        card.className = 'project-card-modern';
        card.setAttribute('data-category', project.category);
        card.style.animationDelay = `${index * 0.1}s`;

        const images = project.images || (project.image ? [project.image] : []);
        const mainImage = images[0] || '';

        // Create image container with overlay
        const imageContainer = `
            <div class="project-image-container">
                ${mainImage ? `<img src="${mainImage}" class="project-main-image" alt="${project.name}">` : ''}
                <div class="project-overlay">
                    <div class="project-overlay-buttons">
                        ${images.length > 1 ? `<button class="overlay-btn gallery-btn" data-gallery="project-${project.category}-${index}">
                            <i class="fas fa-images"></i> Gallery
                        </button>` : ''}
                        <button class="overlay-btn details-btn" data-project-index="${index}" data-project-category="${project.category}">
                            <i class="fas fa-info-circle"></i> Details
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Create technology badges
        const techBadges = project.technologies ? 
            project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('') : '';

        // Create project links
        const links = [];
        if (project.liveUrl) {
            links.push(`<a href="${project.liveUrl}" class="project-link-btn" target="_blank">
                <i class="fas fa-external-link-alt"></i> Live Demo
            </a>`);
        }
        if (project.repoUrl) {
            links.push(`<a href="${project.repoUrl}" class="project-link-btn" target="_blank">
                <i class="fab fa-github"></i> Source Code
            </a>`);
            console.log(project);
        }

        // Create gallery thumbnails
        const galleryThumbs = images.length > 1 ? `
            <div class="project-gallery-grid-modern">
                ${images.slice(0, 4).map((img, idx) => `
                    <img src="${img}" class="gallery-thumb-modern" data-gallery="project-${project.category}-${index}" alt="Gallery ${idx + 1}">
                `).join('')}
                ${images.length > 4 ? `<div class="gallery-thumb-modern" style="display: flex; align-items: center; justify-content: center; background: var(--gradient-1); color: white; font-weight: bold;">
                    +${images.length - 4}
                </div>` : ''}
            </div>
        ` : '';

        // Create project stats
        const stats = `
            <div class="project-stats">
                <div class="project-stat">
                    <span class="project-stat-number">${images.length}</span>
                    <span class="project-stat-label">Images</span>
                </div>
                <div class="project-stat">
                    <span class="project-stat-number">${project.technologies ? project.technologies.length : 0}</span>
                    <span class="project-stat-label">Technologies</span>
                </div>
                <div class="project-stat">
                    <span class="project-stat-number">${links.length}</span>
                    <span class="project-stat-label">Links</span>
                </div>
            </div>
        `;

        // Create description with read more functionality
        let description = project.description;
        let needsReadMore = false;
        let fullDescription = '';

        if (Array.isArray(description)) {
            fullDescription = `<ul class="custom-desc-list">${description.map(item => `<li><span class="custom-bullet"></span>${item}</li>`).join('')}</ul>`;
            if (description.length > 3) {
                description = `<ul class="custom-desc-list">${description.slice(0, 3).map(item => `<li><span class="custom-bullet"></span>${item}</li>`).join('')}</ul>`;
                needsReadMore = true;
            } else {
                description = fullDescription;
            }
        } else {
            const descWords = project.description.split(/\s+/);
            fullDescription = `<p>${project.description}</p>`;
            if (descWords.length > 20) {
                description = `<p>${descWords.slice(0, 20).join(' ')}...</p>`;
                needsReadMore = true;
            } else {
                description = `<p>${project.description}</p>`;
            }
        }

        if (needsReadMore) {
            description += `<button class="read-more-btn" data-full="${encodeURIComponent(fullDescription)}" data-project="${project.name}">Read More</button>`;
        }

        card.innerHTML = `
            ${imageContainer}
            <div class="project-content-modern">
                <h3 class="project-title-modern">${project.name}</h3>
                <div class="project-description-modern">${description}</div>
                ${techBadges ? `<div class="project-tech-stack">${techBadges}</div>` : ''}
                ${galleryThumbs}
                ${links.length > 0 ? `<div class="project-links-modern">${links.join('')}</div>` : ''}
                ${stats}
            </div>
        `;

        // Add event listeners for overlay buttons
        setTimeout(() => {
            // Gallery button
            const galleryBtn = card.querySelector('.gallery-btn');
            if (galleryBtn) {
                galleryBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Gallery button clicked for project:', project.name);
                    console.log('Images:', images);
                    
                    // Test if images exist
                    images.forEach((img, idx) => {
                        const testImg = new Image();
                        testImg.onload = () => console.log(`Image ${idx} loaded successfully:`, img);
                        testImg.onerror = () => console.log(`Image ${idx} failed to load:`, img);
                        testImg.src = img;
                    });
                    
                    // Create GLightbox gallery
                    const glightboxItems = images.map(img => ({
                        href: img,
                        type: 'image',
                        alt: `${project.name} - Image`
                    }));
                    
                    console.log('GLightbox items:', glightboxItems);
                    
                    if (window.GLightbox) {
                        console.log('GLightbox is available');
                        // Destroy any existing lightbox
                        if (window.currentLightbox) {
                            window.currentLightbox.destroy();
                        }
                        
                        const lightbox = GLightbox({
                            elements: glightboxItems,
                            touchNavigation: true,
                            keyboardNavigation: true,
                            closeOnOutsideClick: true,
                            draggable: true,
                            zoomable: true
                        });
                        
                        // Store the lightbox instance globally
                        window.currentLightbox = lightbox;
                        lightbox.open();
                    } else {
                        console.log('GLightbox not available, using fallback');
                        // Create a simple modal gallery
                        this.createSimpleGallery(images, project.name);
                    }
                });
            }

            // Details button
            const detailsBtn = card.querySelector('.details-btn');
            if (detailsBtn) {
                detailsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const readMoreBtn = card.querySelector('.read-more-btn');
                    if (readMoreBtn) {
                        readMoreBtn.click();
                    } else {
                        // If no read more button, show full description directly
                        const modal = document.getElementById('descModal');
                        document.getElementById('descModalLabel').textContent = project.name;
                        let fullDesc = '';
                        if (Array.isArray(project.description)) {
                            fullDesc = `<ul class="custom-desc-list">${project.description.map(item => `<li><span class="custom-bullet"></span>${item}</li>`).join('')}</ul>`;
                        } else {
                            fullDesc = `<p>${project.description}</p>`;
                        }
                        document.getElementById('descModalBody').innerHTML = fullDesc;
                        document.getElementById('descModalBody').classList.add('text-white');
                        new bootstrap.Modal(modal).show();
                    }
                });
            }

            // Read more button
            const readMoreBtn = card.querySelector('.read-more-btn');
            if (readMoreBtn) {
                readMoreBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const modal = document.getElementById('descModal');
                    document.getElementById('descModalLabel').textContent = readMoreBtn.getAttribute('data-project');
                    document.getElementById('descModalBody').innerHTML = decodeURIComponent(readMoreBtn.getAttribute('data-full'));
                    new bootstrap.Modal(modal).show();
                });
            }

            // Gallery thumbnails
            const galleryThumbs = card.querySelectorAll('.gallery-thumb-modern');
            galleryThumbs.forEach((thumb, idx) => {
                if (thumb.tagName === 'IMG') {
                    thumb.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Create GLightbox gallery starting from clicked image
                        const glightboxItems = images.map(img => ({
                            href: img,
                            type: 'image',
                            alt: `${project.name} - Image`
                        }));
                        
                        if (window.GLightbox) {
                            // Destroy any existing lightbox
                            if (window.currentLightbox) {
                                window.currentLightbox.destroy();
                            }
                            
                            const lightbox = GLightbox({
                                elements: glightboxItems,
                                startAt: idx,
                                touchNavigation: true,
                                keyboardNavigation: true,
                                closeOnOutsideClick: true,
                                draggable: true,
                                zoomable: true
                            });
                            
                            // Store the lightbox instance globally
                            window.currentLightbox = lightbox;
                            lightbox.open();
                        } else {
                            // Fallback: create simple gallery
                            this.createSimpleGallery(images, project.name);
                        }
                    });
                }
            });
        }, 0);

        return card;
    }

    setupProjectFilters() {
        const filterButtons = document.querySelectorAll('.project-filter-btn');
        const projectCards = document.querySelectorAll('.project-card-modern');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                const filter = button.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeInUp 0.6s ease forwards';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    createSimpleGallery(images, projectName) {
        // Create a simple modal gallery
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'simpleGalleryModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${projectName} - Gallery</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="gallery-container">
                            ${images.map((img, idx) => `
                                <div class="gallery-item mb-3">
                                    <img src="${img}" class="img-fluid rounded" alt="Gallery Image ${idx + 1}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('simpleGalleryModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Show modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // Remove modal from DOM after it's hidden
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    populateSkills() {
        const { skills } = this.data;
        
        // Technical Skills
        const technicalContainer = document.getElementById('technical-skills');
        skills.technical.forEach((skill, index) => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            skillItem.textContent = skill;
            skillItem.style.animationDelay = `${index * 0.1}s`;
            technicalContainer.appendChild(skillItem);
        });

        // Teaching Skills
        const teachingContainer = document.getElementById('teaching-skills');
        skills.teaching.forEach((skill, index) => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            skillItem.textContent = skill;
            skillItem.style.animationDelay = `${index * 0.1}s`;
            teachingContainer.appendChild(skillItem);
        });

        // Language Skills
        const languageContainer = document.getElementById('language-skills');
        skills.languages.forEach((skill, index) => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            skillItem.textContent = skill;
            skillItem.style.animationDelay = `${index * 0.1}s`;
            languageContainer.appendChild(skillItem);
        });
    }

    populateContact() {
        const { personal } = this.data;
        
        document.getElementById('contact-email').innerHTML = `<a class="text-secondary" href=mailto:${personal.email}>${personal.email}</a>`;
        document.getElementById('contact-phone').innerHTML = `<a class="text-secondary" href=tel:2${personal.phone}>${personal.phone}</a>`;
        document.getElementById('contact-location').textContent = personal.location;
    }

    populateCertificates() {
        const container = document.getElementById('certificates-container');
        const { certificates } = this.data;

        if (!certificates) return;

        certificates.forEach((cert, index) => {
            const card = document.createElement('div');
            card.className = 'col-lg-4 col-md-6 mt-5 mb-5';
            card.style.animationDelay = `${index * 0.2}s`;
            
            const pdfIndicator = cert.pdfUrl ? 
                `<div class="pdf-indicator">
                    <i class="fas fa-file-pdf"></i>
                </div>` : '';
            
            const pdfAvailable = cert.pdfUrl ? 
                '<small class="text-success"><i class="fas fa-check-circle mx-1"></i>PDF Available</small>' : 
                '<small class="text-muted"><i class="fas fa-info-circle mx-1"></i>Image Only</small>';
            
            card.innerHTML = `
                <div class="certificate-card" onclick="portfolio.openCertificateModal('${cert.name}')" data-aos="fade-up" data-aos-delay="${index * 200}">
                    ${pdfIndicator}
                    <img src="${cert.image}" alt="${cert.name}" class="certificate-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNlcnRpZmljYXRlPC90ZXh0Pjwvc3ZnPg=='">
                    <div class="certificate-content">
                        <h4>${cert.name}</h4>
                        <div class="issuer">${cert.issuer}</div>
                        <div class="date">${cert.date}</div>
                        ${pdfAvailable}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    setupEventListeners() {
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            } else {
                navbar.style.background = '#0f172a';
            }
        });

        // Contact form submission
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm();
            });
        }

        // Certificate modal triggers
        document.querySelectorAll('.certificate-card').forEach(card => {
            card.addEventListener('click', () => {
                const certificateName = card.querySelector('h4').textContent;
                this.openCertificateModal(certificateName);
            });
        });

        // Add hover effects to cards
        this.addHoverEffects();
    }

    setupSmoothScrolling() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        document.body.appendChild(particlesContainer);

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    setupScrollAnimations() {
        // Add scroll-triggered animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all cards and sections
        document.querySelectorAll('.about-card, .experience-card, .volunteering-card, .project-card-modern, .skills-card, .certificate-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }

    addHoverEffects() {
        // Add creative hover effects to cards
        document.querySelectorAll('.project-card-modern, .certificate-card, .experience-card, .volunteering-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }



    openProjectModal(category, projectName) {
        const { projects } = this.data;
        const projectList = category === 'electronics' ? projects.electronics : projects.web;
        const project = projectList.find(p => p.name === projectName);
        
        if (!project) return;

        // Populate modal
        document.getElementById('modal-title').textContent = project.name;
        document.getElementById('modal-description').innerHTML = `<p>${project.description}</p>`;
        
        // Technologies
        document.getElementById('modal-technologies').innerHTML = `
            <div class="technology-tags mb-3">
                ${project.technologies.map(tech => `<span class="technology-tag">${tech}</span>`).join('')}
            </div>
        `;

        // Images gallery with Venobox
        const images = project.images || (project.image ? [project.image] : []);
        let imagesHtml = '';
        if (images.length > 0) {
            imagesHtml = images.map((img, idx) => `
                <a class="venobox" data-gall="project-gallery" href="${img}">
                    <img src="${img}" class="img-fluid rounded mb-2" alt="Project Image ${idx + 1}">
                </a>
            `).join('');
        }
        document.getElementById('modal-images').innerHTML = imagesHtml;

        // Links (View Live, Source Code)
        let linksHtml = '';
        if (project.liveUrl) {
            linksHtml += `<a href="${project.liveUrl}" class="btn btn-primary mx-2 mb-2" target="_blank">View Live</a>`;
        }
        if (project.sourceUrl) {
            linksHtml += `<a href="${project.sourceUrl}" class="btn btn-outline-primary mb-2" target="_blank">Source Code</a>`;
        }
        document.getElementById('modal-links').innerHTML = linksHtml;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('projectModal'));
        modal.show();

        // Initialize Venobox for gallery
        setTimeout(() => {
            if (window.VenoBox) {
                new VenoBox({ selector: '.venobox' });
            }
        }, 200);
    }

    openCertificateModal(certificateName) {
        const { certificates } = this.data;
        const certificate = certificates.find(cert => cert.name === certificateName);
        if (!certificate) return;

        // Fill in the Bootstrap modal for certificates
        document.getElementById('certificateModalTitle').textContent = certificate.name;
        document.getElementById('certificateModalBody').innerHTML = `
            <div class="row">
                <div class="col-md-6 text-center mt-5 mb-5">
                    <img src="${certificate.image}" alt="${certificate.name}" class="img-fluid rounded mb-3 certificate-modal-image">
                </div>
                <div class="col-md-6 mt-5 mb-5">
                    <h6 class="text-primary mb-2">${certificate.issuer}</h6>
                    <p class="text-muted mb-3">${certificate.date}</p>
                    <p class="mb-3">${certificate.description}</p>
                    ${certificate.pdfUrl ? `
                        <div class="mt-3">
                            <a href="${certificate.pdfUrl}" target="_blank" class="btn btn-primary my-2">
                                <i class="fas fa-eye mx-2"></i>View Certificate
                            </a>
                            <a href="${certificate.pdfUrl}" download class="btn btn-outline-primary my-2">
                                <i class="fas fa-download mx-2"></i>Download PDF
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        // Show the Bootstrap modal
        const modal = new bootstrap.Modal(document.getElementById('certificateModal'));
        modal.show();
    }

    handleContactForm() {
        const form = document.getElementById('contact-form');
        const sendBtn = document.getElementById('send-btn');
        const sendText = document.getElementById('send-text');
        const sendLoading = document.getElementById('send-loading');
        const formMessage = document.getElementById('form-message');

        // Show loading state
        sendText.style.display = 'none';
        sendLoading.style.display = 'inline-block';
        sendBtn.disabled = true;
        formMessage.innerHTML = '';
        formMessage.className = '';

        const formData = new FormData(form);

        fetch('sendmail.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            sendText.style.display = 'inline';
            sendLoading.style.display = 'none';
            sendBtn.disabled = false;

            if (data.success) {
                formMessage.innerHTML = '<div class="form-message success">Message sent successfully! I\'ll get back to you soon.</div>';
                form.reset();
            } else {
                formMessage.innerHTML = '<div class="form-message error">Failed to send message. ' + (data.error || 'Please try again or contact me directly.') + '</div>';
            }
        })
        .catch(() => {
            sendText.style.display = 'inline';
            sendLoading.style.display = 'none';
            sendBtn.disabled = false;
            formMessage.innerHTML = '<div class="form-message error">Failed to send message. Please try again or contact me directly.</div>';
        });
    }
}

// Initialize portfolio when DOM is loaded (only if not in welcome page mode)
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're in welcome page mode (no user parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    
    // Only auto-initialize if we have a username parameter and portfolio content is visible
    if (username && document.getElementById('portfolio-content').style.display !== 'none') {
        // Don't auto-initialize here - let the user-specific loading handle it
        console.log('Portfolio will be initialized by user-specific loading');
    } else if (!username) {
        // This is the welcome page, don't initialize portfolio
        console.log('Welcome page mode - portfolio not initialized');
    }
});

// Add CSS animation for fadeIn
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style); 