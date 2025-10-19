const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let flaskProcess;
const FLASK_PORT = 5050; // Use different port to avoid conflicts

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, 'static/icons/app-icon.png'), // Add app icon if you have one
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the Flask app
  mainWindow.loadURL(`http://127.0.0.1:${FLASK_PORT}`);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Development tools (remove in production)
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

function startFlaskServer() {
  return new Promise((resolve, reject) => {
    // Modified app.py to use different port for Electron
    const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';

    flaskProcess = spawn(pythonExecutable, ['-c', `
import sys
sys.path.append('${__dirname}')
from app import app
app.run(host='127.0.0.1', port=${FLASK_PORT}, debug=False)
    `], {
      cwd: __dirname,
      env: { ...process.env, FLASK_ENV: 'production' }
    });

    flaskProcess.stdout.on('data', (data) => {
      console.log(`Flask: ${data}`);
      if (data.includes('Running on')) {
        resolve();
      }
    });

    flaskProcess.stderr.on('data', (data) => {
      console.error(`Flask Error: ${data}`);
    });

    flaskProcess.on('close', (code) => {
      console.log(`Flask process exited with code ${code}`);
    });

    // Give Flask time to start
    setTimeout(resolve, 3000);
  });
}

app.whenReady().then(async () => {
  try {
    console.log('Starting Flask server...');
    await startFlaskServer();
    console.log('Creating Electron window...');
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    dialog.showErrorBox('Startup Error', 'Failed to start the application server.');
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Kill Flask process
  if (flaskProcess) {
    flaskProcess.kill();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app quit
app.on('before-quit', () => {
  if (flaskProcess) {
    flaskProcess.kill();
  }
});