const app = {};
window.addEventListener('load', init);

var searchBox;
var search;
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
var deselect;

var groupsContainer;
var eventsContainer;

let gSelected = 0; // Bodge for one selected meetup group

const meetups = ["android_mcr", "BCS-Greater-Manchester-Branch", "blabtalks", "meetup-group-wHuRVtrk", "CIA-Chicks-in-Advertising-Manchester", "Code-Your-Future-Manchester", "CodeUpManchester", "CodeUp-Salford", "Digital-Analytics-Manchester", "Digital_North_", "DotNetNorth", "Enterprise-UX", "freelance-folk-manchester", "HackerNestMAN", "hackspace-manchester", "HadoopManchester", "HCD-Manchester", "IoTMCR", "JavaScript-North-West", "Ladies-of-Code-Manchester", "Lean-Agile-Manchester", "MaccTech", "Magento-Minds-of-Manchester", "MancDB", "Manchester-Bitcoin-blockchain-and-other-cryptocurrencies", "Manchester-Angular-Workshop", "manchesterentrepreneursclub", "Manchester-Futurists", "Manchester-Grey-Hats", "Manchester-InfoSec", "ManchesterUK-Java-Community", "Power-BI-Manchester-Meetup", "Manchester-R", "Manchester-React-User-Group", "ManchesterWordPressUserGroup", "MancJS", "McrFRED", "McrUXD", "Messaging-Bots-Manchester", "Music-Culture-and-Technology", "Neo4j-Manchester", "North-West-IT-Crowd-Beer-BBQ-Event", "North-West-Ruby-User-Group", "Open-Data-Manchester", "Practical-Business-Workshops-Manchester", "RealUX", "Salford-Lean-Startup", "scala-developers", "SEO-Manchester", "Social-Software-Development-Meetup-in-Manchester", "Tech-for-Good-Live", "Tech-Leads-NW", "Test-Hive-Manchester", "ThoughtWorks-Manchester-Events", "UK-North-Crypto-Currency-Meetup", "The-UX-Crunch-North", "VRManchester", "AWS-User-Group-North", "Code-Nation", "Manchester-Open-Source", "DevOps-Manchester", "StartupBlink-Manchester", "nwdrupal", "Manchester-Xamarin-User-Group", "manchester-node-workshop", "DATA-VISUALISATION-MEETUP", "BlockchainManchesterMeetup", "Manchester-WordPress-SEO-Startup", "Manchester-Unity3D-Game-Dev-Meetup", "Google-Cloud-Platform-Users-North-West", "Manc-Bitcoin", "craftcmsmanchester", "Couchbase-Manchester", "NSManchester", "Python-North-West-Meetup", "Expert-Talks-Manchester"]; // wHuRVtrk = Blockchain, PJzMkpIw = Cyber Security Seminar, "meetup-group-PJzMkpIw"

const months = new Map([['01', 'January'], ['02', 'February'], ['03', 'March'], ['04', 'April'], ['05', 'May'], ['06', 'June'], ['07', 'July'], ['08', 'August'], ['09', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December']]);

var eventsJSON = meetups;
var MeetupsJSON = meetups;

function init() {
    meetups.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase())
    });
    searchBox = document.getElementById("searchBox");
    search = document.getElementById("search");
    generate = document.getElementById("generate");
    select = document.getElementById("select");
    deselect = document.getElementById("deselect");
    groupsContainer = document.getElementById("groupsContainer");
    eventsContainer = document.getElementById("eventsContainer");

    generate.addEventListener("click", function () {
        generateCalendar(getMeetupsFromIndexes(getSelectedMeetupsIndexes()));
    });
    searchBox.addEventListener("keyup", searchMeetups); 
    select.addEventListener("click", selectAllShown);
    deselect.addEventListener("click", deselectAllShown);

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
        var group = '<div class="group" id="' + i + '"><input type="checkbox" id="g' + i + '"><label for="g' + i + '"><img src="' + thumb + '"></label><div class="groupText"><a href="' + link + '" target="_blank"><p class="groupName">' + name + '</p></a><p>Members: ' + members + '</p></div></div>';
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

function generateCalendar(x) {
    eventsJSON = x; // replace with selected
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
            drawCalendar(eventsJSON);
        });
}


function drawCalendar(JSON) {
    // JSON = JSON.sort(function (a, b) { return a.time > b.time; });
    eventsContainer.innerHTML = "";
    var month = '00';
    for (var i = 0; i < JSON.length; i++) {
        var x = JSON[i];

        var eventName = x.name;
        var eventLink = x.link;
        var groupName = x.group.name;
        var groupLink = "https://www.meetup.com/" + x.group.urlname + "/";
        var date = x.local_date;
        var day = date.substring(8, 10);
        var year = date.substring(0, 4);
        var time = (x.hasOwnProperty('local_time')) ? x.local_time : "N/A";
        var rsvp = x.yes_rsvp_count;
        var rsvpLimit = (x.hasOwnProperty('rsvp_limit')) ? x.rsvp_limit : "∞";

        var venueName = (x.hasOwnProperty('venue')) ? x.venue.name : "N/A";
        var venueAddress = (x.hasOwnProperty('venue')) ? x.venue.address_1 : "";
        var venuePostcode = (x.hasOwnProperty('venue')) ? x.venue.city : "";

        var event = '<div class="event"><div class="numbers"><p class="day">' + ordinalSuffix(day) + '</p><p>' + timeConvert(time) + '</p><p>' + rsvp + '/' + rsvpLimit + '</p></div><div class="details"><a href="' + eventLink + '"><h4>' + eventName + '</h4></a><p>' + venueName + ' - ' + venueAddress + ' (' + venuePostcode + ')' + '</p><a href="' + groupLink + '"><p>' + groupName + '</p></a></div>';

        if (month != date.substring(5, 7)) {
            month = date.substring(5, 7);
            eventsContainer.insertAdjacentHTML('beforeend', '<h3 class="month">' + months.get(month) + ' (' + year + ')' + '</h3>')
        }

        eventsContainer.insertAdjacentHTML('beforeend', event);
    }
}

function searchMeetups() {
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
    var group = getElementsByClassName("group");
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

function deselectAllShown() {
    var group = document.getElementsByClassName("group");
    for (var i = 0; i < group.length; i++) {
        if (!(group[i].style.display === 'none')) {
            document.getElementById("g" + i).checked = true;
        }
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
    if (i.substring(0,2) > 12) {
        ampm = "PM";
        x = i.substring(0,2) % 12 + ":" + i.substring(3,5) + ampm;
    } else {
        ampm = "AM";
        x = i.substring(0,2) + ":" + i.substring(3,5) + ampm;
    } return x;
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
    var ladiesIndex = ["CIA", "Ladies"];
    var blockchainIndex = ["wHuRVtrk", "Bitcoin", "Crypto-Currency"];
    var methodIndex = ["Lean", "Expert-Talks-Manchester"];

    all.value = "All | " + getCatagoryAmount(allIndex);
    social.value = "Social | " + getCatagoryAmount(socialIndex);
    ux.value = "UX | " + getCatagoryAmount(uxIndex);
    workshops.value = "Workshops | " + getCatagoryAmount(workshopsIndex);
    specialized.value = "Specialized | " + getCatagoryAmount(specializedIndex);
    data.value = "Data | " + getCatagoryAmount(dataIndex);
    web.value = "Web | " + getCatagoryAmount(webIndex);
    ladies.value = "Ladies/Women | " + getCatagoryAmount(ladiesIndex);
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