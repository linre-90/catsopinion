

const launchApp = (id) => {
    let openAppUrr;
    openAppUrr = "openApp?app="+id.toString();
    window.open(openAppUrr);
};

if(document.getElementsByName("openApp").length > 0){
    document.getElementsByName("openApp").forEach(link => {
        link.onclick = () => launchApp(link.id);
})};

