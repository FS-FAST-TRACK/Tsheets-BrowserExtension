function sendClockInAction(){
    chrome.storage.local.set({tsheetActions:{action: "clock-in"} } );
    switchToTab('https://tsheets.intuit.com')
}

function sendTakeABreakAction(){
    chrome.storage.local.set({tsheetActions:{action: "take-a-break"} } );
    switchToTab('https://tsheets.intuit.com')
}

document.getElementById("clock-in-btn").addEventListener("click", sendClockInAction);
document.getElementById("take-a-break-btn").addEventListener("click", sendTakeABreakAction);