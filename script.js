const app = {};
window.addEventListener('load', init);

var searchBox, navSearchBox, search, clearSearch, clearNavSearch, generate, loadingText;
// Catagory Elements
var all, social, ux, workshops, specialized, data, web, ladies, blockchain, method;

var select, selectShown, deselect,invertSelect;
var groupsContainer,eventsContainer;
var eventSearch, searchEvents;
var techNW, generateAll;

let gSelected = 10; // Bodge for one selected meetup group, needs to be more than 1 for search

const commonWords = ["MANCHESTER", "GROUP", "USER", "-"];
var meetups = ["android_mcr", "BCS-Greater-Manchester-Branch", "blabtalks", "meetup-group-wHuRVtrk", "CIA-Chicks-in-Advertising-Manchester", "Code-Your-Future-Manchester", "CodeUpManchester", "CodeUp-Salford", "Digital-Analytics-Manchester", "Digital_North_", "DotNetNorth", "Enterprise-UX", "freelance-folk-manchester", "HackerNestMAN", "hackspace-manchester", "HadoopManchester", "HCD-Manchester", "IoTMCR", "JavaScript-North-West", "Ladies-of-Code-Manchester", "Lean-Agile-Manchester", "MaccTech", "Magento-Minds-of-Manchester", "MancDB", "Manchester-Bitcoin-blockchain-and-other-cryptocurrencies", "Manchester-Angular-Workshop", "manchesterentrepreneursclub", "Manchester-Futurists", "Manchester-Grey-Hats", "Manchester-InfoSec", "ManchesterUK-Java-Community", "Power-BI-Manchester-Meetup", "Manchester-R", "Manchester-React-User-Group", "ManchesterWordPressUserGroup", "MancJS", "McrFRED", "McrUXD", "Messaging-Bots-Manchester", "Neo4j-Manchester", "North-West-IT-Crowd-Beer-BBQ-Event", "North-West-Ruby-User-Group", "Open-Data-Manchester", "Practical-Business-Workshops-Manchester", "RealUX", "Salford-Lean-Startup", "scala-developers", "SEO-Manchester", "Social-Software-Development-Meetup-in-Manchester", "Tech-for-Good-Live", "Tech-Leads-NW", "Test-Hive-Manchester", "ThoughtWorks-Manchester-Events", "UK-North-Crypto-Currency-Meetup", "The-UX-Crunch-North", "VRManchester", "AWS-User-Group-North", "Code-Nation", "Manchester-Open-Source", "DevOps-Manchester", "StartupBlink-Manchester", "nwdrupal", "Manchester-Xamarin-User-Group", "manchester-node-workshop", "DATA-VISUALISATION-MEETUP", "BlockchainManchesterMeetup", "Manchester-WordPress-SEO-Startup", "Manchester-Unity3D-Game-Dev-Meetup", "Google-Cloud-Platform-Users-North-West", "Manc-Bitcoin", "craftcmsmanchester", "Couchbase-Manchester", "NSManchester", "Python-North-West-Meetup", "Expert-Talks-Manchester", "HER-Data-MCR", "northernsoho", "North-West-Playtesters", "VueJS-Manchester", "North-West-Tester-Gathering", "etechmcr", "Introduction-to-Bitcoin-and-Cryptoeconomics", "Bitcoin-Manchester", "Manchester-F-User-Group", "Manchester-Technology-Leaders-Meet-Up-Group", "North-West-Bitcoin-Meetup", "WMUGMCR", "Kotlin-Manchester", "Docker-Manchester", "Manchester-OpenStack-Meetup", "Women-in-Technology-North", "IBM-PowerAI-Manchester", "MCR-CoderDojo", "meetup-group-MsiOIcyg", "Manchester-Blockchain-Organisation", "EOS-Manchester", "HacksHackersMCR", "R-Ladies-Manchester", "golang-mcr", "Ministry-of-Testing-Manchester", "Redis-Manchester", "gdg_manchester", "Manchester-Artificial-Intelligence-Meetup","GraphQL-Manchester", "PyData-Manchester","Codebar-Manchester", "The-Future-of-DevOps-and-Security", "Manchester-Kafka", "Manchester-Bitcoin-Miners-Meetup"]; // wHuRVtrk = Blockchain, meetup-group-MsiOIcyg = M1Con
// DEAD GROUPS:  ManchesterData, Manchester-Elastic-Fantastics, Manchester-Cassandra-Users, Manchester-MongoDB-User-Group, The-Manchester-PostgreSQL-Meetup, Manchester-Web-Performance-Group

const months = new Map([[1, 'January'], [2, 'February'], [3, 'March'], [4, 'April'], [5, 'May'], [6, 'June'], [7, 'July'], [8, 'August'], [9, 'September'], [10, 'October'], [11, 'November'], [12, 'December']]);

var eventsJSON = meetups;
var MeetupsJSON = meetups;

function init() {
    meetups.sort(function (a, b) {
        return withoutMCR(a).localeCompare(withoutMCR(b))
    });

    initDOMelements();
    initGetMeetups();
}

function withoutMCR(x) {
    return x.toLowerCase().replace("manchester-", "").replace("manchesteruk-", "").replace("manchester", "").replace("manc", "").replace("mcr", "").replace("-", "");
}

function drawMeetups(JSON) {
    groupsContainer.innerHTML = "";
    for (var i = 0; i < JSON.length; i++) {
        var x = JSON[i];
        var name = x.name;
        var link = x.link;
        var members = x.members;
        var tilNext = x.tilNext;
        var sinceLast = x.sinceLast;

        var txtEvents = 'N/A';
        if (tilNext == 'N/A' && sinceLast == 'N/A') {
            txtEvents = 'No Events';
        } else {
            if (tilNext == 'N/A') {
                txtEvents = (sinceLast == 1) ? 'YESTERDAY' : 'Since Last: ' + sinceLast;
            } else {
                switch (tilNext) {
                    case 0:
                        txtEvents = 'TODAY';
                        break;
                    case 1:
                        txtEvents = 'TOMORROW';
                        break;
                    default: 
                        txtEvents = 'Until Next: ' + tilNext;
                }
            }
        }

        var thumb = 'blank.jpg';
        if (x.hasOwnProperty('group_photo')) {
            thumb = x.group_photo.photo_link;
        } else {
            if(x.hasOwnProperty('organizer')) {
                if (x.organizer.hasOwnProperty('photo')) {
                    thumb = x.organizer.photo.photo_link;
                }
            }
        }
        
        var group = '<div class="group" id="' + i + '"><div class="meetupImg"><input type="checkbox" id="g' + i + '"><label for="g' + i + '"><img src="' + thumb + '"></label></div><div class="groupText"><a href="' + link + '" target="_blank"><p class="groupName">' + name + '</p></a><p>Members: ' + members + '<br/>' + txtEvents + '</p></div></div>';
        groupsContainer.insertAdjacentHTML('beforeend', group);
    }
}

function initGetMeetups() {
    console.log(meetups);
    loadingText.innerHTML = "Getting Groups";
    MeetupsJSON = MeetupsJSON.map(app.getMeetups);
    var errorMeetups = [];

    $.when(...MeetupsJSON)
        .then((...MeetupsJSON) => {
            MeetupsJSON = MeetupsJSON.map(a => a[0].data).filter(function (n) {
                if (n.hasOwnProperty('errors')) {
                    var name = n.errors[0].message.substr(22, n.errors[0].message.length);
                    console.log(name + ': Group Error');
                    errorMeetups.push(name);
                }
                return !n.hasOwnProperty('errors');
            });
            meetups = meetups.filter(function (n) {
                return !errorMeetups.includes(n);
            });
            console.log(MeetupsJSON);
            addUntilNext(MeetupsJSON); // REMOVE IF DOESN'T WORK
            // drawMeetups(MeetupsJSON);
            // setupButtons();
        });
}

function addUntilNext(MeetupsJSON) {
    var i = meetups;
    loadingText.innerHTML = "Adding Until Next";
    i = i.map(app.getEvents);
    $.when(...i)
    .then((...i) => {
        i = i.map(a => a[0].data);
        // console.log(i);
        for (var j = 0; j < i.length; j++) {
           // console.log(i[j][0]);
            MeetupsJSON[j].tilNext = (i[j].length == 0) ? "N/A" : daysUntil(i[j][0].time);
        } addSince(MeetupsJSON);
        // drawMeetups(MeetupsJSON);
        // setupButtons();
    });
}

function addSince(MeetupsJSON) {
    var i = meetups;
    loadingText.innerHTML = "Adding Since Last";
    i = i.map(app.getPastEvents);
    $.when(...i)
    .then((...i) => {
        i = i.map(a => a[0].data);
        //console.log(i);
        for (var j = 0; j < i.length; j++) {
           // console.log(i[j][0]);
            MeetupsJSON[j].sinceLast = (i[j].length == 0) ? "N/A" : daysSince(i[j][0].time);
        } drawMeetups(MeetupsJSON);
        setupButtons();
    });
}

function daysUntil(epoch) { // using epoch time since "local_date" is not always defined
    var now = new Date();
    var event = new Date(epoch); //var event = new Date(date.substr(0,4),date.substr(5,2),date.substr(8,2));
    return Math.round(Math.abs((now.getTime() - event.getTime()) / (24*60*60*1000)));
}

function daysSince(epoch) { // using epoch time since "local_date" is not always defined
    var now = new Date();
    var event = new Date(epoch); //var event = new Date(date.substr(0,4),date.substr(5,2),date.substr(8,2));
    return Math.round(Math.abs((event.getTime() - now.getTime()) / (24*60*60*1000)));
}

function searchEventsFor() {
    getTechNW(true, eventSearch.value.toUpperCase());
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
            eventsJSON = addLocal(eventsJSON);
            console.log(eventsJSON);
            drawCalendar(eventsJSON, t);
        });
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
    } selectOnlyAllShown();
}

function showAllMeetups() {
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < group.length; i++) {
        group[i].style.display = "inline-block";
    } selectOnlyAllShown();
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

app.getPastEvents = (meetup) => $.ajax({
    url: 'https://api.meetup.com/' + meetup + '/events?desc=true&status=past',
    method: 'GET',
    dataType: 'jsonp'
});

app.getMeetups = (meetup) => $.ajax({
    url: 'https://api.meetup.com/' + meetup,
    method: 'GET',
    dataType: 'jsonp'
});

function getTechNW(merge, t) {
    var r = new XMLHttpRequest();
    
    r.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/a73q3trj8bssqjifgolb1q8fr4@group.calendar.google.com/events?key=AIzaSyCR3-ptjHE-_douJsn8o20oRwkxt-zHStY&maxResults=9999&singleEvents=true&orderBy=starttime&timeMin=' + ISODateString(new Date()) + "&timeMax=" + ISODateString(new Date ((new Date().valueOf()) + 31540000000)), true);

    r.onload = () => {
        var data = JSON.parse(r.responseText);
        console.log(data);
        data = data.items;

        var futureEvents = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].hasOwnProperty('start') && data[i].hasOwnProperty('summary')) {
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

        if (merge) generateAllEvents(futureEvents, t);
        if (!merge) drawCalendar(futureEvents, t);

        console.log(futureEvents);
    }

    r.send();
}

function generateAllEvents(techNWMeetups, t) {
    eventsJSON = meetups;
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

            eventsJSON = addLocal(eventsJSON);
            console.log(eventsJSON);
            var e = mergeMeetupTechNW(eventsJSON, techNWMeetups);
            e = sortMeetups(e);
            e = reduceFromTerm(e, t);
            e = removeDuplicates(e);
            console.log(e);
            drawCalendar(e, t);
        });
}


function addLocal(JSON) {
    for (var i = 0; i < JSON.length; i++) {
        if (!JSON[i].hasOwnProperty('local_date') && !JSON[i].hasOwnProperty('local_time')) {
            var time = new Date(JSON[i].time);
            var month = (time.getMonth() > 9) ? time.getMonth() + 1 : '0' + (time.getMonth() + 1);
            var day = (time.getDate() > 9) ? time.getDate() : '0' + time.getDate();
            var hour = (time.getHours() > 9) ? time.getHours() : '0' + time.getHours();
            var minute = (time.getMinutes() > 9) ? time.getMinutes() : '0' + time.getMinutes();
            JSON[i].local_date = time.getFullYear() + '-' + month + '-' + day;
            JSON[i].local_time = hour + ':' + minute;
        }
    }
    return JSON;
}

function mergeMeetupTechNW(Meetup, TechNW) {
    return Meetup.concat(TechNW);
}

function sortMeetups(JSON) {
    return JSON.sort(function (a, b) {
        if (a.hasOwnProperty('start') && b.hasOwnProperty('start')) return new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime();
        if (a.hasOwnProperty('start') && b.hasOwnProperty('time')) return new Date(a.start.dateTime).getTime() - b.time;
        if (a.hasOwnProperty('time') && b.hasOwnProperty('start')) return a.time - new Date(b.start.dateTime).getTime();
        if (a.hasOwnProperty('time') && b.hasOwnProperty('time')) return a.time - b.time;
    });
}

function reduceFromTerm(JSON, t) {
    var j = [];
    for (var i = 0; i < JSON.length; i++) {
        var x = JSON[i];

        var desc = (x.hasOwnProperty('description')) ? x.description.replace(/<(?:.|\n)*?>/gm, '').toUpperCase() : "";
        var name = (x.hasOwnProperty('name')) ? x.name.toUpperCase() : x.summary.toUpperCase();

        if (desc.includes(t) || name.includes(t)) {
            j.push(x);
        }
    }
    console.log(j);
    return j;
}

function removeDuplicates(JSON) {
    var newJSON = [];
    for (var i = 0; i < JSON.length; i++) {
        var x = JSON[i];

        if (JSON[i] != null) {
            var xDay = (x.hasOwnProperty('start')) ? x.start.dateTime.substr(8, 2) : x.local_date.substr(8, 2);

            var xMonth = (x.hasOwnProperty('start')) ? new Date(x.start.dateTime).getMonth() + 1 : parseInt(x.local_date.substring(5, 7));

            for (var j = i + 1; j < JSON.length && JSON[j] != null && xDay == ((JSON[j].hasOwnProperty('start')) ? JSON[j].start.dateTime.substr(8, 2) : JSON[j].local_date.substr(8, 2)); j++) {

                var y = JSON[j];

                if (x != null && y != null) {
                    if (i != j && containsWords(x, y)) {
                        if (!((x.hasOwnProperty('start') && y.hasOwnProperty('start')) || (x.hasOwnProperty('name') && y.hasOwnProperty('name')))) {

                            if (x.hasOwnProperty('start')) {

                                if (!y.hasOwnProperty('venue') && x.hasOwnProperty('location')) {
                                    var obj = {
                                        name: JSON[i].location
                                    };
                                    JSON[j].venue = obj;
                                }
                                JSON[i] = null;

                            } else {

                                if (!x.hasOwnProperty('venue') && y.hasOwnProperty('location')) {
                                    var obj = {
                                        name: JSON[j].location
                                    };
                                    JSON[i].venue = obj;
                                }
                                JSON[j] = null

                            }
                        }
                    }
                }

            }
        }
    }
    console.log(JSON);
    newJSON = JSON.filter(function (n) {
        return n !== null
    });
    console.log(JSON);
    return newJSON;
}

function containsWords(x, y) {

    var xName = (x.hasOwnProperty('name')) ? x.name + " " + x.group.name : x.summary;
    var xWords = xName.match(/[A-Z]*[^A-Z]+/g);
    if (xWords == null) xWords = xName.split(" ");
    xWords.map(function (z) {
        return z.toUpperCase().replace(" ", "")
    });

    var yName = (y.hasOwnProperty('name')) ? y.name + " " + y.group.name : y.summary;
    var yWords = yName.match(/[A-Z]*[^A-Z]+/g);
    if (yWords == null) yWords = yName.split(" ");
    yWords.map(function (z) {
        return z.toUpperCase().replace(" ", "")
    });

    for (var i = 0; i < xWords.length; i++) {
        for (var j = 0; j < yWords.length; j++) {
            if (xWords[i] == yWords[j] && !commonWords.includes(xWords[i])) {
                return true;
            }
        }
    }
    return false;
}



function drawCalendar(JSON, t) {
    document.getElementById("eventsContainer").innerHTML = "";
    var m = 0;
    if (JSON.length == 0) document.getElementById("eventsContainer").innerHTML = '<div class="centerElements"><h3>No Events</h3></div>';
    for (var i = 0; i < JSON.length; i++) {
        var x = JSON[i];

        var desc = (x.hasOwnProperty('description')) ? x.description.replace(/<(?:.|\n)*?>/gm, '').toUpperCase() : "";

        var name = (x.hasOwnProperty('name')) ? x.name.toUpperCase() : x.summary.toUpperCase();

        if (desc.includes(t) || name.includes(t)) {

            var month = (x.hasOwnProperty('start')) ? new Date(x.start.dateTime).getMonth() + 1 : parseInt(x.local_date.substring(5, 7));

            var year = (x.hasOwnProperty('start')) ? '20' + (new Date(x.start.dateTime).getYear()).toString().substring(1, 3) : parseInt(x.local_date.substring(0, 4));

            if (m != month) {
                m = month;
                eventsContainer.insertAdjacentHTML('beforeend', '<h3 class="month">' + months.get(month) + ' (' + year + ')' + '</h3>')
            }

            if (x.hasOwnProperty('name')) {
                drawMeetupEvent(x);
            } else {
                drawTechNWEvent(x);
            }
        }
    }
}

function drawMeetupEvent(x) {
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

    var fee = "";
    if (x.hasOwnProperty('fee')) {
        var a = Math.round(x.fee.amount * 100) / 100;
        var t = (x.fee.currency == "GBP") ? "£" : x.fee.currency;
        fee = '<a>' + t + a + '</a>';
    }

    var venueName = (x.hasOwnProperty('venue')) ? x.venue.name : "N/A";
    var venueAddress = (x.hasOwnProperty('venue')) ? x.venue.address_1 : "";
    var venuePostcode = (x.hasOwnProperty('venue')) ? x.venue.city : "";
    var venue = (venueName == "N/A") ? "N/A" : venueName + ' - ' + venueAddress + ' (' + venuePostcode + ')';
    venue = venue.replace("undefined", "").replace("undefined", "").replace(' - ()', "");

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

    var event = '<div class="event"><div class="numbers"><p class="day">' + ordinalSuffix(day) + '</p><p>' + timeRange + '</p><p>' + rsvp + '/' + rsvpLimit + '</p> ' + fee + '</div><div class="details"><a href="' + eventLink + '" target="_blank"><h4>' + eventName + '</h4></a><p>' + venue + '</p><a href="' + groupLink + '" target="_blank"><p>' + groupName + '</p></a></div>';

    eventsContainer.insertAdjacentHTML('beforeend', event);
}

function drawTechNWEvent(x) {
    var name = x.summary;
    var date = x.start.dateTime;
    var day = date.substr(8, 2);
    var month = new Date(date).getMonth() + 1;
    var year = '20' + (new Date(date).getYear()).toString().substring(1, 3);
    var h = (new Date(date).getHours() > 9) ? new Date(date).getHours() : '0' + new Date(date).getHours();
    var m = (new Date(date).getMinutes() > 9) ? new Date(date).getMinutes() : '0' + new Date(date).getMinutes();
    var time = h + ":" + m;
    var location = (x.hasOwnProperty('location')) ? x.location : "N/A";
    var link = x.htmlLink;

    var event = '<div class="event"><div class="numbers"><p class="day">' + ordinalSuffix(day) + '</p><p>' + timeConvert(time) + '</p></div><div class="details"><a href="' + link + '" target="_blank"><h4>' + name + '</h4></a><p>' + location + '</p><a href="http://technw.uk/calendar" target="_blank"><p> TechNW </p></a></div>';

    eventsContainer.insertAdjacentHTML('beforeend', event);
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

function ISODateString(d) {
    function pad(n) {
        return n < 10 ? '0' + n : n
    }
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + 'Z'
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
    var socialIndex = ["freelance", "North-West-IT-Crowd-Beer-BBQ", "Social-Software", "HackerNestMAN"];
    var uxIndex = ["UX"];
    var workshopsIndex = ["CodeUp", "Code-Your-Future", "CoderDojo"];
    var specializedIndex = ["DotNetNorth", "Magento", "Java", "Manchester-R", "ManchesterWordPressUserGroup", "JS", "Ruby", "scala"];
    var dataIndex = ["Digital-Analytics-Manchester", "DB", "InfoSec", "Power-BI", "Manchester-R", "Neo4j-Manchester", "Data", "Couchbase"];
    var webIndex = ["JavaScript", "SEO", "AWS", "node", "JS", "React", "Angular", "FRED", "WordPress"];
    var ladiesIndex = ["CIA", "Ladies", "HER-Data-MCR", "Women"];
    var blockchainIndex = ["wHuRVtrk", "Bitcoin", "Crypto-Currency", "Blockchain", "EOS"];
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
        selectOnlyAllShown();
    });
    social.addEventListener("click", function () {
        showEvents(socialIndex);
        selectOnlyAllShown();
    });
    ux.addEventListener("click", function () {
        showEvents(uxIndex);
        selectOnlyAllShown();
    });
    workshops.addEventListener("click", function () {
        showEvents(workshopsIndex);
        selectOnlyAllShown();
    });
    specialized.addEventListener("click", function () {
        showEvents(specializedIndex);
        selectOnlyAllShown();
    });
    data.addEventListener("click", function () {
        showEvents(dataIndex);
        selectOnlyAllShown();
    });
    web.addEventListener("click", function () {
        showEvents(webIndex);
        selectOnlyAllShown();
    });
    ladies.addEventListener("click", function () {
        showEvents(ladiesIndex);
        selectOnlyAllShown();
    });
    blockchain.addEventListener("click", function () {
        showEvents(blockchainIndex);
        selectOnlyAllShown();
    });
    method.addEventListener("click", function () {
        showEvents(methodIndex);
        selectOnlyAllShown();
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
    // selectShown = document.getElementById("selectShown");
    deselect = document.getElementById("deselect");
    invertSelect = document.getElementById("invertSelect");
    groupsContainer = document.getElementById("groupsContainer");
    eventsContainer = document.getElementById("eventsContainer");
    eventSearch = document.getElementById("eventSearch");
    searchEvents = document.getElementById("searchEvents");
    techNW = document.getElementById("techNW");
    generateAll = document.getElementById("generateAll");
    loadingText = document.getElementById("loadingText");

    generate.addEventListener("click", function () {
        spinner();
        generateCalendar(getMeetupsFromIndexes(getSelectedMeetupsIndexes()), "");
    });
    searchBox.addEventListener("keyup", searchMeetups);
    navSearchBox.addEventListener("keyup", searchMeetups);
    clearSearch.addEventListener("click", clearMeetupSearch);
    clearNavSearch.addEventListener("click", clearMeetupSearch);

    select.addEventListener("click", selectAllShown);
    // selectShown.addEventListener("click", selectOnlyAllShown);
    deselect.addEventListener("click", deselectAllShown);
    invertSelect.addEventListener("click", invertSelection);

    searchEvents.addEventListener("click", searchEventsFor);
    techNW.addEventListener("click", function () {
        spinner();
        getTechNW(false, "");
    });
    generateAll.addEventListener("click", function () {
        spinner();
        getTechNW(true, "");
    });

}

function spinner() {
    document.getElementById("eventsContainer").innerHTML = '<div class="loader"></div>';
}