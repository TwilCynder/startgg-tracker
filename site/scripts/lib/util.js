const slugRegex = /(tournament\/[^\/]*\/event\/[^\/]*)/g;
const IDRegex = /tournament\/[^\/]*\/(?:event-edit|brackets|seeding)\/([0-9]*)/g;
const IDAloneRegex = /^([0-9]+)$/g

export class EventIdentifier{
    /** @param {string} value  */
    constructor(value) {this.value = value}
    getURLProperty(){return this.constructor.propertyName + "=" + this.value}
    toString(){return this.value}
}

export class Slug extends EventIdentifier {
    constructor(slug){super(slug)}
    static propertyName = "eventSlug";
    getGraphQLVariables(){return {slug: this.value, id: null}}
    toReadableString(){return "<Slug: " + this.value + ">"}
}

export class ID extends EventIdentifier {
    constructor(id){super(id)}
    static propertyName = "eventID";
    getGraphQLVariables(){return {slug: null, id: this.value}}
    toReadableString(){return "<ID: " + this.value + ">"}
}

/**
 * 
 * @param {string?} slug 
 * @returns 
 */
export function processEventIdentifier(slug){
    if (!slug) return slug;

    let res = slugRegex.exec(slug);
    if (res) return new Slug(res[1]);

    res = IDRegex.exec(slug);
    if (res) return new ID(res[1]);

    res = IDAloneRegex.exec(slug);
    if (res) return new ID(res[1]);

    return null;
}

/**
 * @param {URLSearchParams} searchParameters 
 */
export function getEventIdentifierFromParams(searchParameters){
    let id = searchParameters.get(ID.propertyName);
    let slug = searchParameters.get(Slug.propertyName);
    return id ? new ID(id) : slug ? new Slug(slug) : null;
}

export function deep_get_raw(obj, def, ...names){
    for (const name of names){
        if (obj == undefined || obj == null) return def;
        obj = obj[name];
    };
    return obj;
}

/**
 * 
 * @param {{}} obj 
 * @param {string} path 
 * @param {*} def 
 * @returns 
 */
export function deep_get(obj, path, def = null){
    //https://stackoverflow.com/a/8817473
    path = path=path.split('.');
    for (let i = 0; i < path.length; i++){
        if (/^\d/.test(path[i])){
            let n = parseInt(path[i]);
            if (!isNaN){
                path[i] = n;
            }
        }
    }

    return deep_get_raw(obj, def, path);
};

/**
 * @param {string[]} arr1 
 * @param {string[]} arr2 
 * @returns 
 */
export function compareStrArray(arr1, arr2){
    return arr1.length == arr2.length && arr1.every((elt, index) => elt == arr2[index]);
}

/**
 * @param {Date} date 
 */
export function getDaysInDate(date){
    return date.getTime() / 86400000; //1000 * 3600 * 24
}


export function getDaysSinceTimestamp(timestamp){
    return getDaysInDate(new Date(Date.now() - timestamp * 1000))
}