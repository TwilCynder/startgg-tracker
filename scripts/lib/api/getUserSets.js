import queryManager from "../queryManager.js";

const schema_filename = "./schemas/PlayerSets.graphql"

export async function getUserSetsFactory(){
    let query = await queryManager.tryQuery("playerSets", new URL(schema_filename, import.meta.url));

    return async function getUserSets(id, after, client, limiter){
        /** @type {Object[]} */
        let sets = await query.executePaginated(client, {id, after}, "player.sets", limiter, {
            perPage: 80
        });

        if (!sets){
            console.log("Invalid response :", sets);
            return null;
            //throw new Error("Couldn't fetch sets from " + id + " ; invalid response (might indicate non-existent user)");
        }

        return sets;
    }
}