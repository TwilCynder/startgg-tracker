import { getEventEntrantsFactory } from "./lib/api/getEntrants.js";
import { getSetsFactory } from "./lib/api/getSets.js";
import { getUserSetsFactory } from "./lib/api/getUserSets.js";
import { SGGHelperClient, StartGGDelayQueryLimiter } from "./lib/api/sgg-helper.js";
import { get_rematches } from "./lib/check_rematches.js";

const getUserSets = await getUserSetsFactory();

let token = localStorage.getItem("token");
let client = new SGGHelperClient("Bearer " + token);
let limiter = new StartGGDelayQueryLimiter();

console.log(await getUserSets("2863f841", 1722513915, client));

//1722513915
//2863f841