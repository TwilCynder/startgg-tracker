import { requestStartGG } from "./request.js"

const schema_filename = "./schemas/GetCalledSets.graphql"
const default_tries = 3;

export async function getCalledSetsFactory(){
    let schema = await fetch(new URL(schema_filename, import.meta.url))
        .then(res => res.text())

    return async function getCalledSets(slug, token){
        let response = await requestStartGG(schema, {slug}, token);

        console.log(response)

        if (!response || !response.data || !response.data.event){
            throw new Error("Couldn't fetch sets from " + slug + " ; invalid response (might indicate non-existent event) : " + response)
        }

        return response.data.event;
    }
}

export async function fetchSetsFactory(max_tries = default_tries){
    let getCalledSets = await getCalledSetsFactory();

    async function fetchSets_(slug, token, tries){
        try {
            return await getCalledSets(slug, token);
        } catch (e) {
            console.warn("FetchSets failed with", e)
            if (tries > max_tries){
                console.error("Too many retries !")
                return {}
            }
            return fetchSets_(eventSlug, tries ? tries + 1 : 1)
        }
    }

    return function fetchSets(slug, token){
        return fetchSets_(slug, token);
    }

}