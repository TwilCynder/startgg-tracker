import { getEventEntrantsFactory } from "./lib/api/getEntrants.js";
import { SGGHelperClient } from "./lib/api/sgg-helper.js";

const getEventEntrants = await getEventEntrantsFactory();

let token = localStorage.getItem("token");
let client = new SGGHelperClient("Bearer " + token);

console.log(await getEventEntrants("tournament/tls-mad-ness-29/event/1v1-ultimate", client));