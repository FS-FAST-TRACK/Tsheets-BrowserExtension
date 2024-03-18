let tSheetActions = undefined;
let tsheetData = undefined;
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    // Listen to an action called setTsheetData
    if(message.action === 'setTsheetData'){
        chrome.storage.local.set({ tsheetData: message.data });
        sendResponse(tSheetActions);
    }  
    
    if(message.action === 'getTsheetData'){
        sendResponse(tsheetData);
    } 

    if(message.action === 'clearAction'){
        chrome.storage.local.set({tsheetActions:{action: "idle"} } );
    } 
});

// Fast Update
setInterval(()=>{
    chrome.storage.local.get("tsheetActions", function (actions){
        if(actions){
            tSheetActions = actions;
        }
    })
},500);

// Slow Update
setInterval(() => {
    chrome.storage.local.get("tsheetData", function (data) {
        if(data){
            tsheetData = data;
        }
    });
}, 10_000);