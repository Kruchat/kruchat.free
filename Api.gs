/**
 * บันทึกเอกสารส่วนตัว - Personal Document Tracker
 * Api.gs - CRUD Operations & Helpers
 *
 * Schema: id, title, category, tags, owner, issueDate, expiryDate, remindDays,
 *         driveFileId, driveFileUrl, version, location, source, status, notes,
 *         createdAt, updatedAt
 */

var Api = {

  // ============================================================
  // CONFIGURATION
  // ============================================================

  getSheetId: function() {
    return PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  },

  getSheetName: function() {
    return PropertiesService.getScriptProperties().getProperty('SHEET_NAME') || 'documents';
  },

  getDriveFolderId: function() {
    return PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
  },

  getAdminPassword: function() {
    return PropertiesService.getScriptProperties().getProperty('ADMIN_PASS') || 'admin123';
  },

  getSheet: function() {
    const sheetId = this.getSheetId();
    if (!sheetId) {
      throw new Error('SHEET_ID not configured in Script Properties');
    }
    const ss = SpreadsheetApp.openById(sheetId);
    const sheetName = this.getSheetName();
    let sheet = ss.getSheetByName(sheetName);

    // Create sheet if not exists
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      this.initializeSheet(sheet);
    }

    return sheet;
  },

  initializeSheet: function(sheet) {
    const headers = [
      'id', 'title', 'category', 'tags', 'owner', 'issueDate', 'expiryDate', 'remindDays',
      'driveFileId', 'driveFileUrl', 'version', 'location', 'source', 'status', 'notes',
      'createdAt', 'updatedAt'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    Logger.log('Sheet initialized with headers');
  },

  // ============================================================
  // CRUD OPERATIONS
  // ============================================================

  /**
   * List documents with filtering, sorting, pagination
   * Payload: { filter, sort, page, pageSize }
   */
  listDocuments: function(payload) {
    Logger.log('[Api.listDocuments] START');
    try {
      Logger.log('[Api.listDocuments] payload: ' + JSON.stringify(payload || {}).substring(0, 200));

      Logger.log('[Api.listDocuments] Getting sheet...');
      const sheet = this.getSheet();
      Logger.log('[Api.listDocuments] Sheet retrieved successfully');

      Logger.log('[Api.listDocuments] Getting data range...');
      const data = sheet.getDataRange().getValues();
      Logger.log('[Api.listDocuments] Data range retrieved: ' + data.length + ' rows');

      const headers = data[0];
      const rows = data.slice(1);
      Logger.log('[Api.listDocuments] Headers: ' + headers.join(', '));
      Logger.log('[Api.listDocuments] Processing ' + rows.length + ' data rows');

      // Convert to objects
      let documents = rows.map(row => {
        const doc = {};
        headers.forEach((header, index) => {
          doc[header] = row[index];
        });
        return doc;
      }).filter(doc => doc.id); // Filter out empty rows

      // Apply filters
      if (payload.filter) {
        const filter = payload.filter;

        if (filter.keyword) {
          const keyword = filter.keyword.toLowerCase();
          documents = documents.filter(doc =>
            (doc.title && doc.title.toLowerCase().includes(keyword)) ||
            (doc.tags && doc.tags.toLowerCase().includes(keyword)) ||
            (doc.notes && doc.notes.toLowerCase().includes(keyword))
          );
        }

        if (filter.category) {
          documents = documents.filter(doc => doc.category === filter.category);
        }

        if (filter.status) {
          documents = documents.filter(doc => doc.status === filter.status);
        }

        if (filter.owner) {
          documents = documents.filter(doc => doc.owner === filter.owner);
        }

        if (filter.issueDate) {
          const startDate = filter.issueDate.start ? new Date(filter.issueDate.start) : null;
          const endDate = filter.issueDate.end ? new Date(filter.issueDate.end) : null;
          documents = documents.filter(doc => {
            if (!doc.issueDate) return false;
            const docDate = new Date(doc.issueDate);
            if (startDate && docDate < startDate) return false;
            if (endDate && docDate > endDate) return false;
            return true;
          });
        }

        if (filter.expiryDate) {
          const startDate = filter.expiryDate.start ? new Date(filter.expiryDate.start) : null;
          const endDate = filter.expiryDate.end ? new Date(filter.expiryDate.end) : null;
          documents = documents.filter(doc => {
            if (!doc.expiryDate) return false;
            const docDate = new Date(doc.expiryDate);
            if (startDate && docDate < startDate) return false;
            if (endDate && docDate > endDate) return false;
            return true;
          });
        }
      }

      // Apply sorting
      if (payload.sort) {
        const sortField = payload.sort.field || 'updatedAt';
        const sortOrder = payload.sort.order || 'desc';
        documents.sort((a, b) => {
          let valA = a[sortField];
          let valB = b[sortField];

          // Handle dates
          if (sortField.includes('Date') || sortField.includes('At')) {
            valA = valA ? new Date(valA) : new Date(0);
            valB = valB ? new Date(valB) : new Date(0);
          }

          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Calculate totals before pagination
      const total = documents.length;
      Logger.log('[Api.listDocuments] Total documents after filters: ' + total);

      // Apply pagination
      const page = payload.page || 1;
      const pageSize = payload.pageSize || 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedDocs = documents.slice(startIndex, endIndex);
      Logger.log('[Api.listDocuments] Returning ' + paginatedDocs.length + ' documents (page ' + page + ')');

      const result = {
        ok: true,
        data: {
          documents: paginatedDocs,
          pagination: {
            page: page,
            pageSize: pageSize,
            total: total,
            totalPages: Math.ceil(total / pageSize)
          }
        }
      };

      Logger.log('[Api.listDocuments] SUCCESS - returning result');
      return result;

    } catch (error) {
      Logger.log('[Api.listDocuments] ERROR: ' + error.toString());
      Logger.log('[Api.listDocuments] ERROR stack: ' + error.stack);

      const errorResult = {
        ok: false,
        error: error.toString(),
        data: {
          documents: [],
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 }
        }
      };

      Logger.log('[Api.listDocuments] ERROR - returning error result');
      return errorResult;
    }
  },

  /**
   * Get single document by ID
   */
  getDocument: function(id) {
    try {
      if (!id) {
        throw new Error('Document ID is required');
      }

      const sheet = this.getSheet();
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const rowIndex = rows.findIndex(row => row[0] === id);
      if (rowIndex === -1) {
        throw new Error('Document not found');
      }

      const doc = {};
      headers.forEach((header, index) => {
        doc[header] = rows[rowIndex][index];
      });

      return { ok: true, data: doc };
    } catch (error) {
      Logger.log('Error in getDocument: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  /**
   * Create new document
   */
  createDocument: function(payload) {
    try {
      // Validation
      if (!payload.title || payload.title.trim() === '') {
        throw new Error('Title is required');
      }

      if (payload.issueDate && payload.expiryDate) {
        const issueDate = new Date(payload.issueDate);
        const expiryDate = new Date(payload.expiryDate);
        if (issueDate > expiryDate) {
          throw new Error('Issue date must be before or equal to expiry date');
        }
      }

      if (payload.remindDays !== undefined) {
        const remindDays = parseInt(payload.remindDays);
        if (isNaN(remindDays) || remindDays < 0) {
          throw new Error('Remind days must be a non-negative integer');
        }
      }

      const sheet = this.getSheet();
      const now = new Date().toISOString();
      const id = Utilities.getUuid();

      const newDoc = {
        id: id,
        title: payload.title || '',
        category: payload.category || '',
        tags: payload.tags || '',
        owner: payload.owner || this.getCurrentUserEmail(),
        issueDate: payload.issueDate || '',
        expiryDate: payload.expiryDate || '',
        remindDays: payload.remindDays || 7,
        driveFileId: payload.driveFileId || '',
        driveFileUrl: payload.driveFileUrl || '',
        version: payload.version || '1',
        location: payload.location || '',
        source: payload.source || '',
        status: payload.status || 'active',
        notes: payload.notes || '',
        createdAt: now,
        updatedAt: now
      };

      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const rowData = headers.map(header => newDoc[header] || '');

      sheet.appendRow(rowData);
      Logger.log('Document created: ' + id);

      return { ok: true, data: newDoc };
    } catch (error) {
      Logger.log('Error in createDocument: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  /**
   * Update existing document
   */
  updateDocument: function(id, payload) {
    try {
      if (!id) {
        throw new Error('Document ID is required');
      }

      // Validation
      if (payload.title !== undefined && payload.title.trim() === '') {
        throw new Error('Title cannot be empty');
      }

      if (payload.issueDate && payload.expiryDate) {
        const issueDate = new Date(payload.issueDate);
        const expiryDate = new Date(payload.expiryDate);
        if (issueDate > expiryDate) {
          throw new Error('Issue date must be before or equal to expiry date');
        }
      }

      if (payload.remindDays !== undefined) {
        const remindDays = parseInt(payload.remindDays);
        if (isNaN(remindDays) || remindDays < 0) {
          throw new Error('Remind days must be a non-negative integer');
        }
      }

      const sheet = this.getSheet();
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const rowIndex = rows.findIndex(row => row[0] === id);
      if (rowIndex === -1) {
        throw new Error('Document not found');
      }

      const sheetRowIndex = rowIndex + 2; // +1 for header, +1 for 0-based index
      const now = new Date().toISOString();

      // Update fields
      headers.forEach((header, colIndex) => {
        if (payload[header] !== undefined) {
          sheet.getRange(sheetRowIndex, colIndex + 1).setValue(payload[header]);
        }
      });

      // Always update updatedAt
      const updatedAtIndex = headers.indexOf('updatedAt');
      if (updatedAtIndex !== -1) {
        sheet.getRange(sheetRowIndex, updatedAtIndex + 1).setValue(now);
      }

      Logger.log('Document updated: ' + id);

      // Return updated document
      return this.getDocument(id);
    } catch (error) {
      Logger.log('Error in updateDocument: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  /**
   * Archive document (soft delete)
   */
  archiveDocument: function(id) {
    try {
      if (!id) {
        throw new Error('Document ID is required');
      }

      return this.updateDocument(id, { status: 'archived' });
    } catch (error) {
      Logger.log('Error in archiveDocument: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  /**
   * Delete document (hard delete)
   */
  deleteDocument: function(id) {
    try {
      if (!id) {
        throw new Error('Document ID is required');
      }

      const sheet = this.getSheet();
      const data = sheet.getDataRange().getValues();
      const rows = data.slice(1);

      const rowIndex = rows.findIndex(row => row[0] === id);
      if (rowIndex === -1) {
        throw new Error('Document not found');
      }

      const sheetRowIndex = rowIndex + 2; // +1 for header, +1 for 0-based index
      sheet.deleteRow(sheetRowIndex);

      Logger.log('Document deleted: ' + id);

      return { ok: true, data: { id: id } };
    } catch (error) {
      Logger.log('Error in deleteDocument: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  // ============================================================
  // FILE OPERATIONS
  // ============================================================

  /**
   * Upload file to Drive
   * Payload: { fileName, mimeType, base64Data }
   */
  uploadFile: function(payload) {
    try {
      if (!payload.fileName || !payload.base64Data) {
        throw new Error('fileName and base64Data are required');
      }

      const folderId = this.getDriveFolderId();
      if (!folderId) {
        throw new Error('DRIVE_FOLDER_ID not configured');
      }

      const folder = DriveApp.getFolderById(folderId);
      const blob = Utilities.newBlob(
        Utilities.base64Decode(payload.base64Data),
        payload.mimeType || 'application/octet-stream',
        payload.fileName
      );

      const file = folder.createFile(blob);
      const fileId = file.getId();
      const fileUrl = file.getUrl();

      Logger.log('File uploaded: ' + fileId);

      return {
        ok: true,
        data: {
          driveFileId: fileId,
          driveFileUrl: fileUrl,
          fileName: payload.fileName,
          mimeType: file.getMimeType(),
          size: file.getSize()
        }
      };
    } catch (error) {
      Logger.log('Error in uploadFile: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  // ============================================================
  // STATISTICS
  // ============================================================

  getStats: function() {
    try {
      const sheet = this.getSheet();
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const documents = rows.map(row => {
        const doc = {};
        headers.forEach((header, index) => {
          doc[header] = row[index];
        });
        return doc;
      }).filter(doc => doc.id);

      const total = documents.length;
      const active = documents.filter(doc => doc.status === 'active').length;
      const archived = documents.filter(doc => doc.status === 'archived').length;
      const expired = documents.filter(doc => doc.status === 'expired').length;

      // Check expiring soon (within remindDays)
      const today = new Date();
      const expiringSoon = documents.filter(doc => {
        if (!doc.expiryDate || doc.status !== 'active') return false;
        const expiryDate = new Date(doc.expiryDate);
        const remindDays = parseInt(doc.remindDays) || 7;
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry >= 0 && daysUntilExpiry <= remindDays;
      }).length;

      // Categories breakdown
      const categories = {};
      documents.forEach(doc => {
        const category = doc.category || 'Uncategorized';
        categories[category] = (categories[category] || 0) + 1;
      });

      return {
        ok: true,
        data: {
          total: total,
          active: active,
          archived: archived,
          expired: expired,
          expiringSoon: expiringSoon,
          categories: categories
        }
      };
    } catch (error) {
      Logger.log('Error in getStats: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  // ============================================================
  // EXPORT
  // ============================================================

  exportCSV: function() {
    try {
      const sheet = this.getSheet();
      const data = sheet.getDataRange().getValues();

      const csv = data.map(row => row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma or quote
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return '"' + cellStr.replace(/"/g, '""') + '"';
        }
        return cellStr;
      }).join(',')).join('\n');

      return {
        ok: true,
        data: {
          csv: csv,
          fileName: 'documents_export_' + new Date().toISOString().split('T')[0] + '.csv'
        }
      };
    } catch (error) {
      Logger.log('Error in exportCSV: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  exportJSON: function() {
    try {
      const sheet = this.getSheet();
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const documents = rows.map(row => {
        const doc = {};
        headers.forEach((header, index) => {
          doc[header] = row[index];
        });
        return doc;
      }).filter(doc => doc.id);

      return {
        ok: true,
        data: {
          json: JSON.stringify(documents, null, 2),
          fileName: 'documents_export_' + new Date().toISOString().split('T')[0] + '.json'
        }
      };
    } catch (error) {
      Logger.log('Error in exportJSON: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  // ============================================================
  // BACKUP
  // ============================================================

  backupSheet: function() {
    try {
      const sheetId = this.getSheetId();
      const folderId = this.getDriveFolderId();

      if (!sheetId || !folderId) {
        throw new Error('SHEET_ID or DRIVE_FOLDER_ID not configured');
      }

      const ss = SpreadsheetApp.openById(sheetId);
      const folder = DriveApp.getFolderById(folderId);

      const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss');
      const backupName = 'Backup_Documents_' + timestamp;

      const file = DriveApp.getFileById(sheetId);
      const backup = file.makeCopy(backupName, folder);

      Logger.log('Backup created: ' + backup.getId());

      return {
        ok: true,
        data: {
          backupId: backup.getId(),
          backupUrl: backup.getUrl(),
          backupName: backupName,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      Logger.log('Error in backupSheet: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  // ============================================================
  // ADMIN
  // ============================================================

  verifyAdminPassword: function(password) {
    try {
      const correctPassword = this.getAdminPassword();
      const isValid = password === correctPassword;

      return {
        ok: true,
        data: { valid: isValid }
      };
    } catch (error) {
      Logger.log('Error in verifyAdminPassword: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  updateAdminPassword: function(oldPassword, newPassword) {
    try {
      const verifyResult = this.verifyAdminPassword(oldPassword);
      if (!verifyResult.data.valid) {
        throw new Error('Invalid old password');
      }

      if (!newPassword || newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters');
      }

      PropertiesService.getScriptProperties().setProperty('ADMIN_PASS', newPassword);
      Logger.log('Admin password updated');

      return { ok: true, data: { message: 'Password updated successfully' } };
    } catch (error) {
      Logger.log('Error in updateAdminPassword: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  getConfig: function() {
    try {
      const props = PropertiesService.getScriptProperties();
      return {
        ok: true,
        data: {
          SHEET_ID: props.getProperty('SHEET_ID') || '',
          SHEET_NAME: props.getProperty('SHEET_NAME') || 'documents',
          DRIVE_FOLDER_ID: props.getProperty('DRIVE_FOLDER_ID') || ''
        }
      };
    } catch (error) {
      Logger.log('Error in getConfig: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  updateConfig: function(payload) {
    try {
      const props = PropertiesService.getScriptProperties();

      if (payload.SHEET_ID) props.setProperty('SHEET_ID', payload.SHEET_ID);
      if (payload.SHEET_NAME) props.setProperty('SHEET_NAME', payload.SHEET_NAME);
      if (payload.DRIVE_FOLDER_ID) props.setProperty('DRIVE_FOLDER_ID', payload.DRIVE_FOLDER_ID);

      Logger.log('Config updated');

      return { ok: true, data: { message: 'Configuration updated successfully' } };
    } catch (error) {
      Logger.log('Error in updateConfig: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  // ============================================================
  // AUTO SETUP
  // ============================================================

  /**
   * Check if system is set up
   */
  checkSetup: function() {
    try {
      const props = PropertiesService.getScriptProperties();
      const sheetId = props.getProperty('SHEET_ID');
      const folderId = props.getProperty('DRIVE_FOLDER_ID');

      const isConfigured = !!(sheetId && folderId);

      return {
        ok: true,
        data: {
          isConfigured: isConfigured,
          sheetId: sheetId || null,
          folderId: folderId || null,
          sheetName: props.getProperty('SHEET_NAME') || 'documents'
        }
      };
    } catch (error) {
      Logger.log('Error in checkSetup: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  /**
   * Auto setup: Create Spreadsheet and Drive Folder
   */
  autoSetup: function(payload) {
    try {
      const sheetName = payload.sheetName || 'บันทึกเอกสารส่วนตัว';
      const folderName = payload.folderName || 'เอกสารส่วนตัว';
      const adminPass = payload.adminPass || 'admin123';

      Logger.log('Starting auto setup...');

      // 1. Create new Spreadsheet
      const ss = SpreadsheetApp.create(sheetName);
      const sheetId = ss.getId();
      Logger.log('Spreadsheet created: ' + sheetId);

      // 2. Setup the documents sheet
      const sheet = ss.getSheets()[0];
      sheet.setName('documents');
      this.initializeSheet(sheet);
      Logger.log('Sheet initialized with headers');

      // 3. Create Drive folder
      const folder = DriveApp.createFolder(folderName);
      const folderId = folder.getId();
      Logger.log('Drive folder created: ' + folderId);

      // 4. Move spreadsheet to the folder
      const file = DriveApp.getFileById(sheetId);
      file.moveTo(folder);
      Logger.log('Spreadsheet moved to folder');

      // 5. Save configuration to Script Properties
      const props = PropertiesService.getScriptProperties();
      props.setProperty('SHEET_ID', sheetId);
      props.setProperty('SHEET_NAME', 'documents');
      props.setProperty('DRIVE_FOLDER_ID', folderId);
      props.setProperty('ADMIN_PASS', adminPass);
      Logger.log('Configuration saved to Script Properties');

      // 6. Create sample data (optional)
      if (payload.createSampleData) {
        this.createSampleData(sheet);
        Logger.log('Sample data created');
      }

      return {
        ok: true,
        data: {
          message: 'Auto setup completed successfully!',
          sheetId: sheetId,
          sheetUrl: ss.getUrl(),
          folderId: folderId,
          folderUrl: folder.getUrl(),
          sheetName: sheetName,
          folderName: folderName
        }
      };
    } catch (error) {
      Logger.log('Error in autoSetup: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  /**
   * Create sample data for testing
   */
  createSampleData: function(sheet) {
    try {
      const now = new Date().toISOString();
      const userEmail = this.getCurrentUserEmail();

      // Sample documents
      const sampleDocs = [
        {
          id: Utilities.getUuid(),
          title: 'บัตรประชาชน',
          category: 'บัตรประชาชน',
          tags: 'สำคัญ, ต้องต่ออายุ',
          owner: userEmail,
          issueDate: '2020-01-15',
          expiryDate: '2027-01-14',
          remindDays: 180,
          driveFileId: '',
          driveFileUrl: '',
          version: '1',
          location: 'กระเป๋าสตางค์',
          source: 'กรมการปกครอง',
          status: 'active',
          notes: 'บัตรประชาชนฉบับปัจจุบัน',
          createdAt: now,
          updatedAt: now
        },
        {
          id: Utilities.getUuid(),
          title: 'พาสปอร์ต',
          category: 'พาสปอร์ต',
          tags: 'เดินทาง, ระหว่างประเทศ',
          owner: userEmail,
          issueDate: '2023-06-20',
          expiryDate: '2033-06-19',
          remindDays: 365,
          driveFileId: '',
          driveFileUrl: '',
          version: '1',
          location: 'ลิ้นชักที่ 1',
          source: 'กรมการกงสุล',
          status: 'active',
          notes: 'พาสปอร์ตเล่มใหม่ ยังใช้งานได้อีกนาน',
          createdAt: now,
          updatedAt: now
        },
        {
          id: Utilities.getUuid(),
          title: 'ใบขับขี่รถยนต์',
          category: 'ใบขับขี่',
          tags: 'ขับรถ, ใกล้หมดอายุ',
          owner: userEmail,
          issueDate: '2020-03-10',
          expiryDate: '2025-03-09',
          remindDays: 30,
          driveFileId: '',
          driveFileUrl: '',
          version: '1',
          location: 'กระเป๋าสตางค์',
          source: 'กรมการขนส่งทางบก',
          status: 'active',
          notes: 'ใบขับขี่กำลังจะหมดอายุ ต้องรีบไปต่ออายุ',
          createdAt: now,
          updatedAt: now
        }
      ];

      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

      sampleDocs.forEach(doc => {
        const rowData = headers.map(header => doc[header] || '');
        sheet.appendRow(rowData);
      });

      Logger.log('Sample data created: ' + sampleDocs.length + ' documents');
    } catch (error) {
      Logger.log('Error in createSampleData: ' + error.toString());
      throw error;
    }
  },

  // ============================================================
  // HELPERS
  // ============================================================

  getCurrentUserEmail: function() {
    try {
      return Session.getActiveUser().getEmail();
    } catch (error) {
      return 'unknown@example.com';
    }
  }

};
