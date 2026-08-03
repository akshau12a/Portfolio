let authToken = localStorage.getItem('admin_token') || '';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = '';

    try {
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        if (res.ok) {
            const data = await res.json();
            authToken = data.token;
            localStorage.setItem('admin_token', authToken);
            document.getElementById('loginView').style.display = 'none';
            document.getElementById('adminView').style.display = 'flex';
            loadAdminData();
        } else {
            errorEl.textContent = 'Invalid password. Please try again.';
            document.getElementById('loginPassword').value = '';
        }
    } catch {
        errorEl.textContent = 'Connection error. Please try again.';
    }
});

(async () => {
    if (!authToken) return;
    try {
        const res = await fetch('/api/admin/verify', { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (res.ok) {
            document.getElementById('loginView').style.display = 'none';
            document.getElementById('adminView').style.display = 'flex';
            loadAdminData();
        } else {
            localStorage.removeItem('admin_token');
            authToken = '';
        }
    } catch {}
})();

function getHeaders() {
    return { 'Authorization': `Bearer ${authToken}` };
}

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

function showFileName(input) {
    const fileNameEl = input.parentElement.querySelector('.file-name');
    if (fileNameEl && input.files.length) fileNameEl.textContent = input.files[0].name;
}

function showPage(pageName) {
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    document.getElementById(`page-${pageName}`).classList.add('active');
    const link = document.querySelector(`[data-page="${pageName}"]`);
    if (link) link.classList.add('active');
}

async function logout() {
    await fetch('/api/admin/logout', { method: 'POST', headers: getHeaders() });
    authToken = '';
    localStorage.removeItem('admin_token');
    location.reload();
}

document.getElementById('videoType').addEventListener('change', (e) => {
    document.getElementById('videoUrlGroup').style.display = e.target.value === 'upload' ? 'none' : '';
    document.getElementById('videoFileGroup').style.display = e.target.value === 'upload' ? '' : 'none';
});

async function loadAdminData() {
    try {
        const analytics = await fetch('/api/admin/analytics', { headers: getHeaders() }).then(r => r.json());
        document.getElementById('adminVisits').textContent = analytics.visits || 0;
        document.getElementById('adminDownloads').textContent = analytics.downloads || 0;
        document.getElementById('adminContacts').textContent = analytics.contacts || 0;
        renderMessages(analytics.recent_messages || [], 'recentMessages');
        renderMessages(analytics.recent_messages || [], 'adminMessagesList');

        const profile = await fetch('/api/profile').then(r => r.json());
        if (profile.name) document.getElementById('profileName').value = profile.name;
        if (profile.title) document.getElementById('profileTitle').value = profile.title;
        if (profile.bio) document.getElementById('profileBio').value = profile.bio;
        if (profile.location) document.getElementById('profileLocation').value = profile.location;
        if (profile.availability) document.getElementById('profileAvailability').value = profile.availability;
        if (profile.github) document.getElementById('profileGithub').value = profile.github;
        if (profile.linkedin) document.getElementById('profileLinkedin').value = profile.linkedin;

        await Promise.all([loadProjects(), loadCertificates(), loadVideos(), loadSkills(), loadExperience()]);
    } catch (err) {
        console.error('Admin load error:', err);
    }
}

function renderMessages(messages, containerId) {
    const container = document.getElementById(containerId);
    if (!messages.length) {
        container.innerHTML = '<p class="empty-msg">No messages yet.</p>';
        return;
    }
    container.innerHTML = messages.map(msg => `
        <div class="message-card">
            <div class="message-header">
                <span class="message-from">${msg.name}</span>
                <span class="message-type ${msg.request_type}">${(msg.request_type || 'general').replace('_', ' ')}</span>
            </div>
            <div class="message-email">${msg.email}</div>
            <div class="message-subject"><strong>Subject:</strong> ${msg.subject}</div>
            <div class="message-body">${msg.message}</div>
            <div class="message-date">${new Date(msg.created_at).toLocaleString()}</div>
        </div>
    `).join('');
}

async function loadProjects() {
    try {
        const projects = await fetch('/api/admin/projects', { headers: getHeaders() }).then(r => r.json());
        document.getElementById('adminProjectCount').textContent = projects.length;
        const list = document.getElementById('adminProjectsList');
        if (!projects.length) { list.innerHTML = '<p class="empty-msg">No projects added yet.</p>'; return; }
        list.innerHTML = projects.map(p => `
            <div class="admin-item ${!p.is_visible ? 'hidden-item' : ''}">
                ${p.image_url ? `<img src="${p.image_url}" class="admin-item-thumb" alt="">` : ''}
                <div class="admin-item-info">
                    <div class="admin-item-title">${p.title}</div>
                    <div class="admin-item-meta">${p.tech_stack || '—'} &bull; ${p.is_visible ? 'Visible' : 'Hidden'}</div>
                </div>
                <div class="admin-item-actions">
                    <button class="btn-toggle" onclick="toggleProject('${p.id}', ${!p.is_visible})" title="${p.is_visible ? 'Hide' : 'Show'}"><i class="fas fa-${p.is_visible ? 'eye-slash' : 'eye'}"></i></button>
                    <button class="btn-delete" onclick="deleteProject('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch { }
}

async function loadCertificates() {
    try {
        const certs = await fetch('/api/admin/certificates', { headers: getHeaders() }).then(r => r.json());
        const list = document.getElementById('adminCertsList');
        if (!certs.length) { list.innerHTML = '<p class="empty-msg">No certificates added yet.</p>'; return; }
        list.innerHTML = certs.map(c => `
            <div class="admin-item">
                ${c.image_url ? `<img src="${c.image_url}" class="admin-item-thumb" alt="">` : ''}
                <div class="admin-item-info">
                    <div class="admin-item-title">${c.title}</div>
                    <div class="admin-item-meta">${c.issuer} &bull; ${c.date_obtained} ${c.pdf_url ? '&bull; PDF attached' : ''}</div>
                </div>
                <div class="admin-item-actions">
                    <button class="btn-delete" onclick="deleteCertificate('${c.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch { }
}

async function loadVideos() {
    try {
        const videos = await fetch('/api/admin/videos', { headers: getHeaders() }).then(r => r.json());
        const list = document.getElementById('adminVideosList');
        if (!videos.length) { list.innerHTML = '<p class="empty-msg">No videos added yet.</p>'; return; }
        list.innerHTML = videos.map(v => `
            <div class="admin-item">
                <div class="admin-item-info">
                    <div class="admin-item-title">${v.title}</div>
                    <div class="admin-item-meta">${v.video_type} &bull; ${(v.video_url || 'Uploaded').substring(0, 50)}</div>
                </div>
                <div class="admin-item-actions">
                    <button class="btn-delete" onclick="deleteVideo('${v.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch { }
}

async function loadSkills() {
    try {
        const skills = await fetch('/api/skills').then(r => r.json());
        const list = document.getElementById('adminSkillsList');
        if (!skills.length) { list.innerHTML = '<p class="empty-msg">No skills added yet.</p>'; return; }
        list.innerHTML = skills.map(s => `
            <div class="admin-item">
                <div class="admin-item-info">
                    <div class="admin-item-title">${s.name}</div>
                    <div class="admin-item-meta">${s.category} &bull; ${s.proficiency}%</div>
                </div>
                <div class="admin-item-actions">
                    <button class="btn-delete" onclick="deleteSkill('${s.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch { }
}

async function loadExperience() {
    try {
        const exp = await fetch('/api/experience').then(r => r.json());
        const list = document.getElementById('adminExperienceList');
        if (!exp.length) { list.innerHTML = '<p class="empty-msg">No experience added yet.</p>'; return; }
        list.innerHTML = exp.map(e => `
            <div class="admin-item">
                <div class="admin-item-info">
                    <div class="admin-item-title">${e.company} — ${e.role}</div>
                    <div class="admin-item-meta">${e.start_date} — ${e.is_current ? 'Present' : (e.end_date || '—')}</div>
                </div>
                <div class="admin-item-actions">
                    <button class="btn-delete" onclick="deleteExperience('${e.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    } catch { }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('/api/admin/profile', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: new FormData(e.target)
        });
        if (res.ok) showToast('Profile updated!', 'success');
        else {
            const err = await res.json();
            showToast('Error: ' + (err.detail || 'Failed'), 'error');
        }
    } catch { showToast('Failed to update profile.', 'error'); }
});

document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('/api/admin/project', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: new FormData(e.target)
        });
        if (res.ok) {
            showToast('Project added!', 'success');
            e.target.reset();
            document.querySelectorAll('#projectForm .file-name').forEach(el => el.textContent = '');
            loadProjects();
        } else {
            const err = await res.json();
            showToast('Error: ' + (err.detail || 'Failed'), 'error');
        }
    } catch { showToast('Failed to add project.', 'error'); }
});

document.getElementById('certificateForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const res = await fetch('/api/admin/certificate', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });
        const result = await res.json();
        if (res.ok && result.success) {
            showToast('Certificate added!', 'success');
            e.target.reset();
            document.querySelectorAll('#certificateForm .file-name').forEach(el => el.textContent = '');
            loadCertificates();
        } else {
            showToast('Error: ' + (result.detail || 'Unknown error'), 'error');
            console.error('Certificate error:', result);
        }
    } catch (err) {
        showToast('Failed to add certificate. Check console.', 'error');
        console.error('Certificate upload error:', err);
    }
});
document.getElementById('videoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('/api/admin/video', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: new FormData(e.target)
        });
        if (res.ok) {
            showToast('Video added!', 'success');
            e.target.reset();
            document.querySelectorAll('#videoForm .file-name').forEach(el => el.textContent = '');
            loadVideos();
        } else {
            const err = await res.json();
            showToast('Error: ' + (err.detail || 'Failed'), 'error');
        }
    } catch { showToast('Failed to add video.', 'error'); }
});

document.getElementById('skillForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = { name: form.name.value, category: form.category.value, proficiency: parseInt(form.proficiency.value), icon: form.icon.value };
    try {
        const res = await fetch('/api/admin/skill', { method: 'POST', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (res.ok) { showToast('Skill added!', 'success'); form.reset(); form.proficiency.value = '80'; loadSkills(); }
        else throw new Error();
    } catch { showToast('Failed to add skill.', 'error'); }
});

document.getElementById('experienceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = { company: form.company.value, role: form.role.value, description: form.description.value, start_date: form.start_date.value, end_date: form.end_date.value || null, is_current: form.is_current.checked };
    try {
        const res = await fetch('/api/admin/experience', { method: 'POST', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (res.ok) { showToast('Experience added!', 'success'); form.reset(); loadExperience(); }
        else throw new Error();
    } catch { showToast('Failed to add experience.', 'error'); }
});

async function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/admin/project/${id}`, { method: 'DELETE', headers: getHeaders() });
    showToast('Project deleted.', 'info');
    loadProjects();
}

async function toggleProject(id, visible) {
    await fetch(`/api/admin/project/${id}`, { method: 'PATCH', headers: { ...getHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ is_visible: visible }) });
    showToast(visible ? 'Project is now visible.' : 'Project hidden.', 'info');
    loadProjects();
}

async function deleteCertificate(id) {
    if (!confirm('Delete this certificate?')) return;
    await fetch(`/api/admin/certificate/${id}`, { method: 'DELETE', headers: getHeaders() });
    showToast('Certificate deleted.', 'info');
    loadCertificates();
}

async function deleteVideo(id) {
    if (!confirm('Delete this video?')) return;
    await fetch(`/api/admin/video/${id}`, { method: 'DELETE', headers: getHeaders() });
    showToast('Video deleted.', 'info');
    loadVideos();
}

async function deleteSkill(id) {
    if (!confirm('Delete this skill?')) return;
    await fetch(`/api/admin/skill/${id}`, { method: 'DELETE', headers: getHeaders() });
    showToast('Skill deleted.', 'info');
    loadSkills();
}

async function deleteExperience(id) {
    if (!confirm('Delete this experience entry?')) return;
    await fetch(`/api/admin/experience/${id}`, { method: 'DELETE', headers: getHeaders() });
    showToast('Experience deleted.', 'info');
    loadExperience();
}