const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files from the "public" folder, where "index.html" is located
app.use(express.static('public'));

// Helper function to create a folder path for the current month
function getMonthlyFolderPath() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Pad single digits with 0
  const folderPath = path.join(__dirname, 'Salary Sheets', `${year}-${month}`);

  // Create the folder if it doesn’t exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  return folderPath;
}

// Route to handle CSV file upload and PDF generation
app.post('/upload', upload.single('csvFile'), async (req, res) => {
  try {
    const results = [];
    // Read the CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const folderPath = getMonthlyFolderPath();

        // Generate a PDF for each record in the CSV
        for (const [index, record] of results.entries()) {
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([600, 800]);
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          const { width, height } = page.getSize();

          // Add header to PDF
          page.drawText('Sameera Furniture', { x: 50, y: height - 50, size: 20, font: boldFont, color: rgb(0, 0, 0) });
          page.drawText('Address: 95/6A Molamure Road, Kegalle', { x: 50, y: height - 80, size: 10, font, color: rgb(0, 0, 0) });
          page.drawText('Email: verifications@gmail.com', { x: 50, y: height - 95, size: 10, font, color: rgb(0, 0, 0) });

          // Employee details and salary breakdown
          page.drawText(`Name: ${record.Name || 'N/A'}`, { x: 50, y: height - 130, size: 12, font, color: rgb(0, 0, 0) });
          page.drawText(`EPF Number: ${record.EPF || 'N/A'}`, { x: 50, y: height - 150, size: 12, font, color: rgb(0, 0, 0) });
          page.drawText('Salary for the month of July 2024', { x: 50, y: height - 170, size: 12, font: boldFont, color: rgb(0, 0, 0) });

          // Additional salary details
          page.drawText(`Net Pay: ${record.Net_Pay || '0.00'}`, { x: 50, y: height - 400, size: 12, font: boldFont, color: rgb(0, 0, 0) });

          // Save the PDF
          const pdfBytes = await pdfDoc.save();
          fs.writeFileSync(path.join(folderPath, `Employee_${index + 1}.pdf`), pdfBytes);
        }

        // Clean up the uploaded CSV file after processing
        fs.unlinkSync(req.file.path);

        // Redirect to the home page with a success message
        res.redirect('/?success=true');
      });
  } catch (err) {
    console.error('Error processing file:', err);
    // Redirect to the home page with an error message
    res.redirect('/?error=true');
  }
});

// Set up server to listen on port 3000 and open the browser automatically
const PORT = 3000;
const HOST = '127.0.0.1';

app.listen(PORT, HOST, () => {
  console.log(`Server started on http://${HOST}:${PORT}`);

  // Automatically open the default browser
  exec(`start http://${HOST}:${PORT}`, (err) => {
    if (err) {
      console.error('Error opening browser:', err);
    }
  });
});
