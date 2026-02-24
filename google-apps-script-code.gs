/**
 * Google Apps Script — Lemon Tour Lead Form Handler
 * 
 * IMPORTANT: This writes ONLY to a tab named "Kurs Zayavkalar".
 * If that tab doesn't exist, it creates it automatically.
 * Your first tab data is NEVER touched.
 * 
 * After pasting this code:
 *   1. Click Save
 *   2. Deploy → Manage deployments → Edit → New version → Deploy
 */

var TAB_NAME = "Kurs Zayavkalar";

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(TAB_NAME);
  
  if (!sheet) {
    // Create the tab and add headers
    sheet = ss.insertSheet(TAB_NAME);
    sheet.appendRow(["Ism", "Telefon", "Yosh toifasi", "Sana"]);
    
    // Style headers
    var headerRange = sheet.getRange(1, 1, 1, 4);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#E8A838");
    headerRange.setFontColor("#0A0A0A");
    
    // Set column widths
    sheet.setColumnWidth(1, 200); // Ism
    sheet.setColumnWidth(2, 180); // Telefon
    sheet.setColumnWidth(3, 120); // Yosh
    sheet.setColumnWidth(4, 200); // Sana
  }
  
  return sheet;
}

function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);

    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();
    
    sheet.appendRow([
      data.name || "",
      "'" + (data.phone || ""),   // prefix with ' to prevent formula interpretation
      data.age || "",
      data.timestamp || new Date().toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" })
    ]);

    lock.releaseLock();

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "Lemon Tour Lead API is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}
