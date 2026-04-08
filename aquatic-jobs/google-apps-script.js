// ============================================================
// Google Apps Script — Aquatic Jobs Board API (v2)
// ============================================================
// CHANGES IN V2:
// - Added manageCode column (Q) for self-service edit/delete
// - doPost now handles actions: create, edit, delete, lookup
// - Management codes are 8-char alphanumeric, shown once on post
// ============================================================

const SHEET_NAME = 'Jobs';

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ success: false, error: 'Sheet not found. Create a sheet named "Jobs".' });
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return jsonResponse({ success: true, jobs: [] });
    }

    const headers = data[0].map(h => h.toString().trim());
    const jobs = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const job = {};
      headers.forEach((header, idx) => {
        job[header] = row[idx] !== undefined ? row[idx].toString() : '';
      });

      // Only return approved jobs
      const approved = job.approved ? job.approved.toLowerCase().trim() : 'yes';
      if (approved === 'yes' || approved === 'true' || approved === '1' || approved === '') {
        delete job.approved;     // Don't expose internal fields
        delete job.manageCode;   // Never expose management codes
        jobs.push(job);
      }
    }

    return jsonResponse({ success: true, jobs: jobs });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ success: false, error: 'Sheet not found.' });
    }

    const params = JSON.parse(e.postData.contents);
    const action = params.action || 'create';

    if (action === 'create') {
      return handleCreate(sheet, params);
    } else if (action === 'lookup') {
      return handleLookup(sheet, params);
    } else if (action === 'edit') {
      return handleEdit(sheet, params);
    } else if (action === 'delete') {
      return handleDelete(sheet, params);
    } else {
      return jsonResponse({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ---- CREATE: Post a new job ----
function handleCreate(sheet, params) {
  const id = new Date().getTime().toString();
  const postedDate = new Date().toISOString();
  const manageCode = generateManageCode();

  const newRow = [
    id,
    params.title || '',
    params.company || '',
    params.city || '',
    params.state || '',
    params.type || '',
    params.payType || '',
    params.pay || '',
    params.description || '',
    params.requirements || '',
    params.benefits || '',
    params.email || '',
    params.phone || '',
    params.howToApply || '',
    postedDate,
    'yes',        // auto-approve
    manageCode    // column Q
  ];

  sheet.appendRow(newRow);

  return jsonResponse({
    success: true,
    message: 'Job posted successfully!',
    job: { id: id, postedDate: postedDate },
    manageCode: manageCode
  });
}

// ---- LOOKUP: Retrieve job data for editing (requires manageCode) ----
function handleLookup(sheet, params) {
  const manageCode = (params.manageCode || '').trim();
  if (!manageCode) {
    return jsonResponse({ success: false, error: 'Management code is required.' });
  }

  const result = findRowByManageCode(sheet, manageCode);
  if (!result) {
    return jsonResponse({ success: false, error: 'No job found with that management code. Please check and try again.' });
  }

  const job = result.job;
  // Return all editable fields (but not the manageCode itself)
  delete job.manageCode;
  delete job.approved;

  return jsonResponse({ success: true, job: job });
}

// ---- EDIT: Update an existing job (requires manageCode) ----
function handleEdit(sheet, params) {
  const manageCode = (params.manageCode || '').trim();
  if (!manageCode) {
    return jsonResponse({ success: false, error: 'Management code is required.' });
  }

  const result = findRowByManageCode(sheet, manageCode);
  if (!result) {
    return jsonResponse({ success: false, error: 'No job found with that management code.' });
  }

  const rowIndex = result.rowIndex; // 1-based sheet row
  const headers = result.headers;

  // Fields that can be updated
  const editableFields = ['title', 'company', 'city', 'state', 'type', 'payType', 'pay',
    'description', 'requirements', 'benefits', 'email', 'phone', 'howToApply'];

  editableFields.forEach(field => {
    if (params[field] !== undefined) {
      const colIndex = headers.indexOf(field);
      if (colIndex !== -1) {
        sheet.getRange(rowIndex, colIndex + 1).setValue(params[field]);
      }
    }
  });

  return jsonResponse({ success: true, message: 'Job updated successfully!' });
}

// ---- DELETE: Remove a job (requires manageCode) ----
function handleDelete(sheet, params) {
  const manageCode = (params.manageCode || '').trim();
  if (!manageCode) {
    return jsonResponse({ success: false, error: 'Management code is required.' });
  }

  const result = findRowByManageCode(sheet, manageCode);
  if (!result) {
    return jsonResponse({ success: false, error: 'No job found with that management code.' });
  }

  sheet.deleteRow(result.rowIndex);

  return jsonResponse({ success: true, message: 'Job deleted successfully.' });
}

// ---- HELPERS ----

function findRowByManageCode(sheet, manageCode) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;

  const headers = data[0].map(h => h.toString().trim());
  const codeCol = headers.indexOf('manageCode');
  if (codeCol === -1) return null;

  for (let i = 1; i < data.length; i++) {
    const rowCode = data[i][codeCol] ? data[i][codeCol].toString().trim() : '';
    if (rowCode === manageCode) {
      const job = {};
      headers.forEach((header, idx) => {
        job[header] = data[i][idx] !== undefined ? data[i][idx].toString() : '';
      });
      return { rowIndex: i + 1, job: job, headers: headers }; // i+1 because sheets are 1-based
    }
  }

  return null;
}

function generateManageCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
  let code = 'MGT-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Helper: Run this once to set up your sheet headers automatically
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  const headers = [
    'id', 'title', 'company', 'city', 'state', 'type', 'payType', 'pay',
    'description', 'requirements', 'benefits', 'email', 'phone',
    'howToApply', 'postedDate', 'approved', 'manageCode'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }

  SpreadsheetApp.getUi().alert('Sheet "Jobs" is ready with manageCode column!');
}
