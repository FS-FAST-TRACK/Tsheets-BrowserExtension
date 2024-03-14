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

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    // Get the URL of the current tab
    var currentTabUrl = currentTab.url;
    
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
