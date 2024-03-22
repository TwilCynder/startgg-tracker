/**
 * 
 * @param {string} schema 
 * @param {{[varName: string]: value}} variables 
 * @param {string} token 
 * @returns 
 */
export function requestStartGG(schema, variables, token){
    return fetch('https://api.start.gg/gql/alpha', {         
            method: 'POST',         
            headers: {             
                'Content-Type': 'application/json',             
                'accept' : 'application/json',             
                'Authorization' : token         
            },         
            body: JSON.stringify({
                'query': schema,
                'variables' : variables
            }),  
            
        })     
            .then((response) => response.json()) 
}

export class Client {
    #token;

    /**
     * 
     * @param {string} token 
     */
    constructor(token){
        this.#token = token;
    }

    request(schema, variables){
        return requestStartGG(schema, variables, this.#token);
    }
}

export class Query {
    #schema;
    #maxTries;

    /**
     * 
     * @param {string} schema 
     * @param {number?} maxTries 
     */
    constructor (schema, maxTries = null){
        this.#schema = schema;
        this.#maxTries = maxTries;
    }

    static async load(url, maxTries = null){
        try {
            let schema = await fetch(url)
                .then(res => res.text())
            return new Query(schema, maxTries);
        } catch (err){
            throw new Error("Failed to load query from GraphQL file. Reason : " + err);
        }
    }

    /**
     * 
     * @param {string} logName 
     * @param {{[varName: string]: value}} params 
     * @returns 
     */
    #getLog(logName, params){
        if (!this.log) return null;
        let log = this.log[logName];
        if (log){
            if (typeof log == "string"){
                return log;
            } else if (typeof log == "function"){
                return log(params);
            }
        }
        return null;
    }

    /**
     * 
     * @param {Client} client 
     * @param {{[varName: string]: value}} params 
     * @param {number} tries How many tries in are we 
     * @param {boolean} silentErrors 
     * @param {number} maxTries Overrides this.#maxTries
     * @returns 
     */
    async #execute_(client, params, tries, silentErrors = false, maxTries = null){
        maxTries = maxTries || this.#maxTries || 1

        console.log(this.#getLog("query", params) || "Querying ..." + " Try " + (tries + 1));
        try {
            let data = await (client.request(this.#schema, params));
            
            return data;
        } catch (e) {
            
            if (tries >= maxTries) {
                console.error("Maximum number of tries reached. Throwing.", e);
                throw e;
            }
            console.error((this.#getLog("error", params) || "Request failed.") + ` Retrying (try ${tries + 1}). Error : `, e);
            return this.#execute_(client, params, tries + 1, silentErrors, maxTries);
        }
    }

    /**
     * Executes the query with given parameters and client
     * @param {Client} client 
     * @param {{[varName: string]: value}} params 
     * @param {boolean} silentErrors 
     * @param {number} maxTries Overrides the default maximum tries count for this query
     * @returns 
     */
    async execute(client, params, silentErrors = false, maxTries = null){
        return await this.#execute_(client, params, 0, silentErrors, maxTries);
    }

    /**
     * Executes a query containing a paginated collection, repeatedly, increasing the page index each time until nothing is returned, returning an aggregation of all the pages.
     * @param {Client} client 
     * @param {{[varName: string]: value}} params 
     * @param {string} collectionPathInQuery JSON path to the paginated collection that must aggregated in the query (JSON path : property names separated by dots)
     * @param {number} delay Adds a delay between calls
     * @param {string} pageParamName Name of the query parameter that must be updated with a page index for each query
     * @param {boolean} silentErrors 
     * @param {number} maxTries 
     * @returns 
     */
    async executePaginated(client, params, collectionPathInQuery, delay = null, pageParamName = "page", silentErrors = false, maxTries = null){
        let result = [];

        params = Object.assign({}, params);
        params[pageParamName] = 1;

        while (true){
            let data = await this.execute(client, params, silentErrors, maxTries);

            if (!data) throw this.#getLog("error", params) || "Request failed." + "(in paginated execution, at page " + params[pageParamName] + ")";

            let localResult = deep_get(data, collectionPathInQuery);

            if (!localResult) throw `The given path ${collectionPathInQuery} does not point to anything.`
            if (!localResult.push) throw "The given path does not point to an array."

            if (localResult.length < 1) break;

            result = result.concat(localResult);
            params[pageParamName]++;

            if (delay)
                await new Promise(r => setTimeout(r, delay));
        }

        return result;
    }
}