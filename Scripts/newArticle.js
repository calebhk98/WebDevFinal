import { db, startUp } from './DatabaseCreation.js';

var article = {};

waitToStart();

async function waitToStart() { 
    
    startUp().then(() => {
        waitForElm("#newArticleForm").then((elm) => {   
            SetUp();
        });
    })
}

function SetUp() {    
    document.getElementById("newArticleForm").addEventListener('submit', Submit);    
}

function Submit(event) { 
    event.preventDefault();
    var user = getLoggedInUser();
    
    var transaction = db.transaction("articles", "readwrite");
    var table = transaction.objectStore("articles");
    var tagsString = document.getElementById("ArticleTags").value;
    var tags = tagsString.split(",");
    

    article.article = document.getElementById("Article").value;
    article.articleHeadline = document.getElementById("ArticleHeadline").value;    
    article.author = user.username;
    article.comment = [];
    article.date=document.getElementById("date").value;  
    article.desc=document.getElementById("desc").value;   
    article.tags = tags;
    user.articles.push(article);

    AddArticle(article);
    updateUser(user);
    
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

function AddArticle(article) { 
    var transaction = db.transaction("articles", "readwrite");
    var table = transaction.objectStore("articles");
    var articleJson = JSON.stringify(article);    
    sessionStorage.setItem("Article", articleJson);  
    var articleUpdateRequest = table.put(article);    
}

function getLoggedInUser() { 
    var sessionUser = JSON.parse(sessionStorage.getItem("loggedInUser"));        
    var longTermUser = JSON.parse(localStorage.getItem("loggedInUser")); 
    if (sessionUser != null) { 
        longTermUser = sessionUser;
    }
    return longTermUser;

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
