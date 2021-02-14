const route = "/blog/getPosts";
const openPostroute = "/blog/openpost?id=";

document.getElementsByName("openPostLink").forEach(link => {
    link.addEventListener("click", (event) => {
        open(event);
    })
});

const open = async (clickedLink) => {
    let postDataUrl;
    document.getElementById("waitpostResponse").style.display = "block";
    document.getElementById("backdrop").style.display = "block";
    document.getElementById("raisedPost").style.display = "block";
    postDataUrl = clickedLink.path[0].id.toString();
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
