let tSheetActions = undefined;
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Listen to an action called setTsheetData
    if(message.action === 'setTsheetData'){
        chrome.storage.local.set({ tsheetData: message.data });
        sendResponse(tSheetActions);
    }   

    if(message.action === 'clearAction'){
        chrome.storage.local.set({tsheetActions:{action: "idle"} } );
    } 
});

setInterval(()=>{
    chrome.storage.local.get("tsheetActions", function (actions){
        if(actions){
            tSheetActions = actions;
        }
    })
},500);
// RUN SOMETHING IN BACKGROUND LIKE ALARM??
// TODO: JAY WILL IMPLEMENT SOON ---- ALARM