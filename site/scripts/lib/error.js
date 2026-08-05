export class PresentableError extends Error {
    constructor(...args){
        super(...args);
    }
}

export function presentError(err){
    console.error(err);
    if (err instanceof PresentableError){
        alert(err.message);
    } else {
        alert("Internal error");
    }
    
}