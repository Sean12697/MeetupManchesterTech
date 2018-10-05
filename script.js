const app = {};
window.addEventListener('load', init);

var searchBox, navSearchBox, search, clearSearch, clearNavSearch, generate, loadingText;
// Catagory Elements
var all, ux, data, web, ladies, blockchain, workshops;
var inactive, nothing, showInactive = false,
    showNothing = false;
var select, selectShown, deselect, invertSelect;
// var def, az, za, membersAsc, membersDesc, upcoming;
var groupsContainer, eventsContainer;
var eventSearch, searchEvents;
var techNW, generateAll;

let gSelected = 10; // Bodge for one selected meetup group, needs to be more than 1 for search

const commonWords = ["MANCHESTER", "GROUP", "USER", "-"];

const months = new Map([[1, 'January'], [2, 'February'], [3, 'March'], [4, 'April'], [5, 'May'], [6, 'June'], [7, 'July'], [8, 'August'], [9, 'September'], [10, 'October'], [11, 'November'], [12, 'December']]);
const abvMonths = new Map([[1, 'Jan'], [2, 'Feb'], [3, 'March'], [4, 'Apr'], [5, 'May'], [6, 'Jun'], [7, 'Jul'], [8, 'Aug'], [9, 'Sept'], [10, 'Oct'], [11, 'Nov'], [12, 'Dec']]);
const abvDays = new Map([[0,"Sun"],[1,"Mon"],[2,"Tue"],[3,"Wed"],[4,"Thur"],[5,"Fri"],[6,"Sat"]]);

var eventsJSON = meetups;
var MeetupsJSON = meetups;
var MeetupJSONfinal = [];

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

function toShow(meetupGroup) {
    if (meetupGroup.show && !((meetupGroup.sinceLast > 90 && !showInactive) || (meetupGroup.sinceLast == "N/A" && meetupGroup.tilNext == "N/A" && !showNothing))) {
        return true;
    } return false;
}

function drawMeetups(JSON) {
    groupsContainer.innerHTML = "";
    for (var i = 0; i < JSON.length; i++) {
        if (toShow(JSON[i])) {
            var x = JSON[i];
            var name = x.name;
            var link = x.link;
            var id = link.replace("https://www.meetup.com/", "").replace("/", "");
            var members = x.members;
            var tilNext = x.tilNext;
            var sinceLast = x.sinceLast;

            var txtEvents = 'N/A';
            if (tilNext == 'N/A' && sinceLast == 'N/A') {
                txtEvents = 'No Events';
            } else {
                if (tilNext == 'N/A') {
                    txtEvents = (sinceLast == 1) ? 'YESTERDAY' : 'Last: ' + sinceLast + ' Days';
                } else {
                    switch (tilNext) {
                        case 0:
                            txtEvents = 'TODAY';
                            break;
                        case 1:
                            txtEvents = 'TOMORROW';
                            break;
                        default:
                            txtEvents = 'Next: ' + tilNext + ' Days';
                    }
                }
            }

            var thumb = 'blank.jpg';
            if (x.hasOwnProperty('group_photo')) {
                thumb = x.group_photo.photo_link;
            } else {
                if (x.hasOwnProperty('organizer')) {
                    if (x.organizer.hasOwnProperty('photo')) {
                        thumb = x.organizer.photo.photo_link;
                    }
                }
            }

            var group = '<div class="group" id="' + id + '"><div class="meetupImg"><input type="checkbox" id="g' + i + '"><label for="g' + i + '"><img src="' + thumb + '"></label></div><div class="groupText"><a href="' + link + '" target="_blank"><p class="groupName">' + name + '</p></a><p>Members: ' + members + '<br/>' + txtEvents + '</p></div></div>';
            groupsContainer.insertAdjacentHTML('beforeend', group);
        }
    } setupButtons();
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
    for (var i = 0; i < MeetupsJSON.length; i++) {
        MeetupsJSON[i].tilNext = (MeetupsJSON[i].hasOwnProperty('next_event')) ? daysUntil(MeetupsJSON[i].next_event.time) : "N/A";
    }
    addSince(MeetupsJSON);
}

function addSince(MeetupsJSON) {
    var i = meetups;
    loadingText.innerHTML = "Adding Since Last";
    i = i.map(app.getPastEvents);
    $.when(...i)
        .then((...i) => {
            i = i.map(a => a[0].data)
                 .filter(function(e) {
                     return !e.hasOwnProperty("errors");
                 });
            //console.log(i);
            for (var j = 0; j < i.length; j++) {
                MeetupsJSON[j].sinceLast = (i[j].length == 0) ? "N/A" : daysSince(i[j][0].time);
                MeetupsJSON[j].sortID = j;
                MeetupsJSON[j].show = true;
            }
            MeetupJSONfinal = MeetupsJSON;
            drawMeetups(MeetupsJSON);
            setupButtons();
        });
}

function daysUntil(epoch) { // using epoch time since "local_date" is not always defined
    var now = new Date();
    var event = new Date(epoch); //var event = new Date(date.substr(0,4),date.substr(5,2),date.substr(8,2));
    return Math.round(Math.abs((now.getTime() - event.getTime()) / (24 * 60 * 60 * 1000)));
}

function daysSince(epoch) { // using epoch time since "local_date" is not always defined
    var now = new Date();
    var event = new Date(epoch); //var event = new Date(date.substr(0,4),date.substr(5,2),date.substr(8,2));
    return Math.round(Math.abs((event.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
}

function searchEventsFor() {
    spinner();
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

            console.log(eventsJSON);
            eventsJSON = addLocal(eventsJSON);
            console.log(eventsJSON);
            drawCalendar(eventsJSON, t);
        });
}

function searchMeetups() {
    navSearchBox.value = this.value;
    searchBox.value = this.value;
    var term = searchBox.value.toLowerCase();
    for (var i = 0; i < MeetupJSONfinal.length; i++) {
        MeetupJSONfinal[i].show = (MeetupJSONfinal[i].name.toLowerCase().includes(term)) ? true : false;
    }
    drawMeetups(MeetupJSONfinal);
    selectAllShown();
}

function showAllMeetups() {
    for (var i = 0; i < MeetupJSONfinal.length; i++) MeetupJSONfinal[i].show = true;
    drawMeetups(MeetupJSONfinal);
    selectAllShown();
}

function selectAllShown() {
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < group.length; i++) group[i].firstChild.childNodes[0].checked = false;
}

function deselectAllShown() {
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < group.length; i++) group[i].firstChild.childNodes[0].checked = true;
}

function invertSelection() {
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < group.length; i++) group[i].firstChild.childNodes[0].checked = (group[i].firstChild.childNodes[0].checked) ? false : true;
}

function getSelectedMeetups() {
    var selected = [];
    var groups = document.getElementsByClassName("group");
    for (var i = 0; i < groups.length; i++) {
        if (groups[i].firstChild.childNodes[0].checked === false) selected.push(groups[i].id);
    }
    gSelected = selected.length;
    return selected;
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

    r.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/a73q3trj8bssqjifgolb1q8fr4@group.calendar.google.com/events?key=AIzaSyCR3-ptjHE-_douJsn8o20oRwkxt-zHStY&maxResults=9999&singleEvents=true&orderBy=starttime&timeMin=' + ISODateString(new Date()) + "&timeMax=" + ISODateString(new Date((new Date().valueOf()) + 31540000000)), true);

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
            // console.log(eventsJSON);
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

    var event = '<div class="event"><div class="numbers"><p class="day">' + ordinalSuffix(day) + '</p><p class="abv">' + abvDays.get((new Date(date).getDay())).toUpperCase() + " | " + abvMonths.get(parseInt(x.local_date.substring(5, 7))).toUpperCase() + '</p><p>' + timeRange + '</p><p>' + rsvp + '/' + rsvpLimit + '</p> ' + fee + '</div><div class="details"><a href="' + eventLink + '" target="_blank"><h4>' + eventName + '</h4></a><p class="location">' + venue + '</p><a href="' + groupLink + '" target="_blank"><p>' + groupName + '</p></a></div>';

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

    var event = '<div class="event"><div class="numbers"><p class="day">' + ordinalSuffix(day) + '</p><p class="abv">' + abvDays.get((new Date(date).getDay())).toUpperCase() + " | " + abvMonths.get(month).toUpperCase() + '</p><p>' + timeConvert(time) + '</p></div><div class="details"><a href="' + link + '" target="_blank"><h4>' + name + '</h4></a><p class="location">' + location + '</p><a href="http://technw.uk/calendar" target="_blank"><p> TechNW </p></a></div>';

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

function showEvents(arr) {
    for (var i = 0; i < MeetupJSONfinal.length; i++) {
        var x = MeetupJSONfinal[i];
        x.show = (iterate([x.name, x.link], arr)) ? true : false;
    }
    drawMeetups(MeetupJSONfinal);
}

function getCatagoryAmount(arr) {
    var total = 0, shown = 0;
    for (var i = 0; i < MeetupJSONfinal.length; i++) {
        var x = MeetupJSONfinal[i];
        if (iterate([x.name, x.link], arr)) {
            total++;
            if (toShow(MeetupJSONfinal[i])) shown++;
        }
    }
    return "(" + shown + " | " + total + ")";
}

function iterate(words, arr) {
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < words.length; j++) {
            if (words[j].includes(arr[i])) return true;
        }
    }
    return false;
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
    // social = document.getElementById("social");
    ux = document.getElementById("ux");
    workshops = document.getElementById("workshops");
    // specialized = document.getElementById("specialized");
    data = document.getElementById("data");
    web = document.getElementById("web");
    ladies = document.getElementById("ladies");
    blockchain = document.getElementById("blockchain");
    // method = document.getElementById("method");

    var allIndex = [""];
    // var socialIndex = ["freelance", "North-West-IT-Crowd-Beer-BBQ", "Social-Software", "HackerNestMAN"];
    var uxIndex = ["UX", "uxey", "Conversion-Optimisation", "UXSessions", "User-Research"];
    var workshopsIndex = ["CodeUp", "Code-Your-Future", "CoderDojo", "Codebar"];
    // var specializedIndex = ["DotNetNorth", "Magento", "Java", "Manchester-R", "ManchesterWordPressUserGroup", "JS", "Ruby", "scala"];
    var dataIndex = ["Analytics", "MySQL", "SQL", "Azure", "Digital-Analytics-Manchester", "R-Ladies", "DB", "InfoSec", "Power-BI", "Manchester-R", "Neo4j-Manchester", "Data", "Couchbase", "PyData"];
    var webIndex = ["JavaScript", "SEO", "AWS", "node", "JS", "React", "Angular", "FRED", "WordPress", "MongoDB", "Web", "Laravel"];
    var ladiesIndex = ["CIA", "Ladies", "HER-Data-MCR", "Women"];
    var blockchainIndex = ["wHuRVtrk", "Bitcoin", "Crypto-Currency", "Blockchain", "EOS"];
    // var methodIndex = ["Lean", "Expert-Talks-Manchester"];

    all.value = "All | " + getCatagoryAmount(allIndex);
    // social.value = "Social | " + getCatagoryAmount(socialIndex);
    ux.value = "UX | " + getCatagoryAmount(uxIndex);
    workshops.value = "Workshops | " + getCatagoryAmount(workshopsIndex);
    // specialized.value = "Specialized | " + getCatagoryAmount(specializedIndex);
    data.value = "Data | " + getCatagoryAmount(dataIndex);
    web.value = "Web | " + getCatagoryAmount(webIndex);
    ladies.value = "Women/Ladies | " + getCatagoryAmount(ladiesIndex);
    blockchain.value = "Blockchain | " + getCatagoryAmount(blockchainIndex);
    // method.value = "Methodologies | " + getCatagoryAmount(methodIndex);

    all.addEventListener("click", function () {
        showEvents(allIndex);
        selectAllShown();
    });
    ux.addEventListener("click", function () {
        showEvents(uxIndex);
        selectAllShown();
    });
    data.addEventListener("click", function () {
        showEvents(dataIndex);
        selectAllShown();
    });
    web.addEventListener("click", function () {
        showEvents(webIndex);
        selectAllShown();
    });
    ladies.addEventListener("click", function () {
        showEvents(ladiesIndex);
        selectAllShown();
    });
    blockchain.addEventListener("click", function () {
        showEvents(blockchainIndex);
        selectAllShown();
    });
    workshops.addEventListener("click", function () {
        showEvents(workshopsIndex);
        selectAllShown();
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

    // Sorts
    document.getElementById("default").addEventListener("click", function () {
        drawMeetups(MeetupJSONfinal.sort((a, b) => a.sortID - b.sortID));
    });
    document.getElementById("az").addEventListener("click", function () {
        drawMeetups(MeetupJSONfinal.sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            return 0;
        }));
    });
    document.getElementById("za").addEventListener("click", function () {
        drawMeetups(MeetupJSONfinal.sort((a, b) => {
            if (a.name.toLowerCase() > b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() < b.name.toLowerCase()) return 1;
            return 0;
        }));
    });
    document.getElementById("membersAsc").addEventListener("click", function () {
        drawMeetups(MeetupJSONfinal.sort((a, b) => b.members - a.members));
    });
    document.getElementById("membersDesc").addEventListener("click", function () {
        drawMeetups(MeetupJSONfinal.sort((a, b) => a.members - b.members));
    });
    document.getElementById("upcoming").addEventListener("click", function () {
        drawMeetups(MeetupJSONfinal.sort((a, b) => {
            if (a.tilNext != 'N/A' && b.tilNext != 'N/A') return a.tilNext - b.tilNext;
            if (a.tilNext == 'N/A' && b.tilNext == 'N/A' && a.sinceLast != 'N/A' && b.sinceLast != 'N/A') return a.sinceLast - b.sinceLast;
            if (a.tilNext == 'N/A' && b.tilNext == 'N/A' && a.sinceLast == 'N/A' && b.sinceLast != 'N/A') return 1;
            if (a.tilNext == 'N/A' && b.tilNext == 'N/A' && a.sinceLast != 'N/A' && b.sinceLast == 'N/A') return -1;
            if (a.tilNext == 'N/A') return 1;
            if (b.tilNext == 'N/A') return -1;
            return 0;
        })); // (a.tilNext == 'N/A' || b.tilNext == 'N/A') ? (a.tilNext == 'N/A') ? -1 : 1 : a.tilNext - b.tilNext));  
    });

    generate.addEventListener("click", function () {
        spinner();
        generateCalendar(getSelectedMeetups(), ""); // generateCalendar(getMeetupsFromIndexes(getSelectedMeetupsIndexes()), "");
    });
    searchBox.addEventListener("keyup", searchMeetups);
    navSearchBox.addEventListener("keyup", searchMeetups);
    clearSearch.addEventListener("click", clearMeetupSearch);
    clearNavSearch.addEventListener("click", clearMeetupSearch);

    select.addEventListener("click", selectAllShown);
    // selectShown.addEventListener("click", selectAllShown);
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

    document.getElementById("inactive").addEventListener("click", function () {
        if (showInactive) {
            showInactive = false;
            this.value = "Show Inactive Groups";
        } else {
            showInactive = true;
            this.value = "Hide Inactive Groups";
        } drawMeetups(MeetupJSONfinal);
    });

    document.getElementById("nothing").addEventListener("click", function () {
        if (showNothing) {
            showNothing = false;
            this.value = "Show with No Events";
        } else {
            showNothing = true;
            this.value = "Hide with No Events";
        } drawMeetups(MeetupJSONfinal);
    });
}

function spinner() {
    document.getElementById("eventsContainer").innerHTML = '<div class="loader"></div>';
}
