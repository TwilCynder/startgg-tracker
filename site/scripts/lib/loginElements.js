import { testTokenFactory } from "./api/testToken.js";

/**
 * 
 * @param {((token: string) => void)} validTokenCallback 
 */
export async function initLoginElements(validTokenCallback){
    const testToken = await testTokenFactory();

    const inputElement = document.getElementById("api-key-input");
    const buttonElement = document.getElementById("api-key-start-button");

    async function startButton(){
        inputElement.disabled = true;
        buttonElement.value = "...";
        
        let token = inputElement.value;

        try {
            const res = await testToken(token);
            switch (res){
                case 0:
                    localStorage.setItem('token', token);
                    validTokenCallback(token); 
                    break;
                case 1:
                    alert("The API token you provided is invalid. Please provide a valid API token");
                    break;
                case 2:
                    alert("There seems to be a problem with the start.gg API. Please try again later");
                    break;
            }
        } finally {
            inputElement.disabled = false;
            buttonElement.value = "Start";
        }
    }

    buttonElement.addEventListener("click", async (element) => {
        await startButton();
    });
    inputElement.addEventListener("keypress", async (event) => {
        if (event.key == "Enter"){
            await startButton();
        }
    });

    document.querySelector(".startgg-login-button").addEventListener("click", () => {
        console.log(window.location.pathname + window.location.search)
        const encodedURI = encodeURIComponent(window.location.pathname + window.location.search);
        console.log(encodedURI);
        window.location.assign("/startgg-oauth?source=" + encodedURI);
    })
}