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
        }, 5000)
        
        
    }, 1000)
}

const captureTimeClockData = () => {
    const {hour: currentHour, min: currentMin, second} = getCurrentTime()[1];
    let CurrentStartTime = undefined;
    let DayStartTime = undefined;
    let Week = undefined
    let HasDayTime = true;
    let ClockedOut = false;
    let Break = false;
    if(currentHour === -1 && currentMin === -1 && second === -1){
        CurrentStartTime = getTheActualStartTime(currentHour, currentMin, second)
        const {hour: dayHour, min: dayMin} = getDayTime(false);
        if(dayHour === -1 && dayMin === -1) HasDayTime = false;
        DayStartTime = `${dayHour}:${String(dayMin).padStart(2,"0")}`
    
        Week = getWeekTime(false);
        ClockedOut = true;
    }else{
        CurrentStartTime = getTheActualStartTime(currentHour, currentMin, second)

        const {hour: dayHour, min: dayMin} = getDayTime()[1];
        DayStartTime = getTheActualStartTime(dayHour, dayMin, second)
    
        Week = getWeekTime();
    }
    return {CurrentStartTime, DayStartTime, Week, ClockedOut, Break, HasDayTime}
}

const getTheActualStartTime = (hour, minute, second = 0) => {
    const d = new Date();
    d.setHours(d.getHours() - hour);
    d.setMinutes(d.getMinutes() - minute);
    d.setSeconds(second)
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
    if(currentTimeElement.textContent.includes("-")) return ["-1:-1:-1", {hour: -1, min: -1, second: -1}]
    const hourMin = currentTimeElement.childNodes[0].childNodes[0].textContent;
    const second = currentTimeElement.childNodes[0].childNodes[1].textContent.split(":")[0];
    return [`${hourMin}${second}`, {hour: hourMin.split(':')[0], min: hourMin.split(':')[1], second}];
}

const getDayTime = (def = true) => {
    // const currentTimeElement = document.getElementById('timecard_task_total');
    // if(!currentTimeElement)
    //     return "0:00:00";
    const currentTimeElement = document.getElementById('timecard_day_total');
    if(!def){
        if(currentTimeElement.textContent.includes("-")) return ["-1:-1", {hour: -1, min: -1}];
        const hourMin = currentTimeElement.childNodes[1].textContent
        return {hour: hourMin.split(':')[0], min: hourMin.split(':')[1]}
    }
    const hourMin = currentTimeElement.childNodes[0].childNodes[0].textContent;
    if(hourMin.includes("-")) return ["0:0", {hour: 0, min: 0}]
    return [`${hourMin}`, {hour: hourMin.split(':')[0], min: hourMin.split(':')[1]}];
}

const getWeekTime = (def = true) => {
    // const currentTimeElement = document.getElementById('timecard_task_total');
    // if(!currentTimeElement)
    //     return "0:00:00";
    const currentTimeElement = document.getElementById('timecard_week_total');
    if(!def){
        const hourMin = currentTimeElement.childNodes[1].textContent;
        return [`${hourMin}`, {hour: hourMin.split(':')[0], min: hourMin.split(':')[1]}]
    }
    const hourMin = currentTimeElement.childNodes[0].childNodes[0].textContent;
    return [`${hourMin}`, {hour: hourMin.split(':')[0], min: hourMin.split(':')[1]}];
}