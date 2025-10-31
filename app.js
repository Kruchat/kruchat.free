// ระบบบันทึกการพัฒนาตนเองของครู - Professional Development Log System
// Version 2.0 - Enhanced with comprehensive features

// Initialize data
let logs = JSON.parse(localStorage.getItem('teacherLogs')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 'training', name: 'อบรม/workshop', color: '#1976d2' },
    { id: 'seminar', name: 'สัมมนา/ประชุมวิชาการ', color: '#7b1fa2' },
    { id: 'selfstudy', name: 'ศึกษาด้วยตนเอง', color: '#388e3c' },
    { id: 'research', name: 'วิจัยในชั้นเรียน', color: '#f57c00' },
    { id: 'plc', name: 'ชุมชนการเรียนรู้ทางวิชาชีพ (PLC)', color: '#c2185b' },
    { id: 'online-course', name: 'คอร์สออนไลน์', color: '#0288d1' },
    { id: 'coaching', name: 'การให้คำปรึกษา/พี่เลี้ยง', color: '#5e35b1' },
    { id: 'observation', name: 'การสังเกตการสอน', color: '#00796b' },
    { id: 'other', name: 'อื่นๆ', color: '#616161' }
];
let yearlyGoal = JSON.parse(localStorage.getItem('yearlyGoal')) || { year: new Date().getFullYear() + 543, hours: 30 };
let teacherInfo = JSON.parse(localStorage.getItem('teacherInfo')) || {
    name: '',
    position: 'ครู',
    school: '',
    office: ''
};

// Set today's date as default
document.getElementById('activityDate').valueAsDate = new Date();

// Initialize categories dropdown
function initCategoryDropdowns() {
    const selects = ['activityCategory', 'editCategory', 'filterCategory'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Keep first option (-- เลือกประเภท --)
        const firstOption = select.options[0];
        select.innerHTML = '';
        if (firstOption && selectId !== 'filterCategory') {
            select.appendChild(firstOption);
        } else if (selectId === 'filterCategory') {
            const allOption = document.createElement('option');
            allOption.value = '';
            allOption.textContent = 'ทุกประเภท';
            select.appendChild(allOption);
        }

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    });
}

// Save categories
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
}

// Category Management
function openCategoryModal() {
    renderCategoryList();
    document.getElementById('categoryModal').style.display = 'block';
}

function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

function renderCategoryList() {
    const list = document.getElementById('categoryList');
    list.innerHTML = categories.map(cat => `
        <li class="category-item" style="border-left-color: ${cat.color}">
            <div class="category-item-content">
                <div class="color-picker" style="background: ${cat.color}"
                     onclick="changeCategoryColor('${cat.id}')"></div>
                <span>${cat.name}</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-edit btn-small" onclick="editCategoryName('${cat.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-delete btn-small" onclick="deleteCategory('${cat.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');
}

function addCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const colorInput = document.getElementById('newCategoryColor');
    const name = nameInput.value.trim();
    const color = colorInput.value;

    if (!name) {
        alert('กรุณาใส่ชื่อประเภท');
        return;
    }

    const id = 'cat-' + Date.now();
    categories.push({ id, name, color });
    saveCategories();
    initCategoryDropdowns();
    renderCategoryList();

    nameInput.value = '';
    colorInput.value = '#667eea';
    showNotification('เพิ่มประเภทสำเร็จ!', 'success');
}

function editCategoryName(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    const newName = prompt('แก้ไขชื่อประเภท:', category.name);
    if (newName && newName.trim()) {
        category.name = newName.trim();
        saveCategories();
        initCategoryDropdowns();
        renderCategoryList();
        renderLogs();
        showNotification('แก้ไขสำเร็จ!', 'success');
    }
}

function changeCategoryColor(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    const newColor = prompt('ใส่รหัสสี (hex):', category.color);
    if (newColor && /^#[0-9A-F]{6}$/i.test(newColor)) {
        category.color = newColor;
        saveCategories();
        renderCategoryList();
        renderLogs();
        showNotification('เปลี่ยนสีสำเร็จ!', 'success');
    } else if (newColor) {
        alert('รูปแบบสีไม่ถูกต้อง กรุณาใส่ในรูปแบบ #RRGGBB');
    }
}

function deleteCategory(id) {
    // Check if category is in use
    const inUse = logs.some(log => log.category === id);
    if (inUse) {
        alert('ไม่สามารถลบประเภทนี้ได้ เนื่องจากมีการใช้งานอยู่');
        return;
    }

    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประเภทนี้?')) return;

    categories = categories.filter(c => c.id !== id);
    saveCategories();
    initCategoryDropdowns();
    renderCategoryList();
    showNotification('ลบสำเร็จ!', 'success');
}

function getCategoryById(id) {
    return categories.find(c => c.id === id) || { id: 'unknown', name: 'ไม่ทราบ', color: '#999' };
}

// Form submission
document.getElementById('logForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const competencies = document.getElementById('activityCompetency').value
        .split(',')
        .map(c => c.trim())
        .filter(c => c);

    const log = {
        id: Date.now(),
        date: document.getElementById('activityDate').value,
        title: document.getElementById('activityTitle').value,
        category: document.getElementById('activityCategory').value,
        hours: parseFloat(document.getElementById('activityHours').value),
        format: document.getElementById('activityFormat').value,
        venue: document.getElementById('activityVenue').value,
        organizer: document.getElementById('activityOrganizer').value,
        instructor: document.getElementById('activityInstructor').value,
        competencies: competencies,
        description: document.getElementById('activityDescription').value,
        application: document.getElementById('activityApplication').value,
        certificate: document.getElementById('activityCertificate').value,
        createdAt: new Date().toISOString()
    };

    logs.push(log);
    saveLogs();
    this.reset();
    document.getElementById('activityDate').valueAsDate = new Date();

    renderLogs();
    updateStats();

    showNotification('บันทึกสำเร็จ!', 'success');
});

// Filter and search listeners
document.getElementById('filterCategory').addEventListener('change', renderLogs);
document.getElementById('filterFormat').addEventListener('change', renderLogs);
document.getElementById('filterMonth').addEventListener('change', renderLogs);
document.getElementById('sortBy').addEventListener('change', renderLogs);
document.getElementById('searchInput').addEventListener('input', renderLogs);

// Save logs to localStorage
function saveLogs() {
    localStorage.setItem('teacherLogs', JSON.stringify(logs));
    autoBackup();
}

// Auto backup
function autoBackup() {
    const backup = {
        logs: logs,
        categories: categories,
        goal: yearlyGoal,
        teacherInfo: teacherInfo,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('autoBackup', JSON.stringify(backup));
}

// Render logs
function renderLogs() {
    const filterCategory = document.getElementById('filterCategory').value;
    const filterFormat = document.getElementById('filterFormat').value;
    const filterMonth = document.getElementById('filterMonth').value;
    const sortBy = document.getElementById('sortBy').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    let filteredLogs = logs;

    // Search
    if (searchTerm) {
        filteredLogs = filteredLogs.filter(log =>
            log.title.toLowerCase().includes(searchTerm) ||
            log.description.toLowerCase().includes(searchTerm) ||
            (log.venue && log.venue.toLowerCase().includes(searchTerm)) ||
            (log.organizer && log.organizer.toLowerCase().includes(searchTerm)) ||
            (log.instructor && log.instructor.toLowerCase().includes(searchTerm))
        );
    }

    // Filter by category
    if (filterCategory) {
        filteredLogs = filteredLogs.filter(log => log.category === filterCategory);
    }

    // Filter by format
    if (filterFormat) {
        filteredLogs = filteredLogs.filter(log => log.format === filterFormat);
    }

    // Filter by month
    if (filterMonth) {
        filteredLogs = filteredLogs.filter(log => {
            const logMonth = log.date.substring(0, 7);
            return logMonth === filterMonth;
        });
    }

    // Sort
    filteredLogs.sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.date) - new Date(a.date);
            case 'date-asc':
                return new Date(a.date) - new Date(b.date);
            case 'hours-desc':
                return b.hours - a.hours;
            case 'hours-asc':
                return a.hours - b.hours;
            case 'title-asc':
                return a.title.localeCompare(b.title, 'th');
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });

    const logsList = document.getElementById('logsList');

    if (filteredLogs.length === 0) {
        logsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>ไม่พบบันทึกตามเงื่อนไขที่เลือก</p>
            </div>
        `;
        return;
    }

    logsList.innerHTML = filteredLogs.map(log => {
        const category = getCategoryById(log.category);
        const formatLabels = { onsite: 'Onsite', online: 'Online', hybrid: 'Hybrid' };

        return `
            <div class="log-card">
                <div class="log-card-header" style="background: linear-gradient(135deg, ${category.color} 0%, ${adjustColor(category.color, -20)} 100%)">
                    <div class="log-card-title">${log.title}</div>
                    <div><i class="fas fa-clock"></i> ${log.hours} ชม.</div>
                </div>
                <div class="log-card-body">
                    <div class="log-meta-grid">
                        <div class="log-meta-item">
                            <i class="fas fa-calendar"></i>
                            <div>
                                <strong>วันที่</strong>
                                <span>${formatDateThai(log.date)}</span>
                            </div>
                        </div>
                        <div class="log-meta-item">
                            <i class="fas fa-tag"></i>
                            <div>
                                <strong>ประเภท</strong>
                                <span>${category.name}</span>
                            </div>
                        </div>
                        <div class="log-meta-item">
                            <i class="fas fa-laptop"></i>
                            <div>
                                <strong>รูปแบบ</strong>
                                <span>${formatLabels[log.format]}</span>
                            </div>
                        </div>
                        ${log.venue ? `
                        <div class="log-meta-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <strong>สถานที่</strong>
                                <span>${log.venue}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${log.organizer ? `
                        <div class="log-meta-item">
                            <i class="fas fa-building"></i>
                            <div>
                                <strong>ผู้จัด</strong>
                                <span>${log.organizer}</span>
                            </div>
                        </div>
                        ` : ''}
                        ${log.instructor ? `
                        <div class="log-meta-item">
                            <i class="fas fa-chalkboard-teacher"></i>
                            <div>
                                <strong>วิทยากร</strong>
                                <span>${log.instructor}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    ${log.competencies && log.competencies.length > 0 ? `
                    <div class="log-tags">
                        <strong style="color: #667eea;"><i class="fas fa-star"></i> สมรรถนะที่พัฒนา:</strong><br>
                        ${log.competencies.map(c => `<span class="log-tag">${c}</span>`).join('')}
                    </div>
                    ` : ''}

                    <div class="log-description">
                        <strong style="color: #667eea;"><i class="fas fa-file-alt"></i> สิ่งที่ได้เรียนรู้:</strong><br>
                        ${log.description}
                    </div>

                    ${log.application ? `
                    <div class="log-description" style="border-left-color: #4caf50;">
                        <strong style="color: #4caf50;"><i class="fas fa-lightbulb"></i> การนำไปใช้:</strong><br>
                        ${log.application}
                    </div>
                    ` : ''}

                    ${log.certificate ? `
                    <div style="margin: 10px 0; padding: 10px; background: #fff3cd; border-radius: 5px;">
                        <strong><i class="fas fa-certificate"></i> เกียรติบัตร:</strong> ${log.certificate}
                    </div>
                    ` : ''}

                    <div class="log-actions">
                        <button class="btn btn-view btn-small" onclick="viewLog(${log.id})">
                            <i class="fas fa-eye"></i> ดูรายละเอียด
                        </button>
                        <button class="btn btn-edit btn-small" onclick="editLog(${log.id})">
                            <i class="fas fa-edit"></i> แก้ไข
                        </button>
                        <button class="btn btn-delete btn-small" onclick="deleteLog(${log.id})">
                            <i class="fas fa-trash"></i> ลบ
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// View log detail
function viewLog(id) {
    const log = logs.find(l => l.id === id);
    if (!log) return;

    const category = getCategoryById(log.category);
    const formatLabels = { onsite: 'Onsite', online: 'Online', hybrid: 'Hybrid' };

    const content = `
        <div style="line-height: 1.8;">
            <h3 style="color: ${category.color}; margin-bottom: 20px;">${log.title}</h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div><strong>วันที่:</strong> ${formatDateThai(log.date)}</div>
                <div><strong>ชั่วโมง:</strong> ${log.hours} ชม.</div>
                <div><strong>ประเภท:</strong> ${category.name}</div>
                <div><strong>รูปแบบ:</strong> ${formatLabels[log.format]}</div>
                ${log.venue ? `<div><strong>สถานที่:</strong> ${log.venue}</div>` : ''}
                ${log.organizer ? `<div><strong>ผู้จัด:</strong> ${log.organizer}</div>` : ''}
                ${log.instructor ? `<div><strong>วิทยากร:</strong> ${log.instructor}</div>` : ''}
            </div>

            ${log.competencies && log.competencies.length > 0 ? `
            <div style="margin: 20px 0;">
                <strong style="color: #667eea;"><i class="fas fa-star"></i> สมรรถนะที่พัฒนา:</strong><br>
                ${log.competencies.map(c => `<span class="log-tag">${c}</span>`).join('')}
            </div>
            ` : ''}

            <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #667eea;">
                <strong style="color: #667eea;"><i class="fas fa-file-alt"></i> สิ่งที่ได้เรียนรู้:</strong><br><br>
                ${log.description}
            </div>

            ${log.application ? `
            <div style="margin: 20px 0; padding: 15px; background: #f1f8f4; border-radius: 8px; border-left: 3px solid #4caf50;">
                <strong style="color: #4caf50;"><i class="fas fa-lightbulb"></i> การนำไปใช้ในการสอน:</strong><br><br>
                ${log.application}
            </div>
            ` : ''}

            ${log.certificate ? `
            <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 8px;">
                <strong><i class="fas fa-certificate"></i> เกียรติบัตร/หลักฐาน:</strong><br>
                ${log.certificate}
            </div>
            ` : ''}
        </div>
    `;

    document.getElementById('viewModalContent').innerHTML = content;
    document.getElementById('viewModal').style.display = 'block';
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
}

// Update statistics
function updateStats() {
    const totalActivities = logs.length;
    const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);

    const currentMonth = new Date().toISOString().substring(0, 7);
    const thisMonth = logs.filter(log => log.date.startsWith(currentMonth)).length;

    document.getElementById('totalActivities').textContent = totalActivities;
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
    document.getElementById('thisMonth').textContent = thisMonth;

    // Update goal progress
    const currentYear = new Date().getFullYear() + 543;
    if (yearlyGoal.year === currentYear) {
        const yearStart = (currentYear - 543) + '-01-01';
        const yearEnd = (currentYear - 543) + '-12-31';
        const yearlyHours = logs
            .filter(log => log.date >= yearStart && log.date <= yearEnd)
            .reduce((sum, log) => sum + log.hours, 0);

        const progress = Math.min(100, (yearlyHours / yearlyGoal.hours) * 100);
        document.getElementById('goalProgress').textContent = progress.toFixed(0) + '%';
        document.getElementById('goalProgressBar').style.width = progress + '%';
        document.getElementById('goalText').textContent = `${yearlyHours.toFixed(1)} / ${yearlyGoal.hours} ชม.`;
    }
}

// Edit log
function editLog(id) {
    const log = logs.find(l => l.id === id);
    if (!log) return;

    document.getElementById('editId').value = log.id;
    document.getElementById('editDate').value = log.date;
    document.getElementById('editTitle').value = log.title;
    document.getElementById('editCategory').value = log.category;
    document.getElementById('editHours').value = log.hours;
    document.getElementById('editFormat').value = log.format;
    document.getElementById('editVenue').value = log.venue || '';
    document.getElementById('editOrganizer').value = log.organizer || '';
    document.getElementById('editInstructor').value = log.instructor || '';
    document.getElementById('editCompetency').value = (log.competencies || []).join(', ');
    document.getElementById('editDescription').value = log.description;
    document.getElementById('editApplication').value = log.application || '';
    document.getElementById('editCertificate').value = log.certificate || '';

    document.getElementById('editModal').style.display = 'block';
}

// Save edit
function saveEdit() {
    const id = parseInt(document.getElementById('editId').value);
    const logIndex = logs.findIndex(l => l.id === id);

    if (logIndex === -1) return;

    const competencies = document.getElementById('editCompetency').value
        .split(',')
        .map(c => c.trim())
        .filter(c => c);

    logs[logIndex] = {
        ...logs[logIndex],
        date: document.getElementById('editDate').value,
        title: document.getElementById('editTitle').value,
        category: document.getElementById('editCategory').value,
        hours: parseFloat(document.getElementById('editHours').value),
        format: document.getElementById('editFormat').value,
        venue: document.getElementById('editVenue').value,
        organizer: document.getElementById('editOrganizer').value,
        instructor: document.getElementById('editInstructor').value,
        competencies: competencies,
        description: document.getElementById('editDescription').value,
        application: document.getElementById('editApplication').value,
        certificate: document.getElementById('editCertificate').value
    };

    saveLogs();
    renderLogs();
    updateStats();
    closeEditModal();

    showNotification('แก้ไขสำเร็จ!', 'success');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Delete log
function deleteLog(id) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบบันทึกนี้?')) return;

    logs = logs.filter(log => log.id !== id);
    saveLogs();
    renderLogs();
    updateStats();

    showNotification('ลบสำเร็จ!', 'success');
}

// Clear filters
function clearFilters() {
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterFormat').value = '';
    document.getElementById('filterMonth').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('sortBy').value = 'date-desc';
    renderLogs();
}

// Goal management
function openGoalModal() {
    document.getElementById('goalYear').value = yearlyGoal.year;
    document.getElementById('goalHours').value = yearlyGoal.hours;
    document.getElementById('goalModal').style.display = 'block';
}

function closeGoalModal() {
    document.getElementById('goalModal').style.display = 'none';
}

function saveGoal() {
    yearlyGoal = {
        year: parseInt(document.getElementById('goalYear').value),
        hours: parseInt(document.getElementById('goalHours').value)
    };
    localStorage.setItem('yearlyGoal', JSON.stringify(yearlyGoal));
    updateStats();
    closeGoalModal();
    showNotification('บันทึกเป้าหมายสำเร็จ!', 'success');
}

// Export to JSON
function exportToJSON() {
    if (logs.length === 0) {
        alert('ไม่มีข้อมูลให้ส่งออก');
        return;
    }

    const data = {
        logs: logs,
        categories: categories,
        goal: yearlyGoal,
        teacherInfo: teacherInfo,
        exportDate: new Date().toISOString(),
        version: '2.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `teacher-logs-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('ส่งออกสำเร็จ!', 'success');
}

// Import from JSON
function importFromJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.logs || !Array.isArray(data.logs)) {
                throw new Error('Invalid data format');
            }

            if (logs.length > 0) {
                if (!confirm('การนำเข้าจะเพิ่มข้อมูลเข้ากับข้อมูลปัจจุบัน ต้องการดำเนินการต่อหรือไม่?')) {
                    return;
                }
            }

            // Merge logs (avoid duplicates)
            const existingIds = new Set(logs.map(log => log.id));
            const newLogs = data.logs.filter(log => !existingIds.has(log.id));
            logs = [...logs, ...newLogs];

            // Update categories if provided
            if (data.categories && Array.isArray(data.categories)) {
                const existingCatIds = new Set(categories.map(c => c.id));
                const newCategories = data.categories.filter(c => !existingCatIds.has(c.id));
                categories = [...categories, ...newCategories];
                saveCategories();
            }

            if (data.goal) {
                yearlyGoal = data.goal;
                localStorage.setItem('yearlyGoal', JSON.stringify(yearlyGoal));
            }

            if (data.teacherInfo) {
                teacherInfo = data.teacherInfo;
                localStorage.setItem('teacherInfo', JSON.stringify(teacherInfo));
            }

            saveLogs();
            initCategoryDropdowns();
            renderLogs();
            updateStats();

            showNotification(`นำเข้าสำเร็จ! เพิ่มข้อมูล ${newLogs.length} รายการ`, 'success');
        } catch (error) {
            alert('ไม่สามารถนำเข้าข้อมูลได้ กรุณาตรวจสอบไฟล์');
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Backup data
function backupData() {
    const backup = {
        logs: logs,
        categories: categories,
        goal: yearlyGoal,
        teacherInfo: teacherInfo,
        backupDate: new Date().toISOString(),
        version: '2.0'
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `backup-${timestamp}.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('สำรองข้อมูลสำเร็จ!', 'success');
}

// Restore data
function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm('การกู้คืนจะแทนที่ข้อมูลปัจจุบันทั้งหมด คุณแน่ใจหรือไม่?')) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);

            if (!backup.logs || !Array.isArray(backup.logs)) {
                throw new Error('Invalid backup format');
            }

            logs = backup.logs;
            if (backup.categories) {
                categories = backup.categories;
                saveCategories();
            }
            if (backup.goal) {
                yearlyGoal = backup.goal;
                localStorage.setItem('yearlyGoal', JSON.stringify(yearlyGoal));
            }
            if (backup.teacherInfo) {
                teacherInfo = backup.teacherInfo;
                localStorage.setItem('teacherInfo', JSON.stringify(teacherInfo));
            }

            saveLogs();
            initCategoryDropdowns();
            renderLogs();
            updateStats();

            showNotification('กู้คืนข้อมูลสำเร็จ!', 'success');
        } catch (error) {
            alert('ไม่สามารถกู้คืนข้อมูลได้ กรุณาตรวจสอบไฟล์');
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Export to CSV
function exportToCSV() {
    if (logs.length === 0) {
        alert('ไม่มีข้อมูลให้ส่งออก');
        return;
    }

    let csv = '\uFEFF';
    csv += 'วันที่,หัวข้อ,ประเภท,รูปแบบ,ชั่วโมง,สถานที่,ผู้จัด,วิทยากร,สมรรถนะ,รายละเอียด,การนำไปใช้\n';

    logs.forEach(log => {
        const category = getCategoryById(log.category);
        const formatLabels = { onsite: 'Onsite', online: 'Online', hybrid: 'Hybrid' };
        csv += `"${formatDateThai(log.date)}","${log.title}","${category.name}","${formatLabels[log.format]}","${log.hours}","${log.venue || ''}","${log.organizer || ''}","${log.instructor || ''}","${(log.competencies || []).join(', ')}","${log.description.replace(/"/g, '""')}","${(log.application || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `teacher-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('ส่งออกสำเร็จ!', 'success');
}

// Print Official Report
function printOfficialReport() {
    if (logs.length === 0) {
        alert('ไม่มีข้อมูลสำหรับพิมพ์รายงาน');
        return;
    }

    // Prompt for teacher info if not set
    if (!teacherInfo.name || !teacherInfo.school) {
        const name = prompt('ชื่อ-นามสกุล:', teacherInfo.name);
        const position = prompt('ตำแหน่ง:', teacherInfo.position || 'ครู');
        const school = prompt('โรงเรียน:', teacherInfo.school);
        const office = prompt('สำนักงานเขตพื้นที่การศึกษา:', teacherInfo.office);

        if (name && school) {
            teacherInfo = { name, position, school, office };
            localStorage.setItem('teacherInfo', JSON.stringify(teacherInfo));
        } else {
            return;
        }
    }

    // Calculate totals
    const totalHours = logs.reduce((sum, log) => sum + log.hours, 0);
    const categorySummary = {};
    logs.forEach(log => {
        const cat = getCategoryById(log.category);
        if (!categorySummary[cat.name]) {
            categorySummary[cat.name] = { count: 0, hours: 0 };
        }
        categorySummary[cat.name].count++;
        categorySummary[cat.name].hours += log.hours;
    });

    // Generate report HTML
    const reportDate = formatDateThai(new Date().toISOString().split('T')[0]);
    const currentYear = new Date().getFullYear() + 543;

    const reportHTML = `
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>รายงานการพัฒนาตนเองของครู</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
        body {
            font-family: 'Sarabun', sans-serif;
            line-height: 1.6;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px double #000;
        }
        .logo {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        .office-name {
            font-size: 1.2rem;
            font-weight: 600;
            margin: 5px 0;
        }
        .school-name {
            font-size: 1rem;
            margin: 5px 0;
        }
        .title {
            font-size: 1.4rem;
            font-weight: 700;
            margin: 30px 0 20px 0;
            text-align: center;
        }
        .meta-info {
            margin: 20px 0;
            line-height: 2.5;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #000;
            padding: 10px;
            text-align: left;
        }
        th {
            background: #f0f0f0;
            font-weight: 700;
            text-align: center;
        }
        td.center {
            text-align: center;
        }
        .summary {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-left: 4px solid #667eea;
        }
        .signature {
            margin-top: 60px;
            text-align: right;
            line-height: 2.5;
        }
        .signature-line {
            display: inline-block;
            min-width: 200px;
            border-bottom: 1px dotted #000;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🎓</div>
        <div class="office-name">${teacherInfo.office || 'สำนักงานเขตพื้นที่การศึกษา'}</div>
        <div class="school-name">${teacherInfo.school}</div>
    </div>

    <div class="meta-info">
        <div>ที่ ......................../........................</div>
        <div>วันที่ ${reportDate}</div>
    </div>

    <div class="title">รายงานผลการพัฒนาตนเอง</div>
    <div class="title" style="font-size: 1.2rem;">ประจำปีการศึกษา ${currentYear}</div>

    <div style="margin: 30px 0; line-height: 2;">
        <div><strong>เรื่อง</strong> รายงานผลการพัฒนาตนเองของครู</div>
        <div><strong>เรียน</strong> ผู้อำนวยการ${teacherInfo.school}</div>
    </div>

    <div style="margin: 30px 0; text-indent: 3em; line-height: 2; text-align: justify;">
        ด้วย ข้าพเจ้า ${teacherInfo.name} ตำแหน่ง ${teacherInfo.position}
        ได้ดำเนินการพัฒนาตนเองเพื่อพัฒนาสมรรถนะทางวิชาชีพ เพื่อนำความรู้และประสบการณ์
        มาใช้ในการพัฒนาคุณภาพการจัดการเรียนการสอน จึงขอรายงานผลการพัฒนาตนเอง
        ประจำปีการศึกษา ${currentYear} ดังต่อไปนี้
    </div>

    <div class="summary">
        <h3 style="margin-bottom: 15px;">สรุปผลการพัฒนาตนเอง</h3>
        <ul style="line-height: 2;">
            <li>จำนวนกิจกรรมพัฒนาตนเองทั้งหมด: <strong>${logs.length}</strong> กิจกรรม</li>
            <li>ชั่วโมงการพัฒนาตนเองรวม: <strong>${totalHours.toFixed(1)}</strong> ชั่วโมง</li>
        </ul>

        <h4 style="margin: 20px 0 10px 0;">สรุปแบ่งตามประเภทกิจกรรม:</h4>
        <ul style="line-height: 2;">
            ${Object.entries(categorySummary).map(([name, data]) =>
                `<li>${name}: ${data.count} กิจกรรม (${data.hours.toFixed(1)} ชั่วโมง)</li>`
            ).join('')}
        </ul>
    </div>

    <h3 style="margin: 30px 0 15px 0;">รายละเอียดกิจกรรมพัฒนาตนเอง</h3>

    <table>
        <thead>
            <tr>
                <th style="width: 5%;">ที่</th>
                <th style="width: 12%;">วันที่</th>
                <th style="width: 25%;">หัวข้อกิจกรรม</th>
                <th style="width: 15%;">ประเภท</th>
                <th style="width: 8%;">ชั่วโมง</th>
                <th style="width: 15%;">สถานที่</th>
                <th style="width: 20%;">หมายเหตุ</th>
            </tr>
        </thead>
        <tbody>
            ${logs.map((log, index) => {
                const category = getCategoryById(log.category);
                return `
                    <tr>
                        <td class="center">${index + 1}</td>
                        <td>${formatDateThai(log.date)}</td>
                        <td>${log.title}</td>
                        <td>${category.name}</td>
                        <td class="center">${log.hours}</td>
                        <td>${log.venue || '-'}</td>
                        <td>${log.organizer || '-'}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
        <tfoot>
            <tr style="background: #f0f0f0; font-weight: 700;">
                <td colspan="4" class="center">รวมทั้งสิ้น</td>
                <td class="center">${totalHours.toFixed(1)}</td>
                <td colspan="2"></td>
            </tr>
        </tfoot>
    </table>

    <div style="margin: 30px 0; text-indent: 3em; line-height: 2; text-align: justify;">
        จึงเรียนมาเพื่อโปรดทราบและพิจารณา
    </div>

    <div class="signature">
        <p>ขอแสดงความนับถือ</p>
        <p style="margin-top: 40px;">
            (ลงชื่อ) <span class="signature-line">${teacherInfo.name}</span>
        </p>
        <p>ตำแหน่ง ${teacherInfo.position}</p>
        <p>วันที่ <span class="signature-line">${reportDate}</span></p>
    </div>

    <div style="margin-top: 60px; line-height: 2;">
        <p><strong>ความเห็นของผู้บังคับบัญชา</strong></p>
        <div style="margin: 20px 0; min-height: 100px; border: 1px solid #ddd; padding: 15px;">
            .............................................................................................
            <br>.............................................................................................
            <br>.............................................................................................
        </div>
        <div style="margin-top: 40px; text-align: right;">
            <p>(ลงชื่อ) <span class="signature-line"></span></p>
            <p>ตำแหน่ง <span class="signature-line"></span></p>
            <p>วันที่ <span class="signature-line"></span></p>
        </div>
    </div>

</body>
</html>
    `;

    // Open in new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Chart Modal
let categoryChart = null;
let monthlyChart = null;

function openChartModal() {
    if (logs.length === 0) {
        alert('ไม่มีข้อมูลสำหรับแสดงกราฟ');
        return;
    }

    document.getElementById('chartModal').style.display = 'block';

    setTimeout(() => {
        renderCharts();
    }, 100);
}

function closeChartModal() {
    document.getElementById('chartModal').style.display = 'none';
    if (categoryChart) categoryChart.destroy();
    if (monthlyChart) monthlyChart.destroy();
}

function renderCharts() {
    // Category Chart
    const categoryData = {};
    logs.forEach(log => {
        const cat = getCategoryById(log.category);
        categoryData[cat.name] = (categoryData[cat.name] || 0) + 1;
    });

    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    if (categoryChart) categoryChart.destroy();

    const categoryColors = logs.map(log => getCategoryById(log.category).color);
    const uniqueColors = [...new Set(categoryColors)];

    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryData),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: uniqueColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Sarabun',
                            size: 14
                        }
                    }
                }
            }
        }
    });

    // Monthly Chart
    const monthlyData = {};
    logs.forEach(log => {
        const month = log.date.substring(0, 7);
        monthlyData[month] = (monthlyData[month] || 0) + log.hours;
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(monthlyCtx, {
        type: 'bar',
        data: {
            labels: sortedMonths.map(m => {
                const [year, month] = m.split('-');
                return `${parseInt(month)}/${parseInt(year) + 543}`;
            }),
            datasets: [{
                label: 'ชั่วโมง',
                data: sortedMonths.map(m => monthlyData[m]),
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: 'Sarabun',
                            size: 12
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: 'Sarabun',
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: 'Sarabun',
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// Helper functions
function formatDateThai(dateString) {
    const date = new Date(dateString);
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
                      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543;

    return `${day} ${month} ${year}`;
}

function adjustColor(color, amount) {
    const clamp = (num) => Math.min(Math.max(num, 0), 255);
    const num = parseInt(color.replace("#", ""), 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00FF) + amount);
    const b = clamp((num & 0x0000FF) + amount);
    return "#" + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-family: 'Sarabun', sans-serif;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initial render
initCategoryDropdowns();
renderLogs();
updateStats();
