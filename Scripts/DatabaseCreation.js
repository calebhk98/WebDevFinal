export var db;
 
//This is the is ran whenever the we need the DB
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
            reject();
        }
        
        var request = indexedDB.open("TimelineHistoriansDB");

        //If we can't get a database
        request.onerror = (event) => {
            console.error("Why didn't you allow my web app to use IndexedDB?!");
            console.error(event);
            reject(event);
        };

            
        //If the database already exists
        //Weirdly, will run after onUpgradeNeeded has ran, but before everything I want done is done
        request.onsuccess = (event) => {
            db = event.target.result;

            //If everything worked correctly, then these shouldn't run, but just incase
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
            db = request.result;
            //This should force it to create articles, then the users, before resolving
            //Unfortunatly once the DB is created, it gets an onsuccess event before adding all the articles
            createArticleTable().then(() => {
                createUserTable().then(() => { 
                    GrabSavedArticles().then(
                        previousArticles => {
                            var transaction = db.transaction("articles", "readwrite");
                            var table = transaction.objectStore("articles");
                            for (var particle in previousArticles) {
                                table.add(previousArticles[particle]);
                            }
                            resolve(db);      //Returns the promise 
                            location.reload();//Reloads the page now that the articles have been recieved. 
                        }
                    )                    
                })
            });            
        };
    });  
}

//Creates the table for articles
function createArticleTable() { 
    return new Promise((resolve, reject) => { 
        var articles = db.createObjectStore("articles", { keyPath: "id", autoIncrement: true });

        //Create a search so we can look by some different values
        articles.createIndex("article_ArticleHeadline", "articleHeadline");  
        articles.createIndex("article_date", "date");  
        articles.createIndex("article_author", "author"); 
        articles.createIndex("article_tags", "tags", { unique: false, multiEntry: true });  
        resolve();
    })
}

//Creates the table for Users
function createUserTable() { 
    return new Promise((resolve, reject) => { 
        var users = db.createObjectStore("users", { keyPath: "email" });

        //Create a search so we can look by username
        users.createIndex("users_username", "username", { unique: true });           
       
        //Then we add the saved users to the new table
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

        //Mostly just for Promise to not be upset there is no reject
        users.transaction.onerror = function (event) {   
            reject();
        }
    });    
}

//This returns all the articles that are saved with the HTML, before they are put in the DB 
async function GrabSavedArticles() {
    var articles=[];
    var even = 0;
    var articlePaths = [];
    var massArticlePath = '../Articles/MassArticles.json';
    
    //So, this first grabs the file ArticleIndexes, which saves what all the other file names are
    //We have to do this, as looking through the files is "insecure"
    //After grabbing the file, we then save the paths to the ArticlePaths array
    await fetch('../Information/ArticleIndexes.json')
    .then(response => response.json())
    .then(index => {
        for (var i in index.articles) { 
            articlePaths.push(index.articles[i]);
        }
    });
    
    
    articles= await grabArticlesFromPath(articlePaths);
    even = articlePaths.length % 2;//This is to make sure that we split the articles evenly
    

    //This goes through the mass articles Json, that is unsorted, to add each of these articles
    await fetch(massArticlePath)
        .then(response => response.json())
        .then(articleData => {
            for (var i in articleData) { 
                var tempArticle = articleData[i];
                
                //This could probably be shrunk to be without conditionals, but I've messed with it enough
                if (even) {
                    tempArticle.even = true;
                    even = 0;
                }
                else {
                    tempArticle.even = false;                      
                    even = 1;
                }
                articles.push(tempArticle);
            }
            
        });  
    return articles;
}

//This returns the articles from each path. 
async function grabArticlesFromPath(path) { 
    var even = 0;
    var articles = [];
    for (var i in path) { 
        await fetch(path[i])
        .then(response => response.json())
        .then(articleData => {   
            var tempArticle = articleData;   
            
            //This could probably be shrunk to be without conditionals, but I've messed with it enough
            if (even) {
                tempArticle.even = true;
                even = 0;
            }
            else {
                tempArticle.even = false;                      
                even = 1;
            }
            articles.push(tempArticle);
        });
    }
    return articles;
}

//This returns the object from the JSON file
async function GrabSavedUsers() { 
    var users;
    await fetch("./Information/Users.json")
        .then((response) => response.json())
        .then((json) => users = json);
    return users;
}