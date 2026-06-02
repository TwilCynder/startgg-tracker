export async function getAuthStatus(){
    //First, is there an API key stored locally ?
    let token = localStorage.getItem("token");
    if (token) return {mode: "api-key", token};
    //No ? then we ask the server for a token saved under our session

    let auth = await fetch("/token")
        .then(async res => {
            if (res.status == 401){
                console.log("Not authenticated on server");
                return null;
            } else if (res.status < 400){
                const body = await res.json();
                console.log(body);
                let token = body.token;
                if (!token) throw "The server returned a success code but no token";
                return {mode: "oauth", token};
            } 
            throw "The server returned " + res.status;
        })
        .catch(err => {
            console.error("Error while retrieveing token :", err);
            return null;
        })

    return auth;
}