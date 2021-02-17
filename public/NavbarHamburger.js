const hamburger = document.getElementById("hamburgerDiv");
const menuItems = document.getElementsByName("menuitem");


hamburger.addEventListener("click", () => {
    menuItems.forEach(item => {
        if(item.style.display == ""){
            item.style.display = "flex";
            item.classList.remove("hideMenuAnimation");
            item.classList.add("showMenuAnimation")
        }else if(item.style.display == "flex"){
            item.classList.add("hideMenuAnimation")
            item.classList.remove("showMenuAnimation");
            setTimeout(() => {
                item.style.display = "";
            },1000)
        }
    });
});


