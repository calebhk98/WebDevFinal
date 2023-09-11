async function fill_template() {     
    var data = [];
    var articles = [];
    
    var lang = document.documentElement.lang;
    var db;



    var generalInfo;


    var even = 0;
    var pair = [];
    var articlePaths = [];
    await fetch('../Information/ArticleIndexes.json')
    .then(response => response.json())
        .then(index => {
            for (i in index.articles) { 
                articlePaths.push(index.articles[i]);
            }
        });
    
    
    for (i in articlePaths) { 
        await fetch(articlePaths[i])
            .then(response => response.json())
            .then(articleData => {
                pair[even] = articleData;
                var test = articleData;
                                               
                if (even) {
                    test.even = true;
                    even = 0;
                }
                else {
                    test.even = false;                      
                    even = 1;
                }
                articles.push(test);
            });
    }
    
    
    
    data.articles = articles;
    console.log(data);


    await fetch("./Information/"+lang+"/WebsiteInfo.json")
    .then((response) => response.json())
        .then((json) => generalInfo = json);
    

    Object.assign(data, generalInfo);
    
   
    console.log(data);


    var template = Handlebars.compile(document.querySelector("#template").innerHTML);
    var filled = await template(data);
    document.querySelector("#output").innerHTML = filled;

    document.title = data.websiteName;

    var boxes = document.getElementsByClassName("TimelineBox");
        console.log(boxes);
        for (var i = 0; i < boxes.length; i++) {            
            boxes[i].onclick = function () {
                window.location.href = "Article.html";
            };
    }
    

        
    
    
       

}

async function startUp() { 
    //Saves whichever indexedDB we need
    var indexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB ||
        window.shimIndexedDB;
    
    if (!indexedDB) {
        console.log("IndexedDB could not be found in this browser.");
    }

    
    var request = await indexedDB.open("TimelineHistoriansDB");

    //If we can't get a database
    request.onerror = (event) => {
        console.error("Why didn't you allow my web app to use IndexedDB?!");
        console.error(event);
    };

    //If the database already exists
    request.onsuccess = (event) => {
        db = event.target.result;

        if (!db.objectStoreNames.contains("articles")) {
            createArticleTable();
        }

        db.onerror = (event) => {
            console.error(`Database error: ${event.target.errorCode}`);
        };
        
    };

    //If the database doesn't exist yet
    request.onupgradeneeded = function () {
        //Sets the table for users, could use the email as the id        
        db = request.result;
        createArticleTable();
        
    };
}

function createArticleTable() { 
    console.log("Creating Articles")
    var users = db.createObjectStore("articles", { keyPath: "id", autoIncrement: true });

    //Create a search so we can look by username
    users.createIndex("article_ArticleHeadline", "articleHeadline");  
    users.createIndex("article_date", "date");  
    users.createIndex("article_author", "author"); 
    users.createIndex("article_tags", "tags", { unique: false, multiEntry: true }); 

    users.transaction.oncomplete = function (event) {    
        GrabSavedArticles().then(
            previousArticles => {
                var transaction = db.transaction("articles", "readwrite");
                var table = transaction.objectStore("articles");
                for (particle in previousArticles) {
                    console.log(previousArticles);
                    table.add(previousArticles[particle]);
                }
            } 
        )
        

    }
}

async function GrabSavedArticles() { 
    var articles=[];
    var even = 0;
    var pair = [];
    var articlePaths = [];
    await fetch('../Information/ArticleIndexes.json')
    .then(response => response.json())
        .then(index => {
            for (i in index.articles) { 
                articlePaths.push(index.articles[i]);
            }
        });
    
    
    for (i in articlePaths) { 
        await fetch(articlePaths[i])
            .then(response => response.json())
            .then(articleData => {
                pair[even] = articleData;
                var test = articleData;
                                               
                if (even) {
                    test.even = true;
                    even = 0;
                }
                else {
                    test.even = false;                      
                    even = 1;
                }
                articles.push(test);
            });
    }
    
    
    
    return articles;
}
