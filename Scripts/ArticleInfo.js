async function fill_template() {     
    var data;
    var lang = document.documentElement.lang;
    var db;



    var generalInfo;
    // startUp();

    await fetch("ArticleInfo.json")
        .then((response) => response.json())
        .then((json) => data = json);




    await fetch("./Information/"+lang+"/WebsiteInfo.json")
    .then((response) => response.json())
        .then((json) => generalInfo = json);
    

    Object.assign(data, generalInfo);
            
    console.log(data);


    var template = Handlebars.compile(document.querySelector("#template").innerHTML);
    var filled = template(data);
    document.querySelector("#output").innerHTML = filled;

    document.title = data.websiteName + "-" + data.articleHeadline;
    
  
    
       

}

