import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import chromium from '@sparticuz/chromium';
import { log } from 'console';



// Derive __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateTimesheetPDF = async (client, timesheetData, startDate, endDate, totalHoursWorked, clientSignature, workList, directCareWorker, providerId, employeeSignature, orgLogo) => {
  try {
    const tempDir = path.join(__dirname, '..', 'temp');
    const fileName = `timesheet-${startDate}.pdf`;
    const filePath = path.join(tempDir, fileName);

    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir, { recursive: true });
    }

    // Generate the HTML content
    const htmlContent = await generateHTML(client, timesheetData, startDate, endDate, totalHoursWorked, clientSignature, workList, directCareWorker, providerId, employeeSignature, orgLogo);


    const browser = await puppeteer.launch({
      args: chromium.args,
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('error', (err) => console.error('PAGE ERROR:', err));

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '30px', right: '30px', bottom: '30px', left: '30px' },
      printBackground: true,
    });

    console.log('PDF Buffer Length:', pdfBuffer.length);
    if (pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error('Failed to generate PDF:', error.message);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

const generateHTML = async (client, timesheetData, startDate, endDate, totalHoursWorked, clientSignature, workList, directCareWorker, providerId, employeeSignature, orgLogo) => {
  // Define the work list


  // Generate the dates for the week
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push({
      dateStr: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
      isoDate: d.toISOString().split('T')[0],
      formatted: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
    });
  }

  // Generate date inputs HTML (with consistent styling)
  const dateInputsHTML = dates
    .map(
      (date, i) => `
    <th style="border: 1px solid rgba(128, 128, 128, 0.5); text-align: center; padding: 2px; vertical-align: middle;">
        <input type="text" id="date${i + 1}" value="${date.isoDate}" disabled 
               style="border: none; background: transparent; font-size: 9px; width: 100%; font-weight: 600; text-align: center;" />
    </th>`
    )
    .join('');

  // Generate date labels HTML (with consistent styling)
  const dateLabelsHTML = dates
    .map(
      (date, i) => `
    <th style="font-size: 9px; font-weight: 600; padding: 2px;">
        <span id="label${i + 1}">${date.formatted}</span>
    </th>`
    )
    .join('');

  const emptyCells = Array(7 - dates.length).fill('<th></th>').join('');
  const emptyInputCells = Array(7 - dates.length)
    .fill('<th style="border: 1px solid rgba(128, 128, 128, 0.5); text-align: center"></th>')
    .join('');

  // Generate work list HTML (with consistent styling)
  const workListHTML = workList
    .map((work) => {
      const cells = dates
        .map((date) => {
          const timesheetEntry = timesheetData.find((entry) => entry.date === date.isoDate);
          const task = Array.isArray(timesheetEntry?.completedWorks) ? timesheetEntry.completedWorks.find(
            (task) => task.code === work.code
          ) : null;
          return `<td style="border: 1px solid rgba(128, 128, 128, 0.5); text-align: center; padding: 2px; font-size: 9px;">
                        ${task ? '<i class="fa-solid fa-check" style="font-size: 9px;"></i>' : ''}
                    </td>`;
        })
        .join('');
      return `
            <tr>
                <td style="border-bottom: 1px solid rgba(128, 128, 128, 0.5); border-right: none; font-size: 9px; font-weight: 500; text-align: left; padding: 2px;">
                    ${work.name}
                </td>
                <td style="border-bottom: 1px solid rgba(128, 128, 128, 0.5); border-left: none; font-size: 9px; font-weight: 500; text-align: right; padding: 2px;">
                    ${work.code}
                </td>
                ${cells}
                ${Array(7 - dates.length)
          .fill('<td style="border: 1px solid rgba(128, 128, 128, 0.5); padding: 2px;"></td>')
          .join('')}
            </tr>`;
    })
    .join('');

  // Time In/Out HTML (with consistent styling)
  const timeInHTML = dates
    .map((date) => {
      const timesheetEntry = timesheetData.find((entry) => entry.date === date.isoDate);
      const timeIn = timesheetEntry?.clockIn
        ? new Date(timesheetEntry.clockIn).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: true })
        : '';
      return `<td style="padding: 2px;">
                <input class="input" type="text" value="${timeIn}" ${timeIn ? 'disabled' : ''} 
                       style="width: 80%; border: none; font-size: 9px; font-weight: 400; text-align: center;" />
            </td>`;
    })
    .join('');

  const timeOutHTML = dates
    .map((date) => {
      const timesheetEntry = timesheetData.find((entry) => entry.date === date.isoDate);
      const timeOut = timesheetEntry?.clockOut
        ? new Date(timesheetEntry.clockOut).toLocaleTimeString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, hour: '2-digit', minute: '2-digit', hour12: true })
        : '';
      return `<td style="padding: 2px;">
                <input class="input" type="text" value="${timeOut}" ${timeOut ? 'disabled' : ''} 
                       style="width: 80%; border: none; font-size: 9px; font-weight: 400; text-align: center;" />
            </td>`;
    })
    .join('');

  // Reason/GPS HTML (with consistent styling)
  const reasonGpsHTML = dates
    .map((date) => {
      const timesheetEntry = timesheetData.find((entry) => entry.date === date.isoDate);
      const reason = timesheetEntry?.reason || '';
      const gps = timesheetEntry?.gps || '';
      const displayText = [reason && `Reason: ${reason}`, gps && `GPS: ${gps}`].filter(Boolean).join(', ');
      return `<td style="padding: 2px;">
                <input class="input" type="text" value="${displayText}" ${displayText ? 'disabled' : ''} 
                       style="width: 90%; border: none; font-size: 8px; font-weight: 400; text-align: center;" />
            </td>`;
    })
    .join('');
  const logoSrc = orgLogo && orgLogo.
    includes('data:image') ?
    orgLogo : `data:image/png;base64,${orgLogo}`;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
    <title>Timesheet Form</title>
   <style>
  body {
    font-family: Arial, sans-serif;
    background-color: #fff;
    padding: 5px;
    font-size: 10px;
    line-height: 1.1;
    font-weight: 400; /* Normal weight for body text */
  }
  .container {
    width: 100%;
    margin: 0 auto;
    padding: 0;
  }
  .header {
    width: 100%;
    display: flex;
    margin: 5px 0 10px;
    align-items: center;
    gap: 10px;
  }
  .header .image {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .header .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .header .line {
    width: 1px;
    background-color: #000;
    height: 50px;
  }
  h2, h3 {
    text-align: center;
    margin: 3px 0;
    font-size: 11px;
    font-weight: 600; /* Slightly bolder for headings */
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 5px;
    table-layout: fixed;
  }
  table, th, td {
    border: 1px solid rgba(128, 128, 128, 0.5);
  }
  th, td {
    padding: 2px;
    text-align: center;
    font-size: 9px;
    height: 12px;
    font-weight: 400; /* Normal weight for table content */
  }
  th {
    font-weight: 600; /* Slightly bolder for table headers */
  }
  .input {
    width: 80%;
    outline: none;
    border: none;
    font-size: 9px;
    font-weight: 400; /* Normal weight for inputs */
    padding: 0;
    margin: 0;
  }
  .form-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 3px;
  }
  .form-section label {
    width: 48%;
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex: 1;
    font-size: 9px;
    font-weight: 400; /* Normal weight for labels */
  }
  .form-section .form-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }
  .signature-section {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
    gap: 5px;
    font-size: 9px;
  }
  .table-title {
    text-align: center;
    font-weight: 600; /* Slightly bolder for table titles */
    font-size: 9px;
    padding: 2px;
  }
  .extra-code {
    width: 30px;
    text-align: center;
    font-size: 9px;
    padding: 5px;
  }
  input[type="date"] {
    border: none;
    background: transparent;
    font-size: 9px;
    width: 100%;
  }
  input[disabled] {
    color: black;
  }
  img {
    max-height: 50px;
    width: auto;
    display: block;
  }
  p {
    margin: 3px 0;
    font-size: 8px;
    line-height: 1.1;
    font-weight: 400; /* Normal weight for paragraphs */
  }
  .checkbox-cell {
    width: 15px;
    padding: 0;
  }
  .task-name {
    font-size: 9px;
    padding: 2px;
  }
  .task-id {
    font-size: 9px;
    padding: 2px;
  }
</style>
  </head>
  <body>
    <div class="container">
      <div class="header">
  <div class="image">
    <img src="${logoSrc}" alt="Company Logo" style="max-height: 80px; width: auto;" />
  </div>
  <div class="line"></div>
  <div class="info">
    <label>
      Provider Id
      <input type="text" class="input" style="border-bottom: 1px solid rgba(128, 128, 128, 0.5)" value="${providerId || 'N/A'}" />
    </label>
    <p style="text-align: justify; font-weight: bold; margin: 0;">
      Time Sheet Documentation for Manual Electronic Visit Verification
      (EVV) Entries/Edits. Reasons: HHA not working:H Internet problem:I
      Other:O; GPS; Home:H, Others:O
    </p>
  </div>
</div>
     <div class="form-section">
  <div class="form-row">
    <label style="white-space: nowrap;">
      Client Full Name:
      <input type="text" class="input" style="border-bottom: 1px solid rgba(128, 128, 128, 0.5); display: inline;" value="${client.name || 'N/A'}" />
    </label>
    <label style="white-space: nowrap;">
      Medical ID #:
      <input type="text" class="input" style="border-bottom: 1px solid rgba(128, 128, 128, 0.5); display: inline;" value="${client.medicalId || 'N/A'}" />
    </label>
  </div>
  <div class="form-row">
    <label style="white-space: nowrap;">
      Direct Care Worker:
      <input type="text" class="input" style="border-bottom: 1px solid rgba(128, 128, 128, 0.5); display: inline;" value="${directCareWorker.name || 'N/A'}" />
    </label>
    <label style="white-space: nowrap;">
      Last 4 Digits of SSN:
      <input type="text" class="input" style="border-bottom: 1px solid rgba(128, 128, 128, 0.5); display: inline;" value="${directCareWorker.ssn || 'N/A'}" />
    </label>
  </div>
</div>
      <table>
        <thead>
          <tr>
            <th>DATES OF SERVICE<br />(MM/DD)</th>
            ${dateInputsHTML}
            ${emptyInputCells}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>TIME IN<br />(Write AM/PM)</td>
            ${timeInHTML}
            ${Array(7 - dates.length).fill('<td></td>').join('')}
          </tr>
          <tr>
            <td>TIME OUT<br />(Write AM/PM)</td>
            ${timeOutHTML}
            ${Array(7 - dates.length).fill('<td></td>').join('')}
          </tr>
          <tr>
            <td>Reasons & GPS</td>
            ${reasonGpsHTML}
            ${Array(7 - dates.length).fill('<td></td>').join('')}
          </tr>
        </tbody>
      </table>
      <table>
        <tr>
          <th colspan="2" rowspan="2">DATES OF SERVICES BASED ON PLAN OF CARE</th>
          ${dateLabelsHTML}
          ${emptyCells}
        </tr>
        <tr>
          ${dates.map(() => '<th></th>').join('')}
          ${emptyCells}
        </tr>
        <tr>
          <th colspan="2">DWC Initials</th>
          ${dates.map(() => '<th></th>').join('')}
          ${emptyCells}
        </tr>
        ${workListHTML}
      </table>
      <table>
        <tr>
          <th colspan="10" class="table-title">(Additional Services Provided Based on Plan of Care)</th>
        </tr>
        ${Array(3).fill().map(() => `
        <tr>
          <td class="extra-code"></td>
          <td colspan="9"></td>
        </tr>`).join('')}
      </table>
      <div class="signature-section" style="display: flex; justify-content: space-between; gap: 10px; margin-bottom: 10px;">
  <label style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
    Client Signature:
    ${clientSignature ? `<img src="data:image/png;base64,${clientSignature}" alt="Client Signature" style="max-height: 50px; width: auto;" />` : '<span style="margin-top: 5px; font-size:13px; border-bottom: 1px solid rgba(128, 128, 128, 0.5); width: 100%;"></span>'}
  </label>
  <label style="flex: 1; display: flex; flex-direction: column; min-width: 0; ">
    Date:
    <span style="margin-top: 5px; font-size:11px; border-bottom: 1px solid rgba(128, 128, 128, 0.5); width: 100%;">${new Date().toISOString().split('T')[0].replace(/-/g, '/')}</span>
  </label>
  <label style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
    DCW Signature:
    ${employeeSignature ? `<img src="data:image/png;base64,${employeeSignature}" alt="DCW Signature" style="max-height: 50px; width: auto;" />` : '<span style="margin-top: 5px; font-size:13px; border-bottom: 1px solid rgba(128, 128, 128, 0.5); width: 100%;"></span>'}
  </label>
  <label style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
    Date:
    <span style=" margin-top: 5px; font-size:11px; border-bottom: 1px solid rgba(128, 128, 128, 0.5); width: 100%;">${new Date().toISOString().split('T')[0].replace(/-/g, '/')}</span>
  </label>
</div>

<div class="signature-section" style="display: flex; justify-content: space-between; gap: 10px;">
  <label style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
    Provider's Signature:
  </label>
  <label style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
    Name:
      <span style="margin-top: 5px; font-size:11px; border-bottom: 1px solid rgba(128, 128, 128, 0.5); width: 100%;">${directCareWorker || 'N/A'}</span>
  </label>
  <label style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
    Date:
    <span style="margin-top: 5px; font-size:11px; border-bottom: 1px solid rgba(128, 128, 128, 0.5); width: 100%;">${new Date().toISOString().split('T')[0].replace(/-/g, '/')}</span>
  </label>
  <label style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
    Total Hours Worked:
    <span style="margin-top: 5px; font-size:11px; border-bottom: 1px solid rgba(128, 128, 128, 0.5); width: 100%;">${(totalHoursWorked || 0).toFixed(1)}</span>
  </label>
</div>
      <p style="margin-top: 10px;">
        By signing this timesheet, I agree that the information entered is true
        and correct. I am solely responsible for any falsification. I also agree
        that I don't get paid outside my HHA schedule hours. (Blank on tasks:
        Not on POC/Client's refused)
      </p>
    </div>
  </body>
</html>
    `;
};

export { generateTimesheetPDF };