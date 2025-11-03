/**
 * บันทึกเอกสารส่วนตัว - Personal Document Tracker
 * Code.gs - Entry Point
 *
 * รองรับ: doGet (แสดง Web App), doPost (API JSON)
 */

// ============================================================
// ENTRY POINTS
// ============================================================

/**
 * doGet - Serve Web App HTML
 */
function doGet(e) {
  try {
    Logger.log('doGet called at: ' + new Date().toISOString());

    // Check if system is set up
    const setupCheck = Api.checkSetup();

    if (!setupCheck.ok || !setupCheck.data.isConfigured) {
      // Show setup wizard if not configured
      Logger.log('System not configured. Showing setup wizard.');
      return HtmlService.createHtmlOutputFromFile('Setup')
        .setTitle('ติดตั้งระบบบันทึกเอกสารส่วนตัว')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    // Show main app if configured
    Logger.log('System configured. Showing main app.');
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('บันทึกเอกสารส่วนตัว')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return HtmlService.createHtmlOutput('<h1>Error loading app</h1><p>' + error.toString() + '</p>');
  }
}

/**
 * doPost - API Endpoint (รับ/ส่ง JSON)
 * Request: { action, payload }
 * Response: { ok, data, error }
 */
function doPost(e) {
  const startTime = new Date();
  let action = 'unknown';

  try {
    // Parse request
    const requestData = JSON.parse(e.postData.contents);
    action = requestData.action || 'unknown';
    const payload = requestData.payload || {};

    Logger.log(`[API] Action: ${action}, Payload: ${JSON.stringify(payload).substring(0, 200)}`);

    // Route to appropriate handler
    let result;
    switch (action) {
      // Health check
      case 'ping':
        result = { ok: true, message: 'pong', timestamp: new Date().toISOString() };
        break;

      // Document CRUD
      case 'list':
        result = Api.listDocuments(payload);
        break;
      case 'get':
        result = Api.getDocument(payload.id);
        break;
      case 'create':
        result = Api.createDocument(payload);
        break;
      case 'update':
        result = Api.updateDocument(payload.id, payload);
        break;
      case 'archive':
        result = Api.archiveDocument(payload.id);
        break;
      case 'delete':
        result = Api.deleteDocument(payload.id);
        break;

      // File upload
      case 'upload':
        result = Api.uploadFile(payload);
        break;

      // Statistics
      case 'stats':
        result = Api.getStats();
        break;

      // Export
      case 'exportCSV':
        result = Api.exportCSV();
        break;
      case 'exportJSON':
        result = Api.exportJSON();
        break;

      // Backup
      case 'backupSheet':
        result = Api.backupSheet();
        break;

      // Trigger management
      case 'createTriggers':
        result = TriggerManager.createAllTriggers();
        break;
      case 'deleteTriggers':
        result = TriggerManager.deleteAllTriggers();
        break;
      case 'listTriggers':
        result = TriggerManager.listTriggers();
        break;

      // Admin
      case 'verifyPassword':
        result = Api.verifyAdminPassword(payload.password);
        break;
      case 'updatePassword':
        result = Api.updateAdminPassword(payload.oldPassword, payload.newPassword);
        break;
      case 'getConfig':
        result = Api.getConfig();
        break;
      case 'updateConfig':
        result = Api.updateConfig(payload);
        break;

      // Auto Setup
      case 'checkSetup':
        result = Api.checkSetup();
        break;
      case 'autoSetup':
        result = Api.autoSetup(payload);
        break;

      default:
        result = { ok: false, error: `Unknown action: ${action}` };
    }

    const duration = new Date() - startTime;
    Logger.log(`[API] ${action} completed in ${duration}ms`);

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    const duration = new Date() - startTime;
    Logger.log(`[API ERROR] ${action} failed after ${duration}ms: ${error.toString()}\n${error.stack}`);

    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: error.toString(),
      action: action
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// UTILITY FUNCTIONS (callable from frontend via google.script.run)
// ============================================================

/**
 * Get current user email
 */
function getUserEmail() {
  try {
    return Session.getActiveUser().getEmail();
  } catch (error) {
    return 'unknown@example.com';
  }
}

/**
 * Wrapper function for Auto Setup (callable from google.script.run)
 */
function runAutoSetup(payload) {
  return Api.autoSetup(payload);
}

/**
 * Wrapper function for Check Setup (callable from google.script.run)
 */
function runCheckSetup() {
  return Api.checkSetup();
}

/**
 * Test function - Simple test to verify google.script.run works
 */
function testSimple() {
  Logger.log('testSimple called');
  return { ok: true, message: 'Test successful', timestamp: new Date().toISOString() };
}

/**
 * Direct wrapper for listDocuments (for testing)
 */
function testListDocuments(payload) {
  Logger.log('testListDocuments called with: ' + JSON.stringify(payload || {}));
  try {
    var result = Api.listDocuments(payload || {});
    Logger.log('testListDocuments result: ' + JSON.stringify(result).substring(0, 200));
    return result;
  } catch (error) {
    Logger.log('testListDocuments ERROR: ' + error.toString());
    return { ok: false, error: error.toString() };
  }
}

/**
 * Universal API wrapper (callable from google.script.run)
 * This function routes all API calls from the frontend
 */
function runApi(action, payload) {
  try {
    // Ensure payload is always an object
    if (!payload) {
      payload = {};
    }

    // Check if Api object exists
    if (typeof Api === 'undefined') {
      Logger.log('[runApi ERROR] Api object is undefined!');
      return { ok: false, error: 'Api object is not defined' };
    }

    // Safe logging
    try {
      Logger.log(`[runApi] Action: ${action}, Payload: ${JSON.stringify(payload).substring(0, 200)}`);
    } catch (e) {
      Logger.log(`[runApi] Action: ${action}, Payload: [could not stringify]`);
    }

    let result;
    switch (action) {
      // Health check
      case 'ping':
        result = { ok: true, message: 'pong', timestamp: new Date().toISOString() };
        break;

      // Document CRUD
      case 'list':
        Logger.log('[runApi] Calling Api.listDocuments...');
        Logger.log('[runApi] Api type: ' + typeof Api);
        Logger.log('[runApi] Api.listDocuments type: ' + typeof Api.listDocuments);

        if (typeof Api.listDocuments !== 'function') {
          Logger.log('[runApi ERROR] Api.listDocuments is not a function!');
          result = { ok: false, error: 'Api.listDocuments is not a function' };
        } else {
          try {
            result = Api.listDocuments(payload);
            Logger.log('[runApi] Api.listDocuments returned type: ' + typeof result);
            if (result) {
              Logger.log('[runApi] result.ok = ' + result.ok);
              Logger.log('[runApi] result preview: ' + JSON.stringify(result).substring(0, 100));
            } else {
              Logger.log('[runApi ERROR] Api.listDocuments returned null/undefined!');
              result = { ok: false, error: 'Api.listDocuments returned null' };
            }
          } catch (error) {
            Logger.log('[runApi ERROR] Exception in Api.listDocuments: ' + error.toString());
            result = { ok: false, error: 'Exception in listDocuments: ' + error.toString() };
          }
        }
        break;
      case 'get':
        result = Api.getDocument(payload.id);
        break;
      case 'create':
        result = Api.createDocument(payload);
        break;
      case 'update':
        result = Api.updateDocument(payload.id, payload);
        break;
      case 'archive':
        result = Api.archiveDocument(payload.id);
        break;
      case 'delete':
        result = Api.deleteDocument(payload.id);
        break;

      // File upload
      case 'upload':
        result = Api.uploadFile(payload);
        break;

      // Statistics
      case 'stats':
        result = Api.getStats();
        break;

      // Export
      case 'exportCSV':
        result = Api.exportCSV();
        break;
      case 'exportJSON':
        result = Api.exportJSON();
        break;

      // Backup
      case 'backupSheet':
        result = Api.backupSheet();
        break;

      // Trigger management
      case 'createTriggers':
        result = TriggerManager.createAllTriggers();
        break;
      case 'deleteTriggers':
        result = TriggerManager.deleteAllTriggers();
        break;
      case 'listTriggers':
        result = TriggerManager.listTriggers();
        break;

      // Admin
      case 'verifyPassword':
        result = Api.verifyAdminPassword(payload.password);
        break;
      case 'updatePassword':
        result = Api.updateAdminPassword(payload.oldPassword, payload.newPassword);
        break;
      case 'getConfig':
        result = Api.getConfig();
        break;
      case 'updateConfig':
        result = Api.updateConfig(payload);
        break;

      // Auto Setup
      case 'checkSetup':
        result = Api.checkSetup();
        break;
      case 'autoSetup':
        result = Api.autoSetup(payload);
        break;

      default:
        result = { ok: false, error: `Unknown action: ${action}` };
    }

    // Ensure result is never null/undefined
    if (!result) {
      Logger.log(`[runApi WARNING] ${action} returned null/undefined, using default error`);
      result = { ok: false, error: `Action ${action} did not return a result` };
    }

    Logger.log(`[runApi] ${action} completed successfully`);
    return result;

  } catch (error) {
    Logger.log(`[runApi ERROR] ${action}: ${error.toString()}\n${error.stack}`);
    return {
      ok: false,
      error: error.toString(),
      action: action
    };
  }
}

/**
 * Test function for debugging
 */
function testApi() {
  // Test ping
  const pingResult = doPost({
    postData: {
      contents: JSON.stringify({ action: 'ping' })
    }
  });
  Logger.log('Ping result: ' + pingResult.getContent());

  // Test stats
  const statsResult = doPost({
    postData: {
      contents: JSON.stringify({ action: 'stats' })
    }
  });
  Logger.log('Stats result: ' + statsResult.getContent());
}
