import { PresentableError } from "../error.js";
import queryManager from "../queryManager.js";

const schema_filename = "./schemas/GetCalledSets.graphql"

export async function getCalledSetsFactory(){
    let query = await queryManager.tryQuery("calledSets", new URL(schema_filename, import.meta.url));
    
    return async function getCalledSets(slug, client){
        let response = await query.execute(client, {slug})

        if (!response || !response.event){
            throw new PresentableError("Couldn't fetch sets from " + slug + " ; invalid response (might indicate non-existent event ; check the URL)");
        }

        return response.event;
    }
}