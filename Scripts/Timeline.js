async function fill_template() {     
    var data = [];
    var articles = [];    
    var lang = document.documentElement.lang;
    var db;
    var generalInfo;
    var even = 0;
    var pair = [];
    var articlePaths = [];
    await fetch('../Information/ArticleIndexes.json')
    .then(response => response.json())
        .then(index => {
            for (i in index.articles) { 
                articlePaths.push(index.articles[i]);
            }
        });
    
    
    for (i in articlePaths) { 
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
    
    
    
    data.articles = articles;
    console.log(data);


    await fetch("./Information/"+lang+"/WebsiteInfo.json")
    .then((response) => response.json())
        .then((json) => generalInfo = json);
    

    Object.assign(data, generalInfo);
    
   
    console.log(data);


    var template = Handlebars.compile(document.querySelector("#template").innerHTML);
    var filled = await template(data);
    document.querySelector("#output").innerHTML = filled;

    document.title = data.websiteName;

    var boxes = document.getElementsByClassName("TimelineBox");
        console.log(boxes);
        for (var i = 0; i < boxes.length; i++) {            
            boxes[i].onclick = function () {
                window.location.href = "Article.html";
            };
    }      
}
