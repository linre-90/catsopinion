const open = async (event) => {
    let postDataUrl;
    event.path.forEach(object => {
        if(object.localName == "button"){
            postDataUrl = object.id.toString();
        }
    });
    document.getElementById("waitpostResponse").style.display = "block";
    document.getElementById("backdrop").style.display = "block";
    document.getElementById("raisedPost").style.display = "block";   
    const response = await fetch(postDataUrl).catch(console.dir);
    postResponse = await response.json();
    document.getElementById("waitpostResponse").style.display = "none";
    document.getElementById("blogsImage").src = postResponse.imageUrl;
    document.getElementById("raisedPostheadline").textContent = postResponse.title;
    document.getElementById("raisedPostText").innerHTML = postResponse.text;
    document.getElementById("raisedPostTimeStamp").textContent =postResponse.day + "/" + postResponse.month + "/" + postResponse.year;
    document.getElementById("closeRaisedPost").addEventListener("click", closeRaisedPOst);
}

const closeRaisedPOst = () =>{
    
    document.getElementById("backdrop").style.display = "none";
    document.getElementById("raisedPost").style.display = "none";
    document.getElementById("waitpostResponse").style.display = "none";
    document.getElementById("blogsImage").src = "";
    document.getElementById("raisedPostheadline").textContent = "";
    document.getElementById("raisedPostText").textContent = "";
    document.getElementById("raisedPostTimeStamp").textContent ="";
}

if(document.getElementsByName("openPostLink").length > 0){
    document.getElementsByName("openPostLink").forEach(link => {
        link.addEventListener("click", open);
});
}