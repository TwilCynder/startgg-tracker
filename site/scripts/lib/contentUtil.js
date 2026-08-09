import { presentError } from "./error.js";
import { ID, Slug } from "./util.js";

/**
 * @param {URLSearchParams} searchParameters 
 */
export function getEventIdentifierFromParams(searchParameters){
    let id = searchParameters.get(ID.propertyName);
    let slug = searchParameters.get(Slug.propertyName);
    return id ? new ID(id) : slug ? new Slug(slug) : null;
}

/**
 * 
 * @param {() => void} f 
 * @param {(Error) => void} errorCallback 
 * @returns 
 */
export async function try_(f, errorCallback){
    try {
      await f();
    } catch(error){
        errorCallback(error);
        return false;
    }
    return true;
}

/**
 * 
 * @param {() => void} f 
 * @param {(Error) => void} errorCallback 
 * @param {number} delay 
 */
export async function runLoop(f, errorCallback, delay){
    if (await try_(f, errorCallback)){
        setTimeout(() => runLoop(f, errorCallback, delay), delay);
    }
}

export function contentManagerErrorCallbackFactory(contentManager){
    return (error) => contentManager.showError(presentError(error));
}