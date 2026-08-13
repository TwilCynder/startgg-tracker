import { PresentableError } from "../error.js";
import queryManager from "../queryManager.js";

const schema_filename = "./schemas/StationSets.graphql";

export async function getStationSetsFactory(){
    let query = await queryManager.tryQuery("stationSets", new URL(schema_filename, import.meta.url));

    return async function getStationSets(eventIdentifier, client, progressionCallback){
        let sets = await query.executePaginated(client, eventIdentifier.getGraphQLVariables({perPage: 50}), "event.sets", null, {callback: (_l, _c, currentPage, totalPages) => progressionCallback && progressionCallback(currentPage, totalPages)}, false)

        if (!sets){
            throw new PresentableError("Couldn't fetch sets from " + eventIdentifier.toReadableString() + " - it seems that the event doesn't exist, check the URL");
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

        let streams = {}
        for (const set of sets){
            if (set.stream && set.stream.streamName){
                const id = set.stream.streamName;
                if (streams[id]){
                    streams[id].push(set);
                } else {
                    streams[id] = [set];
                }
            }
        }

        return {stations, streams};
    }
}
