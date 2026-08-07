/**
 * @param {HTMLElement} element 
 */
export function FitText(element) {
    document.fonts.ready.then(() => {
        if (element == null) return;
        if (element.style.fontSize == null) return;
        if (element.style.width == null) return;
    
        let textElement = element.querySelector(".text");
    
        if (textElement.textContent.trim().toLowerCase() == "undefined") {
            textElement.html("");
        }
        
        textElement.style.transform = ""
        let w = element.getBoundingClientRect().width

        if (textElement.scrollWidth > w) {
            let scaleX = w / textElement.scrollWidth;
            textElement.style.transform = "scaleX(" + scaleX + ")"
        }
    });
}

export function showElement(element){
    element.style.setProperty(`display`, "flex");
    element.style.setProperty('opacity', "100%");
}

export function show(elementName){
    let element = document.querySelector(elementName);
    if (element) showElement(element);
}

export function hideElement(element){
    element.style.setProperty(`display`, "none");
    element.style.setProperty('opacity', "0");
}

export function hide(elementName){
    let element = document.querySelector(elementName);
    if (element) hideElement(element);
}

/**
 * @param {HTMLElement} element 
 * @param {string} className 
 */
export function toggleClass(element, className){
    let classList = element.classList;
    if (classList.contains(className)){
        classList.remove(className);
    } else {
        classList.add(className);
    }
}

/** @type {NodeJS.Timeout}*/
let notif_timer = null;
function reset_notif_timer(){
    if (notif_timer){
        clearTimeout(notif_timer);
    }
}

export function showNotif(content){
    reset_notif_timer();
    let element = document.querySelector(".notif-bar");
    element.innerHTML = content;
    showElement(element);
}

export function showNotifTemp(content, timer){
    showNotif(content);
    notif_timer = setTimeout(hideNotif, timer);
}

export function hideNotif(){
    hide(".notif-bar")
}
