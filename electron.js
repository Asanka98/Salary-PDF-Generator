const { app, BrowserWindow } = require('electron');
const path = require('path');

// Create a new window
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Optional, for security
    },
  });

  // Load the main HTML page of your app
  win.loadURL('http://localhost:3000'); // Assuming your Node.js app runs here
}

// Initialize the app
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Close the app when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
