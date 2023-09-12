import { db, startUp } from './DatabaseCreation.js';
fill_template();

async function fill_template() {
    var data = [];
    var lang = document.documentElement.lang;
    var generalInfo;

    
    var articles;
    await startUp();

    articles = await FindArticles();
    data.articles = DivideByEven(articles);


    
    


    await fetch("./Information/" + lang + "/WebsiteInfo.json")
        .then((response) => response.json())
        .then((json) => generalInfo = json);
    

    Object.assign(data, generalInfo);
    
   
    console.log(data);

    fetch('Header.html')
        .then(response => response.text())
        .then(headInfo => {
            Handlebars.registerPartial('header', headInfo);
            var template = Handlebars.compile(document.querySelector("#template").innerHTML);
            var filled = template(data);
            document.querySelector("#output").innerHTML = filled;  
            
            document.title = data.websiteName;

    var boxes = document.getElementsByClassName("TimelineBox");
        
    for (var i = 0; i < boxes.length; i++) {    
        boxes[i].addEventListener('click', async function() {
            var articleIdElement = this.getElementsByClassName("articleID")[0];                
            var articleId = articleIdElement.textContent;
            console.log("Clicked");

            
            console.log(articleId);

            var transaction = db.transaction("articles", "readonly");
            var table = transaction.objectStore("articles");
            var clickedArticle = table.get(parseInt(articleId));

            clickedArticle.onsuccess = function (event) { 
                // console.log(clickedArticle);
                // console.log(clickedArticle.result);
                sessionStorage.setItem("Article",
                    JSON.stringify(clickedArticle.result));

            }

            // 
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

