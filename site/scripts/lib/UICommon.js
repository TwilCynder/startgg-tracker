import { processEventIdentifier } from "./util.js";

/**
 * @param {string} selector 
 * @returns 
 */
export function processEventIdentifierInput(inputElement){
    const input = inputElement.value;

    const identifier = processEventIdentifier(input);
    if (!identifier){
        alert("Please enter a valid event URL. Go to the page of your event on start.gg and copy the content of the URL bar.");
        return;
    }
    return identifier.getURLProperty();
}

/**
 * @param {string} selector 
 * @param {string} page 
 * @param {() => string} propertiesCallback 
 * @returns 
 */
export function goToPageWithInputEvent(selector, page, propertiesCallback){
    const urlProp = processEventIdentifierInput(selector);
    if (!urlProp) return;
    window.location.href = `/${page}.html?` + urlProp + (propertiesCallback ? propertiesCallback() : "")
}