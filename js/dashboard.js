// Dashboard Management System
class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.currentData = null;
        this.currentSection = 'personal';
        this.isSaving = false; // Add save lock
        this.init();
    }

    async init() {
        // Check authentication
        this.currentUser = AuthSystem.checkAuth();
        if (!this.currentUser) return;

        // Set username in UI
        document.getElementById('currentUsername').textContent = this.currentUser;
        
        // Set preview link
        document.getElementById('previewLink').href = `index.html?user=${this.currentUser}`;

        // Load user data
        await this.loadUserData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial section
        this.loadSection('personal');
    }

    async loadUserData() {
        try {
            const response = await fetch(`api/data.php?action=get&username=${this.currentUser}&t=${Date.now()}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentData = data.data;
                this.populateForms();
            } else {
                this.showAlert('Failed to load user data', 'danger');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showAlert('Error loading user data', 'danger');
        }
    }

    async saveUserData() {
        // Prevent multiple simultaneous saves
        if (this.isSaving) {
            console.log('Save already in progress, skipping...');
            return;
        }
        
        this.isSaving = true;
        
        try {
            // Show saving status
            this.showSaveStatus('saving');
            
            // Saving data for user
            
            const response = await fetch('api/data.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'save',
                    username: this.currentUser,
                    data: this.currentData
                })
            });

            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Response text:', responseText);
                this.showSaveStatus('error');
                this.showAlert('Server returned invalid JSON. Check console for details.', 'danger');
                return;
            }
            
            if (data.success) {
                this.showSaveStatus('saved');
                this.showAlert('Data saved successfully!', 'success');
            } else {
                this.showSaveStatus('error');
                this.showAlert('Failed to save data: ' + (data.message || 'Unknown error'), 'danger');
            }
        } catch (error) {
            console.error('Error saving user data:', error);
            this.showSaveStatus('error');
            this.showAlert('Error saving data: ' + error.message, 'danger');
        } finally {
            // Always unlock the save function
            this.isSaving = false;
        }
    }

    showSaveStatus(status) {
        const saveStatus = document.getElementById('saveStatus');
        const savingStatus = document.getElementById('savingStatus');
        
        // Hide all status indicators
        saveStatus.style.display = 'none';
        savingStatus.style.display = 'none';
        
        switch (status) {
            case 'saving':
                savingStatus.style.display = 'inline-block';
                break;
            case 'saved':
                saveStatus.style.display = 'inline-block';
                // Hide after 3 seconds
                setTimeout(() => {
                    saveStatus.style.display = 'none';
                }, 3000);
                break;
            case 'error':
                // Error status is handled by alerts
                break;
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.loadSection(section);
            });
        });

        // Save and Reset buttons
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.collectFormData();
            this.saveUserData();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.populateForms();
            this.showAlert('Form reset to saved data', 'info');
        });

        // Experience management
        document.getElementById('addExperienceBtn').addEventListener('click', () => {
            this.openExperienceModal();
        });

        // Volunteering management
        document.getElementById('addVolunteeringBtn').addEventListener('click', () => {
            this.openVolunteeringModal();
        });

        // Skills management
        document.getElementById('addTechnicalSkillBtn').addEventListener('click', () => {
            this.addSkill('technical');
        });

        document.getElementById('addTeachingSkillBtn').addEventListener('click', () => {
            this.addSkill('teaching');
        });

        document.getElementById('addLanguageSkillBtn').addEventListener('click', () => {
            this.addSkill('languages');
        });

        // Projects management
        document.getElementById('addElectronicsProjectBtn').addEventListener('click', () => {
            this.openProjectModal('electronics');
        });

        document.getElementById('addWebProjectBtn').addEventListener('click', () => {
            this.openProjectModal('web');
        });

        document.getElementById('addTrainingProjectBtn').addEventListener('click', () => {
            this.openProjectModal('trainings');
        });

        // Certificates management
        document.getElementById('addCertificateBtn').addEventListener('click', () => {
            this.openCertificateModal();
        });

        // File uploads
        document.getElementById('uploadImagesBtn').addEventListener('click', () => {
            this.uploadFiles('images');
        });

        document.getElementById('uploadDocumentsBtn').addEventListener('click', () => {
            this.uploadFiles('documents');
        });

        // CV upload
        document.getElementById('uploadCVBtn').addEventListener('click', () => {
            this.uploadCV();
        });

        // Modal save buttons
        document.getElementById('saveExperienceBtn').addEventListener('click', () => {
            this.saveExperience();
        });

        document.getElementById('saveVolunteeringBtn').addEventListener('click', () => {
            this.saveVolunteering();
        });

        document.getElementById('saveProjectBtn').addEventListener('click', () => {
            this.saveProject();
        });

        document.getElementById('saveCertificateBtn').addEventListener('click', () => {
            this.saveCertificate();
        });

        // Auto-save functionality
        this.setupAutoSave();
        
        // Theme functionality
        this.setupThemeListeners();
    }

    loadSection(section) {
        // Update navigation
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.style.display = 'none';
        });

        // Show selected section
        document.getElementById(`${section}-section`).style.display = 'block';

        // Update title
        const titles = {
            personal: 'Personal Information',
            education: 'Education',
            experience: 'Experience',
            volunteering: 'Volunteering & Leadership',
            skills: 'Skills',
            projects: 'Projects',
            certificates: 'Certificates',
            media: 'Media Manager',
            social: 'Social Media Links',
            theme: 'Choose Your Theme',
            account: 'Account Settings'
        };
        document.getElementById('sectionTitle').textContent = titles[section];

        this.currentSection = section;

        // Load section-specific data
        this.loadSectionData(section);
    }

    loadSectionData(section) {
        switch (section) {
            case 'experience':
                this.loadExperienceList();
                break;
            case 'volunteering':
                this.loadVolunteeringList();
                break;
            case 'skills':
                this.loadSkillsList();
                break;
            case 'projects':
                this.loadProjectsList();
                break;
            case 'certificates':
                this.loadCertificatesList();
                break;
            case 'media':
                this.loadMediaList();
                break;
            case 'social':
                this.loadSocialData();
                break;
            case 'theme':
                this.loadThemeData();
                break;
            case 'account':
                this.loadAccountData();
                break;
        }
    }

    populateForms() {
        if (!this.currentData) return;

        // Personal information
        document.getElementById('personalName').value = this.currentData.personal?.name || '';
        document.getElementById('personalTitle').value = this.currentData.personal?.title || '';
        document.getElementById('personalLocation').value = this.currentData.personal?.location || '';
        document.getElementById('personalPhone').value = this.currentData.personal?.phone || '';
        document.getElementById('personalEmail').value = this.currentData.personal?.email || '';
        document.getElementById('personalObjective').value = this.currentData.personal?.objective || '';
        document.getElementById('personalCV').value = this.currentData.personal?.cv || '';

        // Education
        document.getElementById('educationDegree').value = this.currentData.education?.degree || '';
        document.getElementById('educationInstitution').value = this.currentData.education?.institution || '';
        document.getElementById('educationYear').value = this.currentData.education?.year || '';
    }

    collectFormData() {
        if (!this.currentData) {
            this.currentData = {
                personal: {},
                education: {},
                experience: [],
                volunteering: [],
                skills: { technical: [], teaching: [], languages: [] },
                projects: { electronics: [], web: [], trainings: [] },
                certificates: []
            };
        }

        // Personal information
        this.currentData.personal = {
            name: document.getElementById('personalName').value,
            title: document.getElementById('personalTitle').value,
            location: document.getElementById('personalLocation').value,
            phone: document.getElementById('personalPhone').value,
            email: document.getElementById('personalEmail').value,
            objective: document.getElementById('personalObjective').value,
            cv: document.getElementById('personalCV').value
        };

        // Education
        this.currentData.education = {
            degree: document.getElementById('educationDegree').value,
            institution: document.getElementById('educationInstitution').value,
            year: document.getElementById('educationYear').value
        };

        // Skills data is already managed by the skill management functions
        // No need to collect it here as it's handled separately

        // Form data collected successfully
    }

    // Experience Management
    loadExperienceList() {
        const container = document.getElementById('experienceList');
        container.innerHTML = '';

        if (!this.currentData.experience || this.currentData.experience.length === 0) {
            container.innerHTML = '<p class="text-muted">No experience entries yet. Click "Add Experience" to get started.</p>';
            return;
        }

        this.currentData.experience.forEach((exp, index) => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div class="list-item-header">
                    <h6 class="list-item-title">${exp.title}</h6>
                    <div class="list-item-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="dashboard.editExperience(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="dashboard.deleteExperience(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="text-muted">${exp.company} • ${exp.period}</div>
                <div class="mt-2">
                    ${Array.isArray(exp.description) ? 
                        `<ul class="mb-0"><li>${exp.description.join('</li><li>')}</li></ul>` : 
                        exp.description
                    }
                </div>
            `;
            container.appendChild(item);
        });
    }

    openExperienceModal(index = null) {
        const modal = new bootstrap.Modal(document.getElementById('experienceModal'));
        
        if (index !== null) {
            // Edit mode
            const exp = this.currentData.experience[index];
            document.getElementById('experienceIndex').value = index;
            document.getElementById('expTitle').value = exp.title;
            document.getElementById('expCompany').value = exp.company;
            document.getElementById('expPeriod').value = exp.period;
            document.getElementById('expDescription').value = Array.isArray(exp.description) ? 
                exp.description.join('\n') : exp.description;
        } else {
            // Add mode
            document.getElementById('experienceForm').reset();
            document.getElementById('experienceIndex').value = '';
        }
        
        modal.show();
    }

    saveExperience() {
        const index = document.getElementById('experienceIndex').value;
        const experience = {
            title: document.getElementById('expTitle').value,
            company: document.getElementById('expCompany').value,
            period: document.getElementById('expPeriod').value,
            description: document.getElementById('expDescription').value.split('\n').filter(line => line.trim())
        };

        if (!this.currentData.experience) {
            this.currentData.experience = [];
        }

        if (index === '') {
            // Add new
            this.currentData.experience.push(experience);
        } else {
            // Edit existing
            this.currentData.experience[index] = experience;
        }

        bootstrap.Modal.getInstance(document.getElementById('experienceModal')).hide();
        this.loadExperienceList();
        this.showAlert('Experience saved successfully!', 'success');
    }

    editExperience(index) {
        this.openExperienceModal(index);
    }

    deleteExperience(index) {
        if (confirm('Are you sure you want to delete this experience entry?')) {
            this.currentData.experience.splice(index, 1);
            this.loadExperienceList();
            this.showAlert('Experience deleted successfully!', 'success');
        }
    }

    // Volunteering Management
    loadVolunteeringList() {
        const container = document.getElementById('volunteeringList');
        container.innerHTML = '';

        if (!this.currentData.volunteering || this.currentData.volunteering.length === 0) {
            container.innerHTML = '<p class="text-muted">No volunteering entries yet. Click "Add Volunteering" to get started.</p>';
            return;
        }

        this.currentData.volunteering.forEach((vol, index) => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div class="list-item-header">
                    <h6 class="list-item-title">${vol.title}</h6>
                    <div class="list-item-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="dashboard.editVolunteering(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="dashboard.deleteVolunteering(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="text-muted">${vol.organization}</div>
                ${vol.role ? `<div class="text-muted">${vol.role}</div>` : ''}
                ${vol.achievements ? `<div class="mt-2"><ul class="mb-0"><li>${vol.achievements.join('</li><li>')}</li></ul></div>` : ''}
            `;
            container.appendChild(item);
        });
    }

    openVolunteeringModal(index = null) {
        const modal = new bootstrap.Modal(document.getElementById('volunteeringModal'));
        
        if (index !== null) {
            // Edit mode
            const vol = this.currentData.volunteering[index];
            document.getElementById('volIndex').value = index;
            document.getElementById('volTitle').value = vol.title;
            document.getElementById('volOrganization').value = vol.organization;
            document.getElementById('volRole').value = vol.role || '';
            document.getElementById('volAchievements').value = vol.achievements ? vol.achievements.join('\n') : '';
        } else {
            // Add mode
            document.getElementById('volunteeringForm').reset();
            document.getElementById('volIndex').value = '';
        }
        
        modal.show();
    }

    saveVolunteering() {
        const index = document.getElementById('volIndex').value;
        const volunteering = {
            title: document.getElementById('volTitle').value,
            organization: document.getElementById('volOrganization').value,
            role: document.getElementById('volRole').value,
            achievements: document.getElementById('volAchievements').value.split('\n').filter(line => line.trim())
        };

        if (!this.currentData.volunteering) {
            this.currentData.volunteering = [];
        }

        if (index === '') {
            // Add new
            this.currentData.volunteering.push(volunteering);
        } else {
            // Edit existing
            this.currentData.volunteering[index] = volunteering;
        }

        bootstrap.Modal.getInstance(document.getElementById('volunteeringModal')).hide();
        this.loadVolunteeringList();
        this.showAlert('Volunteering entry saved successfully!', 'success');
    }

    editVolunteering(index) {
        this.openVolunteeringModal(index);
    }

    deleteVolunteering(index) {
        if (confirm('Are you sure you want to delete this volunteering entry?')) {
            this.currentData.volunteering.splice(index, 1);
            this.loadVolunteeringList();
            this.showAlert('Volunteering entry deleted successfully!', 'success');
        }
    }

    // Skills Management
    loadSkillsList() {
        this.loadSkillCategory('technical', 'technicalSkillsList');
        this.loadSkillCategory('teaching', 'teachingSkillsList');
        this.loadSkillCategory('languages', 'languageSkillsList');
    }

    loadSkillCategory(category, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (!this.currentData.skills || !this.currentData.skills[category] || this.currentData.skills[category].length === 0) {
            container.innerHTML = '<p class="text-muted small">No skills added yet.</p>';
            return;
        }

        this.currentData.skills[category].forEach((skill, index) => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.innerHTML = `
                ${skill}
                <span class="remove-skill" onclick="dashboard.removeSkill('${category}', ${index})">&times;</span>
            `;
            container.appendChild(tag);
        });
    }

    addSkill(category) {
        // Handle special case for languages (singular in HTML)
        let inputId;
        if (category === 'languages') {
            inputId = 'newLanguageSkill';
        } else {
            inputId = `new${category.charAt(0).toUpperCase() + category.slice(1)}Skill`;
        }
        const input = document.getElementById(inputId);
        
        if (!input) {
            console.error(`Input element with id '${inputId}' not found`);
            return;
        }
        
        const skill = input.value.trim();

        if (!skill) return;

        if (!this.currentData.skills) {
            this.currentData.skills = { technical: [], teaching: [], languages: [] };
        }

        if (!this.currentData.skills[category]) {
            this.currentData.skills[category] = [];
        }

        this.currentData.skills[category].push(skill);
        input.value = '';
        
        // Map category names to container IDs
        const containerMap = {
            'technical': 'technicalSkillsList',
            'teaching': 'teachingSkillsList', 
            'languages': 'languageSkillsList'
        };
        
        this.loadSkillCategory(category, containerMap[category]);
        this.showAlert('Skill added successfully!', 'success');
    }

    removeSkill(category, index) {
        this.currentData.skills[category].splice(index, 1);
        
        // Map category names to container IDs
        const containerMap = {
            'technical': 'technicalSkillsList',
            'teaching': 'teachingSkillsList', 
            'languages': 'languageSkillsList'
        };
        
        this.loadSkillCategory(category, containerMap[category]);
        this.showAlert('Skill removed successfully!', 'success');
    }

    // Projects Management
    loadProjectsList() {
        this.loadProjectCategory('electronics', 'electronicsProjectsList');
        this.loadProjectCategory('web', 'webProjectsList');
        this.loadProjectCategory('trainings', 'trainingProjectsList');
    }

    loadProjectCategory(category, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        if (!this.currentData.projects || !this.currentData.projects[category] || this.currentData.projects[category].length === 0) {
            container.innerHTML = '<p class="text-muted small">No projects added yet.</p>';
            return;
        }

        this.currentData.projects[category].forEach((project, index) => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-card-header">
                    <h6 class="project-card-title">${project.name}</h6>
                    <span class="project-card-category">${category}</span>
                </div>
                <div class="project-card-description">${project.description}</div>
                <div class="project-card-technologies">
                    ${project.technologies ? project.technologies.map(tech => 
                        `<span class="technology-tag">${tech}</span>`
                    ).join('') : ''}
                </div>
                <div class="list-item-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="dashboard.editProject('${category}', ${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="dashboard.deleteProject('${category}', ${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    openProjectModal(category, index = null) {
        const modal = new bootstrap.Modal(document.getElementById('projectModal'));
        
        if (index !== null) {
            // Edit mode
            const project = this.currentData.projects[category][index];
            document.getElementById('projectIndex').value = index;
            document.getElementById('projectCategory').value = category;
            document.getElementById('projName').value = project.name || '';
            document.getElementById('projDescription').value = project.description || '';
            document.getElementById('projTechnologies').value = project.technologies ? project.technologies.join('\n') : '';
            document.getElementById('projFeatures').value = project.features || '';
            document.getElementById('projLiveUrl').value = project.liveUrl || '';
            document.getElementById('projRepoUrl').value = project.repoUrl || '';
            document.getElementById('projImages').value = project.images ? project.images.join('\n') : '';
            document.getElementById('projMedia').value = project.media ? project.media.join('\n') : '';
        } else {
            // Add mode
            document.getElementById('projectForm').reset();
            document.getElementById('projectIndex').value = '';
            document.getElementById('projectCategory').value = category;
        }
        
        modal.show();
    }

    saveProject() {
        const index = document.getElementById('projectIndex').value;
        const category = document.getElementById('projectCategory').value;
        
        // Parse technologies - handle both comma-separated and newline-separated
        const techText = document.getElementById('projTechnologies').value;
        const technologies = techText.split(/[,\n]/).map(t => t.trim()).filter(t => t);
        
        // Parse images - handle newline-separated paths
        const imagesText = document.getElementById('projImages').value;
        const images = imagesText.split('\n').map(i => i.trim()).filter(i => i);
        
        // Parse media files
        const mediaText = document.getElementById('projMedia').value;
        const media = mediaText.split('\n').map(m => m.trim()).filter(m => m);
        
        const project = {
            name: document.getElementById('projName').value,
            description: document.getElementById('projDescription').value,
            technologies: technologies,
            features: document.getElementById('projFeatures').value,
            liveUrl: document.getElementById('projLiveUrl').value,
            repoUrl: document.getElementById('projRepoUrl').value,
            images: images,
            media: media
        };

        if (!this.currentData.projects) {
            this.currentData.projects = { electronics: [], web: [], trainings: [] };
        }

        if (!this.currentData.projects[category]) {
            this.currentData.projects[category] = [];
        }

        if (index === '') {
            // Add new
            this.currentData.projects[category].push(project);
        } else {
            // Edit existing
            this.currentData.projects[category][index] = project;
        }

        bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
        this.loadProjectsList();
        this.showAlert('Project saved successfully!', 'success');
    }

    editProject(category, index) {
        this.openProjectModal(category, index);
    }

    deleteProject(category, index) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.currentData.projects[category].splice(index, 1);
            this.loadProjectsList();
            this.showAlert('Project deleted successfully!', 'success');
        }
    }

    // Certificates Management
    loadCertificatesList() {
        const container = document.getElementById('certificatesList');
        container.innerHTML = '';

        if (!this.currentData.certificates || this.currentData.certificates.length === 0) {
            container.innerHTML = '<p class="text-muted">No certificates added yet. Click "Add Certificate" to get started.</p>';
            return;
        }

        this.currentData.certificates.forEach((cert, index) => {
            const card = document.createElement('div');
            card.className = 'certificate-card';
            card.innerHTML = `
                <div class="certificate-card-header">
                    <h6 class="certificate-card-title">${cert.name}</h6>
                    <div class="list-item-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="dashboard.editCertificate(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="dashboard.deleteCertificate(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="certificate-card-issuer">${cert.issuer}</div>
                <div class="certificate-card-date">${cert.date}</div>
                <div class="mt-2">${cert.description}</div>
            `;
            container.appendChild(card);
        });
    }

    openCertificateModal(index = null) {
        const modal = new bootstrap.Modal(document.getElementById('certificateModal'));
        
        if (index !== null) {
            // Edit mode
            const cert = this.currentData.certificates[index];
            document.getElementById('certIndex').value = index;
            document.getElementById('certName').value = cert.name || '';
            document.getElementById('certIssuer').value = cert.issuer || '';
            document.getElementById('certDate').value = cert.date || '';
            document.getElementById('certDescription').value = cert.description || '';
            document.getElementById('certImage').value = cert.image || '';
            document.getElementById('certPdfUrl').value = cert.pdfUrl || '';
            document.getElementById('certCredentialId').value = cert.credentialId || '';
            document.getElementById('certVerifyUrl').value = cert.verifyUrl || '';
        } else {
            // Add mode
            document.getElementById('certificateForm').reset();
            document.getElementById('certIndex').value = '';
        }
        
        modal.show();
    }

    saveCertificate() {
        const index = document.getElementById('certIndex').value;
        
        const certificate = {
            name: document.getElementById('certName').value,
            issuer: document.getElementById('certIssuer').value,
            date: document.getElementById('certDate').value,
            description: document.getElementById('certDescription').value,
            image: document.getElementById('certImage').value,
            pdfUrl: document.getElementById('certPdfUrl').value,
            credentialId: document.getElementById('certCredentialId').value,
            verifyUrl: document.getElementById('certVerifyUrl').value
        };

        if (!this.currentData.certificates) {
            this.currentData.certificates = [];
        }

        if (index === '') {
            // Add new
            this.currentData.certificates.push(certificate);
        } else {
            // Edit existing
            this.currentData.certificates[index] = certificate;
        }

        bootstrap.Modal.getInstance(document.getElementById('certificateModal')).hide();
        this.loadCertificatesList();
        this.showAlert('Certificate saved successfully!', 'success');
    }

    editCertificate(index) {
        this.openCertificateModal(index);
    }

    deleteCertificate(index) {
        if (confirm('Are you sure you want to delete this certificate?')) {
            this.currentData.certificates.splice(index, 1);
            this.loadCertificatesList();
            this.showAlert('Certificate deleted successfully!', 'success');
        }
    }

    // Media Management
    async loadMediaList() {
        const container = document.getElementById('uploadedFilesList');
        container.innerHTML = '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

        try {
            const response = await fetch(`api/media.php?action=getFiles&username=${this.currentUser}`);
            const data = await response.json();
            
            if (data.success) {
                this.renderMediaList(data.files);
            } else {
                container.innerHTML = '<p class="text-muted">No files uploaded yet.</p>';
            }
        } catch (error) {
            console.error('Error loading media files:', error);
            container.innerHTML = '<p class="text-danger">Error loading files.</p>';
        }
    }

    renderMediaList(files) {
        const container = document.getElementById('uploadedFilesList');
        
        if (!files || files.length === 0) {
            container.innerHTML = '<p class="text-muted">No files uploaded yet. Use the upload forms above to add files.</p>';
            return;
        }

        const filesHtml = files.map(file => {
            const fileIcon = this.getFileIcon(file.type);
            const fileSize = this.formatFileSize(file.size);
            const filePath = `data/users/${this.currentUser}/${file.category}/${file.name}`;
            
            return `
                <div class="file-item">
                    <div class="file-item-info">
                        <i class="fas ${fileIcon} file-item-icon"></i>
                        <div>
                            <div class="file-item-name">${file.original_name}</div>
                            <small class="text-muted">${fileSize} • ${file.category}</small>
                        </div>
                    </div>
                    <div class="file-item-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="dashboard.copyFilePath('${filePath}')" title="Copy Path">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="dashboard.previewFile('${filePath}', '${file.type}')" title="Preview">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="dashboard.deleteFile('${file.name}', '${file.category}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = filesHtml;
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fa-image';
        if (fileType === 'application/pdf') return 'fa-file-pdf';
        if (fileType.includes('word')) return 'fa-file-word';
        if (fileType.includes('excel')) return 'fa-file-excel';
        if (fileType.includes('powerpoint')) return 'fa-file-powerpoint';
        return 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    copyFilePath(path) {
        navigator.clipboard.writeText(path).then(() => {
            this.showAlert('File path copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = path;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showAlert('File path copied to clipboard!', 'success');
        });
    }

    previewFile(path, type) {
        if (type.startsWith('image/')) {
            window.open(path, '_blank');
        } else if (type === 'application/pdf') {
            window.open(path, '_blank');
        } else {
            this.showAlert('Preview not available for this file type', 'info');
        }
    }

    async deleteFile(fileName, category) {
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            const response = await fetch('api/media.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'deleteFile',
                    username: this.currentUser,
                    fileName: fileName,
                    category: category
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showAlert('File deleted successfully!', 'success');
                this.loadMediaList();
            } else {
                this.showAlert('Failed to delete file: ' + data.message, 'danger');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            this.showAlert('Error deleting file', 'danger');
        }
    }

    async uploadFiles(type) {
        const inputId = type === 'images' ? 'imageUpload' : 'documentUpload';
        const input = document.getElementById(inputId);
        const files = input.files;

        if (files.length === 0) {
            this.showAlert('Please select files to upload', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('username', this.currentUser);
        formData.append('type', type);
        
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }

        try {
            const response = await fetch('api/upload.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                this.showAlert(`Successfully uploaded ${data.uploaded} files`, 'success');
                input.value = '';
                this.loadMediaList();
            } else {
                this.showAlert(data.message || 'Upload failed', 'danger');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showAlert('Upload failed', 'danger');
        }
    }

    async uploadCV() {
        // Create a file input element for CV upload
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('username', this.currentUser);
            formData.append('type', 'documents');
            formData.append('files[]', file);

            try {
                const response = await fetch('api/upload.php', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                
                if (data.success && data.files && data.files.length > 0) {
                    const uploadedFile = data.files[0];
                    const filePath = `data/users/${this.currentUser}/documents/${uploadedFile.saved_name}`;
                    
                    // Update the CV field with the uploaded file path
                    document.getElementById('personalCV').value = filePath;
                    this.showAlert('CV uploaded successfully! Path has been set automatically.', 'success');
                    this.loadMediaList();
                } else {
                    this.showAlert(data.message || 'CV upload failed', 'danger');
                }
            } catch (error) {
                console.error('CV upload error:', error);
                this.showAlert('CV upload failed', 'danger');
            }
        };
        
        input.click();
    }

    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.collectFormData();
            this.saveUserData();
        }, 30000);

        // Auto-save when user leaves the page
        window.addEventListener('beforeunload', () => {
            this.collectFormData();
            this.saveUserData();
        });

        // Auto-save on form field changes (with debouncing)
        const formFields = [
            'personalName', 'personalTitle', 'personalLocation', 'personalPhone', 'personalEmail', 
            'personalObjective', 'personalCV', 'educationDegree', 'educationInstitution', 'educationYear'
        ];

        let saveTimeout;
        formFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => {
                        this.collectFormData();
                        this.saveUserData();
                    }, 2000); // Save 2 seconds after user stops typing
                });
            }
        });
    }

    showAlert(message, type) {
        const alertContainer = document.getElementById('alertContainer');
        const alertId = 'alert-' + Date.now();
        
        const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        alertContainer.innerHTML = alertHtml;
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }

    // Theme functionality
    setupThemeListeners() {
        // Theme selection
        document.querySelectorAll('.theme-preview').forEach(preview => {
            preview.addEventListener('click', () => {
                this.selectTheme(preview.getAttribute('data-theme'));
            });
        });

        // Color input changes
        document.querySelectorAll('.color-input').forEach(input => {
            input.addEventListener('input', () => {
                this.updateCustomTheme();
            });
        });

        // Font select changes
        document.querySelectorAll('.font-select').forEach(select => {
            select.addEventListener('change', () => {
                this.updateCustomTheme();
            });
        });

        // Save theme button
        document.getElementById('saveThemeBtn').addEventListener('click', () => {
            this.saveTheme();
        });

        // Preview theme button
        document.getElementById('previewThemeBtn').addEventListener('click', () => {
            this.previewTheme();
        });

        // Reset theme button
        document.getElementById('resetThemeBtn').addEventListener('click', () => {
            this.resetTheme();
        });

        // Social links functionality
        document.getElementById('saveSocialBtn').addEventListener('click', () => {
            this.saveSocialLinks();
        });

        document.getElementById('previewSocialBtn').addEventListener('click', () => {
            this.previewSocialLinks();
        });

        // Social links input changes
        document.querySelectorAll('#social-section input[type="url"]').forEach(input => {
            input.addEventListener('input', () => {
                this.updateSocialPreview();
            });
        });

        // Account settings functionality
        document.getElementById('changePasswordBtn').addEventListener('click', () => {
            this.changePassword();
        });

        document.getElementById('deleteAccountBtn').addEventListener('click', () => {
            this.deleteAccount();
        });

        // Enable delete button when checkbox is checked
        document.getElementById('deleteConfirmCheck').addEventListener('change', (e) => {
            const deleteBtn = document.getElementById('deleteAccountBtn');
            const passwordField = document.getElementById('deleteConfirmPassword');
            deleteBtn.disabled = !e.target.checked || !passwordField.value;
        });

        // Enable delete button when password is entered
        document.getElementById('deleteConfirmPassword').addEventListener('input', (e) => {
            const deleteBtn = document.getElementById('deleteAccountBtn');
            const checkbox = document.getElementById('deleteConfirmCheck');
            deleteBtn.disabled = !checkbox.checked || !e.target.value;
        });

        // Mobile sidebar functionality
        this.setupMobileNavigation();
    }

    setupMobileNavigation() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        console.log('Mobile navigation setup:', { sidebarToggle, sidebar, sidebarOverlay });

        if (sidebarToggle && sidebar && sidebarOverlay) {
            // Toggle sidebar
            sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Sidebar toggle clicked');
                sidebar.classList.toggle('show');
                sidebarOverlay.classList.toggle('show');
                console.log('Sidebar classes:', sidebar.className);
            });

            // Close sidebar when overlay is clicked
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('show');
                sidebarOverlay.classList.remove('show');
            });

            // Close sidebar when nav link is clicked (on mobile)
            const navLinks = sidebar.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < 768) {
                        sidebar.classList.remove('show');
                        sidebarOverlay.classList.remove('show');
                    }
                });
            });

            // Close sidebar on window resize if screen becomes larger
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) {
                    sidebar.classList.remove('show');
                    sidebarOverlay.classList.remove('show');
                }
            });
        }
    }

    selectTheme(themeName) {
        // Remove active class from all theme previews
        document.querySelectorAll('.theme-preview').forEach(preview => {
            preview.classList.remove('active');
        });

        // Add active class to selected theme
        document.querySelector(`[data-theme="${themeName}"]`).classList.add('active');

        // Store selected theme
        this.selectedTheme = themeName;

        // Show/hide custom controls
        const customControls = document.getElementById('customThemeControls');
        if (themeName === 'custom') {
            customControls.style.display = 'block';
            this.updateCustomTheme();
        } else {
            customControls.style.display = 'none';
        }

        // Update preview card
        this.updateThemePreview(themeName);
    }

    updateThemePreview(themeName) {
        const previewCard = document.querySelector('.theme-preview-card');
        if (previewCard) {
            // Remove existing theme class
            previewCard.className = 'theme-preview-card';
            
            // Add new theme class
            previewCard.setAttribute('data-theme', themeName);
        }
    }

    previewTheme() {
        if (!this.selectedTheme) {
            this.showAlert('Please select a theme first', 'warning');
            return;
        }

        // Open portfolio in new tab with theme preview
        const previewUrl = `index.html?user=${this.currentUser}&theme=${this.selectedTheme}&preview=true`;
        window.open(previewUrl, '_blank');
    }

    async saveTheme() {
        if (!this.selectedTheme) {
            this.showAlert('Please select a theme first', 'warning');
            return;
        }

        try {
            // Update current data with theme
            if (!this.currentData.theme) {
                this.currentData.theme = {};
            }
            this.currentData.theme.name = this.selectedTheme;

            // If it's a custom theme, save the custom data
            if (this.selectedTheme === 'custom') {
                this.currentData.theme.custom = {
                    primaryColor: document.getElementById('primaryColor').value,
                    primaryHover: document.getElementById('primaryHover').value,
                    secondaryColor: document.getElementById('secondaryColor').value,
                    bgPrimary: document.getElementById('bgPrimary').value,
                    bgSecondary: document.getElementById('bgSecondary').value,
                    bgCard: document.getElementById('bgCard').value,
                    textPrimary: document.getElementById('textPrimary').value,
                    textSecondary: document.getElementById('textSecondary').value,
                    textHero: document.getElementById('textHero').value,
                    heroStart: document.getElementById('heroStart').value,
                    heroEnd: document.getElementById('heroEnd').value,
                    borderColor: document.getElementById('borderColor').value,
                    navbarBg: document.getElementById('navbarBg').value,
                    footerBg: document.getElementById('footerBg').value,
                    fontFamily: document.getElementById('fontFamily').value,
                    fontSize: document.getElementById('fontSize').value
                };
            }

            // Save to server
            const response = await fetch('api/data.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'save',
                    username: this.currentUser,
                    data: this.currentData
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showAlert('Theme saved successfully!', 'success');
            } else {
                this.showAlert('Failed to save theme: ' + result.message, 'danger');
            }
        } catch (error) {
            console.error('Error saving theme:', error);
            this.showAlert('Error saving theme', 'danger');
        }
    }

    loadThemeData() {
        // Load saved theme if exists
        if (this.currentData && this.currentData.theme && this.currentData.theme.name) {
            const savedTheme = this.currentData.theme.name;
            this.selectTheme(savedTheme);
            
            // Load custom theme data if it's a custom theme
            if (savedTheme === 'custom' && this.currentData.theme.custom) {
                this.loadCustomThemeData(this.currentData.theme.custom);
            }
        } else {
            // Default to default theme
            this.selectTheme('default');
        }
    }

    updateCustomTheme() {
        if (this.selectedTheme !== 'custom') return;

        // Get all color and font values
        const themeData = {
            primaryColor: document.getElementById('primaryColor').value,
            primaryHover: document.getElementById('primaryHover').value,
            secondaryColor: document.getElementById('secondaryColor').value,
            bgPrimary: document.getElementById('bgPrimary').value,
            bgSecondary: document.getElementById('bgSecondary').value,
            bgCard: document.getElementById('bgCard').value,
            textPrimary: document.getElementById('textPrimary').value,
            textSecondary: document.getElementById('textSecondary').value,
            textHero: document.getElementById('textHero').value,
            heroStart: document.getElementById('heroStart').value,
            heroEnd: document.getElementById('heroEnd').value,
            borderColor: document.getElementById('borderColor').value,
            navbarBg: document.getElementById('navbarBg').value,
            footerBg: document.getElementById('footerBg').value,
            fontFamily: document.getElementById('fontFamily').value,
            fontSize: document.getElementById('fontSize').value
        };

        // Apply theme to preview card
        this.applyCustomThemeToPreview(themeData);
    }

    applyCustomThemeToPreview(themeData) {
        const previewCard = document.getElementById('themePreviewCard');
        if (!previewCard) return;

        // Apply CSS custom properties to preview card
        previewCard.style.setProperty('--primary-color', themeData.primaryColor);
        previewCard.style.setProperty('--primary-hover', themeData.primaryHover);
        previewCard.style.setProperty('--secondary-color', themeData.secondaryColor);
        previewCard.style.setProperty('--bg-primary', themeData.bgPrimary);
        previewCard.style.setProperty('--bg-secondary', themeData.bgSecondary);
        previewCard.style.setProperty('--bg-card', themeData.bgCard);
        previewCard.style.setProperty('--text-primary', themeData.textPrimary);
        previewCard.style.setProperty('--text-secondary', themeData.textSecondary);
        previewCard.style.setProperty('--text-hero', themeData.textHero);
        previewCard.style.setProperty('--bg-hero', `linear-gradient(135deg, ${themeData.heroStart} 0%, ${themeData.heroEnd} 100%)`);
        previewCard.style.setProperty('--border-color', themeData.borderColor);
        previewCard.style.setProperty('--bg-navbar', themeData.navbarBg);
        previewCard.style.setProperty('--bg-footer', themeData.footerBg);
        previewCard.style.setProperty('--font-family', themeData.fontFamily);
        previewCard.style.setProperty('--font-size-base', themeData.fontSize);

        // Apply theme class
        previewCard.setAttribute('data-theme', 'custom');
    }

    loadCustomThemeData(customData) {
        // Load custom theme data into form inputs
        if (customData.primaryColor) document.getElementById('primaryColor').value = customData.primaryColor;
        if (customData.primaryHover) document.getElementById('primaryHover').value = customData.primaryHover;
        if (customData.secondaryColor) document.getElementById('secondaryColor').value = customData.secondaryColor;
        if (customData.bgPrimary) document.getElementById('bgPrimary').value = customData.bgPrimary;
        if (customData.bgSecondary) document.getElementById('bgSecondary').value = customData.bgSecondary;
        if (customData.bgCard) document.getElementById('bgCard').value = customData.bgCard;
        if (customData.textPrimary) document.getElementById('textPrimary').value = customData.textPrimary;
        if (customData.textSecondary) document.getElementById('textSecondary').value = customData.textSecondary;
        if (customData.textHero) document.getElementById('textHero').value = customData.textHero;
        if (customData.heroStart) document.getElementById('heroStart').value = customData.heroStart;
        if (customData.heroEnd) document.getElementById('heroEnd').value = customData.heroEnd;
        if (customData.borderColor) document.getElementById('borderColor').value = customData.borderColor;
        if (customData.navbarBg) document.getElementById('navbarBg').value = customData.navbarBg;
        if (customData.footerBg) document.getElementById('footerBg').value = customData.footerBg;
        if (customData.fontFamily) document.getElementById('fontFamily').value = customData.fontFamily;
        if (customData.fontSize) document.getElementById('fontSize').value = customData.fontSize;

        // Update preview
        this.updateCustomTheme();
    }

    resetTheme() {
        // Reset to default values
        document.getElementById('primaryColor').value = '#007bff';
        document.getElementById('primaryHover').value = '#0056b3';
        document.getElementById('secondaryColor').value = '#6c757d';
        document.getElementById('bgPrimary').value = '#ffffff';
        document.getElementById('bgSecondary').value = '#f8f9fa';
        document.getElementById('bgCard').value = '#ffffff';
        document.getElementById('textPrimary').value = '#212529';
        document.getElementById('textSecondary').value = '#6c757d';
        document.getElementById('textHero').value = '#ffffff';
        document.getElementById('heroStart').value = '#667eea';
        document.getElementById('heroEnd').value = '#764ba2';
        document.getElementById('borderColor').value = '#dee2e6';
        document.getElementById('navbarBg').value = '#343a40';
        document.getElementById('footerBg').value = '#343a40';
        document.getElementById('fontFamily').value = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        document.getElementById('fontSize').value = '1rem';

        // Update preview
        this.updateCustomTheme();
    }

    // Social links functionality
    loadSocialData() {
        if (this.currentData && this.currentData.social) {
            const social = this.currentData.social;
            
            // Load Linktree URL
            if (social.linktree) {
                document.getElementById('linktreeUrl').value = social.linktree;
            }
            
            // Load individual social media links
            if (social.individual) {
                const individual = social.individual;
                if (individual.facebook) document.getElementById('facebookUrl').value = individual.facebook;
                if (individual.twitter) document.getElementById('twitterUrl').value = individual.twitter;
                if (individual.linkedin) document.getElementById('linkedinUrl').value = individual.linkedin;
                if (individual.instagram) document.getElementById('instagramUrl').value = individual.instagram;
                if (individual.github) document.getElementById('githubUrl').value = individual.github;
                if (individual.youtube) document.getElementById('youtubeUrl').value = individual.youtube;
                if (individual.behance) document.getElementById('behanceUrl').value = individual.behance;
                if (individual.dribbble) document.getElementById('dribbbleUrl').value = individual.dribbble;
            }
        }
        
        // Update preview
        this.updateSocialPreview();
    }

    updateSocialPreview() {
        const preview = document.getElementById('socialLinksPreview');
        if (!preview) return;

        const linktreeUrl = document.getElementById('linktreeUrl').value;
        const facebookUrl = document.getElementById('facebookUrl').value;
        const twitterUrl = document.getElementById('twitterUrl').value;
        const linkedinUrl = document.getElementById('linkedinUrl').value;
        const instagramUrl = document.getElementById('instagramUrl').value;
        const githubUrl = document.getElementById('githubUrl').value;
        const youtubeUrl = document.getElementById('youtubeUrl').value;
        const behanceUrl = document.getElementById('behanceUrl').value;
        const dribbbleUrl = document.getElementById('dribbbleUrl').value;

        let previewHtml = '';

        // Show Linktree if provided
        if (linktreeUrl) {
            previewHtml += `
                <div class="mb-3">
                    <a href="${linktreeUrl}" target="_blank" class="btn btn-info btn-sm">
                        <i class="fas fa-link me-2"></i>All Social Links (Linktree)
                    </a>
                </div>
            `;
        }

        // Show individual social links
        const socialLinks = [
            { url: facebookUrl, icon: 'fab fa-facebook', name: 'Facebook', color: 'primary' },
            { url: twitterUrl, icon: 'fab fa-twitter', name: 'Twitter', color: 'info' },
            { url: linkedinUrl, icon: 'fab fa-linkedin', name: 'LinkedIn', color: 'primary' },
            { url: instagramUrl, icon: 'fab fa-instagram', name: 'Instagram', color: 'danger' },
            { url: githubUrl, icon: 'fab fa-github', name: 'GitHub', color: 'dark' },
            { url: youtubeUrl, icon: 'fab fa-youtube', name: 'YouTube', color: 'danger' },
            { url: behanceUrl, icon: 'fab fa-behance', name: 'Behance', color: 'primary' },
            { url: dribbbleUrl, icon: 'fab fa-dribbble', name: 'Dribbble', color: 'danger' }
        ];

        const activeLinks = socialLinks.filter(link => link.url);
        
        if (activeLinks.length > 0) {
            previewHtml += '<div class="d-flex flex-wrap gap-2">';
            activeLinks.forEach(link => {
                previewHtml += `
                    <a href="${link.url}" target="_blank" class="btn btn-${link.color} btn-sm">
                        <i class="${link.icon} me-1"></i>${link.name}
                    </a>
                `;
            });
            previewHtml += '</div>';
        }

        if (!linktreeUrl && activeLinks.length === 0) {
            previewHtml = '<p class="text-muted">No social links added yet</p>';
        }

        preview.innerHTML = previewHtml;
    }

    async saveSocialLinks() {
        try {
            // Collect social links data
            const socialData = {
                linktree: document.getElementById('linktreeUrl').value,
                individual: {
                    facebook: document.getElementById('facebookUrl').value,
                    twitter: document.getElementById('twitterUrl').value,
                    linkedin: document.getElementById('linkedinUrl').value,
                    instagram: document.getElementById('instagramUrl').value,
                    github: document.getElementById('githubUrl').value,
                    youtube: document.getElementById('youtubeUrl').value,
                    behance: document.getElementById('behanceUrl').value,
                    dribbble: document.getElementById('dribbbleUrl').value
                }
            };

            // Remove empty values
            Object.keys(socialData.individual).forEach(key => {
                if (!socialData.individual[key]) {
                    delete socialData.individual[key];
                }
            });

            if (!socialData.linktree && Object.keys(socialData.individual).length === 0) {
                this.showAlert('Please add at least one social link', 'warning');
                return;
            }

            // Update current data
            this.currentData.social = socialData;

            // Save to server
            const response = await fetch('api/data.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'save',
                    username: this.currentUser,
                    data: this.currentData
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showAlert('Social links saved successfully!', 'success');
            } else {
                this.showAlert('Failed to save social links: ' + result.message, 'danger');
            }
        } catch (error) {
            console.error('Error saving social links:', error);
            this.showAlert('Error saving social links', 'danger');
        }
    }

    previewSocialLinks() {
        const previewUrl = `index.html?user=${this.currentUser}&preview=true`;
        window.open(previewUrl, '_blank');
    }

    // Account settings functionality
    loadAccountData() {
        // Display current username
        document.getElementById('currentUsernameDisplay').textContent = this.currentUser;
        
        // Set account creation date (you can modify this based on your user data structure)
        const createdDate = new Date().toLocaleDateString();
        document.getElementById('accountCreatedDate').textContent = createdDate;
        
        // Set last login date
        const lastLogin = new Date().toLocaleDateString();
        document.getElementById('lastLoginDate').textContent = lastLogin;
    }

    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showAlert('Please fill in all password fields', 'warning');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showAlert('New passwords do not match', 'danger');
            return;
        }

        if (newPassword.length < 6) {
            this.showAlert('New password must be at least 6 characters long', 'warning');
            return;
        }

        try {
            const response = await fetch('api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'changePassword',
                    username: this.currentUser,
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showAlert('Password changed successfully!', 'success');
                // Clear password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            } else {
                this.showAlert('Failed to change password: ' + result.message, 'danger');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showAlert('Error changing password', 'danger');
        }
    }

    async deleteAccount() {
        const password = document.getElementById('deleteConfirmPassword').value;
        const checkbox = document.getElementById('deleteConfirmCheck');

        if (!password) {
            this.showAlert('Please enter your password to confirm', 'warning');
            return;
        }

        if (!checkbox.checked) {
            this.showAlert('Please confirm that you understand the consequences', 'warning');
            return;
        }

        // Show final confirmation dialog
        const confirmed = confirm(
            'Are you absolutely sure you want to delete your account?\n\n' +
            'This action will:\n' +
            '• Permanently disable your account\n' +
            '• Remove your portfolio from public access\n' +
            '• Prevent you from logging in again\n\n' +
            'This action CANNOT be undone easily!\n\n' +
            'Click OK to proceed with account deletion.'
        );

        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch('api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'deleteAccount',
                    username: this.currentUser,
                    password: password
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showAlert('Account deleted successfully. You will be redirected to the login page.', 'success');
                
                // Clear localStorage and redirect after a delay
                setTimeout(() => {
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('userToken');
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                this.showAlert('Failed to delete account: ' + result.message, 'danger');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            this.showAlert('Error deleting account', 'danger');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardManager();
});
