import { db, startUp } from './DatabaseCreation.js';

submitLogin();

async function submitLogin() { 
    startUp().then(() => {       
        waitForElm("#LoginForm").then((elm) => { submission(); });
    });
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
        user.keepLoggedIn = document.getElementById("check").checked;
        

        
        user.password = stringToHash(user.password);
        var usernameUser;
        var emailUser;
        var succesfulLogIn = false;
        usernameQuery.onsuccess = function () { 
            console.log("Username Info: ");
            usernameUser = usernameQuery.result;

            succesfulLogIn= attemptLogin(usernameUser, user) || succesfulLogIn; 
            
        }
            

        emailQuery.onsuccess = function () {
            console.log("Email Info: ");
            emailUser = emailQuery.result;
            console.log(emailUser);
            succesfulLogIn= attemptLogin(emailUser, user) || succesfulLogIn;
        }

        transaction.oncomplete = function () {   
            if (succesfulLogIn) {
                console.log("Closing DB");
                // db.close();
                window.location.href="Article.html";
            }
            else if (usernameUser == null && emailUser == null) {
                alert("Invalid Username/Email");
            }
            else { 
                alert("Invalid Password");
            }
            
        };        
    });
}

//Got this from https://www.geeksforgeeks.org/how-to-create-hash-from-string-in-javascript/
//This can be replaced by any other hash function that would be wanted. 
function stringToHash(string) {
             
    var hash = 0;
     
    if (string.length == 0) return hash;
     
    for (var i = 0; i < string.length; i++) {
        var char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
     
    return hash;
}

function SaveLogin(user) {
    console.log("Saving User");
    var userJson = JSON.stringify(user);
    if (user.keepLoggedIn) {
        localStorage.setItem("loggedInUser", userJson);
    }
    else { 
        sessionStorage.setItem("loggedInUser", userJson);
        localStorage.removeItem("loggedInUser");
    }
}

function attemptLogin(test, user) { 
    
    console.log("Logged in with ",test, "And: ", user);
    if (test != undefined) {
        if (test.password == user.password) { 
            console.log("Password Good!");
            if (user.keepLoggedIn) { 
                test.keepLoggedIn = true;
            }
            SaveLogin(test);
            return true;
        }
        return false; 
    }
}