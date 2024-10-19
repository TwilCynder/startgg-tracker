import { processEventSlug } from "./lib/util.js";

export class RequestValidityError extends Error {}

export class Request {
    constructor(slug, timePeriod = {}){
        this.slug = slug;
        this.date = timePeriod.date;
        this.duration = timePeriod.duration;
    }

    getURL(){
        let params = new URLSearchParams();
        params.set("event", this.slug);
        if (this.date){
            params.set("date", this.date);
        } else {
            params.set("duration", this.duration);
        }

        return params.toString();
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
    
        return new Request(slug, timePeriod);
    }
}

function getRequest(){
    let slug = document.querySelector("#event").value;
    slug = processEventSlug(slug);
    if (!slug){
        throw new RequestValidityError("Please enter a valid event URL. Go to the page of your event on start.gg and copy the content of the URL bar.");
    }
    console.log(slug);
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

    return new Request(slug, timePeriod);
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

/**
 * 
 * @param {(req: Request) => void} goCallback 
 */
export function init(goCallback){
    window.numberInputOnChange = numberInputOnChange;
    window.radioButtonOnChanged = radioButtonOnChanged;

    handleSelectedRadioButton();

    document.querySelector("#GO").addEventListener("click", () => {
        let req;
        try {
            req = getRequest();
            goCallback(req);
        } catch (err){
            if (err instanceof RequestValidityError){
                alert(err.message);
            }
        }
        
        
    });

    document.querySelectorAll(".dateInput").forEach(el => el.max = new Date().toISOString().split("T")[0]);
}