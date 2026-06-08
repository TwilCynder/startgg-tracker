import { getAuthStatus } from "./auth.js";
import { hide, show } from "./DOMUtil.js";
import { initLoginElements } from "./loginElements.js";

class Lock {
    #resolve;
    #reject;
    constructor(){
        const lock = this;
        this.promise = new Promise((resolve, reject) => {
            lock.#resolve = resolve;
            lock.#reject = reject;
        });
    }

    resolve(value){
        this.#resolve(value);
    } 

    reject(error){
        this.#reject(error);
    }
}

function displayLoginOverlay(){
    show(".login-overlay-container");
}

function hideLoginOverlay(){
    hide(".login-overlay-container");
}

export async function checkLogin(client){
    const authStatus = await getAuthStatus();
    if (authStatus && authStatus.token){
        return authStatus.token;
    } else {
        const loginLock = new Lock;
        let token;
        await initLoginElements((token_) => {
            token = token_;
            loginLock.resolve();
        })

        displayLoginOverlay();

        await loginLock.promise;

        hideLoginOverlay();
        
        return token;
    }
}

export function initLoginCheck(client = null){
    return initLoginElements(() => {});
}