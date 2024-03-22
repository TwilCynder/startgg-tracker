import { Client, Query } from "./request.js";

/**
 * Tests whether a given token is valid.
 * @returns 
 */
export async function testTokenFactory(){
    let test_query = await Query.load(new URL("./schemas/DummyRequest.graphql", import.meta.url));

    /**
     * @param {string} token
     * @return {number} 
     *  0 = success  
     *  1 = nothing returned : API error  
     *  2 = invalid token
     */
    return (async function testToken(token){
        let res = await test_query.execute(new Client("Bearer " + token));

        console.log(res)

        if (!res) return 1;
        if (res.data){
            return 0;
        } else {
            if (res.message == "Invalid authentication token"){
                return 2;
            } else {
                return 1;
            }
        }
    })
}