/**
 * บันทึกเอกสารส่วนตัว - Personal Document Tracker
 * Triggers.gs - Trigger Management & Automation
 *
 * รองรับ:
 * - Daily trigger: ตรวจสอบเอกสารที่ใกล้หมดอายุและส่งอีเมลแจ้งเตือน
 * - Weekly trigger: สำรองข้อมูลอัตโนมัติ
 */

const TriggerManager = {

  // ============================================================
  // TRIGGER MANAGEMENT
  // ============================================================

  /**
   * Create all triggers (Daily reminder + Weekly backup)
   */
  createAllTriggers: function() {
    try {
      // Delete existing triggers first
      this.deleteAllTriggers();

      // Create daily reminder trigger (8:00 AM)
      ScriptApp.newTrigger('dailyReminderJob')
        .timeBased()
        .atHour(8)
        .everyDays(1)
        .create();

      // Create weekly backup trigger (Sunday 2:00 AM)
      ScriptApp.newTrigger('weeklyBackupJob')
        .timeBased()
        .onWeekDay(ScriptApp.WeekDay.SUNDAY)
        .atHour(2)
        .create();

      Logger.log('All triggers created successfully');

      return {
        ok: true,
        data: {
          message: 'Triggers created successfully',
          triggers: [
            { name: 'dailyReminderJob', schedule: 'Daily at 8:00 AM' },
            { name: 'weeklyBackupJob', schedule: 'Weekly on Sunday at 2:00 AM' }
          ]
        }
      };
    } catch (error) {
      Logger.log('Error in createAllTriggers: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  /**
   * Delete all project triggers
   */
  deleteAllTriggers: function() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      triggers.forEach(trigger => {
        ScriptApp.deleteTrigger(trigger);
      });

      Logger.log('All triggers deleted: ' + triggers.length);

      return {
        ok: true,
        data: {
          message: 'All triggers deleted successfully',
          count: triggers.length
        }
      };
    } catch (error) {
      Logger.log('Error in deleteAllTriggers: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  /**
   * List all active triggers
   */
  listTriggers: function() {
    try {
      const triggers = ScriptApp.getProjectTriggers();
      const triggerList = triggers.map(trigger => ({
        handlerFunction: trigger.getHandlerFunction(),
        triggerSource: trigger.getTriggerSource().toString(),
        triggerSourceId: trigger.getTriggerSourceId(),
        uniqueId: trigger.getUniqueId()
      }));

      return {
        ok: true,
        data: {
          triggers: triggerList,
          count: triggerList.length
        }
      };
    } catch (error) {
      Logger.log('Error in listTriggers: ' + error.toString());
      return { ok: false, error: error.toString() };
    }
  },

  // ============================================================
  // SCHEDULED JOBS
  // ============================================================

  /**
   * Check for expiring documents and send email reminders
   * Returns list of documents that need reminders
   */
  checkExpiringDocuments: function() {
    try {
      const sheet = Api.getSheet();
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);

      const documents = rows.map(row => {
        const doc = {};
        headers.forEach((header, index) => {
          doc[header] = row[index];
        });
        return doc;
      }).filter(doc => doc.id && doc.status === 'active');

      const today = new Date();
      const expiringDocs = [];

      documents.forEach(doc => {
        if (!doc.expiryDate) return;

        const expiryDate = new Date(doc.expiryDate);
        const remindDays = parseInt(doc.remindDays) || 7;
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        // Check if document is expiring within remind days
        if (daysUntilExpiry >= 0 && daysUntilExpiry <= remindDays) {
          expiringDocs.push({
            doc: doc,
            daysUntilExpiry: daysUntilExpiry
          });
        }

        // Mark as expired if past expiry date
        if (daysUntilExpiry < 0 && doc.status === 'active') {
          Api.updateDocument(doc.id, { status: 'expired' });
          Logger.log('Document marked as expired: ' + doc.id);
        }
      });

      return expiringDocs;
    } catch (error) {
      Logger.log('Error in checkExpiringDocuments: ' + error.toString());
      throw error;
    }
  },

  /**
   * Send email reminder for expiring documents
   */
  sendReminderEmail: function(expiringDocs) {
    try {
      if (expiringDocs.length === 0) {
        Logger.log('No expiring documents to remind');
        return;
      }

      const userEmail = Api.getCurrentUserEmail();
      const subject = `[แจ้งเตือน] เอกสาร ${expiringDocs.length} รายการใกล้หมดอายุ`;

      let body = '⚠️ มีเอกสารที่ใกล้หมดอายุ:\n\n';

      expiringDocs.forEach((item, index) => {
        const doc = item.doc;
        const days = item.daysUntilExpiry;

        body += `${index + 1}. ${doc.title}\n`;
        body += `   หมวดหมู่: ${doc.category || '-'}\n`;
        body += `   วันหมดอายุ: ${doc.expiryDate}\n`;
        body += `   เหลือเวลา: ${days} วัน\n`;

        if (doc.driveFileUrl) {
          body += `   ลิงก์ไฟล์: ${doc.driveFileUrl}\n`;
        }

        body += `   หมายเหตุ: ${doc.notes || '-'}\n\n`;
      });

      body += '\n---\n';
      body += 'อีเมลนี้ส่งอัตโนมัติจากระบบบันทึกเอกสารส่วนตัว\n';
      body += 'กรุณาตรวจสอบและดำเนินการก่อนเอกสารหมดอายุ\n';

      MailApp.sendEmail({
        to: userEmail,
        subject: subject,
        body: body
      });

      Logger.log('Reminder email sent to: ' + userEmail);
    } catch (error) {
      Logger.log('Error in sendReminderEmail: ' + error.toString());
      throw error;
    }
  }

};

// ============================================================
// TRIGGER HANDLER FUNCTIONS (must be global for Apps Script)
// ============================================================

/**
 * Daily job: Check expiring documents and send reminders
 */
function dailyReminderJob() {
  try {
    Logger.log('=== Daily Reminder Job Started ===');
    Logger.log('Time: ' + new Date().toISOString());

    const expiringDocs = TriggerManager.checkExpiringDocuments();

    if (expiringDocs.length > 0) {
      Logger.log('Found ' + expiringDocs.length + ' expiring documents');
      TriggerManager.sendReminderEmail(expiringDocs);
    } else {
      Logger.log('No expiring documents found');
    }

    Logger.log('=== Daily Reminder Job Completed ===');
  } catch (error) {
    Logger.log('ERROR in dailyReminderJob: ' + error.toString());
    Logger.log(error.stack);

    // Send error notification
    try {
      const userEmail = Api.getCurrentUserEmail();
      MailApp.sendEmail({
        to: userEmail,
        subject: '[ข้อผิดพลาด] Daily Reminder Job Failed',
        body: 'เกิดข้อผิดพลาดในระบบตรวจสอบเอกสารหมดอายุ:\n\n' + error.toString() + '\n\n' + error.stack
      });
    } catch (emailError) {
      Logger.log('Failed to send error notification: ' + emailError.toString());
    }
  }
}

/**
 * Weekly job: Backup sheet to Drive
 */
function weeklyBackupJob() {
  try {
    Logger.log('=== Weekly Backup Job Started ===');
    Logger.log('Time: ' + new Date().toISOString());

    const result = Api.backupSheet();

    if (result.ok) {
      Logger.log('Backup successful: ' + result.data.backupName);

      // Send success notification
      const userEmail = Api.getCurrentUserEmail();
      MailApp.sendEmail({
        to: userEmail,
        subject: '[สำเร็จ] สำรองข้อมูลเอกสารอัตโนมัติ',
        body: 'สำรองข้อมูลเอกสารเสร็จสมบูรณ์\n\n' +
              'ชื่อไฟล์: ' + result.data.backupName + '\n' +
              'ลิงก์: ' + result.data.backupUrl + '\n' +
              'เวลา: ' + result.data.timestamp + '\n\n' +
              'ไฟล์สำรองถูกบันทึกไว้ใน Google Drive แล้ว'
      });
    } else {
      throw new Error(result.error);
    }

    Logger.log('=== Weekly Backup Job Completed ===');
  } catch (error) {
    Logger.log('ERROR in weeklyBackupJob: ' + error.toString());
    Logger.log(error.stack);

    // Send error notification
    try {
      const userEmail = Api.getCurrentUserEmail();
      MailApp.sendEmail({
        to: userEmail,
        subject: '[ข้อผิดพลาด] Weekly Backup Job Failed',
        body: 'เกิดข้อผิดพลาดในระบบสำรองข้อมูลอัตโนมัติ:\n\n' + error.toString() + '\n\n' + error.stack
      });
    } catch (emailError) {
      Logger.log('Failed to send error notification: ' + emailError.toString());
    }
  }
}

/**
 * Manual test function for reminder job
 */
function testDailyReminder() {
  dailyReminderJob();
}

/**
 * Manual test function for backup job
 */
function testWeeklyBackup() {
  weeklyBackupJob();
}
