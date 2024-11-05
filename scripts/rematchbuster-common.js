import { hide, show } from "./lib/DOMUtil.js";
import { compareStrArray, processEventSlug } from "./lib/util.js";

export class RequestValidityError extends Error {}

export class Request {
    /**
     * @param {string} slug 
     * @param {{date?: number, duration?: number}} timePeriod 
     * @param {string} filters 
     * @param {string[]} ignoredEvents 
     */
    constructor(slug, timePeriod = {}, filters, ignoredEvents = []){
        this.slug = slug;
        this.date = timePeriod.date;
        this.duration = timePeriod.duration;
        this.eventFilters = filters;
        this.ignoredEvents = ignoredEvents;
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
        slug = processEventSlug(slug);
        if (!slug){
            throw new RequestValidityError("Please specify a valid event URL. Go to the page of your event on start.gg and copy the content of the URL bar.");
        }
        console.log(slug);
        let timePeriod = {
            date: params.get("date"),
            duration: params.get("duration")
        };
        if (!timePeriod.date && !timePeriod.duration){
            throw new RequestValidityError("Please specify a time period (either a starting date or a duration)");
        }
        let filters = params.get("filters");
        let ignoredEventsStr = params.get("ignoredEvents");

        return new Request(slug, timePeriod, filters, 
            ignoredEventsStr ? ignoredEventsStr.split(/,/g).map(str => str.trim()).filter(str => !!str) : []
        );
    }

    /**
     * @param {Request} other 
     */
    compare(other){
        if (this.slug != other.slug || (this.date ? (this.date != other.date) : (this.duration != other.duration))){
            return false;
        } else if (this.eventFilters != other.eventFilters || compareStrArray(this.ignoredEvents, other.ignoredEvents)){
            return 1
        }
        return true;
    }
}

function getRequest(){
    let slug = document.querySelector("#event").value;

    slug = processEventSlug(slug);

    if (!slug){
        throw new RequestValidityError("Please enter a valid event URL. Go to the page of your event on start.gg and copy the content of the URL bar.");
    }

    let timePeriod = {};
    if (document.querySelector(".time-inputs-container #duration-mode").checked){
        timePeriod.duration = document.querySelector(".time-inputs-container .weeksInput").value;
        console.log(timePeriod.duration);
    } else {
        let dateString = document.querySelector(".time-inputs-container .dateInput").value;
        if (!dateString){  
            throw new RequestValidityError("Please select a date.");
        }
        timePeriod.date = dateString;
        console.log(timePeriod.date)
    }

    let filters = document.querySelector(".input.event-filters").value;
    let ignoredEvents = window.currentIgnoredEvents;
    return new Request(slug, timePeriod, filters, ignoredEvents);
}

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
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
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

    let isEventFilterContainerDisplayed = false;
    hide(".event-filters-container-inner");
    document.querySelector(".event-filters-container .dropdown_button_container").addEventListener("click", function() {
        console.log(this.classList);
        if (isEventFilterContainerDisplayed){
            isEventFilterContainerDisplayed = false;
            hide(".event-filters-container-inner");
            this.classList.remove("open")
        } else {
            isEventFilterContainerDisplayed = true;
            show(".event-filters-container-inner");
            this.classList.add("open")
        }
    })

    document.querySelector("#GO").addEventListener("click", () => {
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
        
        
    });

    document.querySelectorAll(".dateInput").forEach(el => el.max = new Date().toISOString().split("T")[0]);
}