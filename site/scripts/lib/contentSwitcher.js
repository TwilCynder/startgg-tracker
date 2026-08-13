import { hideElement, showElement } from "./DOMUtil.js";
import { presentError } from "./error.js";

export class ContentSwitcher {
    #activeElement;
    constructor(activeElement){
        this.#activeElement = activeElement;
    }

    showElement(element){
        hideElement(this.#activeElement);
        showElement(element);
        this.#activeElement = element;
    }
}

export class LoadingContentManager extends ContentSwitcher {
    #content;
    #loading;
    #error;
    #errorText;
    constructor(){
        const loadingElement = document.querySelector(".loading-display-container.loading");
        super(loadingElement);
        this.#loading = loadingElement;
        this.#error = document.querySelector(".loading-display-container.loading-error");
        this.#errorText = document.querySelector(".loading-error-text");
        this.#content = document.querySelector(".content");
    }

    showLoading(){
        this.showElement(this.#loading);
    }

    showError(errorText){
        this.#errorText.textContent = errorText;
        this.showElement(this.#error);
    }

    showContent(){
        this.showElement(this.#content);
    }
}

export class LoadingContentManagerWithProgress extends LoadingContentManager {
    #loadingProgress;
    constructor(){
        super();
        this.#loadingProgress = document.getElementById("loading-progress");
    }

    setLoadingProgressText(text){
        this.#loadingProgress.textContent = text;
    }
}