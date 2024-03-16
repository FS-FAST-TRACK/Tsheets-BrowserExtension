function sendClockInAction(){
    chrome.storage.local.set({tsheetActions:{action: "clock-in"} } );
    switchToTab('https://tsheets.intuit.com')
}

document.getElementById("clock-in-btn").addEventListener("click", sendClockInAction);