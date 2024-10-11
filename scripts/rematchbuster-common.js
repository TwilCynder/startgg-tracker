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
}

export function getRequest(){
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
            throw new RequestValidityError("Please select a date");
        }
        timePeriod.date = new Date(dateString);
        console.log(timePeriod.date)
    }

}

//TODO : add more precise error messages for invalid event slug