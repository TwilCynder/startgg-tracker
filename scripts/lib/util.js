/**
 * 
 * @param {string} slug 
 * @returns 
 */
export function processEventSlug(slug){
    if (!slug) return slug;
    slug = slug.replace("/events/", "/event/");
    let split = slug.split("start.gg/");

    slug = (split.length == 2) ? split[1] : split[0]
    split = slug.split(/\//)
    if (split[0] != "tournament" || (split[2] != "event" && split[2] != "events") || split.length < 4){
        return false;
    }

    slug = split.slice(0, 4).join("/");
    return slug;
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

    for (var i=0, len=path.length; i<len; i++){
        if (obj == undefined || obj == null) return def;
        obj = obj[path[i]];
    };
    return obj;
};

/**
 * @param {string[]} arr1 
 * @param {string[]} arr2 
 * @returns 
 */
export function compareStrArray(arr1, arr2){
    return arr1.length == arr2.length && arr1.every((elt, index) => elt == arr2[index]);
}