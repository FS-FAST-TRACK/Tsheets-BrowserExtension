// Optionally, you can use background script for certain tasks
// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Check if the message is to open the popup
    if (message.action === 'openPopup' && sender.tab) {
        // Send a message to the popup script to open the popup
        chrome.tabs.sendMessage(sender.tab.id, { action: 'showPopup' });
    }
});

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Check if the message is to request the body content
    if (message.action === 'getBodyContent') {
        // Send the body content back to the popup script
        sendResponse({ bodyContent: document.body.innerHTML });
    }
});
