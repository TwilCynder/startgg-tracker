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