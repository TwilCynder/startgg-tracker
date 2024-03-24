export function FitText(target) {
    document.fonts.ready.then(() => {
        if (target == null) return;
        if (target.css("font-size") == null) return;
        if (target.css("width") == null) return;
    
        let textElement = target.find(".text");
        //RegisterFit(target);
    
        if (textElement.text().trim().toLowerCase() == "undefined") {
            textElement.html("");
        }
    
        textElement.css("transform", "");
        let scaleX = 1;
    
        if (textElement[0].scrollWidth * scaleX > target.width()) {
            scaleX = target.width() / textElement[0].scrollWidth;
            textElement.css("transform", "scaleX(" + scaleX + ")");
        }
    });
}

function showElement(element){
    element.style.setProperty(`display`, "flex");
    element.style.setProperty('opacity', "100%");
}

export function hide(elementName){
    let element = document.querySelector(elementName);
    
    element.style.setProperty(`display`, "none");
    element.style.setProperty('opacity', "0");
}

export function show(elementName){
    let element = document.querySelector(elementName);

    showElement(element);
}

export function showNotif(content){
    let element = document.querySelector(".notif-bar");
    element.innerHTML = content;
    showElement(element);
}

export function hideNotif(){
    hide(".notif-bar")
}
