const slugRegex = /(tournament\/[^\/]*\/event\/[^\/]*)/g;
const IDRegex = /tournament\/[^\/]*\/(?:event-edit|brackets|seeding)\/([0-9]*)/g;
const IDAloneRegex = /^([0-9]+)$/g

export class EventIdentifier{
    /** @param {string} value  */
    constructor(value) {this.value = value}
    getURLProperty(){return this.constructor.propertyName + "=" + this.value}
    getRawGraphQLVariables(){}
    getGraphQLVariables(obj){return obj ? Object.assign(obj, this.getRawGraphQLVariables()) : this.getRawGraphQLVariables()}
    toString(){return this.value}
}

export class Slug extends EventIdentifier {
    constructor(slug){super(slug)}
    static propertyName = "eventSlug";
    getRawGraphQLVariables(){return {slug: this.value, id: null}}
    toReadableString(){return "<Slug: " + this.value + ">"}
}

export class ID extends EventIdentifier {
    constructor(id){super(id)}
    static propertyName = "eventID";
    getRawGraphQLVariables(){return {slug: null, id: this.value}}
    toReadableString(){return "<ID: " + this.value + ">"}
}

/**
 * 
 * @param {string?} slug 
 * @returns 
 */
export function processEventIdentifier(slug){
    if (!slug) return null;

    let res = slugRegex.exec(slug);
    if (res) return new Slug(res[1]);

    res = IDRegex.exec(slug);
    if (res) return new ID(res[1]);

    res = IDAloneRegex.exec(slug);
    if (res) return new ID(res[1]);

    return null;
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

function isIterable(value){
    return value?.[Symbol.iterator];
}

/**
 * @param {string} str 
 * @returns 
 */
export function escapeHTML(str){
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

/**
 * Wraps a string 
 * - that might contain HTML tags
 * - where all user-provided text has been properly HTML-escaped  
 * 
 * It is returned by the {@link htmlT} template function  
 * 
 * **Usage** : create a HtmlString for all strings that either contains user-provided data OR might be used in an htmlT template later.  
 * Create instances using 
 * - htmlT whenever what you need is a template
 * - HtmlString.fromEscaped for strings created from user data
 * - new HtmlString for static strings
 */
export class HtmlString { 
    //chatGPT made me overengineer this but for the record I out-good-practiced it with my initial idea

    /**
     * @param {string} html string wrapped by this HtmlString ; it is TAKEN AS-IS, so use this constructor only with trusted text
     */
    constructor(html = ""){
        this.html = html;
    }

    /**
     * Creates a new HtmlString from any data, following the same rules as {@link append}
     * @param {any} value 
     * @returns 
     */
    static from(...values){
        return (new HtmlString).appendIterable(values);
    }

    /**
     * Creates a new HtmlString from non-trusted data, escaping it
     * @param {string} value 
     * @returns 
     */
    static fromEscaped(value){
        return new HtmlString(escapeHTML(String()))
    }

    /**
     * Appends each element of an iterable value
     * @param {Iterable<any>} value 
     */
    appendIterable(value){
        for (const subValue of value){
            this.append(subValue);
        }

        return this;
    }

    /**
     * Appends a value to the string.  
     * - HtmlStrings have their content appended directly, as they already contain html-safe text
     * - strings and other non-iterable values are escaped then appended
     * - iterable values have their elements appended individualy in order
     * @param {any} value 
     * @returns 
     */
    append(value){
        if (value instanceof HtmlString){
            this.html += value.html;
        } else if (typeof value === "string"){
            this.html += escapeHTML(value);
        } else if (isIterable(value)){
            this.appendIterable(value)
        } else {
            this.html += escapeHTML(String(value));
        }

        return this;
    }

    concat(...values){
        return new HtmlString(this.html).appendIterable(values);

    }

    toString(){return this.html}
}

/**
 * Tagged Template Function returning an {@link HtmlString}. Expressions are inserted using {@link HtmlString.append}
 * @param {string[]} strings 
 * @param  {...any} values 
 */
export function htmlT(strings, ...values){
    let res = new HtmlString;

    for (let i = 0; i < values.length; i++){
        res.html += strings[i];
        res.append(values[i]);
    }

    res.html += strings[values.length];

    return res;
}