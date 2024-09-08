import { getEventEntrantsFactory } from "./lib/api/getEntrants.js";
import { getSetsFactory } from "./lib/api/getSets.js";
import { SGGHelperClient, StartGGDelayQueryLimiter } from "./lib/api/sgg-helper.js";

const getEventEntrants = await getEventEntrantsFactory();
const getSets = await getSetsFactory();

let token = localStorage.getItem("token");
let client = new SGGHelperClient("Bearer " + token);
let limiter = new StartGGDelayQueryLimiter();

console.log(await getEventEntrants("tournament/tls-mad-ness-29/event/1v1-ultimate", client));
console.log(await Promise.all(
    [1, 2, 3, 4]
    .map(n => `tournament/tls-mad-ness-${n}/event/1v1-ultimate`)
    .map(slug => getSets(slug, client, limiter))
));