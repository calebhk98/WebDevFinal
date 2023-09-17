import { db, startUp } from './DatabaseCreation.js';

//Starts us off with the intialization function
submitLogin();

//We wait until there is a LoginForm available.
//Once it's available, we can assume the rest of the site is
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

//The main function
async function submission() {  
    var form = document.getElementById("LoginForm");
    var user = { };   
    
    //Whenever the user submits the form, we run this
    form.addEventListener('submit', function (event) {
        //We are about to do a lot of stuff, we don't want to be refreshed until we are done
        event.preventDefault();
        var usernameUser;
        var emailUser;
        var succesfulLogIn = false;
        var transaction = db.transaction("users", "readwrite");
        var table = transaction.objectStore("users");
        var usernameIndex = table.index("users_username");

        //We search the DB for both the username or email
        user.password = document.getElementById("password").value;
        user.keepLoggedIn = document.getElementById("check").checked;  
        user.username = document.getElementById("username").value;
        
        var usernameQuery = usernameIndex.get(user.username);            
        var emailQuery = table.get(user.username);
        
        //We hash the password to compare with the saved password
        user.password = stringToHash(user.password);
        
        //If the Username is successful, we attempt to login with that
        usernameQuery.onsuccess = function () { 
            usernameUser = usernameQuery.result;
            //If the username login is successful, we save true, or if its already successful
            succesfulLogIn= attemptLogin(usernameUser, user) || succesfulLogIn;             
        }
            
        //If the email is successful, we attempt to login with that
        emailQuery.onsuccess = function () {
            emailUser = emailQuery.result;
            //If the email login is successful, we save true, or if its already successful
            succesfulLogIn= attemptLogin(emailUser, user) || succesfulLogIn;
        }

        //Once it has finished attempting both username and password,  we redirect as needed
        transaction.oncomplete = function () {   
            //If we login, redirect to homepage
            if (succesfulLogIn) {
                window.location.href="index.html";
            }
            //If neither username or user had a value, then the user should be notified of that
            else if (usernameUser == null && emailUser == null) {
                alert("Invalid Username/Email");
            }
            //If all else fails, we know it was an invalid password
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

//Saves the user as Logged in
function SaveLogin(user) {
    //Converts to JSON as local/session storage can only store strings
    var userJson = JSON.stringify(user);
    if (user.keepLoggedIn) {
        localStorage.setItem("loggedInUser", userJson);
    }
    else { 
        sessionStorage.setItem("loggedInUser", userJson);
        localStorage.removeItem("loggedInUser");
    }
}

//We attempt to login by comparing the 2 users.
function attemptLogin(test, user) { 
    //This honestly shouldn't be possible, but better than sorry
    //Also, doing it like this is easier to read imo
    if (test == undefined || user==undefined) { 
        return false;
    }

    //If the passwords do not match, it returns false
    if (test.password != user.password) { 
        return false; 
    }
    
    //So it will only get here if the passwords match
    if (user.keepLoggedIn) { 
        test.keepLoggedIn = true;
    }
    SaveLogin(test);
    return true;    
}