import { hide, hideElement, show, showElement } from "./lib/DOMUtil.js";
import { compareStrArray, processEventIdentifier } from "./lib/util.js";

export class RequestValidityError extends Error {}

export class Request {
    /**
     * @param {string} slug 
     * @param {{date?: number, duration?: number}} timePeriod 
     * @param {string} filters 
     * @param {string[]} ignoredEvents 
     * @param {string} streamMode
     * @param {boolean} invert 
     */
    constructor(slug, timePeriod = {}, filters, ignoredEvents = [], streamMode, invert, countEvents, streamName, timeSinceLast){
        this.slug = slug;
        this.date = timePeriod.date;
        this.duration = timePeriod.duration;
        this.eventFilters = filters;
        this.ignoredEvents = ignoredEvents;
        this.streamMode = streamMode;
        this.streamName = streamName;
        this.invert = invert;
        this.countEvents = countEvents;
        this.timeSinceLast = timeSinceLast;
    }

    getURL(){
        let params = new URLSearchParams();
        params.set("event", this.slug);
        if (this.date){
            params.set("date", this.date);
        } else {
            params.set("duration", this.duration);
        }
        params.set("filters", this.eventFilters);
        params.set("ignoredEvents", this.ignoredEvents.join(","));
        params.set("streamMode", this.streamMode);
        if (this.streamName) params.set("streamName", this.streamName);
        if (this.invert) params.set("invert", "yes");
        if (this.countEvents) params.set("countEvents", "yes");
        if (this.timeSinceLast) params.set("timeSinceLast", "yes");

        return "?" + params.toString();
    }

    getDate(){
        if (this.date){
            return new Date(this.date);
        } else {
            let weeks = parseInt(this.duration);
            if (!Number.isInteger(weeks)) weeks = 1;
            let d = new Date();
            d.setDate(d.getDate() - weeks * 7);
            return d;
        }
    }

    static fromURL(string){
        let params = new URLSearchParams(string);
        let slug = params.get("event");
        slug = processEventIdentifier(slug);
        if (!slug){
            throw new RequestValidityError("Please specify a valid event URL. Go to the page of your event on start.gg and copy the content of the URL bar.");
        }
        let timePeriod = {
            date: params.get("date"),
            duration: params.get("duration")
        };
        if (!timePeriod.date && !timePeriod.duration){
            throw new RequestValidityError("Please specify a time period (either a starting date or a duration)");
        }
        let ignoredEventsStr = params.get("ignoredEvents");
        
        let streamName = params.get("streamName");
        if (streamName == "undefined" || streamName == "null" || !streamName) streamName = undefined;

        return new Request(slug, timePeriod,
            params.get("filters"),
            ignoredEventsStr ? ignoredEventsStr.split(/,/g).map(str => str.trim()).filter(str => !!str) : [],
            params.get("streamMode"),
            !!params.get("invert"),
            !!params.get("countEvents"),
            params.get("streamName"),
            !!params.get("timeSinceLast")
        );
    }

    /**
     * @param {Request} other 
     */
    compare(other){
        if (this.slug != other.slug || (this.date ? (this.date != other.date) : (this.duration != other.duration))){
            return false;
        } else if (
            this.eventFilters != other.eventFilters || 
            compareStrArray(this.ignoredEvents, other.ignoredEvents) || 
            this.streamMode != other.streamMode || 
            this.streamName != other.streamName ||
            this.invert != other.invert ||
            this.countEvents != other.countEvents ||
            this.timeSinceLast != other.timeSinceLast
        ){
            return 1
        }
        return true;
    }
}

export function getRequest(){
    let slug = document.querySelector("#event").value;

    slug = processEventIdentifier(slug);

    if (!slug){
        throw new RequestValidityError("Please enter a valid event URL. Go to the page of your event on start.gg and copy the content of the URL bar.");
    }

    let timePeriod = {};
    if (document.querySelector(".time-inputs-container #duration-mode").checked){
        timePeriod.duration = document.querySelector(".time-inputs-container .weeksInput").value;
    } else {
        let dateString = document.querySelector(".time-inputs-container .dateInput").value;
        if (!dateString){  
            throw new RequestValidityError("Please select a date.");
        }
        timePeriod.date = dateString;
    }
    let streamMode = document.querySelector("#stream-mode").value;
    let streamName = streamMode.includes("stream") ? document.querySelector("#stream-name").value : undefined;

    return new Request(slug, timePeriod, 
        document.querySelector(".input.event-filters").value, 
        window.currentIgnoredEvents,
        streamMode,
        document.querySelector("#invert-mode").checked,
        document.querySelector("#event-count-mode").checked, 
        streamName,
        document.querySelector("#time-since-last").checked
    );
}
window.getRequest = getRequest;

//TODO : add more precise error messages for invalid event slug

function numberInputOnChange(el){
    if (el.value != "") {
        if (el.min && parseInt(el.value) < parseInt(el.min)) {
          el.value = el.min;
        }
        if (el.max && parseInt(el.value) > parseInt(el.max)) {
          el.value = el.max;
        }
      } 
}

function radioButtonOnChanged(element){
    handleRadioButtons(element.id);
}

export function handleRadioButtons(selected){
    document.querySelectorAll(".time-inputs-container .timeInput").forEach(el => el.disabled = true);
    document.querySelector(`#${selected}-container .timeInput`).disabled = false;
}

export function handleSelectedRadioButton(){
    let selected = getSelectedRadioButton();
    if (selected){
        handleRadioButtons(selected.id);
    }
}

function getSelectedRadioButton(){
    return document.querySelector('input[name="periodMode"]:checked');
}

function auto_grow(element) {
    if (!element.base_height){
        element.base_height = element.clientHeight;
    }

    element.style.height = "5px";
    element.style.height = (Math.max(element.scrollHeight, element.base_height)) + "px";
}

function GO(goCallback){
    let req;
    try {
        req = getRequest();
        goCallback(req);
    } catch (err){
        if (err instanceof RequestValidityError){
            alert(err.message);
        } else {
            throw err;
        }
    }
}

export function initDropdownSection(className){
    let innerClassName = `.${className}-inner`;
    hide(innerClassName);
    let isDisplayed = false;
    document.querySelector(`.${className} .dropdown_button_container`).addEventListener("click", function() {
        if (isDisplayed){
            isDisplayed = false;
            hide(innerClassName);
            this.classList.remove("open")
        } else {
            isDisplayed = true;
            show(innerClassName);
            this.classList.add("open")
        }
    })
}

/**
 * 
 * @param {(req: Request) => void} goCallback 
 */
export function init(goCallback){
    window.numberInputOnChange = numberInputOnChange;
    window.radioButtonOnChanged = radioButtonOnChanged;
    window.auto_grow = auto_grow;

    handleSelectedRadioButton();

    initDropdownSection("event-filters-container");
    initDropdownSection("display-options-container");

    document.querySelector("#GO").addEventListener("click", () => {
        GO(goCallback);
    });
    document.querySelector(".form-column").addEventListener("keydown", function(event){
        if (event.key == "Enter"){
            event.preventDefault();
            GO(goCallback);
        }
    });

    const streamNameElement = document.querySelector(".stream-name-container");
    document.querySelector("#stream-mode").addEventListener("change", (event) => {
        const newValue = event.target.value;
        if (newValue.includes("stream")){
            showElement(streamNameElement);
        } else {
            hideElement(streamNameElement);
        }
    })

    document.querySelectorAll(".dateInput").forEach(el => el.max = new Date().toISOString().split("T")[0]);
}