console.log("Let's Play Scheduler!");


const letsPlayGameTimeToUTCDate = (letsPlayDate) => {
    const currentYear = new Date(Date.now()).getFullYear();
    const letsPlayDateTokens = letsPlayDate.split(" ");
    let monthDay = letsPlayDateTokens[1].split("/").map((element) => Number(element));
    let hourMinute = letsPlayDateTokens[2].split(":").map((element) => Number(element));

    if (letsPlayDateTokens[3].toLowerCase() === "pm") {
        hourMinute[0] = hourMinute[0] + 12;
    }

    return new Date(currentYear, monthDay[0] - 1, monthDay[1], hourMinute[0], hourMinute[1]);
};

const dateToRFC5545String = (date) => {
    const yearStr = String(date.getFullYear()).padStart(2, "0");
    const monthStr = String(date.getMonth() + 1).padStart(2, "0");
    const dayStr = String(date.getDate()).padStart(2, "0");
    const hourStr = String(date.getHours()).padStart(2, "0");
    const minuteStr = String(date.getMinutes()).padStart(2, "0");
    const secondStr = String(date.getSeconds()).padStart(2, "0");

    // follows specifications of RFC 5545 3.3.5
    return `${yearStr}${monthStr}${dayStr}T${hourStr}${minuteStr}${secondStr}`
}

const createIcsFile = (games) => {
    const now = new Date(Date.now());

    const icsFileStart = 
    [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:lets-play-soccer-scheduler",
        "CALSCALE:GREGORIAN\r\n",
    ].join("\r\n");

    const icsFileEnd = "\r\nEND:VCALENDAR";

    let prevMonth = -1; // Used to detect if a schedule spans over new years
    let nextYear = false;
    gameCalendarEvents = games.map((game) => {
        const gameLengthInMs = 60 * 1000 * 45; // Game length is 45 minutes
        let gameStartTime = letsPlayGameTimeToUTCDate(game.gameTime);
        let gameEndTime = new Date(gameStartTime.getTime() + gameLengthInMs);

        // Check for the case when a season spans multiple years (Ex. Nov 2023 - Jan 2024)
        if (nextYear) {
            gameStartTime.setFullYear(gameStartTime.getFullYear() + 1);
            gameEndTime.setFullYear(gameEndTime.getFullYear() + 1);
        }
        else {
            if (prevMonth > gameStartTime.getMonth()) {
                nextYear = true;
                gameStartTime.setFullYear(gameStartTime.getFullYear() + 1);
                gameEndTime.setFullYear(gameEndTime.getFullYear() + 1);
            }
            prevMonth = gameStartTime.getMonth();
        }

        return [
            "BEGIN:VEVENT",
            "UID:" + crypto.randomUUID(),
            "DTSTAMP:" + dateToRFC5545String(now),
            "DTSTART:" + dateToRFC5545String(gameStartTime),
            "DTEND:" + dateToRFC5545String(gameEndTime),
            "SUMMARY:" + `${game.homeTeam} vs. ${game.awayTeam}`,
            "DESCRIPTION:" + `${game.homeTeam} vs. ${game.awayTeam} on ${game.field} at Let's Play Gardner Village 1194 W 7800 S West Jordan UT 84088`,
            "END:VEVENT"
        ].join("\r\n");
    }).join("\r\n");

    return icsFileStart + gameCalendarEvents + icsFileEnd
}

let addGamesToCalendar = () => {
    const gameTableRows = document.getElementsByTagName("tr");
    const numberOfGames = 8;

    let calendarEvents = Array(numberOfGames);
    for (let i = 0; i < numberOfGames; i++) {
        // Go through rows 1-8 rather than rows 0-7 to skip over the table headers
        const row = i + 1;
        const gameTableData = gameTableRows[row].children;
        for (let j = 0; j < gameTableData.length; j++) {
            calendarEvents[i] = 
            {
                "gameTime": gameTableData[0].innerText,
                "field": gameTableData[1].innerText,
                "homeTeam": gameTableData[2].innerText,
                "awayTeam": gameTableData[3].innerText,
            }
        }
    }
    return createIcsFile(calendarEvents);
};

const downloadIcsFile = () => {
    const content = addGamesToCalendar();
    const teamName = document.getElementsByClassName("text-md-40-24 font-semibold mb-8")
                        .item(0)
                        .innerText;
    const season = document.getElementsByClassName("text-md-30-16 font-medium mb-8")
                    .item(0)
                    .outerText
                    .split(' ')[1];

    const blob = new Blob([content], { type: "text/calendar" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = `${teamName}_Season${season}.ics`;
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
}

const main = () => {
    console.log("main");
    console.log(window.location.href);
    let addGamesToCalendarButton = document.createElement("button");
    addGamesToCalendarButton.className = "calendar-button";
    addGamesToCalendarButton.textContent = "Add Games to Calendar";
    addGamesToCalendarButton.onclick = downloadIcsFile;
    
    let gameScheduleBanner = document.getElementsByClassName("text-md-30-16 font-semibold mb-3");   
    console.log(gameScheduleBanner);
    console.log(gameScheduleBanner.item(0).insertAdjacentElement('afterend', addGamesToCalendarButton));
}

main();

