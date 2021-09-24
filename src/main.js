// main.js

// Modules to control application life and create native browser window
const { app, ipcMain, BrowserWindow } = require('electron')
const url  = require('url')
const path = require('path')


let mainWindow

//Download Manager
const DownloadManager = require("electron-download-manager");
DownloadManager.register({
  downloadFolder: app.getPath("downloads") + "/realvuemedia"
});


function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
     // preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));





  // Open the DevTools.
 mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('download-single', (event, arg) => {


  let media_url = arg;

  DownloadManager.download({
      url: media_url,
      onProgress: onProgress
  }, function (error, info) {
      if (error) {
          console.log(error);
          event.reply('download-error', error)
          return;
      }

      //Download Completed
      event.reply('download-completed', info)
      
  });

 
  
});

function onProgress (progress){

  mainWindow.webContents.send('download-progress',progress);
}

ipcMain.on('download-bulk', (event, arg) => {

});

ipcMain.on('get:download:path', (event, arg) => {
  event.returnValue = app.getPath("downloads") + "/realvuemedia";
});

ipcMain.on('asynchronous-message', (event, arg) => {
 // console.log(arg) // prints "ping"
  event.reply('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
  //console.log(arg) // prints "ping"
  event.returnValue = 'pong'
})

// Close Application
ipcMain.on('close-me', (evt, arg) => {
  app.quit()
})