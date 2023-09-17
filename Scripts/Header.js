// import { db, startUp } from './DatabaseCreation.js';
var showUserArticle = true;
waitToStart();


async function waitToStart() { 
    waitForElm("#SearchForm").then((elm) => { SetUp();});
}

function SetUp() {
    document.getElementById("SearchForm").onsubmit = Search;    
    document.getElementById("CenturyDropdown").addEventListener('click', SeacrhByCentury);
    document.getElementById("SubjectDropdown").addEventListener('click', SeacrhBySubject);
               
}

function Search(event) { 
    var Search = {};
    event.preventDefault();
    var searchTerm = document.getElementById("SearchBar").value;
    if (searchTerm == null || searchTerm == "") {
        return;
    }
    Search.tags = searchTerm.split(" ");
    for (var i in Search.tags) { 
        Search.tags[i] = Search.tags[i].trim();
    }
    lookUp(Search);
    
}

function SeacrhByCentury(event) { 
    var Search = {};
    Search.century = event.target.textContent;
    lookUp(Search);

}
function SeacrhBySubject(event) { 
    var Search = {};
    event.preventDefault();
    var searchTerm = event.target.textContent;
    Search.tags = [];
    Search.tags[0] = searchTerm;
    lookUp(Search);

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

function lookUp(search) { 
    sessionStorage.setItem("searchTerm", JSON.stringify(search));    
    window.location.href = "FilteredTimeline.html";
}   
