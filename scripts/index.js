import { testTokenFactory } from "./lib/api/testToken.js"

let testToken = await testTokenFactory();

document.getElementById("start-button").addEventListener("click", async (element) => {
    let token = document.getElementById("apikey").value;

    let res = await testToken(token);

    switch (res){
        case 0:
            break;
        case 1:
            alert("There seems to be a problem with the start.gg API. Please try again later");
            return;
        case 2:
            alert("The API token you provided is invalid. Please provide a valid API token")
            return;
    }

    localStorage.setItem('token', token);

    window.location.href = "./event_sets.html"
})