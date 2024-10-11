import ejs from "ejs";
import fs from "node:fs";

async function renderFile(template){
    let fields = import.meta.resolve(`../../pages/templates/${template}.ejs`).split(":");
    let res = await ejs.renderFile(fields.pop());
    fs.writeFileSync(new URL(`../../pages/rendered/${template}.html`, import.meta.url), res);
}

let lines = fs.readFileSync(new URL(`./templates.txt`, import.meta.url)).toString('utf-8').replaceAll(/\r/g, '').split('\n');
lines.forEach(line => renderFile(line));
