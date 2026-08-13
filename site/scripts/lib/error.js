export class PresentableError extends Error {
    constructor(...args){
        super(...args);
    }
}

export class RequestValidityError extends PresentableError {
    constructor(message, wrongValue){
        super ("Request validity error : " + message + " ; is the URL was not modified manually, this is a bug");
        this.wrongValue = wrongValue;
    }
}

export function presentError(err){
    console.error(err);
    let message = null;
    if (err instanceof PresentableError){
        message = err.message;
    } else {
        message = "Internal error";
    }
    
    alert(message);
    return message;
}