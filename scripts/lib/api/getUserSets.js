import queryManager from "../queryManager.js";

const schema_filename = "./schemas/UserSets.graphql"

export async function getUserSetsFactory(){
    let query = await queryManager.tryQuery("userSets", new URL(schema_filename, import.meta.url));

    return async function getUserSets(id, after, client, limiter){
        let sets = await query.executePaginated(client, {id, after}, "user.player.sets", limiter, {
            perPage: 90
        });

        if (!sets){
            throw new Error("Couldn't fetch sets from " + id + " ; invalid response (might indicate non-existent user)");
        }

        return sets;
    }
}