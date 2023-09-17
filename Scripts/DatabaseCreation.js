export var db;
var articlesReady = false;
 

export async function startUp() {
    return new Promise((resolve, reject) => {
    if (db) resolve(db);
    //Saves whichever indexedDB we need
    var indexedDB =
        window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB ||
        window.shimIndexedDB;
    
    if (!indexedDB) {
        console.error("IndexedDB could not be found in this browser.");
    }

    
    var request = indexedDB.open("TimelineHistoriansDB");

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
            if (!db.objectStoreNames.contains("users")) {
                createUserTable();
            }

            db.onerror = (event) => {
                console.error(`Database error: ${event.target.errorCode}`);
            };
            resolve(db);
        };

        //If the database doesn't exist yet
        request.onupgradeneeded = function ()  {
            //Sets the table for articles       
            db = request.result;
            createArticleTable().then(() => {
                createUserTable().then(() => { 
                    GrabSavedArticles().then(
                        previousArticles => {
                            var transaction = db.transaction("articles", "readwrite");
                            var table = transaction.objectStore("articles");
                            for (var particle in previousArticles) {
                                table.add(previousArticles[particle]);
                            }
                            articlesReady = true;
                            resolve(db);       
                            alert("Reloading");
                            location.reload();

                    })
                    
                })
            });
            
        };
    });
    
    
}


function createArticleTable() { 
    return new Promise((resolve, reject) => { 
        
        
        var articles = db.createObjectStore("articles", { keyPath: "id", autoIncrement: true });

        

        //Create a search so we can look by some different values
        articles.createIndex("article_ArticleHeadline", "articleHeadline");  
        articles.createIndex("article_date", "date");  
        articles.createIndex("article_author", "author"); 
        articles.createIndex("article_tags", "tags", { unique: false, multiEntry: true });  
        
        articles.onerror = function (event) {
        };
        resolve();
    })

    
}

function createUserTable() { 
    return new Promise((resolve, reject) => { 
        var users = db.createObjectStore("users", { keyPath: "email" });

        //Create a search so we can look by username
        users.createIndex("users_username", "username", { unique: true });           
       
            GrabSavedUsers().then(
                previousUsers => {
                    var transaction = db.transaction("users", "readwrite");
                    var table = transaction.objectStore("users");
                    for (var puser in previousUsers) {
                        table.add(previousUsers[puser]);
                    }
                    resolve();
                } 
            )
        // }
        users.transaction.onerror = function (event) {   
            reject();
        }


    });
    
}

async function GrabSavedArticles() {
    var articles=[];
    var even = 0;
    var articlePaths = [];
    var massArticlePath = '../Articles/MassArticles.json';
    
    
    await fetch('../Information/ArticleIndexes.json')
    .then(response => response.json())
        .then(index => {
            for (var i in index.articles) { 
                articlePaths.push(index.articles[i]);
            }
        });
    
    
    await grabArticlesFromPath(articlePaths);
    even = articlePaths.length % 2;
    
    await fetch(massArticlePath)
            .then(response => response.json())
        .then(articleData => {
            for (var i in articleData) { 
                var test = articleData[i];
                                               
                if (even) {
                    test.even = true;
                    even = 0;
                }
                else {
                    test.even = false;                      
                    even = 1;
                }
                articles.push(test);
            }
                
        });
    
    
    return articles;
}
async function grabArticlesFromPath(path) { 
    var even = 0;
    var articles = [];
    for (var i in path) { 
        await fetch(path[i])
            .then(response => response.json())
            .then(articleData => {
                
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