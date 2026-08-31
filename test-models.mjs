import fs from "fs";
const envVars = fs.readFileSync(".env.local", "utf8").split("\n").reduce((acc, line) => {
  const [key, ...value] = line.split("=");
  if (key) acc[key] = value.join("=").replace(/"/g, "");
  return acc;
}, {});

async function run() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${envVars.GEMINI_API_KEY}`);
  const data = await response.json();
  console.log(data.models?.map(m => m.name));
}
run();
