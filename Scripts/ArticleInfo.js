import { db, startUp } from './DatabaseCreation.js';
//Don't really need this, but may as well have it create the DB now

fill_template();

async function fill_template() {     
    var data;
    var lang = document.documentElement.lang;
    data = JSON.parse(sessionStorage.getItem("Article"));
    var generalInfo;

    //If there is no set Article, uses the default Article in the ArticleInfo.Json
    if (data == null) { 
        await fetch("./Information/ArticleInfo.json")
        .then((response) => response.json())
            .then((json) => data = json);
    }
    console.log(data);   


    await fetch("./Information/"+lang+"/WebsiteInfo.json")
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
    })

    document.title = data.websiteName + "-" + data.articleHeadline;       

}

