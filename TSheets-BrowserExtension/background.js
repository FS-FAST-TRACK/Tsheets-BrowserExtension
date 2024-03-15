// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'log') {
        // Store the information received from the content script
        console.log(message.result)
    }

    if(message.action === 'setTsheetData'){
        console.log(message.data);
        chrome.storage.local.set({ tsheetData: message.data });
    }   
});

setInterval(() => {
    console.log("running")
}, 1000);

// RUN SOMETHING IN BACKGROUND LIKE ALARM??
// TODO: JAY WILL IMPLEMENT SOON ---- ALARM