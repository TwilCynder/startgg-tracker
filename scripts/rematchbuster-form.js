import { handleRadioButtons, init } from "./rematchbuster-common.js";

init(req => {
    window.location.assign("./rematchbuster.html?" + req.getURL());
});
document.querySelector(".time-inputs-container #duration-mode").checked = true;
handleRadioButtons("duration-mode");