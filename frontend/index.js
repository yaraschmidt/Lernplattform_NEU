let HTML_TEMPLATE = "";

const backendAPI = "http://localhost:3000";

window.addEventListener("hashchange", func);
window.addEventListener("load", func);

async function func(){
    const pageSplit = location.hash.slice(1).split("/");
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";
};