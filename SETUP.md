# Google Sheets Integration — Setup Guide

## Step 1: Open Your Google Sheet

Go to the Google Sheet where you want to receive data.

## Step 2: Create "Tab 2" (or rename existing)

Make sure the **second tab** exists. You can name it anything (e.g., "Zayavkalar").

In **Row 1** of that tab, add these headers:

| A | B | C | D |
|---|---|---|---|
| **Ism** | **Telefon** | **Yosh toifasi** | **Sana** |

## Step 3: Open Apps Script Editor

1. In Google Sheets, click **Extensions → Apps Script**
2. Delete any existing code in `Code.gs`
3. Paste the code from `google-apps-script-code.gs` (included in this project)
4. Click **Save** (💾)

## Step 4: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click ⚙️ gear icon → Select **Web app**
3. Settings:
   - **Description**: `Lemon Tour Lead Form`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**
5. **Authorize** when prompted (click through "Advanced → Go to...")
6. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```

## Step 5: Paste URL into Your Website

Open `script.js` and replace this line:

```js
const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
```

with your actual URL:

```js
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

## Done! 🎉

Your website will now send form submissions directly to Google Sheets Tab 2.

---

> **Note**: If you update the Apps Script code later, you must create a **New deployment** (not update) for changes to take effect.
