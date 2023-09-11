var db;
async function submitLogin() { 
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
        console.log(db.objectStoreNames.contains("users"));
        if (!db.objectStoreNames.contains("users")) {
            createUserTable();
        }

        db.onerror = (event) => {
            console.error(`Database error: ${event.target.errorCode}`);
        };
        waitForElm("#LoginForm").then((elm) => { submission(); });
    };

    //If the database doesn't exist yet
    request.onupgradeneeded = function () {
        //Sets the table for users, could use the email as the id        
        db = request.result;
        createUserTable();
        
    };

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

async function submission() {  
    var form = document.getElementById("LoginForm");
    var user = { };   
    
    form.addEventListener('submit', function (event) {
            event.preventDefault();
            var transaction = db.transaction("users", "readwrite");
            var table = transaction.objectStore("users");
            var usernameIndex = table.index("users_username");
            
            user.username = document.getElementById("username").value;
            var usernameQuery = usernameIndex.get(user.username);            
            var emailQuery = table.get(user.username);
            user.password = document.getElementById("password").value;
            user.check = document.getElementById("check").checked;

            

           
            var realUsername = false;
            var realEmail = false;
            user.password = stringToHash(user.password);

            usernameQuery.onsuccess = function () { 
                console.log("Username Info: ");
                var test = usernameQuery.result;
                
                
                console.log(test);
                if (test != undefined) {
                    if (test.password == user.password) { 
                        console.log("Logged in");
                        if (user.check) { 
                            test.check = true;
                        }
                        SaveLogin(test);
                    }
                    realUsername = true;
                    return; 
                }
            }
            

            emailQuery.onsuccess = function () { 
                console.log("Email Info: ");
                var test = emailQuery.result;
                console.log(test);
                if (test != undefined) {
                    realEmail = true;
                    if (test.password == user.password) { 
                        console.log("Logged in");
                        if (user.check) { 
                            test.check = true;
                        }
                        SaveLogin(test);
                    }
                    return; 
                }
            }  
            transaction.oncomplete = function () {                
                console.log("Closing DB");
                // db.close();
                window.location.href="Article.html";
            };        
    });
}

async function GrabSavedUsers() { 
    var users;
    await fetch("./Information/Users.json")
        .then((response) => response.json())
        .then((json) => users = json);
    return users;
}


//Got this from https://www.geeksforgeeks.org/how-to-create-hash-from-string-in-javascript/
//This can be replaced by any other hash function that would be wanted. 
function stringToHash(string) {
             
    let hash = 0;
     
    if (string.length == 0) return hash;
     
    for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
     
    return hash;
}

function SaveLogin(user) { 
    var userJson = JSON.stringify(user);
    if (user.check) {
        localStorage.setItem("loggedInUser", userJson);
    }
    else { 
        sessionStorage.setItem("loggedInUser", userJson);
        localStorage.removeItem("loggedInUser");

    }
}

function createUserTable() { 
    var users = db.createObjectStore("users", { keyPath: "email" });

    //Create a search so we can look by username
    users.createIndex("users_username", "username", { unique: true });   
    
    users.transaction.oncomplete = function (event) { 
        var transaction = db.transaction("users", "readwrite");
        var table = transaction.objectStore("users");
        for (puser in previousUsers) { 
            table.add(previousUsers[puser]);
        }               

    }
}