/**
 * Teacher Development Log System v2.0
 * Modern JavaScript Architecture - No Inline Handlers
 */

// ================== DATA MANAGER ==================
class DataManager {
    constructor() {
        this.logs = this.loadFromStorage('logs', []);
        this.categories = this.loadFromStorage('categories', this.getDefaultCategories());
        this.settings = this.loadFromStorage('settings', {});
        this.googleSync = this.loadFromStorage('googleSync', { enabled: false });
    }

    getDefaultCategories() {
        return [
            { id: 'workshop', name: 'อบรม/สัมมนา', color: '#4caf50' },
            { id: 'training', name: 'ฝึกอบรม', color: '#2196f3' },
            { id: 'research', name: 'วิจัย', color: '#ff9800' },
            { id: 'community', name: 'ชุมชนการเรียนรู้', color: '#9c27b0' },
            { id: 'innovation', name: 'นวัตกรรม', color: '#f44336' }
        ];
    }

    loadFromStorage(key, defaultValue) {
        try {
            const data = localStorage.getItem(`teacher_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return defaultValue;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(`teacher_${key}`, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }

    addLog(logData) {
        const log = {
            id: Date.now(),
            ...logData,
            createdAt: new Date().toISOString()
        };
        this.logs.unshift(log);
        this.saveToStorage('logs', this.logs);
        return log;
    }

    updateLog(id, updates) {
        const index = this.logs.findIndex(log => log.id === id);
        if (index !== -1) {
            this.logs[index] = { ...this.logs[index], ...updates };
            this.saveToStorage('logs', this.logs);
            return this.logs[index];
        }
        return null;
    }

    deleteLog(id) {
        this.logs = this.logs.filter(log => log.id !== id);
        this.saveToStorage('logs', this.logs);
    }

    getLog(id) {
        return this.logs.find(log => log.id === id);
    }

    filterLogs(filters) {
        let filtered = [...this.logs];

        if (filters.category) {
            filtered = filtered.filter(log => log.category === filters.category);
        }

        if (filters.format) {
            filtered = filtered.filter(log => log.format === filters.format);
        }

        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(log =>
                log.title.toLowerCase().includes(search) ||
                (log.description && log.description.toLowerCase().includes(search))
            );
        }

        return filtered;
    }

    getStats() {
        const totalLogs = this.logs.length;
        const totalHours = this.logs.reduce((sum, log) => sum + (log.hours || 0), 0);
        const categoriesCount = {};

        this.logs.forEach(log => {
            categoriesCount[log.category] = (categoriesCount[log.category] || 0) + 1;
        });

        return { totalLogs, totalHours, categoriesCount };
    }

    addCategory(name, color) {
        const category = {
            id: Date.now().toString(),
            name,
            color
        };
        this.categories.push(category);
        this.saveToStorage('categories', this.categories);
        return category;
    }

    deleteCategory(id) {
        this.categories = this.categories.filter(cat => cat.id !== id);
        this.saveToStorage('categories', this.categories);
    }

    getCategoryById(id) {
        return this.categories.find(cat => cat.id === id) || { name: 'ไม่ระบุ', color: '#999' };
    }
}

// ================== UI MANAGER ==================
class UIManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    renderStats() {
        const stats = this.dataManager.getStats();
        const statsEl = document.getElementById('stats');

        statsEl.innerHTML = `
            <div class="stat-card">
                <h3>${stats.totalLogs}</h3>
                <p>กิจกรรมทั้งหมด</p>
            </div>
            <div class="stat-card">
                <h3>${stats.totalHours.toFixed(1)}</h3>
                <p>ชั่วโมงทั้งหมด</p>
            </div>
            <div class="stat-card">
                <h3>${this.dataManager.categories.length}</h3>
                <p>ประเภททั้งหมด</p>
            </div>
        `;
    }

    renderLogs(filters = {}) {
        const logs = this.dataManager.filterLogs(filters);
        const logsEl = document.getElementById('logsList');

        if (logs.length === 0) {
            logsEl.innerHTML = '<p style="text-align: center; padding: 40px; color: #999;">ไม่มีข้อมูล</p>';
            return;
        }

        logsEl.innerHTML = logs.map(log => {
            const category = this.dataManager.getCategoryById(log.category);
            const fileCount = log.files ? log.files.length : 0;

            return `
                <div class="log-card" data-log-id="${log.id}">
                    <div class="log-header">
                        <div>
                            <div class="log-title" style="color: ${category.color}">${this.escapeHtml(log.title)}</div>
                            <small>${this.formatDate(log.date)} • ${log.hours} ชม. • ${category.name}</small>
                        </div>
                        <div class="log-actions">
                            <button class="btn btn-small" data-action="view" data-id="${log.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-small" data-action="edit" data-id="${log.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-small" data-action="delete" data-id="${log.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${log.description ? `<p style="margin-top: 10px; color: #666;">${this.escapeHtml(log.description)}</p>` : ''}
                    ${fileCount > 0 ? `
                        <div style="margin-top: 10px;">
                            <small><i class="fas fa-paperclip"></i> ${fileCount} ไฟล์แนบ</small>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    renderCategories() {
        const select1 = document.getElementById('categorySelect');
        const select2 = document.getElementById('filterCategory');

        const options = this.dataManager.categories.map(cat =>
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');

        select1.innerHTML = options;
        select2.innerHTML = '<option value="">ทุกประเภท</option>' + options;
    }

    renderCategoryModal() {
        const content = document.getElementById('categoryContent');

        content.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3>เพิ่มประเภทใหม่</h3>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <input type="text" id="newCategoryName" placeholder="ชื่อประเภท" style="flex: 1; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px;">
                    <input type="color" id="newCategoryColor" value="#667eea" style="width: 60px; height: 42px; border: none; border-radius: 8px; cursor: pointer;">
                    <button class="btn btn-primary" data-action="add-category">เพิ่ม</button>
                </div>
            </div>

            <h3>ประเภททั้งหมด</h3>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                ${this.dataManager.categories.map(cat => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                        <div style="width: 30px; height: 30px; background: ${cat.color}; border-radius: 6px;"></div>
                        <span style="flex: 1;">${cat.name}</span>
                        <button class="btn btn-small" data-action="delete-category" data-id="${cat.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showViewModal(log) {
        const category = this.dataManager.getCategoryById(log.category);
        const content = document.getElementById('viewContent');

        content.innerHTML = `
            <div style="line-height: 1.8;">
                <h3 style="color: ${category.color}; margin-bottom: 20px;">${this.escapeHtml(log.title)}</h3>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div><strong>วันที่:</strong> ${this.formatDate(log.date)}</div>
                    <div><strong>ชั่วโมง:</strong> ${log.hours} ชม.</div>
                    <div><strong>ประเภท:</strong> ${category.name}</div>
                    <div><strong>รูปแบบ:</strong> ${this.getFormatLabel(log.format)}</div>
                </div>

                ${log.description ? `
                    <div style="margin-top: 20px;">
                        <strong>รายละเอียด:</strong>
                        <p style="margin-top: 10px; line-height: 1.6;">${this.escapeHtml(log.description)}</p>
                    </div>
                ` : ''}

                ${log.files && log.files.length > 0 ? `
                    <div style="margin-top: 20px;">
                        <strong>ไฟล์แนบ (${log.files.length}):</strong>
                        <div style="margin-top: 10px;">
                            ${log.files.map((file, index) => `
                                <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
                                    <i class="fas fa-file" style="color: #667eea;"></i>
                                    <span style="flex: 1;">${this.escapeHtml(file.name)}</span>
                                    ${file.url ? `<button class="btn btn-small" data-action="download-file" data-url="${this.escapeHtml(file.url)}"><i class="fas fa-download"></i></button>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        this.showModal('viewModal');
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
    }

    showNotification(message, type = 'success') {
        // Simple notification (can be enhanced)
        alert(message);
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    getFormatLabel(format) {
        const labels = { onsite: 'Onsite', online: 'Online', hybrid: 'Hybrid' };
        return labels[format] || format;
    }
}

// ================== EVENT MANAGER ==================
class EventManager {
    constructor(app) {
        this.app = app;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('activityForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleActivitySubmit(e.target);
        });

        // File upload
        document.querySelector('[data-upload="certificates"]').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Filters
        document.getElementById('filterCategory').addEventListener('change', () => {
            this.app.updateView();
        });

        document.getElementById('filterFormat').addEventListener('change', () => {
            this.app.updateView();
        });

        document.getElementById('searchInput').addEventListener('input', () => {
            this.app.updateView();
        });

        // Event delegation for dynamic content
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const id = target.dataset.id;

            this.handleAction(action, id, target);
        });

        // Close modals
        document.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('[data-close]');
            if (closeBtn) {
                this.app.uiManager.hideModal(closeBtn.dataset.close);
            }
        });
    }

    handleActivitySubmit(form) {
        const formData = new FormData(form);
        const logData = {
            date: formData.get('date'),
            title: formData.get('title'),
            category: formData.get('category'),
            hours: parseFloat(formData.get('hours')),
            format: formData.get('format'),
            description: formData.get('description'),
            files: this.app.currentFiles || []
        };

        this.app.dataManager.addLog(logData);
        this.app.updateView();
        form.reset();
        this.app.currentFiles = [];
        document.getElementById('fileList').innerHTML = '';
        this.app.uiManager.showNotification('บันทึกสำเร็จ!');
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.app.currentFiles = this.app.currentFiles || [];

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.app.currentFiles.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: e.target.result
                });
                this.renderFileList();
            };
            reader.readAsDataURL(file);
        });
    }

    renderFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = (this.app.currentFiles || []).map((file, index) => `
            <div class="file-item">
                <div class="file-icon">
                    <i class="fas fa-file"></i>
                </div>
                <div style="flex: 1;">
                    <div>${file.name}</div>
                    <small>${(file.size / 1024).toFixed(1)} KB</small>
                </div>
                <button type="button" class="btn btn-small" data-action="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    handleAction(action, id, target) {
        switch (action) {
            case 'view':
                const log = this.app.dataManager.getLog(parseInt(id));
                if (log) this.app.uiManager.showViewModal(log);
                break;

            case 'edit':
                this.app.uiManager.showNotification('ฟีเจอร์แก้ไข: กำลังพัฒนา');
                break;

            case 'delete':
                if (confirm('ต้องการลบรายการนี้หรือไม่?')) {
                    this.app.dataManager.deleteLog(parseInt(id));
                    this.app.updateView();
                    this.app.uiManager.showNotification('ลบสำเร็จ!');
                }
                break;

            case 'remove-file':
                const index = parseInt(target.dataset.index);
                this.app.currentFiles.splice(index, 1);
                this.renderFileList();
                break;

            case 'categories':
                this.app.uiManager.renderCategoryModal();
                this.app.uiManager.showModal('categoryModal');
                break;

            case 'add-category':
                const name = document.getElementById('newCategoryName').value.trim();
                const color = document.getElementById('newCategoryColor').value;
                if (name) {
                    this.app.dataManager.addCategory(name, color);
                    this.app.updateView();
                    this.app.uiManager.renderCategoryModal();
                    document.getElementById('newCategoryName').value = '';
                }
                break;

            case 'delete-category':
                if (confirm('ต้องการลบประเภทนี้หรือไม่?')) {
                    this.app.dataManager.deleteCategory(id);
                    this.app.updateView();
                    this.app.uiManager.renderCategoryModal();
                }
                break;

            case 'profile':
            case 'google-sync':
            case 'export':
            case 'charts':
                this.app.uiManager.showNotification(`ฟีเจอร์ ${action}: กำลังพัฒนา`);
                break;

            case 'download-file':
                const url = target.dataset.url;
                if (url) window.open(url, '_blank');
                break;
        }
    }
}

// ================== MAIN APP ==================
class TeacherApp {
    constructor() {
        this.dataManager = new DataManager();
        this.uiManager = new UIManager(this.dataManager);
        this.eventManager = new EventManager(this);
        this.currentFiles = [];

        this.init();
    }

    init() {
        // Set default date
        const dateInput = document.querySelector('[name="date"]');
        dateInput.valueAsDate = new Date();

        this.updateView();
        console.log('✅ Teacher Development Log System v2.0 initialized');
    }

    updateView() {
        const filters = {
            category: document.getElementById('filterCategory').value,
            format: document.getElementById('filterFormat').value,
            search: document.getElementById('searchInput').value
        };

        this.uiManager.renderStats();
        this.uiManager.renderCategories();
        this.uiManager.renderLogs(filters);
    }
}

// ================== INITIALIZE ==================
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TeacherApp();
});
