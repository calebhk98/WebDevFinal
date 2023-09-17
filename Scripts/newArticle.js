import { db, startUp } from './DatabaseCreation.js';

//Starts us off with the intialization function
waitToStart();

//We wait until there is a newArticleForm available.
//Once it's available, we can assume the rest of the site is
async function waitToStart() {     
    startUp().then(() => {
        waitForElm("#newArticleForm").then((elm) => {   
            SetUp();
        });
    })
}

//This is just to add an eventlistener as we can't naturally put it in the HTML as this is a module
function SetUp() {    
    document.getElementById("newArticleForm").addEventListener('submit', Submit);    
}

//Whenever the user clicks Submit, this adds a new Article 
function Submit(event) { 
    event.preventDefault();
    var user = getLoggedInUser();
    var article = {};
    
    //We split the tags by commas and trim whitespace 
    var tagsString = document.getElementById("ArticleTags").value;
    var tags = tagsString.split(",");
    for (var i in tags) { 
        tags[i] = tags[i].trim(); 
    }

    //We save the article information as an object
    article.article = document.getElementById("Article").value;
    article.articleHeadline = document.getElementById("ArticleHeadline").value;    
    article.author = user.username;
    article.comment = [];
    article.date=document.getElementById("date").value;  
    article.desc=document.getElementById("desc").value;   
    article.tags = tags;

    //After the article is an object, we save that to the user
    user.articles.push(article);

    //Updates the DB and adds the article to the user
    AddArticle(article);
    updateUser(user);
    
    //We then go to the Article that was just written
    window.location.href="Article.html";
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

// Adds the article to the DB and puts it in the session storage
function AddArticle(article) { 
    var transaction = db.transaction("articles", "readwrite");
    var table = transaction.objectStore("articles");
    
    //Turns the article object to a JSON string
    var articleJson = JSON.stringify(article);    
    sessionStorage.setItem("Article", articleJson);  
    var articleUpdateRequest = table.put(article);    
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

//Updates the user in both the local/session storage as well as the DB
function updateUser(user) { 
    var transaction = db.transaction("users", "readwrite");
    var table = transaction.objectStore("users");

    //Since the nonDB storage can only store strings, we convert the object to a JSON
    var userJson = JSON.stringify(user); 

    //Only edits the value the user should be stored in
    if (user.keepLoggedIn) {
        localStorage.setItem("loggedInUser", userJson);                 
    }
    else { 
        sessionStorage.setItem("loggedInUser", userJson);        
    }  

    //Adds the updated user to the DB
    var userUpdateRequest = table.put(user);
    //Mostly here just so the compiler doesn't somehow remove the Request since 
    //it might think nothing is being done
    userUpdateRequest.onsuccess = function () { }
}
