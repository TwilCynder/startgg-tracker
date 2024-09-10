import { getEventEntrantsFactory } from "./lib/api/getEntrants.js";
import { getSetsFactory } from "./lib/api/getSets.js";
import { SGGHelperClient, StartGGDelayQueryLimiter } from "./lib/api/sgg-helper.js";
import { get_rematches } from "./lib/check_rematches.js";


let token = localStorage.getItem("token");
let client = new SGGHelperClient("Bearer " + token);
let limiter = new StartGGDelayQueryLimiter();

get_rematches(client, "tournament/tls-mad-ness-29/event/1v1-ultimate", 
    []
)