/**
 * 
 * @param {string} slug 
 * @returns 
 */
export function processEventSlug(slug){
    let split = slug.split("start.gg/");
    slug = (split.length == 2) ? split[1] : split[0]
    split = slug.split(/\//)
    if (split[0] != "tournament" || split[2] != "event" || split.length < 4){
        return false;
    }

    slug = split.slice(0, 4).join("/");
    return slug;
}