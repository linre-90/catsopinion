
// plain javascript
let backToTopBTN = document.getElementById("backToTopBtn");

const limitToShowBtn = 40;

window.onscroll = () =>{
    checkScroll();
}

const checkScroll = () =>{
    if(document.body.scrollTop > limitToShowBtn || document.documentElement.scrollTop > limitToShowBtn){
        backToTopBTN.style.display = "block";
        backToTopBTN.addEventListener("click", backToTop);
    }else{
        backToTopBTN.style.display = "none";
        backToTopBTN.removeEventListener("click",backToTop)
    }
}
const backToTop = () => {
    // safari
    document.body.scrollTop = 0;
    //real browsers
    document.documentElement.scrollTop = 0;
}



