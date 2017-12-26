const app = {};
window.addEventListener('load', init);

var searchBox;
var search;
var generate;

var groupsContainer;
var eventsContainer;

const meetups = ["android_mcr", "BCS-Greater-Manchester-Branch", "blabtalks", "meetup-group-wHuRVtrk", "CIA-Chicks-in-Advertising-Manchester", "Code-Your-Future-Manchester", "CodeUpManchester", "CodeUp-Salford", "Digital-Analytics-Manchester", "Digital_North_", "DotNetNorth", "Enterprise-UX", "freelance-folk-manchester", "HackerNestMAN", "hackspace-manchester", "HadoopManchester", "HCD-Manchester", "IoTMCR", "JavaScript-North-West", "Ladies-of-Code-Manchester", "Lean-Agile-Manchester", "MaccTech", "Magento-Minds-of-Manchester", "MancDB", "Manchester-Bitcoin-blockchain-and-other-cryptocurrencies", "Manchester-Angular-Workshop", "manchesterentrepreneursclub", "Manchester-Futurists", "Manchester-Grey-Hats", "Manchester-InfoSec", "ManchesterUK-Java-Community", "Power-BI-Manchester-Meetup", "Manchester-R", "Manchester-React-User-Group", "ManchesterWordPressUserGroup", "MancJS", "McrFRED", "McrUXD", "Messaging-Bots-Manchester", "Music-Culture-and-Technology", "Neo4j-Manchester", "North-West-IT-Crowd-Beer-BBQ-Event", "North-West-Ruby-User-Group", "Open-Data-Manchester", "Practical-Business-Workshops-Manchester", "RealUX", "Salford-Lean-Startup", "scala-developers", "SEO-Manchester", "Social-Software-Development-Meetup-in-Manchester", "Tech-for-Good-Live", "Tech-Leads-NW", "Test-Hive-Manchester", "ThoughtWorks-Manchester-Events", "UK-North-Crypto-Currency-Meetup", "The-UX-Crunch-North", "VRManchester"]; // wHuRVtrk = Blockchain, PJzMkpIw = Cyber Security Seminar, "meetup-group-PJzMkpIw"

var eventsJSON = meetups;
var MeetupsJSON = meetups;

function init() {
    searchBox = document.getElementById("searchBox");
    search = document.getElementById("search");
    generate = document.getElementById("generate");
    groupsContainer = document.getElementById("groupsContainer");
    eventsContainer = document.getElementById("eventsContainer");

    generate.addEventListener("click", generateCalendar);
    search.addEventListener("click", searchMeetups);

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
        var group = '<div class="group" id="' + i + '"><img src="' + thumb + '"><div class="groupText"><a href="' + link + '" target="_blank"><p>' + name + '</p></a><p>Members: ' + members + '</p></div></div>';
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
        });
}

function generateCalendar() {
    eventsJSON = meetups; // replace with selected
    eventsJSON = eventsJSON.map(app.getEvents);

    $.when(...eventsJSON)
        .then((...eventsJSON) => {
            eventsJSON = eventsJSON.map(a => a[0].data)
                .reduce((prev, curr) => [...prev, ...curr], []);
            eventsJSON.sort(function (a, b) {
                return a.time > b.time;
            });
            console.log(eventsJSON);
            drawCalendar(eventsJSON);
        });
}


function drawCalendar(JSON) {
    eventsContainer.innerHTML = "";
    for (var i = 0; i < JSON.length; i++) {
        var x = JSON[i];

        var eventName = x.name;
        var eventLink = x.link;
        var groupName = x.group.name;
        var groupLink = "https://www.meetup.com/" + x.group.urlname + "/";
        var date = x.local_date;
        var time = (x.hasOwnProperty('local_time')) ? x.local_time : "N/A";
        var rsvp = x.yes_rsvp_count;
        var rsvpLimit = (x.hasOwnProperty('rsvp_limit')) ? x.rsvp_limit : "∞";

        var event = '<div class="event"><div class="numbers"><p>' + date + ' - ' + time + '</p><p>' + rsvp + '/' + rsvpLimit + '</p></div><div class="details"><a href="' + eventLink + '"><p>' + eventName + '</p></a><a href="' + groupLink + '"><p>' + groupName + '</p></a></div>';
        eventsContainer.insertAdjacentHTML('beforeend', event);
    }
}

function searchMeetups() {
    var term = searchBox.value;
    var groups = document.getElementsByClassName("group");
    for (var i = 0; i < groups.length; i++) {
        if (groups[i].innerHTML.includes(term)) {
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