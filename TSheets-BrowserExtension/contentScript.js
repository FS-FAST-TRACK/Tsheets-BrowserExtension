// Extract information from the webpage
var pageTitle = document.title;

// Check if wer are in the QuickBooks website
let ActionTriggered = false;
let closedByDocumentHide = false;
if(pageTitle.toLocaleLowerCase().includes("quickbooks")){
    localStorage.setItem("tsheet-extension", JSON.stringify({FirstRun: true}))
    setInterval(() => {
        const timeClockButton = document.getElementById('timecard_shortcut');
        
        if(!timeClockButton) return;
        
        if(JSON.parse(localStorage.getItem("tsheet-extension")).FirstRun){
            timeClockButton.click();
            localStorage.setItem("tsheet-extension", JSON.stringify({FirstRun: false}))
        }
        let data = captureTimeClockData();
        // Get the current time
        setTimeout(async () => {
            /*
                Since we're syncing time to all other tabs, we have to make sure that the time card is opened,
                although, overtime, the timecard may be inactive and might cause delays. 
                
                We have to close the time-card window overtime but we also must re-open when the tab is focused back
            */
            if(document.hidden){
                const closeBtn = document.getElementById('timecard_close_winc');
                if(closeBtn) closeBtn.click();
                closedByDocumentHide = true;
            }else{ 
                if(closedByDocumentHide){
                    timeClockButton.click(); 
                    closedByDocumentHide = false;
                }
            }

            const timeCard = document.getElementById('timecard');
            if(!timeCard){
                return;
            }

            

            if(data){
                try{
                    chrome.runtime.sendMessage({ action: 'setTsheetData', data:data }, function(actions) {
                        // Handle the response here
                        if(actions && !ActionTriggered){
                            if(actions.tsheetActions.action !== "idle"){
                                //alert("Triggered: "+actions.tsheetActions.action)
                                setTimeout(()=>{
                                    handleActions(actions.tsheetActions.action);
                                    chrome.runtime.sendMessage({ action: 'clearAction' });
                                }, 500);
                                ActionTriggered = true;
                            }
                        }
                    })
                }catch(e){console.log("Failed to send Data to Popup")}
            }
        }, 2000)
        
        
    }, 1000)
}else{
    const tSheetImbed = document.getElementById("tsheet-ext-clock");
    if(!tSheetImbed){
        setTimeout(()=>{
            // create new element
            const EmbedElement = document.createElement("tsheet-ext-clock");
            EmbedElement.style.backgroundColor = "#46A657";
            EmbedElement.style.fontSize = "0.7rem";
            EmbedElement.style.padding = "2px 5px 2px 5px";
            EmbedElement.style.color = "white";
            EmbedElement.style.position = "absolute";
            EmbedElement.style.left = "50%";
            EmbedElement.style.transform = "translateX(-50%)"
            EmbedElement.style.borderRadius = "0px 0px 3px 3px"
            EmbedElement.style.borderLeft = "1px solid darkgreen";
            EmbedElement.style.borderBottom = "1px solid darkgreen";
            EmbedElement.style.borderRight = "1px solid darkgreen";
            EmbedElement.textContent = "Click to open TSheets";
            EmbedElement.style.cursor = "pointer"
            EmbedElement.style.opacity = 0.8;
            EmbedElement.onclick = (e) => {
                location.href = "https://tsheets.intuit.com";
            }
            EmbedElement.onpointerover = (e) => {EmbedElement.style.opacity = 1;} 
            EmbedElement.onpointerleave = (e) => {EmbedElement.style.opacity = 0.8;}



            const Header = document.createElement("div");
            
            Header.style.width = "100%";
            Header.style.height = "0px"
            Header.style.top = "0px";
            Header.style.position = "sticky"
            Header.style.zIndex = "1000"
            Header.appendChild(EmbedElement);
            
            var body = document.body;
            var firstChild = body.firstChild;
            body.insertBefore(Header, firstChild);

            setInterval(() => {
                handleBackgroundUpdate(EmbedElement);
            }, 1_000);

            // Embed Audio to DOM, will cause error at first run 'User must interact first before playing audio', just disregard
            playNotificationSound();
            playOverbreakSound();
        }, 1000);
    }
}

const captureTimeClockData = () => {
    try{
        const {hour: currentHour, min: currentMin, second} = getCurrentTime()[1];
        let CurrentStartTime = undefined;
        let DayStartTime = undefined;
        let Week = undefined
        let HasDayTime = true;
        let ClockedOut = false;
        let Break = IsBreakTime();
        if(currentHour === -1 && currentMin === -1 && second === -1){
            CurrentStartTime = getTheActualStartTime(currentHour, currentMin, second)
            const {hour: dayHour, min: dayMin} = getDayTime(false);
            if(parseInt(dayHour) === -1 || parseInt(dayMin) === -1) {
                HasDayTime = false;
                DayStartTime = "-"
            }else{
                DayStartTime = `${dayHour}:${String(dayMin).padStart(2,"0")}`
            }
        
            Week = getWeekTime(false);
            ClockedOut = true;
        }else{
            CurrentStartTime = getTheActualStartTime(currentHour, currentMin, second)

            const {hour: dayHour, min: dayMin} = getDayTime()[1];
            DayStartTime = getTheActualStartTime(dayHour, dayMin, second)
        
            Week = getWeekTime();
        }
        return {CurrentStartTime, DayStartTime, Week, ClockedOut, Break, HasDayTime}
    }catch(e){
        return null;
    }
}

const getTheActualStartTime = (hour, minute, second = 0) => {
    const d = new Date();
    d.setHours(d.getHours() - hour);
    d.setMinutes(d.getMinutes() - minute);
    d.setSeconds(second)
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
    if(!currentTimeElement) return ["-1:-1:-1", {hour: -1, min: -1, second: -1}]
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
        if(!currentTimeElement) return {hour: -1, min: -1}
        let hourMin = "0:0";
        try{
            hourMin = currentTimeElement.childNodes[1].textContent;
        }catch(e){}
        return {hour: hourMin.split(':')[0]?hourMin.split(':')[0]:"-1", min: hourMin.split(':')[1]?hourMin.split(':')[1]:"-1"}
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
    if(!currentTimeElement) return [`-1:-1`, {hour: -1, min: -1}]
    if(!def){
        let hourMin = "0:0";
        try{
            currentTimeElement.childNodes[1].textContent;
        }catch(e){}
        return [`${hourMin}`, {hour: hourMin.split(':')[0], min: hourMin.split(':')[1]}]
    }
    const hourMin = currentTimeElement.childNodes[0].childNodes[0].textContent;
    return [`${hourMin}`, {hour: hourMin.split(':')[0], min: hourMin.split(':')[1]}];
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

const handleBackgroundUpdate = (EmbedElement) => {
    if(!EmbedElement) return;
    

    try{
        chrome.runtime.sendMessage({ action: 'getTsheetData' }, function(data) {
            // Handle the response here, refer to DOC.md for TSHEET DATA
            if(data){
                const {tsheetData} = data;
                if(tsheetData.Break.break){
                    let date = new Date(tsheetData.Break.breakTime);
                    let diff = GetHourMinsDifference(new Date(), date)
                    EmbedElement.innerHTML = `Break-Time | ${diff}`;

                    let minute = diff.split(":")[1];
                    if(parseInt(minute) >= 40){
                        EmbedElement.style.backgroundColor = "#DF1F26";
                        if(diff.includes("40:00") || diff.includes("50:00") || diff.includes("55:00") || diff.includes("58:00") || diff.includes("58:30")){
                            playOverbreakSound()
                        }
                    }else{
                        EmbedElement.style.backgroundColor = "#F7931E";
                    }
                    return;
                }

                
                // Set element default bg color to green
                EmbedElement.style.backgroundColor = "#46A657";

                if(tsheetData.ClockedOut){
                    EmbedElement.innerHTML = "You're off the clock";
                }else{
                    let date = new Date(tsheetData.CurrentStartTime);
                    let diff = GetHourMinsDifference(new Date(), date)
                    const textContent = `Clocked-In | ${diff}`;
                    if(tsheetData.HasDayTime){
                        let dayStartTime = new Date(tsheetData.DayStartTime);
                        let dayStartTimeDiff = GetHourMinsDifference(new Date(), dayStartTime);
                        // Ensure that the current day and day start time must not be identical
                        if(!diff.includes(dayStartTimeDiff)){
                            textContent = textContent + ` | ${dayStartTimeDiff}`;

                            try{
                                let hour = diff.split(":")[0];
                                if(parseInt(hour) >= 5){
                                    EmbedElement.style.color = "#DF1F26";
                                }else { EmbedElement.style.color = "white"; }
                            }catch(e){}
                        }
                    }
                    EmbedElement.innerHTML = textContent;
                }
                
            }
        })
    }catch(e){console.log("Failed to retrieve data")}
}   

const handleActions = (action) => {
    /*
        ID's for buttons
        clock-in: timecard_advanced_mode_submit
        take-a-break: timecard_take_break
        clock-out: timecard_submit
        end-break: manual_break_end_break_button

        Actions to handle
        clock-in - must trigger clock in button, if not then prompt user to clock in
        take-a-break - must trigger take a break button, if not then prompt user to click 'take-break' button
        clock-out - must trigger clock out button, if not then prompt user to click clock out
        end-break - must trigger end break button, if not, ask the user
    */

    // check first if the timecard is closed, if yes, open it
    const timeCard = document.getElementById('timecard');
    if(!timeCard) {
        const timeClockButton = document.getElementById('timecard_shortcut');
        
        if(!timeClockButton) return;
        // open the timecard by clicking the timeclock
        timeClockButton.click();
    }

    setTimeout(()=> {
        let button = undefined;

        // Handle clocking in
        if(action === "clock-in"){
            button = document.getElementById('timecard_advanced_mode_submit')
            if(!button){
                alert("Coudn't automatically trigger clock-in\nPlease click the 'Clock In' button.");
            }else{
                button.click();
            }
        }

        // Handle take a break
        if(action === 'take-a-break'){
            button = document.getElementById('timecard_take_break');
            if(!button){
                alert("Coudn't automatically trigger take-a-break\nPlease click the 'Take Break' button.");
            }else{
                button.click();
            }
        }

        // Handle end break
        if(action === 'end-break'){
            button = document.getElementById('manual_break_end_break_button');
            if(!button){
                alert("Coudn't automatically trigger end-break\nPlease click the 'End Break' button.");
            }else{
                button.click();
            }
        }

        // Handle clock out
        if(action === 'clock-out'){
            button = document.getElementById('timecard_submit');
            if(!button){
                alert("Coudn't automatically trigger clock-out\nPlease click the 'Clock Out' button.");
            }else{
                button.click();
            }
        }


        // clear ActionTriggered in (n) seconds to accept another command
        setInterval(()=>{
            ActionTriggered = false;
        }, 30_000);
    }, 1000);
}


function playNotificationSound() {
    let doc = document.getElementById("tsheet-sfx");
    if(doc){
        doc.play();
        return;
    }
    // Create an audio element
    var audio = document.createElement('audio');
    audio.id = "tsheet-sfx";
    audio.src = chrome.runtime.getURL("pop_sfx.mp3");
  
    // Autoplay the audio
    audio.autoplay = false;
    // set volume
    audio.volume = 0.1;
  
    // Append the audio element to the body to play the sound
    document.body.appendChild(audio);
}

function playOverbreakSound() {
    let doc = document.getElementById("tsheet-overbreak-sfx");
    if(doc){
        doc.play();
        return;
    }
    // Create an audio element
    var audio = document.createElement('audio');
    audio.id = "tsheet-overbreak-sfx";
    audio.src = chrome.runtime.getURL("overbreak_sfx.mp3");
  
    // Autoplay the audio
    audio.autoplay = false;
    // set volume
    audio.volume = 0.1;
  
    // Append the audio element to the body to play the sound
    document.body.appendChild(audio);
}

const IsBreakTime = () => {
    const breakContainer = document.getElementById('manual_break_break_container');

    if(!breakContainer) return { break: false, breakTime: "00:00"}

    const total = document.getElementById("manual_break_break_total");
    const minTime = total.childNodes[0].textContent;
    const secTime = total.childNodes[1].textContent.split(":")[1];

    return { break: true, breakTime: getTheActualStartTime(0,minTime)}
}
  