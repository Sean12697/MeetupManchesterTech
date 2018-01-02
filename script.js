const app = {};
window.addEventListener('load', init);

var searchBox;
var navSearchBox;
var search;
var clearSearch;
var clearNavSearch;
var generate;

var all;
var social;
var ux;
var workshops;
var specialized;
var data;
var web;
var ladies;
var blockchain;
var method;

var select;
var selectShown;
var deselect;
var invertSelect;

var groupsContainer;
var eventsContainer;

var eventSearch;
var searchEvents;

var techNW;
var generateAll;

let gSelected = 10; // Bodge for one selected meetup group, needs to be more than 1 for search

const meetups = ["android_mcr", "BCS-Greater-Manchester-Branch", "blabtalks", "meetup-group-wHuRVtrk", "CIA-Chicks-in-Advertising-Manchester", "Code-Your-Future-Manchester", "CodeUpManchester", "CodeUp-Salford", "Digital-Analytics-Manchester", "Digital_North_", "DotNetNorth", "Enterprise-UX", "freelance-folk-manchester", "HackerNestMAN", "hackspace-manchester", "HadoopManchester", "HCD-Manchester", "IoTMCR", "JavaScript-North-West", "Ladies-of-Code-Manchester", "Lean-Agile-Manchester", "MaccTech", "Magento-Minds-of-Manchester", "MancDB", "Manchester-Bitcoin-blockchain-and-other-cryptocurrencies", "Manchester-Angular-Workshop", "manchesterentrepreneursclub", "Manchester-Futurists", "Manchester-Grey-Hats", "Manchester-InfoSec", "ManchesterUK-Java-Community", "Power-BI-Manchester-Meetup", "Manchester-R", "Manchester-React-User-Group", "ManchesterWordPressUserGroup", "MancJS", "McrFRED", "McrUXD", "Messaging-Bots-Manchester", "Music-Culture-and-Technology", "Neo4j-Manchester", "North-West-IT-Crowd-Beer-BBQ-Event", "North-West-Ruby-User-Group", "Open-Data-Manchester", "Practical-Business-Workshops-Manchester", "RealUX", "Salford-Lean-Startup", "scala-developers", "SEO-Manchester", "Social-Software-Development-Meetup-in-Manchester", "Tech-for-Good-Live", "Tech-Leads-NW", "Test-Hive-Manchester", "ThoughtWorks-Manchester-Events", "UK-North-Crypto-Currency-Meetup", "The-UX-Crunch-North", "VRManchester", "AWS-User-Group-North", "Code-Nation", "Manchester-Open-Source", "DevOps-Manchester", "StartupBlink-Manchester", "nwdrupal", "Manchester-Xamarin-User-Group", "manchester-node-workshop", "DATA-VISUALISATION-MEETUP", "BlockchainManchesterMeetup", "Manchester-WordPress-SEO-Startup", "Manchester-Unity3D-Game-Dev-Meetup", "Google-Cloud-Platform-Users-North-West", "Manc-Bitcoin", "craftcmsmanchester", "Couchbase-Manchester", "NSManchester", "Python-North-West-Meetup", "Expert-Talks-Manchester", "HER-Data-MCR", "northernsoho", "North-West-Playtesters"]; // wHuRVtrk = Blockchain

const months = new Map([[1, 'January'], [2, 'February'], [3, 'March'], [4, 'April'], [5, 'May'], [6, 'June'], [7, 'July'], [8, 'August'], [9, 'September'], [10, 'October'], [11, 'November'], [12, 'December']]);

var eventsJSON = meetups;
var MeetupsJSON = meetups;

function init() {
    meetups.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase())
    });

    initDOMelements();
    initGetMeetups();
}

function drawMeetups(JSON) {
    groupsContainer.innerHTML = "";
    for (var i = 0; i < JSON.length; i++) {
        var x = JSON[i];
        var name = x.name;
        var link = x.link;
        var members = x.members;
        var thumb = (x.hasOwnProperty('group_photo')) ? x.group_photo.photo_link : x.organizer.photo.photo_link;
        var group = '<div class="group" id="' + i + '"><div class="meetupImg"><input type="checkbox" id="g' + i + '"><label for="g' + i + '"><img src="' + thumb + '"></label></div><div class="groupText"><a href="' + link + '" target="_blank"><p class="groupName">' + name + '</p></a><p>Members: ' + members + '</p></div></div>';
        groupsContainer.insertAdjacentHTML('beforeend', group);
    }
}

function initGetMeetups() {
    console.log(meetups);
    MeetupsJSON = MeetupsJSON.map(app.getMeetups);

    $.when(...MeetupsJSON)
        .then((...MeetupsJSON) => {
            MeetupsJSON = MeetupsJSON.map(a => a[0].data);
            console.log(MeetupsJSON);
            drawMeetups(MeetupsJSON);
            setupButtons();
        });
}

function searchEventsFor() {
    generateCalendar(meetups, eventSearch.value.toUpperCase());
}

// t = term
function generateCalendar(x, t) {
    eventsJSON = x; // x = Meetups Array
    eventsJSON = eventsJSON.map(app.getEvents);

    $.when(...eventsJSON)
        .then((...eventsJSON) => {
            if (gSelected > 1) {
                eventsJSON = eventsJSON.map(a => a[0].data)
                    .reduce((prev, curr) => [...prev, ...curr], [])
                    .sort(function (a, b) {
                        return a.time - b.time;
                    });
            } else {
                eventsJSON = eventsJSON.map(a => a.data)[0];
            }
            console.log(eventsJSON);
            drawCalendar(eventsJSON, t);
        });
}


function drawCalendar(JSON, t) {
    eventsContainer.innerHTML = "";
    var month = 0;
    for (var i = 0; i < JSON.length; i++) {
        var x = JSON[i];
        var desc = (x.hasOwnProperty('description')) ? x.description.replace(/<(?:.|\n)*?>/gm, '').toUpperCase() : ""; // Because some Meetups do not have desc, founded and stopped rendering for "NSManchester: iOS Developer Group" due to error
        var name = x.name.toUpperCase();

        if (desc.includes(t) || name.includes(t)) {
            var timeRange = "N/A";

            var eventName = x.name;
            var eventLink = x.link;
            var groupName = x.group.name;
            var groupLink = "https://www.meetup.com/" + x.group.urlname + "/";
            var date = x.local_date;
            var day = date.substring(8, 10);
            var year = date.substring(0, 4);
            var time = (x.hasOwnProperty('local_time')) ? x.local_time : "N/A";
            var duration = (x.hasOwnProperty('duration')) ? x.duration : "";
            var rsvp = x.yes_rsvp_count;
            var rsvpLimit = (x.hasOwnProperty('rsvp_limit')) ? x.rsvp_limit : "∞";

            var venueName = (x.hasOwnProperty('venue')) ? x.venue.name : "N/A";
            var venueAddress = (x.hasOwnProperty('venue')) ? x.venue.address_1 : "";
            var venuePostcode = (x.hasOwnProperty('venue')) ? x.venue.city : "";

            if (time != "N/A" && duration != "") {
                var timeC = timeConvert(time);
                var until = timeConvert(timeUntil(time, duration));
                if ((timeC.includes("PM") && until.includes("PM")) || (timeC.includes("AM") && until.includes("AM"))) {
                    timeRange = timeC.replace("AM", "").replace("PM", "") + " - " + until;
                } else {
                    timeRange = timeC + " - " + until;
                }
            } else {
                timeRange = timeConvert(time);
            }

            var event = '<div class="event"><div class="numbers"><p class="day">' + ordinalSuffix(day) + '</p><p>' + timeRange + '</p><p>' + rsvp + '/' + rsvpLimit + '</p></div><div class="details"><a href="' + eventLink + '" target="_blank"><h4>' + eventName + '</h4></a><p>' + venueName + ' - ' + venueAddress + ' (' + venuePostcode + ')' + '</p><a href="' + groupLink + '" target="_blank"><p>' + groupName + '</p></a></div>';

            if (month != parseInt(date.substring(5, 7))) {
                month = parseInt(date.substring(5, 7));
                eventsContainer.insertAdjacentHTML('beforeend', '<h3 class="month">' + months.get(parseInt(month)) + ' (' + year + ')' + '</h3>')
            }

            eventsContainer.insertAdjacentHTML('beforeend', event);
        }
    }
}

function searchMeetups() {
    navSearchBox.value = this.value;
    searchBox.value = this.value;
    var term = searchBox.value;
    var groups = document.getElementsByClassName("group");
    for (var i = 0; i < groups.length; i++) {
        if (groups[i].innerHTML.toUpperCase().includes(term.toUpperCase())) {
            groups[i].style.display = "inline-block";
        } else {
            groups[i].style.display = "none";
        }
    }
}

function showAllMeetups() {
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < group.length; i++) {
        group[i].style.display = "inline-block";
    }
}

function selectAllShown() {
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < group.length; i++) {
        if (!(group[i].style.display === 'none')) {
            document.getElementById("g" + i).checked = false;
        }
    }
}

function selectOnlyAllShown() {
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < group.length; i++) {
        if (group[i].style.display === 'none') {
            document.getElementById("g" + i).checked = true;
        } else {
            document.getElementById("g" + i).checked = false;
        }
    }
}

function deselectAllShown() {
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < group.length; i++) {
        if (!(group[i].style.display === 'none')) {
            document.getElementById("g" + i).checked = true;
        }
    }
}

function invertSelection() {
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < group.length; i++) {
        var x = document.getElementById("g" + i);
        x.checked = (x.checked) ? false : true;
    }
}

function getSelectedMeetupsIndexes() {
    var selected = [];
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < meetups.length; i++) {
        if (document.getElementById("g" + i).checked === false) {
            selected.push(i);
        }
    }
    gSelected = selected.length;
    return selected;
}

function getMeetupsFromIndexes(indexes) {
    var x = [];
    for (var i = 0; i < indexes.length; i++) {
        x.push(meetups[indexes[i]]);
    }
    return x;
}

app.getEvents = (meetup) => $.ajax({
    url: 'https://api.meetup.com/' + meetup + '/events',
    method: 'GET',
    dataType: 'jsonp'
});

app.getMeetups = (meetup) => $.ajax({
    url: 'https://api.meetup.com/' + meetup,
    method: 'GET',
    dataType: 'jsonp'
});

function getTechNW(merge, t) {
    document.getElementById("eventsContainer").innerHTML = "";
    eventsContainer.insertAdjacentHTML('beforeend', '<div class="loader"></div>');
    var r = new XMLHttpRequest();

    r.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/a73q3trj8bssqjifgolb1q8fr4@group.calendar.google.com/events?key=AIzaSyCR3-ptjHE-_douJsn8o20oRwkxt-zHStY&maxResults=9999&singleEvents=true&orderBy=starttime', true);

    r.onload = () => {
        var data = JSON.parse(r.responseText);
        console.log(data);
        data = data.items;

        var futureEvents = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].hasOwnProperty('start')) {
                var s = data[i].start;
                if (s.hasOwnProperty('dateTime')) {
                    if (!pastEvent(s.dateTime)) {
                        futureEvents.push(data[i]);
                    }
                }
            }
        }

        futureEvents.sort(function (a, b) {
            return new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime();
        });

        if (merge) generateAllEvents(futureEvents);
        if (!merge) drawTechNW(futureEvents);

        console.log(futureEvents);
    }

    r.send();
}

function generateAllEvents(techNWMeetups) {
    
}

function drawTechNW(JSON) {
    document.getElementById("eventsContainer").innerHTML = "";
    var m = 0;
    for (var i = 0; i < JSON.length; i++) {
        var x = JSON[i];
        // console.log(x);
        var name = x.summary;
        var date = x.start.dateTime;
        var day = date.substr(8, 2);
        var month = new Date(date).getMonth() + 1;
        var year = new Date(date).getYear();
        year = '20' + year.toString().substring(1, 3);
        var h = (new Date(date).getHours() > 9) ? new Date(date).getHours() : '0' + new Date(date).getHours();
        var min = (new Date(date).getMinutes() > 9) ? new Date(date).getMinutes() : '0' + new Date(date).getMinutes();
        var time = h + ":" + min;
        var location = (x.hasOwnProperty('location')) ? x.location : "N/A";
        var link = x.htmlLink;

        var event = '<div class="event"><div class="numbers"><p class="day">' + ordinalSuffix(day) + '</p><p>' + timeConvert(time) + '</p></div><div class="details"><a href="' + link + '" target="_blank"><h4>' + name + '</h4></a><p>' + location + '</p><a href="http://technw.uk/calendar" target="_blank"><p> TechNW </p></a></div>';

        if (m != month) {
                m = month;
                eventsContainer.insertAdjacentHTML('beforeend', '<h3 class="month">' + months.get(month) + ' (' + year + ')' + '</h3>')
            }
        
        eventsContainer.insertAdjacentHTML('beforeend', event);
    }
}

function pastEvent(date) {
    var compareDate = new Date(date);
    var now = new Date();
    
    if (now.getTime() > compareDate.getTime()) {
        return true;
    }

    return false;
};

function showEvents(indexes) {
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < meetups.length; i++) {
        group[i].style.display = "none";
    }
    for (var i = 0; i < meetups.length; i++) {
        if (iterate(group[i], indexes)) {
            group[i].style.display = "inline-block";
        }
    }
}

function getCatagoryAmount(indexes) {
    var x = 0;
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < meetups.length; i++) {
        if (iterate(group[i], indexes)) {
            x += 1;
        }
    }
    return x;
}

function iterate(html, array) {
    for (var i = 0; i < array.length; i++) {
        if (html.innerHTML.includes(array[i])) {
            return true;
        }
    }
    return false;
}

function fullArray() {
    var a = [];
    for (var i = 0; i < meetups.length; i++) {
        a.push(i);
    }
    return a;
}

function ordinalSuffix(i) {
    var x = i % 10,
        y = i % 100;
    if (x == 1 && y != 11) {
        return i + "st";
    }
    if (x == 2 && y != 12) {
        return i + "nd";
    }
    if (x == 3 && y != 13) {
        return i + "rd";
    }
    return i + "th";
}

function timeConvert(i) {
    var ampm;
    var x;
    if (i.substring(0, 2) > 12) {
        ampm = "PM";
        x = i.substring(0, 2) % 12 + ":" + i.substring(3, 5) + ampm;
    } else {
        ampm = "AM";
        x = i.substring(0, 2) + ":" + i.substring(3, 5) + ampm;
    }
    return x;
}

function timeUntil(time, duration) {
    var until;
    var totalMinutesDuration = Math.floor(duration / 60000);

    var hoursDuration = Math.floor(totalMinutesDuration / 60);
    var minutesDuration = totalMinutesDuration % 60;

    var hours = parseInt(time.substring(0, 2)) + hoursDuration;
    var minutes = parseInt(time.substring(3, 5)) + minutesDuration;

    if (minutes > 59) {
        var h = Math.floor(minutes / 60);
        minutes -= h * 60;
        hours += h;
    }
    if (hours > 23) {
        hours -= 24;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    return hours + ":" + minutes;
}

$(window).scroll(function () {
    if ($(window).scrollTop() > 460) {
        $('#navbar').addClass('navbarFixed');
        $('#navSearch').removeClass('navSearchHide');
        $('#navSearch').addClass('navSearchShow');
    } else {
        $('#navbar').removeClass('navbarFixed');
        $('#navSearch').removeClass('navSearchShow');
        $('#navSearch').addClass('navSearchHide');
    }
});

function clearMeetupSearch() {
    searchBox.value = "";
    navSearchBox.value = "";
    showAllMeetups();
}

function setupButtons() {
    all = document.getElementById("all");
    social = document.getElementById("social");
    ux = document.getElementById("ux");
    workshops = document.getElementById("workshops");
    specialized = document.getElementById("specialized");
    data = document.getElementById("data");
    web = document.getElementById("web");
    ladies = document.getElementById("ladies");
    blockchain = document.getElementById("blockchain");
    method = document.getElementById("method");

    var allIndex = fullArray();
    var socialIndex = ["freelance", "North-West-IT-Crowd-Beer-BBQ", "Social-Software"];
    var uxIndex = ["UX"];
    var workshopsIndex = ["CodeUp", "Code-Your-Future"];
    var specializedIndex = ["DotNetNorth", "Magento", "Java", "Manchester-R", "ManchesterWordPressUserGroup", "JS", "Ruby", "scala"];
    var dataIndex = ["Digital-Analytics-Manchester", "DB", "InfoSec", "Power-BI", "Manchester-R", "Neo4j-Manchester", "Data", "Couchbase"];
    var webIndex = ["JavaScript", "SEO", "AWS", "node", "JS", "React", "Angular", "FRED", "WordPress"];
    var ladiesIndex = ["CIA", "Ladies", "HER-Data-MCR"];
    var blockchainIndex = ["wHuRVtrk", "Bitcoin", "Crypto-Currency"];
    var methodIndex = ["Lean", "Expert-Talks-Manchester"];

    all.value = "All | " + getCatagoryAmount(allIndex);
    social.value = "Social | " + getCatagoryAmount(socialIndex);
    ux.value = "UX | " + getCatagoryAmount(uxIndex);
    workshops.value = "Workshops | " + getCatagoryAmount(workshopsIndex);
    specialized.value = "Specialized | " + getCatagoryAmount(specializedIndex);
    data.value = "Data | " + getCatagoryAmount(dataIndex);
    web.value = "Web | " + getCatagoryAmount(webIndex);
    ladies.value = "Women/Ladies | " + getCatagoryAmount(ladiesIndex);
    blockchain.value = "Blockchain | " + getCatagoryAmount(blockchainIndex);
    method.value = "Methodologies | " + getCatagoryAmount(methodIndex);

    all.addEventListener("click", function () {
        showEvents(allIndex);
    });
    social.addEventListener("click", function () {
        showEvents(socialIndex);
    });
    ux.addEventListener("click", function () {
        showEvents(uxIndex);
    });
    workshops.addEventListener("click", function () {
        showEvents(workshopsIndex);
    });
    specialized.addEventListener("click", function () {
        showEvents(specializedIndex);
    });
    data.addEventListener("click", function () {
        showEvents(dataIndex);
    });
    web.addEventListener("click", function () {
        showEvents(webIndex);
    });
    ladies.addEventListener("click", function () {
        showEvents(ladiesIndex);
    });
    blockchain.addEventListener("click", function () {
        showEvents(blockchainIndex);
    });
    method.addEventListener("click", function () {
        showEvents(methodIndex);
    });
}

function initDOMelements() {
    searchBox = document.getElementById("searchBox");
    search = document.getElementById("search");
    navSearchBox = document.getElementById("navSearchBox");
    clearSearch = document.getElementById("clearSearch");
    clearNavSearch = document.getElementById("clearNavSearch");
    generate = document.getElementById("generate");
    select = document.getElementById("select");
    selectShown = document.getElementById("selectShown");
    deselect = document.getElementById("deselect");
    invertSelect = document.getElementById("invertSelect");
    groupsContainer = document.getElementById("groupsContainer");
    eventsContainer = document.getElementById("eventsContainer");
    eventSearch = document.getElementById("eventSearch");
    searchEvents = document.getElementById("searchEvents");
    techNW = document.getElementById("techNW");
    //generateAll = document.getElementById("generateAll");

    generate.addEventListener("click", function () {
        generateCalendar(getMeetupsFromIndexes(getSelectedMeetupsIndexes()), "");
    });
    searchBox.addEventListener("keyup", searchMeetups);
    navSearchBox.addEventListener("keyup", searchMeetups);
    clearSearch.addEventListener("click", clearMeetupSearch);
    clearNavSearch.addEventListener("click", clearMeetupSearch);

    select.addEventListener("click", selectAllShown);
    selectShown.addEventListener("click", selectOnlyAllShown);
    deselect.addEventListener("click", deselectAllShown);
    invertSelect.addEventListener("click", invertSelection);

    searchEvents.addEventListener("click", searchEventsFor);
    techNW.addEventListener("click", function () {
        getTechNW(false, "");
    });
    //generateAll.addEventListener("click", function () {
    //    getTechNW(true, "");
    //});

}
