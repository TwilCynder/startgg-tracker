import ejs from "ejs";
import fs from "fs/promises"

const path = (process.argv[2] ?? ".");

async function renderFile(filename){
    let templatePath = `${path}/pages/templates/${filename}`
    console.log("Rendering", templatePath);
    let res = await ejs.renderFile(templatePath);
    await fs.writeFile(`${path}/pages/rendered/${filename.replace("ejs", "html")}`, res);
}

//let lines = fs.readFileSync(new URL(`./templates.txt`, import.meta.url)).toString('utf-8').replaceAll(/\r/g, '').split('\n');

const files = (await fs.readdir(path + "/pages/templates/", {withFileTypes: true})).filter(entry => !entry.isDirectory()).map(entry => entry.name);

console.log("Rendering EJs templates :", ...(files));
//lines.forEach(line => renderFile(line));
await Promise.all(files.map(file => renderFile(file)));
console.log("Finished rendering");
