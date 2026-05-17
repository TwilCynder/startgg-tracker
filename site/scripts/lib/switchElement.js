export class SwitchElement {
    /**@type {Element} */
    #element;
    
    constructor(element){
        this.#element = element;
    }

    init(callback){
        const topText = this.#element.querySelector(".switch-text-top");
        const botText = this.#element.querySelector(".switch-text-bot");
        const button = this.#element.querySelector(".switch-button");
        button.addEventListener("click", () => {
            this.#element.classList.toggle("switch-checked");
            callback(this.#element.classList.contains("switch-checked"));
        })
        topText.addEventListener("click", () => {
            this.#element.classList.remove("switch-checked");
            callback(false);
        })
        botText.addEventListener("click", () => {
            this.#element.classList.add("switch-checked");
            callback(true);
        })
    }

    isChecked(){
        return this.#element.classList.contains("switch-checked");
    }
}