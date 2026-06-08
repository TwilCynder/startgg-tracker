import { SGGHelperClient, loadQuery } from "./sgg-helper.js";
import queryManager from "../queryManager.js";

/**
 * Tests whether a given token is valid.
 * @returns 
 */
export async function testTokenFactory(){
    let query = await queryManager.tryQuery("testToken", new URL("./schemas/DummyRequest.graphql", import.meta.url));

    /**
     * @param {string} token
     * @return {number} 
     *  0 = success  
     *  1 = nothing returned : API error  
     *  2 = invalid token
     */
    return (async function testToken(token){
        try {
            let res = await query.execute(new SGGHelperClient("Bearer " + token));
            console.log(res);
            return 0;
        } catch (err){
            if(err.resBody && err.resBody.message == "Invalid authentication token"){
                return 1;
            } else {
                return 2;
            }
        }
    })
}