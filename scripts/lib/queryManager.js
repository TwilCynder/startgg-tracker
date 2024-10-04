import { loadQuery } from "./api/sgg-helper.js";

const DEFAULT_TRIES = 3;

export class QueryManager {
    /**
     * @type {{[name: string]: Query}}
     */
    #queries = {}

    /**
     * @param {string} name 
     * @param {string} filename 
     * @param {number} tries 
     * @returns 
     */
    async tryQuery(name, filename, tries = DEFAULT_TRIES){
        let query = this.#queries[name];
        if (!query){
            query = await loadQuery(filename, tries);
        }
        return query;
    }
}

export default (new QueryManager);