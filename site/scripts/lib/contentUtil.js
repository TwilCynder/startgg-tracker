import { PresentableError, presentError } from "./error.js";
import { ID, processEventIdentifier, Slug } from "./util.js";

/**
 * Returns the EventIdentifer based on search parameters. Handles error cases, guaranteed to return
 * @param {URLSearchParams} searchParameters 
 */
export function getEventIdentifierFromParams(searchParameters){
    let eventIdentifier;

    let event = searchParameters.get("event");
    if (event) {
        eventIdentifier = processEventIdentifier(event);
        if (!eventIdentifier) throw new PresentableError(`Event identifier ${event} is invalid - use the URL of a page related to the event`);
        return eventIdentifier;
    }
    let id = searchParameters.get(ID.propertyName);
    let slug = searchParameters.get(Slug.propertyName);

    eventIdentifier = id ? new ID(id) : slug ? new Slug(slug) : null;
    if (!eventIdentifier){
        throw new PresentableError(`No event specified`);
    }
    return eventIdentifier;
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