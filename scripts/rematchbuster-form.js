import { init } from "./rematchbuster-common.js";

init(req => {
    window.location.assign("../rematchbuster.html?" + req.getURL());
});