import { getRequest } from "./rematchbuster-common.js";

function numberInputOnChange(el){
    if (el.value != "") {
        if (el.min && parseInt(el.value) < parseInt(el.min)) {
          el.value = el.min;
        }
        if (el.max && parseInt(el.value) > parseInt(el.max)) {
          el.value = el.max;
        }
      } 
}


function radioButtonOnChanged(element){
    handleRadioButtons(element.id);
}

function handleRadioButtons(selected){
    document.querySelectorAll(".time-inputs-container .timeInput").forEach(el => el.disabled = true);
    document.querySelector(`#${selected}-container .timeInput`).disabled = false;
}

function getSelectedRadioButton(){
    return document.querySelector('input[name="periodMode"]:checked');
}

function init(){
    window.numberInputOnChange = numberInputOnChange;
    window.radioButtonOnChanged = radioButtonOnChanged;

    let selected = getSelectedRadioButton();
    if (selected){
        handleRadioButtons(selected.id);
    } else {
        document.querySelector(".time-inputs-container #duration-mode").checked = true;
        handleRadioButtons("duration-mode");
    }

    document.querySelector("#GO").addEventListener("click", () => {
        getRequest();
    });

    document.querySelectorAll(".dateInput").forEach(el => el.max = new Date().toISOString().split("T")[0])
}

init();