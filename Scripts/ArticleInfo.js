import { db, startUp } from './DatabaseCreation.js';

//This is the intilization funtion
fill_template();

//Intialization function
//This fills the HTML out
async function fill_template() {  
    //Make sure the database is created, but no need to wait for it
    startUp();
    var data;
    var user = getLoggedInUser();

    //If there is a logged in user, we want to use the user's language
    //I don't grab the language from the user's device in case it is set to an unknown language, in which case, nothing would show
    if (user != null && user.lang != null) { 
        document.documentElement.lang = user.lang;
    }
    var lang = document.documentElement.lang;
    data = JSON.parse(sessionStorage.getItem("Article"));
    var generalInfo;

    //If there is no set Article, uses the default Article in the ArticleInfo.Json
    if (data == null) { 
        await fetch("./Information/ArticleInfo.json")
        .then((response) => response.json())
            .then((json) => data = json);
        //This verifies that the session storage will have an article
        sessionStorage.setItem("Article", JSON.stringify(data));
    }
    data.user = user;

    //we do this to ensure the comments are in chronoligical order where the newest is displayed first
    data.comment = data.comment.reverse();

    //Sets the date to the locale Date, using the saved date in ms from epoch
    for (var c in data.comment) { 
        var commentTime = data.comment[c].date;
        data.comment[c].datePrint = new Date(commentTime).toLocaleDateString();
    }

    //This replaces all /ns with a break tag, so we have new lines
    data.article = data.article.replace(/\n/g, '<br>');

    //We can get the lang file based off the lang we select, and since the language is only allowed to be specific items, no need for error handling
    await fetch("./Information/"+lang+"/WebsiteInfo.json")
    .then((response) => response.json())
        .then((json) => generalInfo = json);
    
    //This command just adds general info to data
    Object.assign(data, generalInfo);
            
    //We split the Header of all the files into it's own file
    fetch('Header.html')
        .then(response => response.text())
        .then(headInfo => {
            Handlebars.registerPartial('header', headInfo);
            var template = Handlebars.compile(document.querySelector("#template").innerHTML);
            var filled = template(data);
            document.querySelector("#output").innerHTML = filled;
            
            //If user is logged in or not, will show the correct icons/buttons
            ShowRelevantBtn();   
            //If a user is logged in, it will add an event listener. 
            //Since it is removed by Handlebars, we have to ensure it exist before we add the event listener
            var commentBtn = document.getElementById("NewCommentBtn");
            if (commentBtn) { 
                commentBtn.addEventListener('click', addComment);  
            }             
        })
    document.title = data.websiteName + "-" + data.articleHeadline;     
}

//This adds a comment to the current article baseed on whats in the article box
function addComment() { 
    var user = getLoggedInUser();
    var comment = {};

    //Since sessionStorage and LocalStorage can only store text, we have to convert the Json to an object. 
    var article = JSON.parse(sessionStorage.getItem("Article"));
    comment.text = document.getElementById("comment").value;

    //We don't want users to post empty Comments
    if (comment.text == "") { 
        return;
    }

    comment.author = user.username;
    comment.date = Date.now(); //This grabs the ms since epoch, this allows the comment to be displayed appropriately
    comment.articleID = article.id;
    comment.articleHeadline = article.articleHeadline;   
    
    user.comments.push(comment);
    article.comment.push(comment);
    document.getElementById("comment").value = "";//Clears the comment
    updateUser(user);
    updateArticle(article);
    
    //Refreshes the page so the new changes can be seen.
    //Technically this means no need to clear the comment, but good practice
    location.reload();  

}

//Shows whether the Login/Register buttons are displayed, or the account image is
async function ShowRelevantBtn() { 
    var login = await document.getElementsByClassName("loginInfo");
    var accounts = await document.getElementsByClassName("UserInfo");

    //Grabs the user from the sessionStorage or the local storage
    //Only 1 should ever be filled, but as bugs happen, if the temp user is logged in differently from long term user, 
    //It uses the temp user. 
    var sessionUser = JSON.parse(sessionStorage.getItem("loggedInUser"));        
    var longTermUser = JSON.parse(localStorage.getItem("loggedInUser")); 
    if (sessionUser != null) { 
        longTermUser = sessionUser;
    }

    //Loops through the login/account buttons to hide or display them as needed
    if (longTermUser != null) {
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

//Trys to return the current logged in user. 
//returns null if no logged in user
function getLoggedInUser() { 
    var sessionUser = JSON.parse(sessionStorage.getItem("loggedInUser"));        
    var longTermUser = JSON.parse(localStorage.getItem("loggedInUser")); 
    if (sessionUser != null) { 
        longTermUser = sessionUser;
    }
    return longTermUser;
}

//Updates the user in both the local/session storage as well as the DB
function updateUser(user) { 
    var transaction = db.transaction("users", "readwrite");
    var table = transaction.objectStore("users");

    //Since the nonDB storage can only store strings, we convert the object to a JSON
    var userJson = JSON.stringify(user); 

    //Only edits the value the user should be stored in
    if (user.keepLoggedIn) {
        localStorage.setItem("loggedInUser", userJson);                 
    }
    else { 
        sessionStorage.setItem("loggedInUser", userJson);        
    }  

    //Adds the updated user to the DB
    var userUpdateRequest = table.put(user);
    //Mostly here just so the compiler doesn't somehow remove the Request since 
    //it might think nothing is being done
    userUpdateRequest.onsuccess = function () { }
}

//Updates the article in the session storage and DB
function updateArticle(article) { 
    var transaction = db.transaction("articles", "readwrite");
    var table = transaction.objectStore("articles");

    //Since the nonDB storage can only store strings, we convert the object to a JSON
    var articleJson = JSON.stringify(article);    
    sessionStorage.setItem("Article", articleJson);
    
    //Adding it to the DB, then we do nothing on the success
    //Mostly here just so the compiler doesn't somehow remove the Request since 
    //it might think nothing is being done
    var articleUpdateRequest = table.put(article);  
    articleUpdateRequest.onsuccess = function () { }
}