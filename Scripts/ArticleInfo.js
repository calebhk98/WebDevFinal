import { db, startUp } from './DatabaseCreation.js';
//Don't really need this, but may as well have it create the DB now

fill_template();

async function fill_template() {     
    var data;
    var lang = document.documentElement.lang;
    data = JSON.parse(sessionStorage.getItem("Article"));
    var generalInfo;

    //If there is no set Article, uses the default Article in the ArticleInfo.Json
    if (data == null) { 
        await fetch("./Information/ArticleInfo.json")
        .then((response) => response.json())
            .then((json) => data = json);
    }
    data.user = getLoggedInUser();


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
    
    document.title = data.websiteName + "-" + data.articleHeadline;       

}


async function ShowRelevantBtn() { 
    var login = await document.getElementsByClassName("loginInfo");
    var accounts = await document.getElementsByClassName("UserInfo");
    var test = JSON.parse(sessionStorage.getItem("loggedInUser"));        
    var data = JSON.parse(localStorage.getItem("loggedInUser")); 
    if (test != null) { 
        data = test;
    }

    if (data != null) {
        for (var i = 0; i < login.length; i++) {
            login[i].style.display = 'none';
        }
        for (var i = 0; i < accounts.length; i++) {
            accounts[i].style.display = '';
        }
    }
    else { 
        for (var i = 0; i < login.length; i++) {
            login[i].style.display = '';
        }
        for (var i = 0; i < accounts.length; i++) {
            accounts[i].style.display = 'none';
        }
    }
}


function getLoggedInUser() { 
    var sessionUser = JSON.parse(sessionStorage.getItem("loggedInUser"));        
    var longTermUser = JSON.parse(localStorage.getItem("loggedInUser")); 
    if (sessionUser != null) { 
        longTermUser = sessionUser;
    }
    return longTermUser;

}
