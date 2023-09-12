export var db;

startUp();
 

export async function startUp() { 
    if (db) return;
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

    
    var request = indexedDB.open("TimelineHistoriansDB");

    //If we can't get a database
    request.onerror = (event) => {
        console.error("Why didn't you allow my web app to use IndexedDB?!");
        console.error(event);
    };

    const openPromise = new Promise((resolve, reject) => {
        //If the database already exists
        request.onsuccess = (event) => {
            db = event.target.result;

            if (!db.objectStoreNames.contains("articles")) {
                createArticleTable();
            }
            if (!db.objectStoreNames.contains("users")) {
                createUserTable();
            }

            db.onerror = (event) => {
                console.error(`Database error: ${event.target.errorCode}`);
            };
            resolve();
        };

        //If the database doesn't exist yet
        request.onupgradeneeded = function () {
            //Sets the table for articles       
            db = request.result;
            createArticleTable();
            createUserTable();
        
        };
    });
    return openPromise;
}


function createArticleTable() { 
    console.log("Creating Articles")
    var articles = db.createObjectStore("articles", { keyPath: "id", autoIncrement: true });

    

    //Create a search so we can look by some different values
    articles.createIndex("article_ArticleHeadline", "articleHeadline");  
    articles.createIndex("article_date", "date");  
    articles.createIndex("article_author", "author"); 
    articles.createIndex("article_tags", "tags", { unique: false, multiEntry: true });  
    
    articles.onerror = function (event) {
        console.log("Error?");
    };

    //Weird behaviour where this has to be outside the onComplete function when you run createArticleTable before the createUserTable
    GrabSavedArticles().then(
            previousArticles => {
                var transaction = db.transaction("articles", "readwrite");
                var table = transaction.objectStore("articles");
                for (var particle in previousArticles) {
                    console.log("Adding Article: ",previousArticles);
                    table.add(previousArticles[particle]);
                }
            } 
        )

    articles.transaction.oncomplete = function (event) {   
        console.log("Here!");
    }
}

function createUserTable() { 
    
    console.log("Creating Users");
    var users = db.createObjectStore("users", { keyPath: "email" });

    //Create a search so we can look by username
    users.createIndex("users_username", "username", { unique: true });   
    
    users.transaction.oncomplete = function (event) { 

        GrabSavedUsers().then(
            previousUsers => {
                var transaction = db.transaction("users", "readwrite");
                var table = transaction.objectStore("users");
                for (var puser in previousUsers) {
                    console.log("Adding User: ",previousUsers);
                    table.add(previousUsers[puser]);
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
            for (var i in index.articles) { 
                articlePaths.push(index.articles[i]);
            }
        });
    
    
    for (var i in articlePaths) { 
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

async function GrabSavedUsers() { 
    var users;
    await fetch("./Information/Users.json")
        .then((response) => response.json())
        .then((json) => users = json);
    return users;
}