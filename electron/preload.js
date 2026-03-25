const { contextBridge } = require('electron');

// We are not exposing any Node.js APIs to the renderer process for security reasons.
// If in the future, you need to expose a specific API, you can do it here.
// For example, to expose a 'myAPI' object with a 'doSomething' method:
//
// contextBridge.exposeInMainWorld('myAPI', {
//   doSomething: () => {
//     // ... do something in the main process
//   }
// });

console.log('preload.js loaded. No Node.js APIs are exposed to the renderer process.');
