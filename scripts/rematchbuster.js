import { getEventEntrantsFactory } from "./lib/api/getEntrants.js";
import { getSetsFactory } from "./lib/api/getSets.js";
import { getUserSetsFactory } from "./lib/api/getUserSets.js";
import { SGGHelperClient, StartGGDelayQueryLimiter } from "./lib/api/sgg-helper.js";
import { get_rematches } from "./lib/check_rematches.js";

const getUserSets = await getUserSetsFactory();

let token = localStorage.getItem("token");
let client = new SGGHelperClient("Bearer " + token);
let limiter = new StartGGDelayQueryLimiter();

await get_rematches(client, "tournament/tls-mad-ness-29/event/1v1-ultimate", 1722513915, limiter);
//1722513915
//2863f841