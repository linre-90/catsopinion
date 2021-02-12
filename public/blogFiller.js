const route = "/blog/getPosts?quantity=";
const openPostroute = "/blog/openpost?id=";

// execute blog post creation on load
window.onload = () => generatePosts(5);

// generate post
const generatePosts = async (amount) =>{
    document.getElementById("waitWeatherResponse").style.display = "block";
    const postsWrapper = document.getElementById("blogPostsContainer");
    try {
        const posts = await (await getBlogPosts(amount)).json();
        let generatedPosts = [];
        // generate posts
        posts.forEach(singlePostData => {
            generatedPosts.push(generateSinglePost(singlePostData));
        });
        document.getElementById("waitWeatherResponse").style.display = "none";
        //push all posts to html
        generatedPosts.forEach(post => {
            postsWrapper.appendChild(post);
    });
    } catch (error) {
        console.dir;
    }
}

// get n amount of blog posts from server
const getBlogPosts = async (quantity) =>{
    const response = await fetch(route+quantity);
    if(response.status === 200){
        return response;
    }else{
        console.log("Something is very badly wrong!");
    }
}

// generates single post div
const generateSinglePost = (singlePostData) => {
    /*structure
        <div>
            <div>
                <div>
                    <img>   image
                </div>
                <div>
                    <h3>    title
                    <p>     text
                </div>
            </div>
            <div>
                <a> read full post
            </div>
        </div>
    */
    // wrapperdiv + classes
    let wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("postWrapperDiv");
    // add 2 content boxes
    let imageDiv = document.createElement("div");
    let textDiv = document.createElement("div");
    let buttonDiv = document.createElement("div");
    //content
    let headLine = document.createTextNode(singlePostData.title);
    let img = document.createElement("img");
    img.src = singlePostData.imageUrl;
    img.width = 200;
    let timeStamp = document.createTextNode(singlePostData.day +"/"+singlePostData.month +"/"+ singlePostData.year);
    
    //button
    let openPost = document.createElement("a");
    openPost.id = openPostroute+singlePostData._id;
    let linkText = document.createTextNode("Copy link to post page");
    let openPostLinkText = document.createTextNode("Open post");
    openPost.appendChild(openPostLinkText);
    openPost.onclick = (event) => open(event, true);
    // content showers
    let headline_h3 = document.createElement("h3");
    headline_h3.appendChild(headLine);
    let text_p = document.createElement("p");
    let timeStamp_p = document.createElement("p");
    text_p.innerHTML=singlePostData.text ;
    timeStamp_p.appendChild(timeStamp);
    // contents to div
    imageDiv.appendChild(img);
    textDiv.appendChild(headline_h3);
    textDiv.appendChild(text_p);
    buttonDiv.appendChild(openPost);
    buttonDiv.appendChild(timeStamp_p);
    
    // css classess
    headline_h3.classList.add("removeMarginTop");
    imageDiv.classList.add("col-4");
    textDiv.classList.add("col-8");
    buttonDiv.classList.add("openPostButtonDiv");
    openPost.classList.add("copyLink");
    text_p.classList.add("textLeft");

    // structure creation
    wrapperDiv.appendChild(imageDiv);
    wrapperDiv.appendChild(textDiv);
    wrapperDiv.appendChild(buttonDiv);
    return wrapperDiv;
}


const copyLink = (clickedLink) => {
    const postid = clickedLink.path[0].id.toString();
    window.prompt("Copy to clipboard: Press ctrl+c", getSinglePostFromLink+postid);
}
const open = async (clickedLink, fromLink) => {
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
