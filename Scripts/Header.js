var showUserArticle = true;
waitToStart();

//We wait until there is a SearchForm available.
async function waitToStart() { 
    waitForElm("#SearchForm").then((elm) => { SetUp();});
}

//Just adds a function to the items. Can't keep this in the HTML as this is a module
function SetUp() {
    document.getElementById("SearchForm").onsubmit = Search;    
    document.getElementById("CenturyDropdown").addEventListener('click', SeacrhByCentury);
    document.getElementById("SubjectDropdown").addEventListener('click', SeacrhBySubject);               
}

//The default search, this is done when using the searchbar, so needs a bit more validation
function Search(event) { 
    var Search = {};
    event.preventDefault();//We don't want the page reloading, we're about to send the user somewhere else
    var searchTerm = document.getElementById("SearchBar").value;
    //If there is no value to search, no reason to search, possibly just a misclick
    if (searchTerm == null || searchTerm == "") {
        return;
    }
    //We will search by each word
    Search.tags = searchTerm.split(" ");
    for (var i in Search.tags) { 
        Search.tags[i] = Search.tags[i].trim();
    }
    lookUp(Search);
    
}

//We just need to tell the filtered website to look by century here, so all we do is add the button's text here
function SeacrhByCentury(event) { 
    var Search = {};
    Search.century = event.target.textContent;
    lookUp(Search);

}

//Searching by defined subjects, all we do is give the buttons name to the search term. 
function SeacrhBySubject(event) { 
    var Search = {};
    event.preventDefault();//We don't want it trying to send us anywhere until we are ready
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

//We set the search object as a JSON string, then we go to the Filtered timeline website
function lookUp(search) { 
    sessionStorage.setItem("searchTerm", JSON.stringify(search));    
    window.location.href = "FilteredTimeline.html";
}   
