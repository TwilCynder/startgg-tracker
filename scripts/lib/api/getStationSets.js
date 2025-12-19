import queryManager from "../queryManager.js";

const schema_filename = "./schemas/StationsSets.graphql";

export async function getStationSetsFactory(){
    let query = await queryManager.tryQuery("stationSets", new URL(schema_filename, import.meta.url));

    return async function getStationSets(slug, client){
        let response = await query.executePaginated(client, {slug}, "event.sets", null, {}, false)

        if (!response || !response.event){
            throw new Error("Couldn't fetch sets from " + slug + " ; invalid response (might indicate non-existent event ; check the URL)");
        }

        return response.event;
    }
}
