let HTML_TEMPLATE = "";

const backendAPI = "http://localhost:3000";

window.addEventListener("hashchange", func);
window.addEventListener("load", func);

async function func(){
    const pageSplit = location.hash.slice(1).split("/");
    const contentDiv = document.getElementById("content");
    contentDiv.innerHTML = "";

    switch (pageSplit[0]) {

        case "users":
            await fetch("./templates/users.html")
                .then(resp => resp.text())
                .then(text => {HTML_TEMPLATE = text});


            const userListDiv = document.createElement("div");
            userListDiv.classList.add("list")

            fetch(backendAPI + "/user")
                .then(user => user.json())
                .then(arr => arr.forEach(user => {
                    let html = HTML_TEMPLATE;

                    html = html.replace(/%NAME%/g, user["name"]);
                    html = html.replace(/%AGE%/g, user["age"]);
                    html = html.replace(/%COLOR%/g, user["color"]);
                    html = html.replace(/%USERID%/g, user["_id"]);
                    userListDiv.innerHTML += html;
                }));

            const createUserButton = document.createElement("button");
            createUserButton.onclick = () => route('user');
            createUserButton.innerText = "Create User"
            contentDiv.appendChild(userListDiv);
            contentDiv.appendChild(createUserButton);

        break;
    }
};