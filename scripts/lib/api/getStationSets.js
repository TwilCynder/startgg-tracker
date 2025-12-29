import queryManager from "../queryManager.js";

const schema_filename = "./schemas/StationSets.graphql";

export async function getStationSetsFactory(){
    let query = await queryManager.tryQuery("stationSets", new URL(schema_filename, import.meta.url));

    return async function getStationSets(slug, client){
        let sets = await query.executePaginated(client, {slug}, "event.sets", null, {}, false)

        if (!sets){
            throw new Error("Couldn't fetch sets from " + slug + " ; invalid response (might indicate non-existent event ; check the URL)");
        }

        let stations = {"unknown": []};
        for (const set of sets){
            if (set.station){
                const id = set.station.number;
                if (stations[id]){
                    stations[id].push(set);
                } else {
                    stations[id] = [set];
                }
            } else {
                stations.unknown.push(set);
            }
        }

        return stations;
    }
}
