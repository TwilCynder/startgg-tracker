import { deep_get } from "../util.js";
import { loadQuery } from "./sgg-helper.js";

const schema_filename = "./schemas/EventEntrants.graphql";
const default_tries = 3;



export async function getEventEntrantsFactory(maxTries = default_tries){
    let query = await loadQuery(new URL(schema_filename, import.meta.url), maxTries);

    return async function getEventEntrants(slug, client, limiter){
        let response = await query.execute(client, {slug}, limiter);
        let result = deep_get(response, "event.entrants.nodes");
        if (!result){
            throw new Error("Couldn't fetch events from " + slug + " ; invalid response (might indicate non-existent event) : " + JSON.stringify(response))
        }

        return result;
    }
}