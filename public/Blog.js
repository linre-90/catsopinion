const spinner = document.getElementById("waitpostResponse");
const backdrop = document.getElementById("backdrop");
const postView = document.getElementById("raisedPost");
const closeBtn = document.getElementById("closeRaisedPost");
const postInject =  document.getElementById("insertpost");


const open = async (event) => {
    let postDataUrl;
    event.path.forEach(object => {
        if(object.localName == "button"){
            postDataUrl = object.id.toString();
        }
    });
    spinner.style.display = "block";
    backdrop.style.display = "block";
    postView.style.display = "block";
    const response = await fetch(postDataUrl).catch(console.dir);
    const postResponse = await response.json();
    spinner.style.display = "none";
    postInject.insertAdjacentHTML("afterbegin",postResponse.view);
    closeBtn.addEventListener("click", closeRaisedPOst);
}

const closeRaisedPOst = () =>{
    
    backdrop.style.display = "none";
    postView.style.display = "none";
    spinner.style.display = "none";
    postInject.innerHTML = "";

}

if(document.getElementsByName("openPostLink").length > 0){
    document.getElementsByName("openPostLink").forEach(link => {
        link.addEventListener("click", open);
});
}