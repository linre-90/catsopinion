
// plain javascript
let backToTopBTN = document.getElementById("backToTopBtn");

let reportBugBTN = document.getElementById("reportBugBTN");

const limitToShowBtn = 40;

let reportBugOk = false;

window.onscroll = () =>{
    checkScroll();
}

const checkScroll = () =>{
    if(document.body.scrollTop > limitToShowBtn || document.documentElement.scrollTop > limitToShowBtn){
        backToTopBTN.style.display = "block";
        reportBugBTN.style.display = "block";
        backToTopBTN.addEventListener("click", backToTop);
    }else{
        backToTopBTN.style.display = "none";
        reportBugBTN.style.display = "none";
        backToTopBTN.removeEventListener("click",backToTop)
    }
}
const backToTop = () => {
    // safari
    document.body.scrollTop = 0;
    //real browsers
    document.documentElement.scrollTop = 0;
}



