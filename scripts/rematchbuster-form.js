import { show } from "./lib/DOMUtil.js";
import { handleRadioButtons, init } from "./rematchbuster-common.js";

init(req => {
    window.location.assign("./rematchbuster.html" + req.getURL());
});
document.querySelector(".time-inputs-container #duration-mode").checked = true;
if (document.querySelector("#stream-mode").value.includes("stream")){
    show(".stream-name-container");
}
handleRadioButtons("duration-mode");