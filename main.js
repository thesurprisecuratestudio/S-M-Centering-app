// main.js — Electron main process
// இது தான் .exe double-click பண்ணும்போது run ஆகும் entry file.
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 650,
    title: 'S M Centering — Rental & Billing',
    // 'build/icon.ico' file வச்சா அதுவே app icon ஆக காட்டும். இல்லனா default Electron icon வரும்.
    icon: require('fs').existsSync(path.join(__dirname, 'build', 'icon.ico'))
      ? path.join(__dirname, 'build', 'icon.ico')
      : undefined,
    webPreferences: {
      // App code நேரடியா require('fs') / require('http') / require('os')
      // பண்றதால இது Node integration ஆன் ஆயிருக்கணும்.
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    }
  });

  // Browser-மாதிரி menu bar (File/Edit/View) தேவையில்ல, தள்ளிடுவோம்.
  Menu.setApplicationMenu(null);

  mainWindow.loadFile('index.html');

  // Optional: appத்த maximize பண்ணி open பண்ண வேணும்னா இத uncomment பண்ணுங்க
  // mainWindow.maximize();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
