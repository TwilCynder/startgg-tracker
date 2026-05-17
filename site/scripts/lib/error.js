export class PresentableError extends Error {
    constructor(...args){
        super(...args);
    }
}

export function presentError(err){
    if (err instanceof PresentableError){
        alert(err);
    }
    console.error(err);
}