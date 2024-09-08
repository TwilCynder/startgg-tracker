import { loadQuery } from "./sgg-helper.js"

const schema_filename = "./schemas/EventSets.graphql"
const default_tries = 3;

export async function getSetsFactory(maxTries = default_tries){
    let query = await loadQuery(new URL(schema_filename, import.meta.url), maxTries);

    return async function getSets(slug, client, limiter){
        let sets = await query.executePaginated(client, {slug}, "event.sets.nodes", limiter);

        if (!sets){
            throw new Error("Couldn't fetch sets from " + slug + " ; invalid response (might indicate non-existent event)");
        }

        return sets;
    }
}