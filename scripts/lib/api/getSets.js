import queryManager from "../queryManager.js";

const schema_filename = "./schemas/EventSets.graphql"

export async function getSetsFactory(){
    let query = await queryManager.tryQuery("eventSets", new URL(schema_filename, import.meta.url));

    return async function getSets(slug, client, limiter){
        let sets = await query.executePaginated(client, {slug}, "event.sets.nodes", limiter);

        if (!sets){
            throw new Error("Couldn't fetch sets from " + slug + " ; invalid response (might indicate non-existent event)");
        }

        return sets;
    }
}