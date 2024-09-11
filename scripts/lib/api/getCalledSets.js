import queryManager from "../queryManager.js";

const schema_filename = "./schemas/GetCalledSets.graphql"

export async function getCalledSetsFactory(){
    let query = await queryManager.tryQuery("calledSets", new URL(schema_filename, import.meta.url));
    
    return async function getCalledSets(slug, client){
        let response = await query.execute(client, {slug})

        console.log(response)

        if (!response || !response.event){
            throw new Error("Couldn't fetch sets from " + slug + " ; invalid response (might indicate non-existent event)");
        }

        return response.event;
    }
}