async function fill_template() {     
    var data = {
        title: "History",
        articleHeadline: "Story 1", 
        date: "1-10-2020", 
        desc: "This is the description of the webpage", 
        img: null,
        article: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec erat nibh, convallis ac sagittis eu, consectetur eget tortor.  \n Maecenas ut lectus ultricies, aliquam sapien eu, vehicula nisi. Aliquam egestas augue quis arcu tempor ullamcorper. Curabitur molestie risus vel nisl pulvinar rhoncus eget sit amet nisi. Proin pulvinar turpis nec egestas posuere. Donec orci urna, porttitor quis sollicitudin nec, luctus vel lacus. Duis placerat maximus purus ut imperdiet. Aliquam ac urna sed turpis placerat semper. Ut et urna quis neque hendrerit mollis. In fringilla ultricies ligula, at luctus libero. Duis feugiat odio at pellentesque mollis." +

'Integer placerat felis urna, ut cursus magna aliquam nec. Vestibulum dignissim dolor ultricies felis imperdiet, non viverra sapien accumsan. Phasellus quis commodo odio, ac accumsan leo. Suspendisse posuere velit ut vulputate cursus. In ultricies enim eget sollicitudin interdum. Mauris volutpat condimentum pulvinar. Suspendisse potenti. Nam in finibus leo. Nulla posuere, diam non rhoncus tempus, magna augue ultricies nulla, tincidunt condimentum justo ipsum sed felis. Donec sit amet aliquam tellus, non sagittis nulla.'+

'Praesent accumsan pulvinar laoreet. Quisque ullamcorper a ligula id pretium. Suspendisse potenti. In faucibus nisl nec lorem malesuada, non lobortis turpis sagittis. Aenean ultricies, lectus imperdiet pretium porta, risus orci porttitor lectus, a iaculis nisl massa in tortor. Duis efficitur lorem vel ante dictum eleifend. Ut pretium non nunc quis tincidunt. Morbi vitae finibus mauris. Vivamus porttitor, justo vel consequat blandit, enim diam aliquam purus, eu iaculis lectus eros at ante.'+

'Pellentesque at eleifend neque, in bibendum elit. Mauris convallis et erat ut consequat. In accumsan ullamcorper volutpat. Proin vel sem imperdiet, maximus sem tempor, porttitor nisi. Ut id molestie massa. Suspendisse malesuada, risus vitae faucibus laoreet, tortor nunc euismod tellus, nec congue justo orci sed felis. Vivamus commodo, mi eget condimentum posuere, ex tellus dictum elit, at venenatis nibh nulla eget diam. Proin semper orci a mauris congue cursus. Integer eleifend posuere bibendum. Sed ut nisi sit amet erat rhoncus porttitor id laoreet eros. Donec ligula felis, egestas et mi sit amet, venenatis aliquam ante. Duis commodo turpis non sapien accumsan gravida. In bibendum pretium ante maximus tristique. Proin egestas nec justo id iaculis. Nam pharetra rhoncus varius.'+

'Donec vestibulum blandit commodo. Vivamus lorem odio, egestas eget varius blandit, blandit ut purus. Morbi sed sapien sagittis lorem feugiat iaculis. Phasellus vulputate, nulla sit amet pulvinar rhoncus, turpis ligula facilisis neque, at pulvinar urna dui eget augue. Mauris eu est non arcu accumsan sagittis eu eu massa. Aenean scelerisque in sapien a sollicitudin. Sed at mi a diam porttitor rhoncus. Cras ante erat, commodo a vehicula tincidunt, eleifend sed justo. Vivamus eget lectus pulvinar neque fermentum imperdiet. Donec eros mi, placerat in vehicula sed, efficitur id massa.', 
        author: "Lorem Ipsum",
        comment: [
            {
                author: "Caleb",
                date: "1-11-2020", 
                text: "This is a terrible article."
            },
            {
                author: "Shelly",
                date: "1-12-2020", 
                text: "This is a great article."
            },
            {
                author: "Dave",
                date: "1-15-2020", 
                text: "This is a bob article."
            }
        ]
    }

    var generalInfo;
    await fetch("./Information/en/WebsiteInfo.json")
    .then((response) => response.json())
        .then((json) => generalInfo = json);
    
    console.log(typeof data);
    console.log(typeof generalInfo);
    Object.assign(data, generalInfo);
    console.log(data);


    var template = Handlebars.compile(document.querySelector("#template").innerHTML);
    var filled = template(data);
    document.querySelector("#output").innerHTML = filled;

}

window.fill_template = fill_template;