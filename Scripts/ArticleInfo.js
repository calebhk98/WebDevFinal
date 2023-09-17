import { db, startUp } from './DatabaseCreation.js';
//Don't really need this, but may as well have it create the DB now

fill_template();

async function fill_template() {  
    startUp();
    var data;
    var user = getLoggedInUser();
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
    data.user = getLoggedInUser();
    data.comment = data.comment.reverse();
    for (var c in data.comment) { 
        var commentTime = data.comment[c].date;
        data.comment[c].datePrint = new Date(commentTime).toLocaleDateString();
    }

    data.article = data.article.replace(/\n/g, '<br>');
    console.log(data);
    


    await fetch("./Information/"+lang+"/WebsiteInfo.json")
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
            ShowRelevantBtn();   
            var commentBtn = document.getElementById("NewCommentBtn");
            if (commentBtn) { 
                commentBtn.addEventListener('click', addComment);  
            }
             
    })
    
    document.title = data.websiteName + "-" + data.articleHeadline;     
     

}

function addComment() { 
    var user = getLoggedInUser();
    var comment = {};
    var article = JSON.parse(sessionStorage.getItem("Article"));
    comment.text = document.getElementById("comment").value;
    if (comment.text == "") { 
        return;
    }
    console.log("Adding");
    comment.author = user.username;
    comment.date = Date.now();
    comment.articleID = article.id;
    comment.articleHeadline = article.articleHeadline;
    
    
    user.comments.push(comment);
    article.comment.push(comment);
    document.getElementById("comment").value = "";
    updateUser(user);
    updateArticle(article);
    location.reload();
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

function updateUser(user) { 
    var transaction = db.transaction("users", "readwrite");
    var table = transaction.objectStore("users");
    var userJson = JSON.stringify(user); 

    if (user.keepLoggedIn) {
        localStorage.setItem("loggedInUser", userJson);                 
    }
    else { 
        sessionStorage.setItem("loggedInUser", userJson);        
    }  

    var userUpdateRequest = table.put(user);

    userUpdateRequest.onsuccess = function () {
    }
}

function updateArticle(article) { 
    var transaction = db.transaction("articles", "readwrite");
    var table = transaction.objectStore("articles");
    var articleJson = JSON.stringify(article);    
    sessionStorage.setItem("Article", articleJson);  
    var articleUpdateRequest = table.put(article);    
}


