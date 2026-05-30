/* ===========================
   STATE
=========================== */
let currentTemplate = 'classic';
let profileImageData = null;
let sidebarOpen = false;
let autoSaveTimer = null;
let currentMobileTab = 'editor';

const skills    = [];
const education = [];
const webinars  = [];
const work      = [];

/* ===========================
   TOAST NOTIFICATIONS
=========================== */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: 'fa-circle-check',
    info:    'fa-circle-info',
    error:   'fa-circle-xmark'
  };

  toast.innerHTML = `<i class="fas ${iconMap[type] || 'fa-circle-info'}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/* ===========================
   MOBILE TAB SWITCHING
=========================== */
function switchMobileTab(tab) {
  currentMobileTab = tab;
  const formPanel    = document.getElementById('formPanel');
  const previewPanel = document.getElementById('previewPanel');
  const tabEditor    = document.getElementById('tabEditor');
  const tabPreview   = document.getElementById('tabPreview');

  if (tab === 'editor') {
    formPanel.classList.remove('mobile-hidden');
    previewPanel.classList.remove('mobile-visible');
    tabEditor.classList.add('active');
    tabPreview.classList.remove('active');
  } else {
    formPanel.classList.add('mobile-hidden');
    previewPanel.classList.add('mobile-visible');
    tabEditor.classList.remove('active');
    tabPreview.classList.add('active');
    updatePreview();
  }
}

/* ===========================
   AUTO SAVE (localStorage)
=========================== */
const SAVE_KEY = 'resumecraft_v2_data';

function autoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    const data = {
      template: currentTemplate,
      image: profileImageData,
      fields: {
        fullName: val('fullName'), age: val('age'), dob: val('dob'),
        pob: val('pob'), sex: val('sex'), civilStatus: val('civilStatus'),
        citizenship: val('citizenship'), height: val('height'), weight: val('weight'),
        religion: val('religion'), language: val('language'),
        address: val('address'), phone: val('phone'), email: val('email'),
        objective: val('objective')
      },
      skills: skills.map(s => s.value),
      education: education.map(e => ({ school: e.school, year: e.year, description: e.description })),
      webinars: webinars.map(w => ({ title: w.title, date: w.date, institution: w.institution })),
      work: work.map(w => ({ company: w.company, title: w.title, year: w.year, description: w.description }))
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    updateAutosaveIndicator();
  }, 800);
}

function updateAutosaveIndicator() {
  const el = document.getElementById('autosaveIndicator');
  if (!el) return;
  el.innerHTML = '<i class="fas fa-circle-check"></i> Saved';
  el.style.color = 'var(--green)';
}

function restoreFromSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;

  let data;
  try { data = JSON.parse(raw); } catch { return false; }

  // Restore template
  if (data.template) currentTemplate = data.template;

  // Restore fields
  if (data.fields) {
    Object.entries(data.fields).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.value = value || '';
    });
  }

  // Restore image
  if (data.image) {
    profileImageData = data.image;
    const thumb = document.getElementById('imagePreviewThumb');
    const placeholder = document.getElementById('uploadPlaceholder');
    const removeBtn = document.getElementById('removeImageBtn');
    thumb.src = profileImageData;
    thumb.style.display = 'block';
    placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'flex';
  }

  // Restore dynamic lists
  if (data.skills && data.skills.length) {
    data.skills.forEach(v => addSkill(v));
  }
  if (data.education && data.education.length) {
    data.education.forEach(e => addEducation(e));
  }
  if (data.webinars && data.webinars.length) {
    data.webinars.forEach(w => addWebinar(w));
  }
  if (data.work && data.work.length) {
    data.work.forEach(w => addWork(w));
  }

  return true;
}

/* ===========================
   SIDEBAR TOGGLE
=========================== */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('sidebarOverlay');
  const body    = document.body;

  sidebarOpen = !sidebarOpen;

  if (sidebarOpen) {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    body.style.overflow = 'hidden';
  } else {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    body.style.overflow = '';
  }
}

/* ===========================
   INIT
=========================== */
window.addEventListener('DOMContentLoaded', () => {
  const restored = restoreFromSave();

  if (!restored) {
    addSkill();
    addEducation();
    addWork();
  }

  updatePreview();
  loadFeedback();
});

/* ===========================
   IMAGE UPLOAD
=========================== */
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showToast('Image too large. Max 5MB.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    profileImageData = e.target.result;

    const thumb       = document.getElementById('imagePreviewThumb');
    const placeholder = document.getElementById('uploadPlaceholder');
    const removeBtn   = document.getElementById('removeImageBtn');

    thumb.src = profileImageData;
    thumb.style.display = 'block';
    placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'flex';

    updatePreview();
    autoSave();
    showToast('Photo uploaded!', 'success');
  };
  reader.readAsDataURL(file);
}

function removeImage(event) {
  event.stopPropagation();
  profileImageData = null;

  const thumb       = document.getElementById('imagePreviewThumb');
  const placeholder = document.getElementById('uploadPlaceholder');
  const removeBtn   = document.getElementById('removeImageBtn');
  const input       = document.getElementById('profileImageInput');

  thumb.src = '';
  thumb.style.display = 'none';
  placeholder.style.display = 'flex';
  if (removeBtn) removeBtn.style.display = 'none';
  if (input) input.value = '';

  updatePreview();
  autoSave();
}

function handleDragOver(event) {
  event.preventDefault();
  document.getElementById('imageUploadZone').classList.add('drag-over');
}

function handleDrop(event) {
  event.preventDefault();
  const zone = document.getElementById('imageUploadZone');
  zone.classList.remove('drag-over');

  const file = event.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please drop an image file.', 'error');
    return;
  }

  // Simulate file input change
  const dt = new DataTransfer();
  dt.items.add(file);
  const input = document.getElementById('profileImageInput');
  input.files = dt.files;
  handleImageUpload({ target: input });
}

/* ===========================
   DYNAMIC SKILLS
=========================== */
function addSkill(value = '') {
  const id = Date.now() + Math.random();
  skills.push({ id, value });

  const container = document.getElementById('skillsList');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.id = `skill-${id}`;
  div.innerHTML = `
    <div class="skill-input-wrap">
      <input type="text" placeholder="e.g. JavaScript, Communication, Leadership"
        value="${escHtml(value)}"
        oninput="updateSkill(${id}, this.value); autoSave()" />
      <button class="btn-remove" onclick="removeSkill(${id})">✕</button>
    </div>
  `;
  container.appendChild(div);
}

function updateSkill(id, value) {
  const s = skills.find(s => s.id === id);
  if (s) s.value = value;
  updatePreview();
}

function removeSkill(id) {
  const idx = skills.findIndex(s => s.id === id);
  if (idx > -1) skills.splice(idx, 1);
  const el = document.getElementById(`skill-${id}`);
  if (el) el.remove();
  updatePreview(); autoSave();
}

/* ===========================
   DYNAMIC EDUCATION
=========================== */
function addEducation(data = {}) {
  const id = Date.now() + Math.random();
  education.push({ id, school: data.school || '', year: data.year || '', description: data.description || '' });

  const container = document.getElementById('educationList');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.id = `edu-${id}`;
  div.innerHTML = `
    <button class="btn-remove" onclick="removeEducation(${id})">✕</button>
    <div class="form-grid">
      <div class="form-group full">
        <label>School / University</label>
        <input type="text" placeholder="University of the Philippines"
          value="${escHtml(data.school || '')}"
          oninput="updateEducation(${id}, 'school', this.value); autoSave()"/>
      </div>
      <div class="form-group">
        <label>Year</label>
        <input type="text" placeholder="2016 – 2020"
          value="${escHtml(data.year || '')}"
          oninput="updateEducation(${id}, 'year', this.value); autoSave()"/>
      </div>
      <div class="form-group full">
        <label>Degree / Description</label>
        <input type="text" placeholder="BS Computer Science"
          value="${escHtml(data.description || '')}"
          oninput="updateEducation(${id}, 'description', this.value); autoSave()"/>
      </div>
    </div>
  `;
  container.appendChild(div);
}

function updateEducation(id, field, value) {
  const e = education.find(e => e.id === id);
  if (e) e[field] = value;
  updatePreview();
}

function removeEducation(id) {
  const idx = education.findIndex(e => e.id === id);
  if (idx > -1) education.splice(idx, 1);
  const el = document.getElementById(`edu-${id}`);
  if (el) el.remove();
  updatePreview(); autoSave();
}

/* ===========================
   DYNAMIC WEBINARS
=========================== */
function addWebinar(data = {}) {
  const id = Date.now() + Math.random();
  webinars.push({ id, title: data.title || '', date: data.date || '', institution: data.institution || '' });

  const container = document.getElementById('webinarList');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.id = `web-${id}`;
  div.innerHTML = `
    <button class="btn-remove" onclick="removeWebinar(${id})">✕</button>
    <div class="form-grid">
      <div class="form-group full">
        <label>Webinar / Seminar Title</label>
        <input type="text" placeholder="Advanced Web Development Summit"
          value="${escHtml(data.title || '')}"
          oninput="updateWebinar(${id}, 'title', this.value); autoSave()"/>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="text" placeholder="March 2023"
          value="${escHtml(data.date || '')}"
          oninput="updateWebinar(${id}, 'date', this.value); autoSave()"/>
      </div>
      <div class="form-group">
        <label>Institution / Organizer</label>
        <input type="text" placeholder="DICT Philippines"
          value="${escHtml(data.institution || '')}"
          oninput="updateWebinar(${id}, 'institution', this.value); autoSave()"/>
      </div>
    </div>
  `;
  container.appendChild(div);
}

function updateWebinar(id, field, value) {
  const w = webinars.find(w => w.id === id);
  if (w) w[field] = value;
  updatePreview();
}

function removeWebinar(id) {
  const idx = webinars.findIndex(w => w.id === id);
  if (idx > -1) webinars.splice(idx, 1);
  const el = document.getElementById(`web-${id}`);
  if (el) el.remove();
  updatePreview(); autoSave();
}

/* ===========================
   DYNAMIC WORK
=========================== */
function addWork(data = {}) {
  const id = Date.now() + Math.random();
  work.push({ id, company: data.company || '', title: data.title || '', description: data.description || '', year: data.year || '' });

  const container = document.getElementById('workList');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.id = `work-${id}`;
  div.innerHTML = `
    <button class="btn-remove" onclick="removeWork(${id})">✕</button>
    <div class="form-grid">
      <div class="form-group full">
        <label>Company Name</label>
        <input type="text" placeholder="Acme Corp"
          value="${escHtml(data.company || '')}"
          oninput="updateWork(${id}, 'company', this.value); autoSave()"/>
      </div>
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" placeholder="Software Engineer"
          value="${escHtml(data.title || '')}"
          oninput="updateWork(${id}, 'title', this.value); autoSave()"/>
      </div>
      <div class="form-group">
        <label>Year / Period</label>
        <input type="text" placeholder="2021 – Present"
          value="${escHtml(data.year || '')}"
          oninput="updateWork(${id}, 'year', this.value); autoSave()"/>
      </div>
      <div class="form-group full">
        <label>Description</label>
        <textarea rows="2" placeholder="Key responsibilities and achievements..."
          oninput="updateWork(${id}, 'description', this.value); autoSave()">${escHtml(data.description || '')}</textarea>
      </div>
    </div>
  `;
  container.appendChild(div);
}

function updateWork(id, field, value) {
  const w = work.find(w => w.id === id);
  if (w) w[field] = value;
  updatePreview();
}

function removeWork(id) {
  const idx = work.findIndex(w => w.id === id);
  if (idx > -1) work.splice(idx, 1);
  const el = document.getElementById(`work-${id}`);
  if (el) el.remove();
  updatePreview(); autoSave();
}

/* ===========================
   HELPERS
=========================== */
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) +
    ' • ' + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
}

/* ===========================
   TEMPLATE SWITCH
=========================== */
const templateLabels = {
  classic: '⬡ Classic Layout',
  modern:  '⬡ Modern Sidebar',
  noimage: '⬡ Text-Only CV'
};
const templateNext = {
  classic: 'modern',
  modern:  'noimage',
  noimage: 'classic'
};

function switchTemplate() {
  currentTemplate = templateNext[currentTemplate];
  const btn = document.getElementById('templateToggle');
  const nextLabel = templateLabels[templateNext[currentTemplate]];
  btn.innerHTML = `<i class="fas fa-columns"></i><span>Next: ${nextLabel.replace('⬡ ','')}</span>`;
  updatePreview();
  autoSave();
  showToast('Template switched!', 'info', 2000);
}

/* ===========================
   RESET
=========================== */
function resetForm() {
  if (!confirm('Reset all form data? This cannot be undone.')) return;

  ['fullName','age','dob','pob','sex','civilStatus','citizenship',
   'height','weight','religion','language','address','phone','email','objective'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  profileImageData = null;
  document.getElementById('imagePreviewThumb').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'flex';
  const removeBtn = document.getElementById('removeImageBtn');
  if (removeBtn) removeBtn.style.display = 'none';
  document.getElementById('profileImageInput').value = '';

  skills.length = education.length = webinars.length = work.length = 0;
  ['skillsList','educationList','webinarList','workList'].forEach(id => {
    document.getElementById(id).innerHTML = '';
  });

  currentTemplate = 'classic';
  addSkill(); addEducation(); addWork();
  updatePreview();
  localStorage.removeItem(SAVE_KEY);
  showToast('Form reset successfully.', 'info');
}

/* ===========================
   RENDER RESUME
=========================== */
function updatePreview() {
  const resume = document.getElementById('resumePreview');
  resume.className = `resume template-${currentTemplate}`;

  if (currentTemplate === 'classic') {
    resume.innerHTML = renderClassic();
  } else if (currentTemplate === 'modern') {
    resume.innerHTML = renderModern();
  } else {
    resume.innerHTML = renderNoImage();
  }
}

/* ---- CLASSIC ---- */
function renderClassic() {
  const name      = val('fullName') || 'Your Full Name';
  const phone     = val('phone');
  const email     = val('email');
  const address   = val('address');
  const objective = val('objective');

  const photoHTML = profileImageData
    ? `<img class="r-photo" src="${profileImageData}" alt="Profile"/>`
    : `<div class="r-photo-placeholder">👤</div>`;

  const contactItems = [
    phone   ? `<span>📞 ${phone}</span>`   : '',
    email   ? `<span>✉ ${email}</span>`   : '',
    address ? `<span>📍 ${address}</span>` : '',
  ].filter(Boolean).join('');

  const personalFields = [
    ['Age',           val('age')],
    ['Date of Birth', formatDate(val('dob'))],
    ['Place of Birth',val('pob')],
    ['Sex',           val('sex')],
    ['Civil Status',  val('civilStatus')],
    ['Citizenship',   val('citizenship')],
    ['Height',        val('height')],
    ['Weight',        val('weight')],
    ['Religion',      val('religion')],
    ['Language',      val('language')],
  ].filter(([,v]) => v);

  const personalGrid = personalFields.length ? `
    <div class="r-section">
      <div class="r-section-title">Personal Details</div>
      <div class="r-personal-grid">
        ${personalFields.map(([l, v]) => `<div><div class="r-label">${l}</div>${v}</div>`).join('')}
      </div>
    </div>` : '';

  const skillItems = skills.filter(s => s.value.trim());
  const skillsHTML = skillItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Skills</div>
      ${skillItems.map(s => `<span class="r-skill-pill">${s.value}</span>`).join('')}
    </div>` : '';

  const webinarItems = webinars.filter(w => w.title || w.institution);
  const webinarsHTML = webinarItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Webinars & Seminars</div>
      ${webinarItems.map(w => `
        <div class="r-entry">
          <div class="r-entry-title">${w.title || '—'}</div>
          <div class="r-entry-sub">${[w.institution, w.date].filter(Boolean).join(' · ')}</div>
        </div>`).join('')}
    </div>` : '';

  const objectiveHTML = objective ? `
    <div class="r-section">
      <div class="r-section-title">Career Objective</div>
      <p class="r-text">${objective}</p>
    </div>` : '';

  const eduItems = education.filter(e => e.school || e.description);
  const educationHTML = eduItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Education</div>
      ${eduItems.map(e => `
        <div class="r-entry">
          <div class="r-entry-title">${e.school || '—'}</div>
          <div class="r-entry-sub">${e.year || ''}</div>
          <div class="r-entry-desc">${e.description || ''}</div>
        </div>`).join('')}
    </div>` : '';

  const workItems = work.filter(w => w.company || w.title);
  const workHTML = workItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Work Experience</div>
      ${workItems.map(w => `
        <div class="r-entry">
          <div class="r-entry-title">${w.company || '—'}</div>
          <div class="r-entry-sub">${[w.title, w.year].filter(Boolean).join(' · ')}</div>
          <div class="r-entry-desc">${w.description || ''}</div>
        </div>`).join('')}
    </div>` : '';

  return `
    <div class="r-header">
      ${photoHTML}
      <div class="r-header-info">
        <h1>${name}</h1>
        ${workItems.length ? `<div style="font-size:12px;opacity:0.7;margin-top:2px">${workItems[0].title || ''}</div>` : ''}
        <div class="r-contact-row">${contactItems}</div>
      </div>
    </div>
    <div class="r-body">
      <div class="r-main">
        ${objectiveHTML}${educationHTML}${workHTML}${webinarsHTML}
      </div>
      <div class="r-side">
        ${personalGrid}${skillsHTML}
      </div>
    </div>`;
}

/* ---- MODERN SIDEBAR ---- */
function renderModern() {
  const name      = val('fullName') || 'Your Full Name';
  const objective = val('objective');

  const photoHTML = profileImageData
    ? `<img class="r-sidebar-photo" src="${profileImageData}" alt="Profile"/>`
    : `<div class="r-sidebar-photo-placeholder">👤</div>`;

  const contactFields = [
    ['Phone',   val('phone')],
    ['Email',   val('email')],
    ['Address', val('address')],
  ].filter(([,v]) => v);

  const contactHTML = contactFields.length ? `
    <div>
      <div class="r-sidebar-section-title">Contact</div>
      ${contactFields.map(([l, v]) => `
        <div class="r-sidebar-item"><span class="lbl">${l}</span>${v}</div>`).join('')}
    </div>` : '';

  const personalFields = [
    ['Date of Birth', formatDate(val('dob'))],
    ['Place of Birth',val('pob')],
    ['Age',           val('age')],
    ['Sex',           val('sex')],
    ['Civil Status',  val('civilStatus')],
    ['Citizenship',   val('citizenship')],
    ['Height',        val('height')],
    ['Weight',        val('weight')],
    ['Religion',      val('religion')],
    ['Language',      val('language')],
  ].filter(([,v]) => v);

  const personalHTML = personalFields.length ? `
    <div>
      <div class="r-sidebar-section-title">Personal Info</div>
      ${personalFields.map(([l, v]) => `
        <div class="r-sidebar-item"><span class="lbl">${l}</span>${v}</div>`).join('')}
    </div>` : '';

  const skillItems = skills.filter(s => s.value.trim());
  const skillsHTML = skillItems.length ? `
    <div>
      <div class="r-sidebar-section-title">Skills</div>
      ${skillItems.map(s => `<span class="r-skill-pill">${s.value}</span>`).join('')}
    </div>` : '';

  const objectiveHTML = objective ? `
    <div class="r-section">
      <div class="r-section-title">Career Objective</div>
      <p class="r-text">${objective}</p>
    </div>` : '';

  const eduItems = education.filter(e => e.school || e.description);
  const educationHTML = eduItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Education</div>
      ${eduItems.map(e => `
        <div class="r-entry">
          <div class="r-entry-title">${e.school || '—'}</div>
          <div class="r-entry-sub">${[e.description, e.year].filter(Boolean).join(' · ')}</div>
        </div>`).join('')}
    </div>` : '';

  const workItems = work.filter(w => w.company || w.title);
  const workHTML = workItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Work Experience</div>
      ${workItems.map(w => `
        <div class="r-entry">
          <div class="r-entry-title">${w.title || '—'}</div>
          <div class="r-entry-sub">${[w.company, w.year].filter(Boolean).join(' · ')}</div>
          <div class="r-entry-desc">${w.description || ''}</div>
        </div>`).join('')}
    </div>` : '';

  const webinarItems = webinars.filter(w => w.title || w.institution);
  const webinarsHTML = webinarItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Webinars & Seminars</div>
      ${webinarItems.map(w => `
        <div class="r-entry">
          <div class="r-entry-title">${w.title || '—'}</div>
          <div class="r-entry-sub">${[w.institution, w.date].filter(Boolean).join(' · ')}</div>
        </div>`).join('')}
    </div>` : '';

  return `
    <div class="r-sidebar">
      ${photoHTML}
      <div class="r-sidebar-name">${name}</div>
      ${workItems.length ? `<div style="font-size:10px;color:rgba(255,255,255,0.5);text-align:center;margin-top:-16px;margin-bottom:4px">${workItems[0].title || ''}</div>` : ''}
      ${contactHTML}${personalHTML}${skillsHTML}
    </div>
    <div class="r-content">
      ${objectiveHTML}${workHTML}${educationHTML}${webinarsHTML}
    </div>`;
}

/* ---- NO-IMAGE / TEXT-ONLY CV ---- */
function renderNoImage() {
  const name      = val('fullName') || 'Your Full Name';
  const phone     = val('phone');
  const email     = val('email');
  const address   = val('address');
  const objective = val('objective');

  const contactParts = [phone, email, address].filter(Boolean);
  const contactLine  = contactParts.join('  ·  ');

  const personalFields = [
    ['Date of Birth', formatDate(val('dob'))],
    ['Place of Birth',val('pob')],
    ['Age',           val('age')],
    ['Sex',           val('sex')],
    ['Civil Status',  val('civilStatus')],
    ['Citizenship',   val('citizenship')],
    ['Height',        val('height')],
    ['Weight',        val('weight')],
    ['Religion',      val('religion')],
    ['Language(s)',   val('language')],
  ].filter(([,v]) => v);

  const personalHTML = personalFields.length ? `
    <div class="ni-section">
      <div class="ni-section-title">Personal Information</div>
      <table class="ni-table">
        ${personalFields.map(([l, v]) => `
          <tr><td class="ni-td-label">${l}</td><td class="ni-td-value">${v}</td></tr>`).join('')}
      </table>
    </div>` : '';

  const objectiveHTML = objective ? `
    <div class="ni-section">
      <div class="ni-section-title">Career Objective</div>
      <p class="ni-text">${objective}</p>
    </div>` : '';

  const skillItems = skills.filter(s => s.value.trim());
  const skillsHTML = skillItems.length ? `
    <div class="ni-section">
      <div class="ni-section-title">Core Competencies & Skills</div>
      <div class="ni-skills-wrap">
        ${skillItems.map(s => `<span class="ni-skill">${s.value}</span>`).join('')}
      </div>
    </div>` : '';

  const workItems = work.filter(w => w.company || w.title);
  const workHTML = workItems.length ? `
    <div class="ni-section">
      <div class="ni-section-title">Work Experience</div>
      ${workItems.map(w => `
        <div class="ni-entry">
          <div class="ni-entry-head">
            <span class="ni-entry-title">${w.company || '—'}</span>
            <span class="ni-entry-year">${w.year || ''}</span>
          </div>
          <div class="ni-entry-role">${w.title || ''}</div>
          ${w.description ? `<p class="ni-entry-desc">${w.description}</p>` : ''}
        </div>`).join('')}
    </div>` : '';

  const eduItems = education.filter(e => e.school || e.description);
  const educationHTML = eduItems.length ? `
    <div class="ni-section">
      <div class="ni-section-title">Educational Background</div>
      ${eduItems.map(e => `
        <div class="ni-entry">
          <div class="ni-entry-head">
            <span class="ni-entry-title">${e.school || '—'}</span>
            <span class="ni-entry-year">${e.year || ''}</span>
          </div>
          ${e.description ? `<div class="ni-entry-role">${e.description}</div>` : ''}
        </div>`).join('')}
    </div>` : '';

  const webinarItems = webinars.filter(w => w.title || w.institution);
  const webinarsHTML = webinarItems.length ? `
    <div class="ni-section">
      <div class="ni-section-title">Trainings, Webinars & Seminars</div>
      ${webinarItems.map(w => `
        <div class="ni-entry">
          <div class="ni-entry-head">
            <span class="ni-entry-title">${w.title || '—'}</span>
            <span class="ni-entry-year">${w.date || ''}</span>
          </div>
          ${w.institution ? `<div class="ni-entry-role">${w.institution}</div>` : ''}
        </div>`).join('')}
    </div>` : '';

  return `
    <div class="ni-header">
      <div class="ni-name">${name}</div>
      ${workItems.length && workItems[0].title ? `<div class="ni-headline">${workItems[0].title}</div>` : ''}
      ${contactLine ? `<div class="ni-contact">${contactLine}</div>` : ''}
    </div>
    <div class="ni-body">
      ${objectiveHTML}${workHTML}${educationHTML}${skillsHTML}${personalHTML}${webinarsHTML}
    </div>`;
}

/* ===========================
   PDF DOWNLOAD
=========================== */
function downloadPDF() {
  const el   = document.getElementById('resumePreview');
  const name = val('fullName') || 'resume';
  const filename = name.replace(/\s+/g, '_').toLowerCase() + '_resume.pdf';

  const opt = {
    margin: 0,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    },
    pagebreak: { mode: 'avoid-all' }
  };

  const origStyle = el.style.cssText;
  el.style.width = '794px';
  el.style.maxWidth = 'none';

  showToast('Generating PDF…', 'info', 4000);

  html2pdf().set(opt).from(el).save().then(() => {
    el.style.cssText = origStyle;
    showToast('PDF downloaded!', 'success');
  }).catch(err => {
    console.error(err);
    el.style.cssText = origStyle;
    showToast('PDF export failed.', 'error');
  });
}

/* ===========================
   DOC DOWNLOAD (Editable)
=========================== */
function downloadDOC() {
  const name = val('fullName') || 'Resume';
  const filename = name.replace(/\s+/g, '_').toLowerCase() + '_resume.doc';

  showToast('Generating editable DOC…', 'info', 3000);

  try {
    const docHtml = buildDocHTML();
    const blob = new Blob(['\ufeff', docHtml], { type: 'application/msword' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('DOC downloaded! Open with Word, WPS, or Google Docs.', 'success', 4000);
  } catch (err) {
    console.error(err);
    showToast('DOC export failed.', 'error');
  }
}

function buildDocHTML() {
  const name       = val('fullName') || 'Your Name';
  const phone      = val('phone');
  const email      = val('email');
  const address    = val('address');
  const objective  = val('objective');
  const dob        = formatDate(val('dob'));
  const pob        = val('pob');
  const age        = val('age');
  const sex        = val('sex');
  const civil      = val('civilStatus');
  const citizen    = val('citizenship');
  const height     = val('height');
  const weight     = val('weight');
  const religion   = val('religion');
  const language   = val('language');

  const skillItems   = skills.filter(s => s.value.trim());
  const workItems    = work.filter(w => w.company || w.title);
  const eduItems     = education.filter(e => e.school || e.description);
  const webinarItems = webinars.filter(w => w.title || w.institution);

  const sectionTitle = (t) => `
    <p style="font-family:Arial,sans-serif;font-size:9pt;font-weight:bold;letter-spacing:2pt;
      text-transform:uppercase;border-bottom:2px solid #1a1a2e;padding-bottom:3pt;
      margin-top:16pt;margin-bottom:8pt;color:#1a1a2e;">${t}</p>`;

  const rowField = (label, value) => value ? `
    <tr>
      <td style="font-family:Arial,sans-serif;font-size:9pt;font-weight:bold;width:35%;
        padding:2pt 8pt 2pt 0;color:#333;vertical-align:top;">${label}</td>
      <td style="font-family:Arial,sans-serif;font-size:9pt;padding:2pt 0;color:#444;">${value}</td>
    </tr>` : '';

  const personalRows = [
    rowField('Date of Birth', dob),
    rowField('Place of Birth', pob),
    rowField('Age', age),
    rowField('Sex', sex),
    rowField('Civil Status', civil),
    rowField('Citizenship', citizen),
    rowField('Height', height),
    rowField('Weight', weight),
    rowField('Religion', religion),
    rowField('Language(s)', language),
  ].filter(Boolean);

  const personalSection = personalRows.length ? `
    ${sectionTitle('Personal Information')}
    <table style="border-collapse:collapse;width:100%;">
      ${personalRows.join('')}
    </table>` : '';

  const contactLine = [phone, email, address].filter(Boolean).join('   ·   ');

  const objectiveSection = objective ? `
    ${sectionTitle('Career Objective')}
    <p style="font-family:Arial,sans-serif;font-size:10pt;color:#333;line-height:1.6;">${objective}</p>` : '';

  const skillsSection = skillItems.length ? `
    ${sectionTitle('Core Competencies & Skills')}
    <p style="font-family:Arial,sans-serif;font-size:10pt;color:#333;">${skillItems.map(s => s.value).join('  •  ')}</p>` : '';

  const workSection = workItems.length ? `
    ${sectionTitle('Work Experience')}
    ${workItems.map(w => `
      <p style="margin:0;font-family:Arial,sans-serif;">
        <span style="font-size:10.5pt;font-weight:bold;color:#1a1a1a;">${w.company || '—'}</span>
        ${w.year ? `<span style="font-size:9pt;color:#666;float:right;">${w.year}</span>` : ''}
      </p>
      ${w.title ? `<p style="margin:1pt 0 2pt;font-family:Arial,sans-serif;font-size:10pt;font-style:italic;color:#444;">${w.title}</p>` : ''}
      ${w.description ? `<p style="margin:2pt 0 10pt;font-family:Arial,sans-serif;font-size:9.5pt;color:#555;line-height:1.5;">${w.description}</p>` : '<p style="margin-bottom:10pt;"></p>'}
    `).join('')}` : '';

  const eduSection = eduItems.length ? `
    ${sectionTitle('Educational Background')}
    ${eduItems.map(e => `
      <p style="margin:0;font-family:Arial,sans-serif;">
        <span style="font-size:10.5pt;font-weight:bold;color:#1a1a1a;">${e.school || '—'}</span>
        ${e.year ? `<span style="font-size:9pt;color:#666;float:right;">${e.year}</span>` : ''}
      </p>
      ${e.description ? `<p style="margin:1pt 0 10pt;font-family:Arial,sans-serif;font-size:10pt;font-style:italic;color:#444;">${e.description}</p>` : '<p style="margin-bottom:10pt;"></p>'}
    `).join('')}` : '';

  const webinarSection = webinarItems.length ? `
    ${sectionTitle('Trainings, Webinars & Seminars')}
    ${webinarItems.map(w => `
      <p style="margin:0;font-family:Arial,sans-serif;">
        <span style="font-size:10.5pt;font-weight:bold;color:#1a1a1a;">${w.title || '—'}</span>
        ${w.date ? `<span style="font-size:9pt;color:#666;float:right;">${w.date}</span>` : ''}
      </p>
      ${w.institution ? `<p style="margin:1pt 0 10pt;font-family:Arial,sans-serif;font-size:10pt;color:#555;">${w.institution}</p>` : '<p style="margin-bottom:10pt;"></p>'}
    `).join('')}` : '';

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${name} — Resume</title>
      <!--[if gte mso 9]>
      <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>90</w:Zoom>
        <w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->
      <style>
        body { font-family: Arial, sans-serif; margin: 72pt; }
        p { margin: 0; }
      </style>
    </head>
    <body>
      <!-- HEADER -->
      <div style="text-align:center;border-bottom:3px double #1a1a1a;padding-bottom:14pt;margin-bottom:4pt;">
        <p style="font-family:'Times New Roman',serif;font-size:22pt;font-weight:bold;
          letter-spacing:3pt;text-transform:uppercase;color:#1a1a1a;">${name}</p>
        ${workItems.length && workItems[0].title ? `
          <p style="font-family:Arial,sans-serif;font-size:10pt;letter-spacing:2pt;
            text-transform:uppercase;color:#555;margin-top:4pt;">${workItems[0].title}</p>` : ''}
        ${contactLine ? `
          <p style="font-family:Arial,sans-serif;font-size:9pt;color:#444;margin-top:6pt;">${contactLine}</p>` : ''}
      </div>

      ${objectiveSection}
      ${workSection}
      ${eduSection}
      ${skillsSection}
      ${personalSection}
      ${webinarSection}
    </body>
    </html>`;
}

/* ===========================
   FEEDBACK SYSTEM
=========================== */
const FEEDBACK_KEY = 'resumecraft_feedback_v1';

function openFeedback() {
  const overlay = document.getElementById('feedbackOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  loadFeedback();
}

function closeFeedback() {
  const overlay = document.getElementById('feedbackOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function closeFeedbackOnOverlay(event) {
  if (event.target === document.getElementById('feedbackOverlay')) {
    closeFeedback();
  }
}

function updateCharCount() {
  const text  = document.getElementById('feedbackText').value;
  const count = document.getElementById('charCount');
  count.textContent = `${text.length} / 500`;
  count.className = 'char-count' +
    (text.length > 450 ? ' warning' : '') +
    (text.length > 490 ? ' error'   : '');
}

function submitFeedback() {
  const textarea = document.getElementById('feedbackText');
  const text = textarea.value.trim();

  if (!text) {
    showToast('Please write something before sending.', 'error');
    return;
  }

  if (text.length > 500) {
    showToast('Feedback too long. Max 500 characters.', 'error');
    return;
  }

  const feedbacks = getFeedbacks();
  const entry = {
    id:        Date.now(),
    message:   text,
    timestamp: Date.now(),
    likes:     0,
    liked:     false
  };

  feedbacks.unshift(entry);
  saveFeedbacks(feedbacks);

  textarea.value = '';
  updateCharCount();
  renderFeedbackList(feedbacks);
  showToast('Feedback submitted! Thank you.', 'success');
}

function getFeedbacks() {
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || [];
  } catch { return []; }
}

function saveFeedbacks(feedbacks) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
}

function loadFeedback() {
  renderFeedbackList(getFeedbacks());
}

function renderFeedbackList(feedbacks) {
  const list  = document.getElementById('feedbackList');
  const empty = document.getElementById('feedbackEmpty');
  const count = document.getElementById('commentCount');

  count.textContent = `${feedbacks.length} comment${feedbacks.length !== 1 ? 's' : ''}`;

  if (!feedbacks.length) {
    list.innerHTML = '';
    list.appendChild(empty || createEmptyEl());
    return;
  }

  list.innerHTML = feedbacks.map(f => `
    <div class="feedback-card" id="fc-${f.id}">
      <div class="fc-header">
        <div class="fc-user">
          <div class="fc-avatar"><i class="fas fa-user"></i></div>
          <div>
            <div class="fc-name">Guest User</div>
            <div class="fc-time">${formatTimestamp(f.timestamp)}</div>
          </div>
        </div>
        <div class="fc-actions">
          <button class="fc-like-btn ${f.liked ? 'liked' : ''}" onclick="toggleLike(${f.id})">
            <i class="fas fa-thumbs-up"></i> ${f.likes || 0}
          </button>
          <button class="fc-delete-btn" onclick="deleteFeedback(${f.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="fc-body">${escHtml(f.message).replace(/\n/g, '<br>')}</div>
    </div>
  `).join('');
}

function createEmptyEl() {
  const div = document.createElement('div');
  div.id = 'feedbackEmpty';
  div.className = 'feedback-empty';
  div.innerHTML = '<i class="fas fa-comments"></i><p>No feedback yet. Be the first!</p>';
  return div;
}

function toggleLike(id) {
  const feedbacks = getFeedbacks();
  const f = feedbacks.find(x => x.id === id);
  if (!f) return;
  f.liked  = !f.liked;
  f.likes  = (f.likes || 0) + (f.liked ? 1 : -1);
  if (f.likes < 0) f.likes = 0;
  saveFeedbacks(feedbacks);
  renderFeedbackList(feedbacks);
}

function deleteFeedback(id) {
  const feedbacks = getFeedbacks().filter(f => f.id !== id);
  saveFeedbacks(feedbacks);
  renderFeedbackList(feedbacks);
}


