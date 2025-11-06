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
                     data-category-id="${cat.id}"></div>
                <span>${cat.name}</span>
            </div>
            <div style="display: flex; gap: 10px;">
                <button type="button" class="btn btn-edit btn-small btn-edit-category" data-category-id="${cat.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-delete btn-small btn-delete-category" data-category-id="${cat.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `).join('');

    // Add event listeners
    list.querySelectorAll('.color-picker').forEach(picker => {
        picker.addEventListener('click', function() {
            const catId = this.getAttribute('data-category-id');
            changeCategoryColor(catId);
        });
    });

    list.querySelectorAll('.btn-edit-category').forEach(btn => {
        btn.addEventListener('click', function() {
            const catId = this.getAttribute('data-category-id');
            editCategoryName(catId);
        });
    });

    list.querySelectorAll('.btn-delete-category').forEach(btn => {
        btn.addEventListener('click', function() {
            const catId = this.getAttribute('data-category-id');
            deleteCategory(catId);
        });
    });
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
        certificateFiles: [...certificateFiles], // Store files array
        createdAt: new Date().toISOString()
    };

    logs.push(log);
    saveLogs();
    this.reset();
    document.getElementById('activityDate').valueAsDate = new Date();

    // Clear certificate files
    certificateFiles = [];
    renderCertificateFiles('certificateFilesList', certificateFiles, 'add');

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

// ========== AUTO SAVE TO GOOGLE ==========

let autoSaveTimeout = null;
let isSyncing = false;

// Auto save when data changes
function autoSaveToGoogle() {
    if (!googleSyncSettings.enabled || !googleSyncSettings.scriptUrl) {
        return; // Skip if not configured
    }

    // Clear existing timeout
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }

    // Debounce: wait 2 seconds after last change
    autoSaveTimeout = setTimeout(() => {
        if (!isSyncing) {
            syncToGoogleSilently();
        }
    }, 2000);
}

// Silent sync without user interaction - includes automatic file upload
async function syncToGoogleSilently() {
    if (isSyncing || logs.length === 0) return;

    try {
        isSyncing = true;
        showSyncIndicator(true);

        // First, upload any pending certificate files
        await uploadPendingFilesAuto();

        // Then save all data to Google Sheets
        await pushToGoogleQuick(true); // silent mode
        updateAutoSaveStatus();
    } catch (error) {
        console.error('Auto-save error:', error);
    } finally {
        isSyncing = false;
        showSyncIndicator(false);
    }
}

// Automatically upload pending certificate files in the background
async function uploadPendingFilesAuto() {
    if (!googleSyncSettings.enabled || !googleSyncSettings.scriptUrl) {
        return;
    }

    // Count pending files
    let pendingCount = 0;
    for (const log of logs) {
        if (log.certificateFiles) {
            pendingCount += log.certificateFiles.filter(f => !f.uploadedToGDrive).length;
        }
    }

    if (pendingCount === 0) {
        return; // No files to upload
    }

    // Find logs with pending files (not yet uploaded to Google Drive)
    let hasChanges = false;
    let uploadedCount = 0;

    for (const log of logs) {
        if (!log.certificateFiles || log.certificateFiles.length === 0) {
            continue;
        }

        for (let i = 0; i < log.certificateFiles.length; i++) {
            const file = log.certificateFiles[i];

            // Skip if already uploaded
            if (file.uploadedToGDrive && file.gdriveUrl) {
                continue;
            }

            // Show upload progress
            showSyncIndicator(true, `กำลังอัพโหลดไฟล์... (${uploadedCount + 1}/${pendingCount})`);

            // Upload file to Google Drive
            try {
                const uploadPayload = {
                    action: 'uploadFile',
                    folderId: googleSyncSettings.folderId,
                    fileName: file.name,
                    fileData: file.data,
                    logId: log.id
                };

                const uploadResponse = await fetch(googleSyncSettings.scriptUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: JSON.stringify(uploadPayload)
                });

                const uploadResult = await uploadResponse.json();

                if (uploadResult.success) {
                    // Update file with Google Drive info
                    log.certificateFiles[i] = {
                        ...file,
                        data: null, // Remove base64 data to save space
                        uploadedToGDrive: true,
                        gdriveId: uploadResult.fileId,
                        gdriveUrl: uploadResult.fileUrl
                    };
                    hasChanges = true;
                    uploadedCount++;
                }
            } catch (uploadError) {
                console.error('Auto file upload error:', uploadError);
                // Continue with next file even if one fails
            }
        }
    }

    // Save updated logs if there were any changes
    if (hasChanges) {
        localStorage.setItem('teacherLogs', JSON.stringify(logs));
    }
}

// Show/hide sync indicator
function showSyncIndicator(show, message = 'กำลังบันทึก...') {
    const indicator = document.getElementById('syncIndicator');
    if (indicator) {
        indicator.style.display = show ? 'inline' : 'none';
        if (show) {
            indicator.innerHTML = `<i class="fas fa-sync fa-spin"></i> ${message}`;
        }
    }
}

// Update auto-save status
function updateAutoSaveStatus() {
    const statusEl = document.getElementById('autoSaveStatus');
    if (statusEl && googleSyncSettings.enabled) {
        const now = new Date();
        statusEl.innerHTML = `<i class="fas fa-check-circle"></i> Auto-saved ${now.toLocaleTimeString('th-TH')}`;
        setTimeout(() => {
            statusEl.innerHTML = '';
        }, 3000);
    }
}

// Save logs to localStorage and sync to Google Sheets
function saveLogs() {
    localStorage.setItem('teacherLogs', JSON.stringify(logs));
    autoSaveToGoogle(); // Auto-save to Google Sheets (main backup)
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

                    ${log.certificateFiles && log.certificateFiles.length > 0 ? `
                    <div style="margin: 15px 0;">
                        <strong style="color: #667eea;"><i class="fas fa-certificate"></i> เกียรติบัตร/หลักฐาน (${log.certificateFiles.length} ไฟล์):</strong>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                            ${log.certificateFiles.map((file, idx) => {
                                const { icon, className } = getFileIcon(file.name);
                                return `
                                    <div style="display: flex; align-items: center; gap: 8px; padding: 8px; background: white; border: 1px solid #e0e0e0; border-radius: 8px;">
                                        <div style="width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 0.9rem;">
                                            <i class="${icon}"></i>
                                        </div>
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="font-size: 0.85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${file.name}">${file.name}</div>
                                            <div style="font-size: 0.75rem; color: #999;">${formatFileSize(file.size)}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    ` : ''}

                    <div class="log-actions">
                        <button type="button" class="btn btn-view btn-small btn-view-log" data-log-id="${log.id}">
                            <i class="fas fa-eye"></i> ดูรายละเอียด
                        </button>
                        <button type="button" class="btn btn-edit btn-small btn-edit-log" data-log-id="${log.id}">
                            <i class="fas fa-edit"></i> แก้ไข
                        </button>
                        <button type="button" class="btn btn-delete btn-small btn-delete-log" data-log-id="${log.id}">
                            <i class="fas fa-trash"></i> ลบ
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners for log action buttons
    const logsContainer = document.querySelector('.logs-list');
    if (logsContainer) {
        logsContainer.querySelectorAll('.btn-view-log').forEach(btn => {
            btn.addEventListener('click', function() {
                const logId = parseInt(this.getAttribute('data-log-id'));
                viewLog(logId);
            });
        });

        logsContainer.querySelectorAll('.btn-edit-log').forEach(btn => {
            btn.addEventListener('click', function() {
                const logId = parseInt(this.getAttribute('data-log-id'));
                editLog(logId);
            });
        });

        logsContainer.querySelectorAll('.btn-delete-log').forEach(btn => {
            btn.addEventListener('click', function() {
                const logId = parseInt(this.getAttribute('data-log-id'));
                deleteLog(logId);
            });
        });
    }
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

            ${log.certificateFiles && log.certificateFiles.length > 0 ? `
            <div style="margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 8px;">
                <strong><i class="fas fa-certificate"></i> เกียรติบัตร/หลักฐาน (${log.certificateFiles.length} ไฟล์):</strong><br><br>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${log.certificateFiles.map((file, idx) => {
                        const { icon, className } = getFileIcon(file.name);
                        return `
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: white; border: 1px solid #e0e0e0; border-radius: 8px;">
                                <div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                                    <i class="${icon}"></i>
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${file.name}">${file.name}</div>
                                    <div style="font-size: 0.85rem; color: #999;">${formatFileSize(file.size)}</div>
                                </div>
                                <button type="button" class="btn btn-small btn-view btn-download-cert" data-log-id="${log.id}" data-file-index="${idx}" style="margin: 0;">
                                    <i class="fas fa-download"></i> ดาวน์โหลด
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;

    document.getElementById('viewModalContent').innerHTML = content;
    document.getElementById('viewModal').style.display = 'block';

    // Add event listeners for certificate download buttons
    document.querySelectorAll('.btn-download-cert').forEach(btn => {
        btn.addEventListener('click', function() {
            const logId = parseInt(this.getAttribute('data-log-id'));
            const fileIndex = parseInt(this.getAttribute('data-file-index'));
            downloadCertificateFromLog(logId, fileIndex);
        });
    });
}

function closeViewModal() {
    document.getElementById('viewModal').style.display = 'none';
}

// Download certificate file from log
function downloadCertificateFromLog(logId, fileIndex) {
    const log = logs.find(l => l.id === logId);
    if (!log || !log.certificateFiles || !log.certificateFiles[fileIndex]) return;

    const file = log.certificateFiles[fileIndex];

    // If file has Google Drive URL, open it
    if (file.gdriveUrl) {
        window.open(file.gdriveUrl, '_blank');
        return;
    }

    // Otherwise download from base64
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    link.click();
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

    // Load existing certificate files
    editCertificateFiles = log.certificateFiles ? [...log.certificateFiles] : [];
    renderCertificateFiles('editCertificateFilesList', editCertificateFiles, 'edit');

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
        certificateFiles: [...editCertificateFiles] // Update files
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

// Export to JSON (for offline backup)
function exportToJSON() {
    if (logs.length === 0) {
        alert('ไม่มีข้อมูลให้ส่งออก');
        return;
    }

    const teacherProfile = JSON.parse(localStorage.getItem('teacherProfile')) || {};

    const data = {
        logs: logs,
        categories: categories,
        goal: yearlyGoal,
        teacherInfo: teacherInfo,
        teacherProfile: teacherProfile,
        googleSyncSettings: googleSyncSettings,
        exportDate: new Date().toISOString(),
        version: '5.0'
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

    showNotification('ส่งออกสำเร็จ! (สำหรับ offline backup)', 'success');
}

// REMOVED: importFromJSON() - ใช้ pullFromGoogle() แทน
// REMOVED: backupData() - ซ้ำกับ exportToJSON()
// REMOVED: restoreData() - ใช้ pullFromGoogle() แทน
//
// ระบบใหม่: Google Sheets เป็น source of truth หลัก
// - ดึงข้อมูล: ใช้ pullFromGoogle()
// - ส่งออกสำรอง offline: ใช้ exportToJSON() หรือ exportToCSV()

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

// ========== CERTIFICATE FILES MANAGEMENT ==========

// Store certificate files temporarily
let certificateFiles = [];
let editCertificateFiles = [];

// Handle certificate file selection
function handleCertificateFiles(event, mode) {
    const files = Array.from(event.target.files);
    const targetArray = mode === 'edit' ? editCertificateFiles : certificateFiles;
    const listElement = mode === 'edit' ? 'editCertificateFilesList' : 'certificateFilesList';

    files.forEach(file => {
        // Check file size (max 10MB per file)
        if (file.size > 10 * 1024 * 1024) {
            alert(`ไฟล์ "${file.name}" มีขนาดใหญ่เกิน 10MB กรุณาเลือกไฟล์ที่เล็กกว่า`);
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result, // Base64
                uploadedToGDrive: false,
                gdriveId: null,
                gdriveUrl: null
            };

            targetArray.push(fileData);
            renderCertificateFiles(listElement, targetArray, mode);
        };
        reader.readAsDataURL(file);
    });

    // Clear input
    event.target.value = '';
}

// Render certificate files list
function renderCertificateFiles(elementId, filesArray, mode) {
    const container = document.getElementById(elementId);
    if (!container) return;

    if (filesArray.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = filesArray.map((file, index) => {
        const { icon, className } = getFileIcon(file.name);
        const sizeStr = formatFileSize(file.size);
        const isUploaded = file.uploadedToGDrive;

        const escapedUrl = file.gdriveUrl ? file.gdriveUrl.replace(/'/g, '&apos;') : '';

        return `
            <div class="file-preview-item" data-file-id="${file.id}">
                <div class="file-preview-icon ${className}">
                    <i class="${icon}"></i>
                </div>
                <div class="file-preview-info">
                    <div class="file-preview-name" title="${file.name}">${file.name}</div>
                    <div class="file-preview-size">
                        ${sizeStr}
                        ${isUploaded ? '<span style="color: #4caf50; margin-left: 10px;"><i class="fas fa-check-circle"></i> อัพโหลดแล้ว</span>' : ''}
                    </div>
                </div>
                <div class="file-preview-actions">
                    ${file.gdriveUrl ? `
                        <button type="button" class="btn-file-action btn-file-download" data-url="${escapedUrl}" title="ดาวน์โหลด">
                            <i class="fas fa-download"></i>
                        </button>
                    ` : `
                        <button type="button" class="btn-file-action btn-file-download" data-index="${index}" data-mode="${mode}" title="ดาวน์โหลด">
                            <i class="fas fa-download"></i>
                        </button>
                    `}
                    <button type="button" class="btn-file-action btn-file-delete" data-index="${index}" data-mode="${mode}" title="ลบ">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners for file action buttons
    container.querySelectorAll('.btn-file-download').forEach(btn => {
        btn.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            const index = this.getAttribute('data-index');
            const mode = this.getAttribute('data-mode');

            if (url) {
                // Open Google Drive URL
                window.open(url, '_blank');
            } else if (index !== null && mode) {
                // Download from local data
                downloadCertificateFile(parseInt(index), mode);
            }
        });
    });

    container.querySelectorAll('.btn-file-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const mode = this.getAttribute('data-mode');
            if (index >= 0 && mode) {
                deleteCertificateFile(index, mode);
            }
        });
    });
}

// Get file icon based on file extension
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();

    const iconMap = {
        // Documents
        'pdf': { icon: 'fas fa-file-pdf', className: 'pdf' },
        'doc': { icon: 'fas fa-file-word', className: 'word' },
        'docx': { icon: 'fas fa-file-word', className: 'word' },
        'xls': { icon: 'fas fa-file-excel', className: 'excel' },
        'xlsx': { icon: 'fas fa-file-excel', className: 'excel' },
        'ppt': { icon: 'fas fa-file-powerpoint', className: 'word' },
        'pptx': { icon: 'fas fa-file-powerpoint', className: 'word' },

        // Images
        'jpg': { icon: 'fas fa-file-image', className: 'image' },
        'jpeg': { icon: 'fas fa-file-image', className: 'image' },
        'png': { icon: 'fas fa-file-image', className: 'image' },
        'gif': { icon: 'fas fa-file-image', className: 'image' },
        'bmp': { icon: 'fas fa-file-image', className: 'image' },
        'svg': { icon: 'fas fa-file-image', className: 'image' },

        // Archives
        'zip': { icon: 'fas fa-file-archive', className: 'default' },
        'rar': { icon: 'fas fa-file-archive', className: 'default' },
        '7z': { icon: 'fas fa-file-archive', className: 'default' },

        // Text
        'txt': { icon: 'fas fa-file-alt', className: 'default' },
        'csv': { icon: 'fas fa-file-csv', className: 'excel' },
    };

    return iconMap[ext] || { icon: 'fas fa-file', className: 'default' };
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Download certificate file
function downloadCertificateFile(index, mode) {
    const targetArray = mode === 'edit' ? editCertificateFiles : certificateFiles;
    const file = targetArray[index];

    if (!file) return;

    // If file has Google Drive URL, open it
    if (file.gdriveUrl) {
        window.open(file.gdriveUrl, '_blank');
        return;
    }

    // Otherwise download from base64
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    link.click();
}

// Delete certificate file
function deleteCertificateFile(index, mode) {
    if (!confirm('ต้องการลบไฟล์นี้หรือไม่?')) return;

    const targetArray = mode === 'edit' ? editCertificateFiles : certificateFiles;
    const listElement = mode === 'edit' ? 'editCertificateFilesList' : 'certificateFilesList';

    targetArray.splice(index, 1);
    renderCertificateFiles(listElement, targetArray, mode);

    showNotification('ลบไฟล์สำเร็จ!', 'success');
}

// Upload files to Google Drive (will be called during Google sync)
async function uploadCertificateFilesToDrive(files, logId) {
    if (!googleSyncSettings.enabled || !googleSyncSettings.scriptUrl) {
        return files; // Return as-is if Google sync not configured
    }

    const uploadedFiles = [];

    for (const file of files) {
        if (file.uploadedToGDrive && file.gdriveUrl) {
            // Already uploaded
            uploadedFiles.push(file);
            continue;
        }

        try {
            const payload = {
                action: 'uploadFile',
                folderId: googleSyncSettings.folderId,
                fileName: file.name,
                fileData: file.data,
                logId: logId
            };

            const response = await fetch(googleSyncSettings.scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                uploadedFiles.push({
                    ...file,
                    uploadedToGDrive: true,
                    gdriveId: result.fileId,
                    gdriveUrl: result.fileUrl
                });
            } else {
                // If upload fails, keep original
                uploadedFiles.push(file);
            }
        } catch (error) {
            console.error('Upload error:', error);
            uploadedFiles.push(file);
        }
    }

    return uploadedFiles;
}

// ========== PROFILE MANAGEMENT ==========

function openProfileModal() {
    loadProfile();
    document.getElementById('profileModal').style.display = 'block';
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

function loadProfile() {
    // Load existing profile data
    const profile = JSON.parse(localStorage.getItem('teacherProfile')) || {
        name: teacherInfo.name || '',
        position: teacherInfo.position || 'ครู',
        school: teacherInfo.school || '',
        office: teacherInfo.office || '',
        email: '',
        phone: '',
        photo: ''
    };

    document.getElementById('profileName').value = profile.name;
    document.getElementById('profilePosition').value = profile.position;
    document.getElementById('profileSchool').value = profile.school;
    document.getElementById('profileOffice').value = profile.office;
    document.getElementById('profileEmail').value = profile.email || '';
    document.getElementById('profilePhone').value = profile.phone || '';

    // Load photo if exists
    if (profile.photo) {
        document.getElementById('profilePhotoPreview').src = profile.photo;
    }
}

function handleProfilePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('ไฟล์รูปภาพมีขนาดใหญ่เกิน 2MB กรุณาเลือกไฟล์ที่เล็กกว่า');
        event.target.value = '';
        return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
        event.target.value = '';
        return;
    }

    // Read and preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('profilePhotoPreview');
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function saveProfile() {
    const profile = {
        name: document.getElementById('profileName').value.trim(),
        position: document.getElementById('profilePosition').value.trim(),
        school: document.getElementById('profileSchool').value.trim(),
        office: document.getElementById('profileOffice').value.trim(),
        email: document.getElementById('profileEmail').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        photo: document.getElementById('profilePhotoPreview').src
    };

    if (!profile.name || !profile.school) {
        alert('กรุณากรอกชื่อและโรงเรียนอย่างน้อย');
        return;
    }

    // Save to localStorage
    localStorage.setItem('teacherProfile', JSON.stringify(profile));

    // Update teacherInfo for compatibility
    teacherInfo = {
        name: profile.name,
        position: profile.position,
        school: profile.school,
        office: profile.office
    };
    localStorage.setItem('teacherInfo', JSON.stringify(teacherInfo));

    closeProfileModal();
    showNotification('บันทึกโปรไฟล์สำเร็จ!', 'success');
}

// ========== GOOGLE SYNC MANAGEMENT ==========

let googleSyncSettings = JSON.parse(localStorage.getItem('googleSyncSettings')) || {
    scriptUrl: '',
    folderId: '',
    lastSync: null,
    enabled: false
};

function openGoogleSyncModal() {
    loadGoogleSyncSettings();
    document.getElementById('googleSyncModal').style.display = 'block';
}

function closeGoogleSyncModal() {
    document.getElementById('googleSyncModal').style.display = 'none';
}

function loadGoogleSyncSettings() {
    document.getElementById('googleScriptUrl').value = googleSyncSettings.scriptUrl || '';
    document.getElementById('googleDriveFolderId').value = googleSyncSettings.folderId || '';

    updateSyncStatus();
}

function updateSyncStatus() {
    const statusDiv = document.getElementById('syncStatus');
    const lastSyncDiv = document.getElementById('lastSyncTime');

    if (googleSyncSettings.enabled && googleSyncSettings.scriptUrl) {
        statusDiv.innerHTML = '<i class="fas fa-circle" style="color: #4caf50;"></i> เชื่อมต่อแล้ว';
    } else {
        statusDiv.innerHTML = '<i class="fas fa-circle" style="color: #999;"></i> ยังไม่ได้เชื่อมต่อ';
    }

    if (googleSyncSettings.lastSync) {
        const lastSyncDate = new Date(googleSyncSettings.lastSync);
        lastSyncDiv.textContent = `ซิงค์ครั้งล่าสุด: ${formatDateThai(lastSyncDate.toISOString().split('T')[0])} ${lastSyncDate.toLocaleTimeString('th-TH')}`;
    } else {
        lastSyncDiv.textContent = 'ซิงค์ครั้งล่าสุด: ไม่เคย';
    }
}

function showGoogleScriptCode() {
    const codeSection = document.getElementById('scriptCodeSection');
    const scriptCode = document.getElementById('scriptCode');

    // Toggle display
    if (codeSection.style.display === 'none') {
        codeSection.style.display = 'block';

        // Generate Google Apps Script code
        scriptCode.textContent = `// Google Apps Script for Teacher Development Log System v3.2
// Deploy this as a Web App with "Anyone" access
// IMPORTANT: Set "Execute as: Me" and "Who has access: Anyone"

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Teacher Development Log API v3.2 is running',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const folderId = params.folderId || 'YOUR_FOLDER_ID';

    if (action === 'test') {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Connection successful!',
        version: '3.2',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'push') {
      // Save data to Google Sheets
      const sheetId = getOrCreateSheet(folderId);
      const ss = SpreadsheetApp.openById(sheetId);

      // === SHEET 1: Logs ===
      let logsSheet = ss.getSheetByName('Logs');
      if (!logsSheet) {
        logsSheet = ss.insertSheet('Logs');
      }
      logsSheet.clear();

      // Write headers for Logs
      logsSheet.getRange(1, 1, 1, 12).setValues([[
        'วันที่', 'หัวข้อ', 'ประเภท', 'รูปแบบ', 'ชั่วโมง',
        'สถานที่', 'ผู้จัด', 'วิทยากร', 'สมรรถนะ', 'รายละเอียด', 'การนำไปใช้', 'จำนวนไฟล์'
      ]]).setFontWeight('bold').setBackground('#667eea').setFontColor('#ffffff');

      // Write logs data
      const logs = params.logs || [];
      const categories = params.categories || [];

      if (logs.length > 0) {
        const data = logs.map(log => {
          const category = categories.find(c => c.id === log.category);
          const fileCount = log.certificateFiles ? log.certificateFiles.length : 0;
          return [
            log.date,
            log.title,
            category ? category.name : '',
            log.format,
            log.hours,
            log.venue || '',
            log.organizer || '',
            log.instructor || '',
            (log.competencies || []).join(', '),
            log.description,
            log.application || '',
            fileCount
          ];
        });

        logsSheet.getRange(2, 1, data.length, 12).setValues(data);
      }

      // === SHEET 2: Settings ===
      let settingsSheet = ss.getSheetByName('Settings');
      if (!settingsSheet) {
        settingsSheet = ss.insertSheet('Settings');
      }
      settingsSheet.clear();

      // Write Settings data
      const settingsData = [
        ['ข้อมูล', 'รายละเอียด'],
        [],
        ['=== ข้อมูลครู ===', ''],
        ['ชื่อ-นามสกุล', params.teacherProfile?.name || params.teacherInfo?.name || ''],
        ['ตำแหน่ง', params.teacherProfile?.position || params.teacherInfo?.position || ''],
        ['โรงเรียน', params.teacherProfile?.school || params.teacherInfo?.school || ''],
        ['สพท.', params.teacherProfile?.office || params.teacherInfo?.office || ''],
        ['อีเมล', params.teacherProfile?.email || ''],
        ['เบอร์โทร', params.teacherProfile?.phone || ''],
        [],
        ['=== เป้าหมายประจำปี ===', ''],
        ['ปี พ.ศ.', params.goal?.year || ''],
        ['เป้าหมายชั่วโมง', params.goal?.hours || ''],
        [],
        ['=== การตั้งค่า Google Sync ===', ''],
        ['Script URL', params.googleSyncSettings?.scriptUrl || ''],
        ['Folder ID', params.googleSyncSettings?.folderId || ''],
        ['เปิดใช้งาน', params.googleSyncSettings?.enabled ? 'Yes' : 'No'],
        [],
        ['=== ประเภทกิจกรรม ===', '']
      ];

      // Add categories
      if (categories && categories.length > 0) {
        categories.forEach(cat => {
          settingsData.push([cat.name, cat.color]);
        });
      }

      settingsSheet.getRange(1, 1, settingsData.length, 2).setValues(settingsData);
      settingsSheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#764ba2').setFontColor('#ffffff');

      // === SHEET 3: Certificate Files ===
      let filesSheet = ss.getSheetByName('Certificate Files');
      if (!filesSheet) {
        filesSheet = ss.insertSheet('Certificate Files');
      }
      filesSheet.clear();

      // Write headers for Files
      filesSheet.getRange(1, 1, 1, 6).setValues([[
        'Log ID', 'กิจกรรม', 'ชื่อไฟล์', 'ขนาด', 'อัพโหลดแล้ว', 'Google Drive URL'
      ]]).setFontWeight('bold').setBackground('#43e97b').setFontColor('#ffffff');

      // Collect all files from all logs
      const allFiles = [];
      logs.forEach(log => {
        if (log.certificateFiles && log.certificateFiles.length > 0) {
          log.certificateFiles.forEach(file => {
            allFiles.push([
              log.id,
              log.title,
              file.name,
              formatFileSize(file.size),
              file.uploadedToGDrive ? 'Yes' : 'No',
              file.gdriveUrl || ''
            ]);
          });
        }
      });

      if (allFiles.length > 0) {
        filesSheet.getRange(2, 1, allFiles.length, 6).setValues(allFiles);

        // Make URLs clickable
        for (let i = 0; i < allFiles.length; i++) {
          if (allFiles[i][5]) {
            filesSheet.getRange(i + 2, 6).setFormula('=HYPERLINK("' + allFiles[i][5] + '", "Open")');
          }
        }
      }

      // Save profile photo to Drive if provided
      if (params.profilePhoto && params.profilePhoto.startsWith('data:image')) {
        const folder = DriveApp.getFolderById(folderId);
        const base64Data = params.profilePhoto.split(',')[1];
        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/jpeg', 'profile-photo.jpg');

        // Delete old photo if exists
        const files = folder.getFilesByName('profile-photo.jpg');
        while (files.hasNext()) {
          files.next().setTrashed(true);
        }

        folder.createFile(blob);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Data uploaded successfully!',
        recordCount: logs.length,
        fileCount: allFiles.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Helper function for formatting file size in Google Apps Script
    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    if (action === 'pull') {
      // Get data from Google Sheets - Read ALL 3 sheets
      const sheetId = getOrCreateSheet(folderId);
      const ss = SpreadsheetApp.openById(sheetId);

      // === READ SHEET 1: Logs ===
      let logsSheet = ss.getSheetByName('Logs');
      if (!logsSheet) {
        logsSheet = ss.getSheets()[0]; // Fallback to first sheet
      }

      const logsData = logsSheet.getDataRange().getValues();
      const logs = [];

      for (let i = 1; i < logsData.length; i++) {
        const row = logsData[i];
        if (!row[0]) continue;

        logs.push({
          id: row[0],
          date: row[1],
          title: row[2],
          category: row[3],
          format: row[4],
          hours: parseFloat(row[5]) || 0,
          venue: row[6],
          organizer: row[7],
          instructor: row[8],
          competencies: row[9] ? row[9].split(',').map(c => c.trim()) : [],
          description: row[10],
          application: row[11],
          createdAt: row[12] || new Date().toISOString(),
          certificateFiles: [] // Will be populated from Certificate Files sheet
        });
      }

      // === READ SHEET 2: Settings ===
      let settingsSheet = ss.getSheetByName('Settings');
      let categories = [];
      let yearlyGoal = { total: 0, current: 0 };
      let teacherInfo = { name: '', school: '' };
      let teacherProfile = {};
      let googleSyncSettings = {};
      let profilePhoto = '';

      if (settingsSheet) {
        const settingsData = settingsSheet.getDataRange().getValues();

        for (let i = 1; i < settingsData.length; i++) {
          const row = settingsData[i];
          const key = row[0];
          const value = row[1];

          if (key === 'categories') {
            try {
              categories = JSON.parse(value);
            } catch (e) {
              categories = [];
            }
          } else if (key === 'yearlyGoal') {
            try {
              yearlyGoal = JSON.parse(value);
            } catch (e) {
              yearlyGoal = { total: 0, current: 0 };
            }
          } else if (key === 'teacherInfo') {
            try {
              teacherInfo = JSON.parse(value);
            } catch (e) {
              teacherInfo = { name: '', school: '' };
            }
          } else if (key === 'teacherProfile') {
            try {
              teacherProfile = JSON.parse(value);
            } catch (e) {
              teacherProfile = {};
            }
          } else if (key === 'googleSyncSettings') {
            try {
              googleSyncSettings = JSON.parse(value);
            } catch (e) {
              googleSyncSettings = {};
            }
          } else if (key === 'profilePhoto') {
            profilePhoto = value || '';
          }
        }
      }

      // === READ SHEET 3: Certificate Files ===
      let filesSheet = ss.getSheetByName('Certificate Files');

      if (filesSheet) {
        const filesData = filesSheet.getDataRange().getValues();

        for (let i = 1; i < filesData.length; i++) {
          const row = filesData[i];
          if (!row[0]) continue;

          const logId = row[0];
          const fileName = row[2];
          const fileSize = row[3];
          const uploaded = row[4] === 'Yes';
          const gdriveUrl = row[5];

          // Find corresponding log and add file
          const log = logs.find(l => l.id == logId);
          if (log) {
            if (!log.certificateFiles) {
              log.certificateFiles = [];
            }

            log.certificateFiles.push({
              id: Date.now() + Math.random(),
              name: fileName,
              size: 0, // Size in text format, can't convert back easily
              type: '',
              data: null,
              uploadedToGDrive: uploaded,
              gdriveId: null,
              gdriveUrl: gdriveUrl
            });
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        logs: logs,
        categories: categories,
        yearlyGoal: yearlyGoal,
        teacherInfo: teacherInfo,
        teacherProfile: teacherProfile,
        googleSyncSettings: googleSyncSettings,
        profilePhoto: profilePhoto,
        message: 'All data downloaded successfully!'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'uploadFile') {
      // Upload certificate file to Google Drive
      const fileName = params.fileName || 'certificate.pdf';
      const fileData = params.fileData; // Base64 data URL
      const logId = params.logId || 'unknown';

      if (!fileData) {
        throw new Error('No file data provided');
      }

      // Extract mime type and base64 data
      const matches = fileData.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid file data format');
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      // Create blob from base64
      const blob = Utilities.newBlob(
        Utilities.base64Decode(base64Data),
        mimeType,
        fileName
      );

      // Get or create certificates folder
      const folder = DriveApp.getFolderById(folderId);
      let certFolder;
      const certFolders = folder.getFoldersByName('Certificates');
      if (certFolders.hasNext()) {
        certFolder = certFolders.next();
      } else {
        certFolder = folder.createFolder('Certificates');
      }

      // Upload file
      const file = certFolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        fileId: file.getId(),
        fileUrl: file.getUrl(),
        fileName: fileName,
        message: 'File uploaded successfully!'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFilesByName('Teacher Development Logs');

  if (files.hasNext()) {
    return files.next().getId();
  }

  // Create new spreadsheet
  const ss = SpreadsheetApp.create('Teacher Development Logs');
  const file = DriveApp.getFileById(ss.getId());
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);

  return ss.getId();
}`;
    } else {
        codeSection.style.display = 'none';
    }
}

function copyScriptCode() {
    const scriptCode = document.getElementById('scriptCode');
    const text = scriptCode.textContent;

    navigator.clipboard.writeText(text).then(() => {
        showNotification('คัดลอกโค้ดสำเร็จ!', 'success');
    }).catch(err => {
        alert('ไม่สามารถคัดลอกได้: ' + err);
    });
}

function saveGoogleSyncSettings() {
    const scriptUrl = document.getElementById('googleScriptUrl').value.trim();
    const folderId = document.getElementById('googleDriveFolderId').value.trim();

    if (!scriptUrl || !folderId) {
        alert('กรุณากรอก URL และ Folder ID');
        return;
    }

    googleSyncSettings.scriptUrl = scriptUrl;
    googleSyncSettings.folderId = folderId;
    googleSyncSettings.enabled = true;

    localStorage.setItem('googleSyncSettings', JSON.stringify(googleSyncSettings));
    updateSyncStatus();
    showNotification('บันทึกการตั้งค่าสำเร็จ!', 'success');
}

async function testGoogleConnection() {
    const scriptUrl = document.getElementById('googleScriptUrl').value.trim();

    if (!scriptUrl) {
        alert('กรุณากรอก Script URL ก่อน');
        return;
    }

    try {
        showNotification('กำลังทดสอบการเชื่อมต่อ...', 'success');

        const response = await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Important for cross-origin requests
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'test',
                folderId: document.getElementById('googleDriveFolderId').value.trim()
            })
        });

        // Since we're using no-cors, we can't read the response
        // But if no error is thrown, the connection is likely successful
        showNotification('ทดสอบการเชื่อมต่อสำเร็จ! (หากไม่แน่ใจ ลองอัพโหลดข้อมูลดู)', 'success');

    } catch (error) {
        console.error('Connection test error:', error);
        showNotification('การทดสอบล้มเหลว: ' + error.message, 'error');
    }
}

// Quick sync for auto-save (no file upload)
async function pushToGoogleQuick(silent = false) {
    if (!googleSyncSettings.enabled || !googleSyncSettings.scriptUrl) return;

    try {
        const profile = JSON.parse(localStorage.getItem('teacherProfile')) || {};

        const payload = {
            action: 'push',
            folderId: googleSyncSettings.folderId,
            logs: logs,
            categories: categories,
            goal: yearlyGoal,
            teacherInfo: teacherInfo,
            teacherProfile: profile,
            googleSyncSettings: {
                scriptUrl: googleSyncSettings.scriptUrl,
                folderId: googleSyncSettings.folderId,
                enabled: googleSyncSettings.enabled
            },
            profilePhoto: profile.photo || ''
        };

        await fetch(googleSyncSettings.scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload)
        });

        googleSyncSettings.lastSync = new Date().toISOString();
        localStorage.setItem('googleSyncSettings', JSON.stringify(googleSyncSettings));
        updateSyncStatus();

        if (!silent) {
            showNotification('บันทึกข้อมูลสำเร็จ!', 'success');
        }
    } catch (error) {
        console.error('Quick sync error:', error);
    }
}

// Full sync with file upload
async function pushToGoogle() {
    if (!googleSyncSettings.enabled || !googleSyncSettings.scriptUrl) {
        alert('กรุณาตั้งค่าและบันทึกการเชื่อมต่อก่อน');
        return;
    }

    if (logs.length === 0) {
        alert('ไม่มีข้อมูลให้อัพโหลด');
        return;
    }

    // Count total files
    const totalFiles = logs.reduce((sum, log) => sum + (log.certificateFiles?.length || 0), 0);

    if (!confirm(`ต้องการอัพโหลดข้อมูลและไฟล์ ${totalFiles} ไฟล์ไป Google หรือไม่?\n(ไฟล์ขนาดใหญ่อาจใช้เวลานาน)`)) {
        return;
    }

    try {
        showNotification('กำลังเตรียมข้อมูล...', 'success');

        // Step 1: Upload all certificate files to Google Drive
        let uploadedCount = 0;
        const updatedLogs = [];

        for (const log of logs) {
            if (log.certificateFiles && log.certificateFiles.length > 0) {
                showNotification(`กำลังอัพโหลดไฟล์... (${uploadedCount}/${totalFiles})`, 'success');

                const uploadedFiles = [];
                for (const file of log.certificateFiles) {
                    // Skip if already uploaded
                    if (file.uploadedToGDrive && file.gdriveUrl) {
                        uploadedFiles.push(file);
                        continue;
                    }

                    try {
                        const uploadPayload = {
                            action: 'uploadFile',
                            folderId: googleSyncSettings.folderId,
                            fileName: file.name,
                            fileData: file.data,
                            logId: log.id
                        };

                        const uploadResponse = await fetch(googleSyncSettings.scriptUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'text/plain',
                            },
                            body: JSON.stringify(uploadPayload)
                        });

                        const uploadResult = await uploadResponse.json();

                        if (uploadResult.success) {
                            uploadedFiles.push({
                                ...file,
                                data: null, // Remove base64 data to save space
                                uploadedToGDrive: true,
                                gdriveId: uploadResult.fileId,
                                gdriveUrl: uploadResult.fileUrl
                            });
                            uploadedCount++;
                        } else {
                            // Keep original if upload fails
                            uploadedFiles.push(file);
                        }
                    } catch (uploadError) {
                        console.error('File upload error:', uploadError);
                        uploadedFiles.push(file);
                    }
                }

                updatedLogs.push({
                    ...log,
                    certificateFiles: uploadedFiles
                });
            } else {
                updatedLogs.push(log);
            }
        }

        // Update local logs with Google Drive URLs
        logs.splice(0, logs.length, ...updatedLogs);
        saveLogs();

        // Step 2: Upload all data to Google Sheets
        showNotification('กำลังบันทึกข้อมูลลง Google Sheets...', 'success');

        const profile = JSON.parse(localStorage.getItem('teacherProfile')) || {};

        const payload = {
            action: 'push',
            folderId: googleSyncSettings.folderId,
            logs: updatedLogs,
            categories: categories,
            goal: yearlyGoal,
            teacherInfo: teacherInfo,
            teacherProfile: profile,
            googleSyncSettings: {
                scriptUrl: googleSyncSettings.scriptUrl,
                folderId: googleSyncSettings.folderId,
                enabled: googleSyncSettings.enabled
            },
            profilePhoto: profile.photo || ''
        };

        const response = await fetch(googleSyncSettings.scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload)
        });

        // Update sync time
        googleSyncSettings.lastSync = new Date().toISOString();
        localStorage.setItem('googleSyncSettings', JSON.stringify(googleSyncSettings));
        updateSyncStatus();

        const result = await response.json();

        if (result.success) {
            showNotification(`✅ อัพโหลดสำเร็จ! ${logs.length} รายการ, ${uploadedCount}/${totalFiles} ไฟล์`, 'success');
        } else {
            showNotification(`⚠️ อัพโหลดข้อมูลสำเร็จ แต่ ${totalFiles - uploadedCount} ไฟล์ล้มเหลว`, 'success');
        }

    } catch (error) {
        console.error('Push error:', error);
        showNotification('อัพโหลดล้มเหลว: ' + error.message, 'error');
    }
}

// Auto-load data from Google Sheets on page load (no confirmation)
async function autoLoadFromGoogle() {
    if (!googleSyncSettings.enabled || !googleSyncSettings.scriptUrl) {
        console.log('Google Sync not configured, using localStorage');
        return;
    }

    try {
        console.log('Auto-loading data from Google Sheets...');

        const payload = {
            action: 'pull',
            folderId: googleSyncSettings.folderId
        };

        const response = await fetch(googleSyncSettings.scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.success) {
            // Load ALL data from Google Sheets
            if (result.logs && result.logs.length > 0) {
                logs = result.logs;
                localStorage.setItem('teacherLogs', JSON.stringify(logs));
            }

            if (result.categories && result.categories.length > 0) {
                categories = result.categories;
                localStorage.setItem('categories', JSON.stringify(categories));
            }

            if (result.yearlyGoal) {
                yearlyGoal = result.yearlyGoal;
                localStorage.setItem('yearlyGoal', JSON.stringify(yearlyGoal));
            }

            if (result.teacherInfo) {
                teacherInfo = result.teacherInfo;
                localStorage.setItem('teacherInfo', JSON.stringify(teacherInfo));
            }

            if (result.teacherProfile) {
                localStorage.setItem('teacherProfile', JSON.stringify(result.teacherProfile));
            }

            if (result.profilePhoto) {
                // Update profile photo in memory
                const profile = JSON.parse(localStorage.getItem('teacherProfile')) || {};
                profile.photo = result.profilePhoto;
                localStorage.setItem('teacherProfile', JSON.stringify(profile));
            }

            // Update sync time
            googleSyncSettings.lastSync = new Date().toISOString();
            localStorage.setItem('googleSyncSettings', JSON.stringify(googleSyncSettings));

            console.log(`Loaded ${logs.length} logs from Google Sheets`);

            // Re-render UI
            initCategoryDropdowns();
            renderLogs();
            updateStats();
            updateSyncStatus();
        }

    } catch (error) {
        console.error('Auto-load error:', error);
        console.log('Using localStorage data instead');
    }
}

// Manual pull from Google Sheets (with confirmation)
async function pullFromGoogle() {
    if (!googleSyncSettings.enabled || !googleSyncSettings.scriptUrl) {
        alert('กรุณาตั้งค่าและบันทึกการเชื่อมต่อก่อน');
        return;
    }

    if (!confirm('ต้องการดาวน์โหลดข้อมูลทั้งหมดจาก Google Sheets หรือไม่?\n(ข้อมูลปัจจุบันจะถูกแทนที่)')) {
        return;
    }

    try {
        showNotification('กำลังดาวน์โหลดข้อมูล...', 'success');
        await autoLoadFromGoogle(); // Use same function
        showNotification(`ดาวน์โหลดสำเร็จ! โหลดข้อมูล ${logs.length} รายการ`, 'success');
    } catch (error) {
        console.error('Pull error:', error);
        showNotification('ดาวน์โหลดล้มเหลว: ' + error.message, 'error');
    }
}

// ========== INITIALIZE APP ==========
// Auto-load data from Google Sheets first, then render
(async function initApp() {
    // Try to load from Google Sheets first
    await autoLoadFromGoogle();

    // If no data from Google, localStorage will be used automatically
    initCategoryDropdowns();
    renderLogs();
    updateStats();
})();
