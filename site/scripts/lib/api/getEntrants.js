import { PresentableError } from "../error.js";
import queryManager from "../queryManager.js";
import { EventIdentifier } from "../util.js";

const schema_filename = "./schemas/EventEntrants.graphql";


export async function getEventEntrantsFactory(){
    let query = await queryManager.tryQuery("eventEntrants", new URL(schema_filename, import.meta.url));

    /**
     * @param {EventIdentifier} eventIdentifier
     * @param {Client} client
     * @param {TimedQuerySemaphore} limiter
     */
    return async function getEventEntrants(eventIdentifier, client, limiter){
        /** @type {Object[]?} */
        let result = await query.executePaginated(client, eventIdentifier.getGraphQLVariables(), "event.entrants", limiter, {
            perPage: 200
        });
        
        if (!result){
            throw new PresentableError("Couldn't fetch sets from " + eventIdentifer.toReadableString() + " ; invalid response (might indicate non-existent event ; check the URL)");
        }

        return result;
    }
}