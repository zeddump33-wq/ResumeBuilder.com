/* ===========================
   STATE
=========================== */
let currentTemplate = 'classic';
let profileImageData = null;
let sidebarOpen = false;

const skills = [];
const education = [];
const webinars = [];
const work = [];

/* ===========================
   SIDEBAR TOGGLE
=========================== */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebarMenu');
  const overlay = document.getElementById('sidebarOverlay');
  const body = document.body;
  
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
  addSkill();
  addEducation();
  addWork();
  updatePreview();
});

/* ===========================
   IMAGE UPLOAD
=========================== */
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    profileImageData = e.target.result;

    const thumb = document.getElementById('imagePreviewThumb');
    const placeholder = document.getElementById('uploadPlaceholder');
    thumb.src = profileImageData;
    thumb.style.display = 'block';
    placeholder.style.display = 'none';

    updatePreview();
  };
  reader.readAsDataURL(file);
}

/* ===========================
   DYNAMIC SKILLS
=========================== */
function addSkill() {
  const id = Date.now();
  skills.push({ id, value: '' });

  const container = document.getElementById('skillsList');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.id = `skill-${id}`;
  div.innerHTML = `
    <div class="skill-input-wrap">
      <input type="text" placeholder="e.g. JavaScript, Communication, Leadership"
        oninput="updateSkill(${id}, this.value)" />
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
  updatePreview();
}

/* ===========================
   DYNAMIC EDUCATION
=========================== */
function addEducation() {
  const id = Date.now();
  education.push({ id, school: '', year: '', description: '' });

  const container = document.getElementById('educationList');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.id = `edu-${id}`;
  div.innerHTML = `
    <button class="btn-remove" onclick="removeEducation(${id})">✕</button>
    <div class="form-grid">
      <div class="form-group full">
        <label>School / University</label>
        <input type="text" placeholder="University of the Philippines" oninput="updateEducation(${id}, 'school', this.value)"/>
      </div>
      <div class="form-group">
        <label>Year</label>
        <input type="text" placeholder="2016 – 2020" oninput="updateEducation(${id}, 'year', this.value)"/>
      </div>
      <div class="form-group full">
        <label>Degree / Description</label>
        <input type="text" placeholder="BS Computer Science" oninput="updateEducation(${id}, 'description', this.value)"/>
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
  updatePreview();
}

/* ===========================
   DYNAMIC WEBINARS
=========================== */
function addWebinar() {
  const id = Date.now();
  webinars.push({ id, title: '', date: '', institution: '' });

  const container = document.getElementById('webinarList');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.id = `web-${id}`;
  div.innerHTML = `
    <button class="btn-remove" onclick="removeWebinar(${id})">✕</button>
    <div class="form-grid">
      <div class="form-group full">
        <label>Webinar / Seminar Title</label>
        <input type="text" placeholder="Advanced Web Development Summit" oninput="updateWebinar(${id}, 'title', this.value)"/>
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="text" placeholder="March 2023" oninput="updateWebinar(${id}, 'date', this.value)"/>
      </div>
      <div class="form-group">
        <label>Institution / Organizer</label>
        <input type="text" placeholder="DICT Philippines" oninput="updateWebinar(${id}, 'institution', this.value)"/>
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
  updatePreview();
}

/* ===========================
   DYNAMIC WORK
=========================== */
function addWork() {
  const id = Date.now();
  work.push({ id, company: '', title: '', description: '', year: '' });

  const container = document.getElementById('workList');
  const div = document.createElement('div');
  div.className = 'dynamic-item';
  div.id = `work-${id}`;
  div.innerHTML = `
    <button class="btn-remove" onclick="removeWork(${id})">✕</button>
    <div class="form-grid">
      <div class="form-group full">
        <label>Company Name</label>
        <input type="text" placeholder="Acme Corp" oninput="updateWork(${id}, 'company', this.value)"/>
      </div>
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" placeholder="Software Engineer" oninput="updateWork(${id}, 'title', this.value)"/>
      </div>
      <div class="form-group">
        <label>Year / Period</label>
        <input type="text" placeholder="2021 – Present" oninput="updateWork(${id}, 'year', this.value)"/>
      </div>
      <div class="form-group full">
        <label>Description</label>
        <textarea rows="2" placeholder="Key responsibilities and achievements..." oninput="updateWork(${id}, 'description', this.value)"></textarea>
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
  updatePreview();
}

/* ===========================
   HELPERS
=========================== */
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ===========================
   TEMPLATE SWITCH
=========================== */
const templates = ['classic', 'modern', 'noimage'];
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
  btn.innerHTML = `<span class="btn-icon">⬡</span> → ${templateLabels[templateNext[currentTemplate]]}`;
  updatePreview();
}

/* ===========================
   RESET
=========================== */
function resetForm() {
  if (!confirm('Reset all form data?')) return;

  ['fullName','age','dob','pob','sex','civilStatus','citizenship',
   'height','weight','religion','language','address','phone','email','objective'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  profileImageData = null;
  document.getElementById('imagePreviewThumb').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'block';
  document.getElementById('profileImageInput').value = '';

  skills.length = 0;
  education.length = 0;
  webinars.length = 0;
  work.length = 0;

  document.getElementById('skillsList').innerHTML = '';
  document.getElementById('educationList').innerHTML = '';
  document.getElementById('webinarList').innerHTML = '';
  document.getElementById('workList').innerHTML = '';

  addSkill();
  addEducation();
  addWork();
  updatePreview();
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
  const name = val('fullName') || 'Your Full Name';
  const phone = val('phone');
  const email = val('email');
  const address = val('address');
  const objective = val('objective');

  const photoHTML = profileImageData
    ? `<img class="r-photo" src="${profileImageData}" alt="Profile"/>`
    : `<div class="r-photo-placeholder">👤</div>`;

  const contactItems = [
    phone ? `<span>📞 ${phone}</span>` : '',
    email ? `<span>✉ ${email}</span>` : '',
    address ? `<span>📍 ${address}</span>` : '',
  ].filter(Boolean).join('');

  // Personal info grid
  const personalFields = [
    ['Age', val('age')],
    ['Date of Birth', formatDate(val('dob'))],
    ['Place of Birth', val('pob')],
    ['Sex', val('sex')],
    ['Civil Status', val('civilStatus')],
    ['Citizenship', val('citizenship')],
    ['Height', val('height')],
    ['Weight', val('weight')],
    ['Religion', val('religion')],
    ['Language', val('language')],
  ].filter(([,v]) => v);

  const personalGrid = personalFields.length ? `
    <div class="r-section">
      <div class="r-section-title">Personal Details</div>
      <div class="r-personal-grid">
        ${personalFields.map(([l, v]) => `
          <div><div class="r-label">${l}</div>${v}</div>
        `).join('')}
      </div>
    </div>` : '';

  // Skills
  const skillItems = skills.filter(s => s.value.trim());
  const skillsHTML = skillItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Skills</div>
      ${skillItems.map(s => `<span class="r-skill-pill">${s.value}</span>`).join('')}
    </div>` : '';

  // Webinars for side panel
  const webinarItems = webinars.filter(w => w.title || w.institution);
  const webinarsHTML = webinarItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Webinars & Seminars</div>
      ${webinarItems.map(w => `
        <div class="r-entry">
          <div class="r-entry-title">${w.title || '—'}</div>
          <div class="r-entry-sub">${[w.institution, w.date].filter(Boolean).join(' · ')}</div>
        </div>
      `).join('')}
    </div>` : '';

  // Objective
  const objectiveHTML = objective ? `
    <div class="r-section">
      <div class="r-section-title">Career Objective</div>
      <p class="r-text">${objective}</p>
    </div>` : '';

  // Education
  const eduItems = education.filter(e => e.school || e.description);
  const educationHTML = eduItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Education</div>
      ${eduItems.map(e => `
        <div class="r-entry">
          <div class="r-entry-title">${e.school || '—'}</div>
          <div class="r-entry-sub">${e.year || ''}</div>
          <div class="r-entry-desc">${e.description || ''}</div>
        </div>
      `).join('')}
    </div>` : '';

  // Work
  const workItems = work.filter(w => w.company || w.title);
  const workHTML = workItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Work Experience</div>
      ${workItems.map(w => `
        <div class="r-entry">
          <div class="r-entry-title">${w.company || '—'}</div>
          <div class="r-entry-sub">${[w.title, w.year].filter(Boolean).join(' · ')}</div>
          <div class="r-entry-desc">${w.description || ''}</div>
        </div>
      `).join('')}
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
        ${objectiveHTML}
        ${educationHTML}
        ${workHTML}
        ${webinarsHTML}
      </div>
      <div class="r-side">
        ${personalGrid}
        ${skillsHTML}
      </div>
    </div>
  `;
}

/* ---- MODERN SIDEBAR ---- */
function renderModern() {
  const name = val('fullName') || 'Your Full Name';
  const objective = val('objective');

  const photoHTML = profileImageData
    ? `<img class="r-sidebar-photo" src="${profileImageData}" alt="Profile"/>`
    : `<div class="r-sidebar-photo-placeholder">👤</div>`;

  // Contact sidebar
  const contactFields = [
    ['Phone', val('phone')],
    ['Email', val('email')],
    ['Address', val('address')],
  ].filter(([,v]) => v);

  const contactHTML = contactFields.length ? `
    <div>
      <div class="r-sidebar-section-title">Contact</div>
      ${contactFields.map(([l, v]) => `
        <div class="r-sidebar-item">
          <span class="lbl">${l}</span>
          ${v}
        </div>
      `).join('')}
    </div>` : '';

  // Personal sidebar
  const personalFields = [
    ['Date of Birth', formatDate(val('dob'))],
    ['Place of Birth', val('pob')],
    ['Age', val('age')],
    ['Sex', val('sex')],
    ['Civil Status', val('civilStatus')],
    ['Citizenship', val('citizenship')],
    ['Height', val('height')],
    ['Weight', val('weight')],
    ['Religion', val('religion')],
    ['Language', val('language')],
  ].filter(([,v]) => v);

  const personalHTML = personalFields.length ? `
    <div>
      <div class="r-sidebar-section-title">Personal Info</div>
      ${personalFields.map(([l, v]) => `
        <div class="r-sidebar-item">
          <span class="lbl">${l}</span>
          ${v}
        </div>
      `).join('')}
    </div>` : '';

  // Skills sidebar
  const skillItems = skills.filter(s => s.value.trim());
  const skillsHTML = skillItems.length ? `
    <div>
      <div class="r-sidebar-section-title">Skills</div>
      ${skillItems.map(s => `<span class="r-skill-pill">${s.value}</span>`).join('')}
    </div>` : '';

  // Main content
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
        </div>
      `).join('')}
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
        </div>
      `).join('')}
    </div>` : '';

  const webinarItems = webinars.filter(w => w.title || w.institution);
  const webinarsHTML = webinarItems.length ? `
    <div class="r-section">
      <div class="r-section-title">Webinars & Seminars</div>
      ${webinarItems.map(w => `
        <div class="r-entry">
          <div class="r-entry-title">${w.title || '—'}</div>
          <div class="r-entry-sub">${[w.institution, w.date].filter(Boolean).join(' · ')}</div>
        </div>
      `).join('')}
    </div>` : '';

  return `
    <div class="r-sidebar">
      ${photoHTML}
      <div class="r-sidebar-name">${name}</div>
      ${workItems.length ? `<div style="font-size:10px;color:rgba(255,255,255,0.5);text-align:center;margin-top:-16px;margin-bottom:4px">${workItems[0].title || ''}</div>` : ''}
      ${contactHTML}
      ${personalHTML}
      ${skillsHTML}
    </div>
    <div class="r-content">
      ${objectiveHTML}
      ${workHTML}
      ${educationHTML}
      ${webinarsHTML}
    </div>
  `;
}

/* ---- NO-IMAGE / TEXT-ONLY CV ---- */
function renderNoImage() {
  const name      = val('fullName') || 'Your Full Name';
  const phone     = val('phone');
  const email     = val('email');
  const address   = val('address');
  const objective = val('objective');

  // Header contact line
  const contactParts = [phone, email, address].filter(Boolean);
  const contactLine  = contactParts.join('  ·  ');

  // Personal details table
  const personalFields = [
    ['Date of Birth', formatDate(val('dob'))],
    ['Place of Birth', val('pob')],
    ['Age',           val('age')],
    ['Sex',           val('sex')],
    ['Civil Status',  val('civilStatus')],
    ['Citizenship',   val('citizenship')],
    ['Height',        val('height')],
    ['Weight',        val('weight')],
    ['Religion',      val('religion')],
    ['Language(s)',   val('language')],
  ].filter(([, v]) => v);

  const personalHTML = personalFields.length ? `
    <div class="ni-section">
      <div class="ni-section-title">Personal Information</div>
      <table class="ni-table">
        ${personalFields.map(([l, v]) => `
          <tr>
            <td class="ni-td-label">${l}</td>
            <td class="ni-td-value">${v}</td>
          </tr>`).join('')}
      </table>
    </div>` : '';

  // Objective
  const objectiveHTML = objective ? `
    <div class="ni-section">
      <div class="ni-section-title">Career Objective</div>
      <p class="ni-text">${objective}</p>
    </div>` : '';

  // Skills — inline comma list
  const skillItems = skills.filter(s => s.value.trim());
  const skillsHTML = skillItems.length ? `
    <div class="ni-section">
      <div class="ni-section-title">Core Competencies & Skills</div>
      <div class="ni-skills-wrap">
        ${skillItems.map(s => `<span class="ni-skill">${s.value}</span>`).join('')}
      </div>
    </div>` : '';

  // Work Experience
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

  // Education
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

  // Webinars
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
      ${objectiveHTML}
      ${workHTML}
      ${educationHTML}
      ${skillsHTML}
      ${personalHTML}
      ${webinarsHTML}
    </div>
  `;
}

/* ===========================
   PDF DOWNLOAD
=========================== */
function downloadPDF() {
  const el = document.getElementById('resumePreview');
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

  // Temporarily expand for clean PDF
  const origStyle = el.style.cssText;
  el.style.width = '794px';
  el.style.maxWidth = 'none';

  const btn = document.querySelector('.btn-download');
  const origText = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">⏳</span> Generating...';
  btn.disabled = true;

  html2pdf().set(opt).from(el).save().then(() => {
    el.style.cssText = origStyle;
    btn.innerHTML = origText;
    btn.disabled = false;
  }).catch(err => {
    console.error(err);
    el.style.cssText = origStyle;
    btn.innerHTML = origText;
    btn.disabled = false;
  });
}
