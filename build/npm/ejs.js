import ejs from "ejs";
import fs from "node:fs";

const path = (process.argv[2] ?? ".");

async function renderFile(template){
    let filename = `${path}/pages/templates/${template}.ejs`
    console.log(filename);
    let res = await ejs.renderFile(filename);
    fs.writeFileSync(`${path}/pages/rendered/${template}.html`, res);
}

let lines = fs.readFileSync(new URL(`./templates.txt`, import.meta.url)).toString('utf-8').replaceAll(/\r/g, '').split('\n');
console.log("Rendering EJs templates :", ...lines);
lines.forEach(line => renderFile(line));
console.log("Finished rendering");
