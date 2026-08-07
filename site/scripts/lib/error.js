export class PresentableError extends Error {
    constructor(...args){
        super(...args);
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