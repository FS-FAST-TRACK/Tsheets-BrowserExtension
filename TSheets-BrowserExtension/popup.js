// document.addEventListener('DOMContentLoaded', function () {
//     // Retrieve counter value from local storage
//     chrome.storage.local.get('counter', function (result) {
//         var counter = result.counter || 0;
//         document.getElementById('counter').textContent = counter;
//     });

//     // Increment counter when button is clicked
//     document.getElementById('incrementBtn').addEventListener('click', function () {
//         // Increment counter value
//         chrome.storage.local.get('counter', function (result) {
//             var counter = result.counter || 0;
//             counter++;
//             // Save updated counter value to local storage
//             chrome.storage.local.set({ 'counter': counter }, function () {
//                 // Update counter display
//                 document.getElementById('counter').textContent = counter;
//             });
//         });
//     });
// });

// This check on what tab you're current into
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    // Get the URL of the current tab
    var currentTabUrl = currentTab.url;
    if(!currentTabUrl) return;
    // Here you can check if the URL matches the one you're interested in
    if (currentTabUrl.includes("https://tsheets.intuit.com")) {
        // Code specific to the tab with URL 'https://example.com'
        document.getElementById('current_tab').innerHTML = "CURRENT TAB: TSHEETS"
    } else {
        // Code for other tabs
        const el = document.createElement('a');
        el.style.padding = '2px 5px 2px 5px';
        el.href ='https://tsheets.intuit.com/#w_timecard';
        el.style.border = '1px';
        el.innerHTML = "Back to T-Sheets"
        el.onclick = (e) => {
            switchToTab('https://tsheets.intuit.com')
        }
        document.getElementById('current_tab').appendChild(el)
    }
});

// Function to switch to a tab with a specific URL
function switchToTab(url) {
    // Query all tabs to find the one with the specified URL
    chrome.tabs.query({}, function (tabs) {
        // Loop through all tabs to find the one with the specified URL
        for (var i = 0; i < tabs.length; i++) {
            if(!tabs[i].url) continue;
            if (tabs[i].url.includes(url)) {
                // Update the tab to make it active
                chrome.tabs.update(tabs[i].id, { active: true });
                return; // Exit the function after switching to the tab
            }
        }
        // If the tab with the specified URL is not found, open a new tab with that URL
        chrome.tabs.create({ url: url });
    });
}


function AppendStatusToHtmlBody(status){
    const statElement = document.getElementById("statusElement-TSHEET-REMINDER");

    if(statElement) return; // RETURN FOR NOW

    const newStatElement = document.createElement('div');
    newStatElement.style.color = "white";
    newStatElement.style.backgroundColor = "darkgreen";
    newStatElement.style.padding = "5px 10px 5px 10px";
    newStatElement.style.border = "2px solid black";
    newStatElement.id = "statusElement-TSHEET-REMINDER";
    newStatElement.style.top = "0px";
    newStatElement.style.right = "0px";
    newStatElement.style.position = "absolute";
    newStatElement.innerHTML = status;

    // Get the <body> element of the current webpage
    var bodyElement = document.body;

    // Get the first element within the <body> element
    var firstElement = bodyElement.querySelector("*");
    firstElement.appendChild(newStatElement)
}

// When the popup is opened
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get('tsheetData', function (data) {
        if(data){
            const { CurrentStartTime, DayStartTime, ClockedOut, HasDayTime, Break} = data.tsheetData;
            chrome.runtime.sendMessage({ action: 'contentlog', data:"testing from popup" })
            console.log(Break)
            if(Break.break){
                LoadBreakData(Break.breakTime);
                hideButtons(true, false, true, false);
                return;
            }

            if(ClockedOut){
                LoadClockedOutTimeData(DayStartTime, HasDayTime);
                hideButtons(false, true, false, true);
            }else{
                LoadTimeData(CurrentStartTime, DayStartTime);
                hideButtons(true, false, false, true);
            }
        }
    })
});

const LoadClockedOutTimeData = (DayStartTime, HasDayTime = false) => {
    const currentTimeElement = document.getElementById("CurrentTime");
    if(currentTimeElement){
        currentTimeElement.innerHTML = "Clocked out";
    }

    const dayTimeElement = document.getElementById("DayTime");
    if(dayTimeElement){
        if(HasDayTime)
            dayTimeElement.innerHTML = DayStartTime;
        else dayTimeElement.innerHTML = "-";
    }
}

const LoadBreakData = (CurrentStartTime) => {
    const currentTimeElement = document.getElementById("CurrentTime");
    if(currentTimeElement){
        let date = new Date(CurrentStartTime);
        setInterval(() => {
            currentTimeElement.innerHTML = GetHourMinsDifference(new Date(), date);
        }, 1000);
    }

    const dayTimeElement = document.getElementById("DayTime");
    if(dayTimeElement){
        dayTimeElement.innerHTML = "-";
    }
}

const LoadTimeData = (CurrentStartTime,DayStartTime) => {
    const currentTimeElement = document.getElementById("CurrentTime");
    if(currentTimeElement){
        let date = new Date(CurrentStartTime);
        setInterval(() => {
            currentTimeElement.innerHTML = GetHourMinsDifference(new Date(), date);
        }, 1000);
    }

    const dayTimeElement = document.getElementById("DayTime");
    if(dayTimeElement){
        let date = new Date(DayStartTime);
        setInterval(() => {
            dayTimeElement.innerHTML = GetHourMinsDifference(new Date(), date);
        }, 1000);
    }
}

const GetHourMinsDifference = (date1, date2) => {
    // Subtract the two dates
    const differenceInMilliseconds = Math.abs(date1 - date2);

    // Convert milliseconds to seconds, minutes, hours, etc. if needed
    const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);

    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}


const hideButtons = (clockin, clockout, takeabreak, endbreak) => {
    if(takeabreak){
        document.getElementById("take-a-break-btn").classList.add("hidden");
    }else{
        document.getElementById("take-a-break-btn").classList.remove("hidden");
    }
    if(clockin){
        document.getElementById("clock-in-btn").classList.add("hidden");
    }else{
        document.getElementById("clock-in-btn").classList.remove("hidden");
    }
    if(clockout){
        document.getElementById("clock-out-btn").classList.add("hidden");
    }else{
        document.getElementById("clock-out-btn").classList.remove("hidden");
    }
    if(endbreak){
        document.getElementById("end-break-btn").classList.add("hidden");
    }else{
        document.getElementById("end-break-btn").classList.remove("hidden");
    }
}