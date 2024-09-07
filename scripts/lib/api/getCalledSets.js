import { loadQuery, Query } from "./sgg-helper.js"

const schema_filename = "./schemas/GetCalledSets.graphql"
const default_tries = 3;

export async function getCalledSetsFactory(maxTries = default_tries){
    let query = await loadQuery(new URL(schema_filename, import.meta.url), maxTries);

    return async function getCalledSets(slug, client){
        let response = await query.execute(client, {slug})

        console.log(response)

        if (!response || !response.data || !response.data.event){
            throw new Error("Couldn't fetch sets from " + slug + " ; invalid response (might indicate non-existent event) : " + response)
        }

        return response.data.event;
    }
}