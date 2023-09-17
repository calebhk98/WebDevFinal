import { db, startUp } from './DatabaseCreation.js';

//Starts us off with the intialization function
fill_template();

//Intialization function
//This fills the HTML out
async function fill_template() {    
    //Make sure the database is created, but no need to something specific for it. We can do other things while that's running
    await startUp();
    var data = [];
    var user = getLoggedInUser();

    //If there is a logged in user, we want to use the user's language
    //I don't grab the language from the user's device in case it is set to an unknown language, in which case, nothing would show
    if (user!=null && user.lang != null) { 
        document.documentElement.lang = user.lang;
    }
    var lang = document.documentElement.lang;
    var generalInfo;    
    var articles;

    articles = await FindArticles();

    //Puts the articles in the correct order
    articles = articles.reverse();
    data.articles = DivideByEven(articles);

    //We can get the lang file based off the lang we select, and since the language is only allowed to be specific items, no need for error handling
    await fetch("./Information/" + lang + "/WebsiteInfo.json")
        .then((response) => response.json())
        .then((json) => generalInfo = json);    

    //This command just adds general info to data
    Object.assign(data, generalInfo);

    //We split the Header of all the files into it's own file
    fetch('Header.html')
    .then(response => response.text())
    .then(headInfo => {
        Handlebars.registerPartial('header', headInfo);
        var template = Handlebars.compile(document.querySelector("#template").innerHTML);
        var filled = template(data);
        document.querySelector("#output").innerHTML = filled;  
        
        //Not sure what to name the title besides the name
        document.title = data.websiteName;

        //If user is logged in or not, will show the correct icons/buttons
        ShowRelevantBtn();
        
        // Adds a click event to each article 
        var boxes = document.getElementsByClassName("TimelineBox");                
        for (var i = 0; i < boxes.length; i++) {    
            boxes[i].addEventListener('click', async function() {
                var articleIdElement = this.getElementsByClassName("articleID")[0];                
                var articleId = articleIdElement.textContent;
                var transaction = db.transaction("articles", "readonly");
                var table = transaction.objectStore("articles");
                var clickedArticle = table.get(parseInt(articleId));

                //Makes a dynamic function that adds the Article information to the session storage
                clickedArticle.onsuccess = function (event) { 
                    sessionStorage.setItem("Article",
                        JSON.stringify(clickedArticle.result));
                }
                //Then it sends you to the Article html
                window.location.href = "Article.html";
                
            });
        }  
    })        
}

//Gets all the articles from the DB
async function FindArticles() { 
    return new Promise((resolve, reject) => {
        var transaction = db.transaction("articles", "readonly");
        var table = transaction.objectStore("articles");
        var articleDateIndex = table.index("article_date");
        var req = articleDateIndex.getAll();
        
        req.onsuccess = function (event) {
            resolve(event.target.result);
        }

        req.onerror = function (event) {
            reject(event.target.error);
        }

    }); 
}


//Splits the results by odd or even to put them on alternatingb sides of the timeline
function DivideByEven(articles) {     
    var even = 0;
    // This could probably be done without any conditionals, but eh
    for (var i in articles) {                                         
        if (even) {
            articles[i].even = true;
            even = 0;
        }
        else {
            articles[i].even = false;                      
            even = 1;
        }
    }
    return articles;
}

//Shows whether the Login/Register buttons are displayed, or the account image is
async function ShowRelevantBtn() { 
    var login = await document.getElementsByClassName("loginInfo");
    var accounts = await document.getElementsByClassName("UserInfo");

    //Grabs the user from the sessionStorage or the local storage
    //Only 1 should ever be filled, but as bugs happen, if the temp user is logged in differently from long term user, 
    //It uses the temp user. 
    var sessionUser = JSON.parse(sessionStorage.getItem("loggedInUser"));        
    var longTermUser = JSON.parse(localStorage.getItem("loggedInUser")); 
    if (sessionUser != null) { 
        longTermUser = sessionUser;
    }

    //Loops through the login/account buttons to hide or display them as needed
    if (longTermUser != null) {
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

//Trys to return the current logged in user. 
//returns null if no logged in user
function getLoggedInUser() { 
    var sessionUser = JSON.parse(sessionStorage.getItem("loggedInUser"));        
    var longTermUser = JSON.parse(localStorage.getItem("loggedInUser")); 
    if (sessionUser != null) { 
        longTermUser = sessionUser;
    }
    return longTermUser;
}
