
import { db, startUp } from './DatabaseCreation.js';
var showUserArticle = true;

waitToStart();

async function waitToStart() { 
    
    startUp().then(() => {
        fill_template();
        waitForElm(".UserPage").then((elm) => { SetUp();});
    });
}


async function fill_template() {  
    var data = {};
    var user = getLoggedInUser();
    if (user.lang != null) { 
        document.documentElement.lang = user.lang;        
    }
    var lang = document.documentElement.lang;
    data.articles = user.articles;
    data.comments = user.comments;
    var generalInfo;

   
    data.user = getLoggedInUser();
    data.comments = data.comments.reverse();
    
    for (var c in data.comments) { 
        var commentTime = data.comments[c].date;
        data.comments[c].datePrint = new Date(commentTime).toLocaleDateString();
    }
    


    await fetch("./Information/"+lang+"/WebsiteInfo.json")
    .then((response) => response.json())
        .then((json) => generalInfo = json);
    

    Object.assign(data, generalInfo);
            


    fetch('Header.html')
        .then(response => response.text())
        .then(headInfo => {
            Handlebars.registerPartial('header', headInfo);
            var template = Handlebars.compile(document.querySelector("#template").innerHTML);
            var filled = template(data);
            document.querySelector("#output").innerHTML = filled;    
            ShowRelevantBtn();            
    })
    
    document.title = data.websiteName + "-" + user.username;     
     

}

function SetUp() {
    user = getLoggedInUser();
    document.getElementById("chgPssBtn").onclick = changePassword;    
    document.getElementById("languageSelection").onchange = changeLanguage;
    document.getElementById("languageSelection").value = document.documentElement.lang;
    if (user.premiumMember) { 
        document.getElementById("newArticleBtn").onclick = newArticle;
    }
    document.getElementById("exportAccBtn").onclick = exportAccount;
    document.getElementById("exportArtBtn").onclick = exportArticles;
    document.getElementById("exportCommBtn").onclick = exportComments;
    document.getElementById("stayLoggedIn").onclick = SwapLogIn;
    document.getElementById("statusBtn").onclick = changeStatus;
    document.getElementById("delBtn").onclick = deleteAccount;
    document.getElementById("logOutBtn").onclick = logOut;
    document.getElementById("viewArticleBtn").onclick = displayArticles;
    document.getElementById("viewCommBtn").onclick = displayComments;

    
    var user = getLoggedInUser();            
    document.getElementById("stayLoggedIn").checked = user.keepLoggedIn;
    if (showUserArticle) {
        displayArticles();
    }
    else { 
        displayComments();
    }
               
}

function changeLanguage() { 
    var lang = document.getElementById("languageSelection").value;
    document.documentElement.lang = lang;
    var user = getLoggedInUser();
    user.lang = lang;
    updateUser(user);
    

    
    location.reload();
    console.log(lang);
}

function changePassword() { 
    var newPass = document.getElementById("changePassText").value;
    var user = getLoggedInUser();
    user.password = newPass;
    if (passwordVerification(user)) {
        user.password = stringToHash(newPass);
        user.confirmPassword = user.password;
        updateUser(user);

        logOut();
    }

}

function newArticle() {     
    window.location.href="NewArticle.html";
}

function changeStatus() { 
    var user = getLoggedInUser();       
    user.premiumMember = !user.premiumMember;
    updateUser(user);   
    window.location.href="User.html";

}

function SwapLogIn() {        
    var user = getLoggedInUser();       
    
    user.keepLoggedIn = !user.keepLoggedIn;

    if (!user.keepLoggedIn) {
        localStorage.removeItem("loggedInUser");                 
    }
    else { 
        sessionStorage.removeItem("loggedInUser");      
    }
    updateUser(user); 
    

}

function exportAccount() { 
    var user = getLoggedInUser();
    downloadObjectAsJson(user, user.username + "-Account-Info");
}

function exportArticles() {     
    var user = getLoggedInUser();
    
    downloadObjectAsJson(user.articles, user.username + "-Articles");
}

function exportComments() {     
    var user = getLoggedInUser();
    downloadObjectAsJson(user.comments, user.username + "-Comments");
}

function updateUser(user) { 
    var transaction = db.transaction("users", "readwrite");
    var table = transaction.objectStore("users");
    var userJson = JSON.stringify(user); 

    if (user.keepLoggedIn) {
        localStorage.setItem("loggedInUser", userJson);                 
    }
    else { 
        sessionStorage.setItem("loggedInUser", userJson);        
    }  

    var userUpdateRequest = table.put(user);

    userUpdateRequest.onsuccess = function () {
    }
}

function deleteAccount() { 
    var user = getLoggedInUser();
    var transaction = db.transaction("users", "readwrite");
    var table = transaction.objectStore("users");

    var deleteRequest = table.delete(user.email);
    deleteRequest.onsuccess = function () {         
        console.log("Successful deletion");
        logOut();
    }
}

function displayArticles() { 
    showUserArticle = true;
    document.getElementById("personalComments").style.display = 'none';
    document.getElementById("personalArticle").style.display = '';

}
function displayComments() { 
    showUserArticle = false;
    document.getElementById("personalComments").style.display = '';
    document.getElementById("personalArticle").style.display = 'none';
}

function logOut() { 
    localStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("loggedInUser");    
    window.location.href="index.html";
}

function getLoggedInUser() { 
    var sessionUser = JSON.parse(sessionStorage.getItem("loggedInUser"));        
    var longTermUser = JSON.parse(localStorage.getItem("loggedInUser")); 
    if (sessionUser != null) { 
        longTermUser = sessionUser;
    }
    return longTermUser;

}

async function ShowRelevantBtn() { 
    var login = await document.getElementsByClassName("loginInfo");
    var accounts = await document.getElementsByClassName("UserInfo");
    

    
    for (var i = 0; i < login.length; i++) {
        login[i].style.display = 'none';
    }
    for (var i = 0; i < accounts.length; i++) {
        accounts[i].style.display = '';
    }
    
}
        


//Use this from https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
//Could use any other examples to allow downnloading any JSON Object. 
function downloadObjectAsJson(exportObj, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
  
//Uses this function from 
//https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

//Got this from https://www.geeksforgeeks.org/how-to-create-hash-from-string-in-javascript/
//This can be replaced by any other hash function that would be wanted. 
function stringToHash(string) {
             
    var hash = 0;
     
    if (string.length == 0) return hash;
     
    for (var i = 0; i < string.length; i++) {
        var char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
     
    return hash;
}

function passwordVerification(user) { 

    var passwordWords = user.password.split(" ");
    var passwordNumbers = /\d/.test(user.password);
    var ES6SpecialChars = /[!-#%-*,-\/:;?@[-\]_{}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4E\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65\u{10100}-\u{10102}\u{1039F}\u{103D0}\u{1056F}\u{10857}\u{1091F}\u{1093F}\u{10A50}-\u{10A58}\u{10A7F}\u{10AF0}-\u{10AF6}\u{10B39}-\u{10B3F}\u{10B99}-\u{10B9C}\u{10F55}-\u{10F59}\u{11047}-\u{1104D}\u{110BB}\u{110BC}\u{110BE}-\u{110C1}\u{11140}-\u{11143}\u{11174}\u{11175}\u{111C5}-\u{111C8}\u{111CD}\u{111DB}\u{111DD}-\u{111DF}\u{11238}-\u{1123D}\u{112A9}\u{1144B}-\u{1144F}\u{1145B}\u{1145D}\u{114C6}\u{115C1}-\u{115D7}\u{11641}-\u{11643}\u{11660}-\u{1166C}\u{1173C}-\u{1173E}\u{1183B}\u{11A3F}-\u{11A46}\u{11A9A}-\u{11A9C}\u{11A9E}-\u{11AA2}\u{11C41}-\u{11C45}\u{11C70}\u{11C71}\u{11EF7}\u{11EF8}\u{12470}-\u{12474}\u{16A6E}\u{16A6F}\u{16AF5}\u{16B37}-\u{16B3B}\u{16B44}\u{16E97}-\u{16E9A}\u{1BC9F}\u{1DA87}-\u{1DA8B}\u{1E95E}\u{1E95F}]/u
    var passwordSpecial = ES6SpecialChars.test(user.password);
    

    
    if (passwordWords.length < 3 || passwordWords.length > 5) { 
        console.log("Not enough words");
        alert("Not enough words");
        return false;
    }
    if (!passwordNumbers) { 
        console.log("Password has no numbers");
        alert("Password has no numbers");
        return false;
    }
    if (!passwordSpecial) { 
        console.log("Password has no Special Characters");
        alert("Password has no Special Characters");
        return false;
    }
    return true;
}