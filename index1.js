import fs from "fs";
import readline from "readline";
import fetch from "node-fetch"; //new added
import { GoogleGenerativeAI } from "@google/generative-ai";
import archiver from "archiver";   // <--- NEW



const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// --- Utility function to safely extract code ---
function extractCode(text, type) {
  let regex;
  if (type === "html") regex = /<html[\s\S]*<\/html>/i;
  if (type === "css") regex = /```(?:css)?([\s\S]*?)```/i;
  if (type === "js") regex = /```(?:javascript|js)?([\s\S]*?)```/i;

  const match = text.match(regex);
  if (match) return match[1] ? match[1].trim() : match[0].trim();

  // fallback: remove <style> or <script> if accidentally included
  if (type === "css") return text.replace(/<\/?style>/gi, "").trim();
  if (type === "js") return text.replace(/<\/?script>/gi, "").trim();

  return text.trim();
}

async function generateFile(prompt, type) {
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = result.response.text();
  return extractCode(text, type);
}

// --- Utility: download image ---
async function downloadImage(url, filepath) {
  const res = await fetch(url);
  const buffer = await res.buffer();
  fs.writeFileSync(filepath, buffer);
}

// --- Replace <img> tags with real images ---
async function fixImages(html, prompt) {
  if (!fs.existsSync("images")) fs.mkdirSync("images");

  let count = 1;
  const matches = [...html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)];

  for (const match of matches) {
    const src = match[1];
    const filename = `images/img${count}.jpg`;
    const localPath = `./images/img${count}.jpg`;

    const imageUrl = `https://source.unsplash.com/600x400/?${encodeURIComponent(prompt)},${count}`;
    await downloadImage(imageUrl, filename);

    html = html.replace(src, localPath);
    count++;
  }

  return html;
}



async function createWebsite(prompt) {
  console.log("\n⏳ Generating professional website...");

  // Step 1: HTML
  let html = await generateFile(
    `Create only the FULL HTML5 page for: ${prompt}.
     Requirements:
     - Must include Bootstrap 5 via CDN.
     - Must link to "style.css" and "script.js".
     - Use semantic sections: header, hero, main, footer. Write required information in detail for the website asked by user.
     - Do NOT include CSS or JS here.
     - Ensure proper spacing of the elements you put . 
     - If user asks for any clone replicate the exact frontend the website that has Ex: If user asks swiggy clone then add name restaurants, hotels, cusins and the same orange background . If whatsapp clone then chats, sample text of persons , status place, basically exactly same as the real whatsapp. if leetcode then also problem one side and solution to be done on other.
     - Ensure same color and design if asked for clone.
     - For clones do exact the same of websites.
     -  Don't be lazy to put many features. Add exact features user want.
     - Make it very attractive and don't just make sections, add all information also. Ex: If user asks for portfolio website then add good picture, name in big with animation and short description. Then add contact us with good box with name, email, phone number. FAQ section with 3-4 faqs, Experience in big cards, projects with image, name and description. Basically attractive with all needs.
     Respond ONLY with HTML code. Nothing else.`,
    "html"
  );
   html = await fixImages(html, prompt); // new

  fs.writeFileSync(path.join(__dirname, "generated/index.html"), html);
console.log("✅ index.html created in /generated");
 


  // Step 2: CSS
  const css = await generateFile(
    `Write only CSS code for styling the ${prompt} website.
     Requirements:
     - Modern, professional theme ex: (blue + white shades).
     - Google Fonts (e.g., 'Poppins').
     - Smooth animations, hover effects, transitions.
     - Responsive design.
     - use good color combinations with gradients and make the cards more beautiful and professional. 
     - Mostly use center alignment but depending upon user choice change it.
     - Add many glow, animations, hovers, slide, image for required website.
     - In cards use various animations like scale up/down, tilt effect, flip card animations, slide animations, fade, blur animations etc.
     - For text also animations like fade in/out, slide in text, typing effect, gradient text animations, letter spacing animations, wave/bounce text etc.
     - Don't keep plain solid colors, do good color combinations to ensure good user interface.
     - Always give name for website.
     - Ensure that important headings is highlited properly with necessary animations.
     - In background also try to add live animations or gradient background.
     - add images also.
     - Ensure proper spacing of the elements you put . 
     - For clones do exact same fonts, text, colors, background etc.
     - If user asks for any clone replicate the exact frontend the website that has Ex: If user asks swiggy clone then add name restaurants, hotels, cusins and the same orange background . If whatsapp clone then chats, and same interface. if leetcode then also problem one side and solution to be done on other.
     - Ensure same color and design if asked for clone.
     - Style should be very attractive , professional and user should feel wow.
     - Don't be lazy to put many features. Add exact features user want. Ex: if user ask for 10 cards then add 10 only..not less not more. If not mentioned any then add atleast 4 .
     Do NOT include <style> tags or any HTML/JS.
     Respond ONLY with CSS.`,
    "css"
  );
fs.writeFileSync(path.join(__dirname, "generated/style.css"), css);
console.log("✅ style.css created in /generated");

  // Step 3: JS
  const js = await generateFile(
    `Write only vanilla JavaScript for interactivity on the ${prompt} website.
     Features:
     - Navbar toggle on mobile
     - Smooth scroll for anchor links
     - Button click ripple or highlight effect
     - add required animations effect and excellent interactions.
     Do NOT include <script> tags or any HTML/CSS.
     Respond ONLY with pure JavaScript.`,
    "js"
  );
fs.writeFileSync(path.join(__dirname, "generated/script.js"), js);
console.log("✅ script.js created in /generated");

  console.log("\n🎉 Professional website generated successfully!");
}

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static("public"));       // serve frontend UI
app.use("/generated", express.static("generated")); // serve generated files

// ✅ Endpoint to generate site
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  await createWebsite(prompt); // your AI function

  res.json({
    files: [
      { name: "index.html", url: "/generated/index.html" },
      { name: "style.css", url: "/generated/style.css" },
      { name: "script.js", url: "/generated/script.js" },
      { name: "Download ZIP", url: "/download" }
    ],
    previewUrl: "/generated/index.html"
  });
});


// ✅ Route to download everything as ZIP
app.get("/download", (req, res) => {
  const output = fs.createWriteStream("website.zip");
  const archive = archiver("zip");

  archive.pipe(output);
  archive.directory("generated/", false);
  archive.finalize();

  output.on("close", () => {
    res.download("website.zip", "website.zip", (err) => {
      if (err) console.error(err);
      fs.unlinkSync("website.zip"); // cleanup after sending
    });
  });
});


app.listen(5500, () => console.log("🚀 Server running on http://localhost:5500"));






