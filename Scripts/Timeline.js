import { db, startUp } from './DatabaseCreation.js';
fill_template();

async function fill_template() {
    
    await startUp();
    var data = [];
    var user = getLoggedInUser();
    if (user!=null && user.lang != null) { 
        document.documentElement.lang = user.lang;
    }
    var lang = document.documentElement.lang;
    var generalInfo;

    
    var articles;

    articles = await FindArticles();
    articles = articles.reverse();
    data.articles = DivideByEven(articles);


    
    


    await fetch("./Information/" + lang + "/WebsiteInfo.json")
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
            
            document.title = data.websiteName;

            ShowRelevantBtn();
            


            var boxes = document.getElementsByClassName("TimelineBox");
                
            for (var i = 0; i < boxes.length; i++) {    
                boxes[i].addEventListener('click', async function() {
                    var articleIdElement = this.getElementsByClassName("articleID")[0];                
                    var articleId = articleIdElement.textContent;

                    var transaction = db.transaction("articles", "readonly");
                    var table = transaction.objectStore("articles");
                    var clickedArticle = table.get(parseInt(articleId));

                    clickedArticle.onsuccess = function (event) { 
                        sessionStorage.setItem("Article",
                            JSON.stringify(clickedArticle.result));
                    }
                    window.location.href = "Article.html";
                    
                });
            } 
            
             
    })

    

        
}


async function FindArticles() { 
    return new Promise((resolve, reject) => {
        var transaction = db.transaction("articles", "readonly");
        var table = transaction.objectStore("articles");
        var articleDateIndex = table.index("article_date");

        var req = articleDateIndex.getAll();
        
        req.onsuccess = function (event) {
            // The result can be accessed here safely
            resolve(event.target.result);
        }

        // Set up an error handler
        req.onerror = function (event) {
            // Reject the promise with the error
            reject(event.target.error);
        }

    }); 
}


function DivideByEven(articles) {     
    var even = 0;

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
