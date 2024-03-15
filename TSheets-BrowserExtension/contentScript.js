// Extract information from the webpage
var pageTitle = document.title;

// Check if wer are in the QuickBooks website
if(pageTitle.toLocaleLowerCase().includes("quickbooks")){
    setTimeout(() => {
        const timeClockButton = document.getElementById('timecard_shortcut');
        
        if(!timeClockButton)
            return;
        timeClockButton.click();
        let data = undefined;
        // Get the current time
        setTimeout(() => {
            data = captureTimeClockData();
            if(data){
                chrome.runtime.sendMessage({ action: 'setTsheetData', data:data })
            }
        }, 2000)
        
        
    }, 1000)
}

const captureTimeClockData = () => {
    const {hour: currentHour, min: currentMin, currentSecond} = getCurrentTime()[1];
    const CurrentStartTime = getTheActualStartTime(currentHour, currentMin, currentSecond)

    const {hour: dayHour, min: dayMin} = getDayTime()[1];
    const DayStartTime = getTheActualStartTime(dayHour, dayMin)

    const Week = getWeekTime();

    return {CurrentStartTime, DayStartTime, Week}
}

const getTheActualStartTime = (hour, minute, second = 0) => {
    const d = new Date();
    d.setHours(d.getHours() - hour);
    d.setMinutes(d.getMinutes() - minute);
    d.setSeconds(d.getSeconds() - second);
    console.log("ActualStart Time: ",d, minute)
    return formatDate(d);
}

function formatDate(d) {
    // Get date components
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1
    const day = String(d.getDate()).padStart(2, '0');
    
    // Get time components
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    // Construct the formatted date string
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


const getCurrentTime = () => {
    // const currentTimeElement = document.getElementById('timecard_task_total');
    // if(!currentTimeElement)
    //     return "0:00:00";
    const currentTimeElement = document.getElementById('timecard_task_total');
    const hourMin = currentTimeElement.childNodes[0].childNodes[0].textContent;
    if(hourMin.includes("-")) return ["0:0:0", {hour: 0, min: 0, second: 0}]
    const second = currentTimeElement.childNodes[0].childNodes[1].textContent;
    return [`${hourMin}${second}`, {hour: hourMin.split(':')[0], min: hourMin.split(':')[1], second}];
}

const getDayTime = () => {
    // const currentTimeElement = document.getElementById('timecard_task_total');
    // if(!currentTimeElement)
    //     return "0:00:00";
    const currentTimeElement = document.getElementById('timecard_day_total');
    const hourMin = currentTimeElement.childNodes[0].childNodes[0].textContent;
    if(hourMin.includes("-")) return ["0:0", {hour: 0, min: 0}]
    return [`${hourMin}`, {hour: hourMin.split(':')[0], min: hourMin.split(':')[1]}];
}

const getWeekTime = () => {
    // const currentTimeElement = document.getElementById('timecard_task_total');
    // if(!currentTimeElement)
    //     return "0:00:00";
    const currentTimeElement = document.getElementById('timecard_week_total');
    const hourMin = currentTimeElement.childNodes[0].childNodes[0].textContent;
    if(hourMin.includes("-")) return ["0:0", {hour: 0, min: 0}]
    return [`${hourMin}`, {hour: hourMin.split(':')[0], min: hourMin.split(':')[1]}];
}