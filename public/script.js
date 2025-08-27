// document.getElementById("generateBtn").addEventListener("click", async () => {
//   const prompt = document.getElementById("prompt").value.trim();
//   if (!prompt) {
//     alert("Please enter a description!");
//     return;
//   }

//   // Call backend API (Express) → index1.js will generate files
//   const res = await fetch("/generate", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ prompt })
//   });

//   const data = await res.json();
//   const filesDiv = document.getElementById("files");
//   filesDiv.innerHTML = "";

//   // Show download links
//   data.files.forEach(file => {
//     const link = document.createElement("a");
//     link.href = file.url;
//     link.download = file.name;
//     link.innerText = file.name;
//     link.classList.add("file-link");
//     filesDiv.appendChild(link);
//   });

//   // Show live preview (load generated index.html)
//   document.getElementById("previewFrame").src = data.previewUrl;
// });
// document.getElementById("generateBtn").addEventListener("click", async () => {
//   const prompt = document.getElementById("prompt").value;
//   const res = await fetch("/generate", {
//     method: "POST",
//     headers: {"Content-Type":"application/json"},
//     body: JSON.stringify({ prompt })
//   });
//   const data = await res.json();
//   document.getElementById("preview").src = "/generated/index.html";
// });

// // Download code as zip
// document.getElementById("downloadBtn").addEventListener("click", () => {
//   window.location.href = "/download";
// });

// // Maximize preview
// document.getElementById("maximizeBtn").addEventListener("click", () => {
//   window.open("/generated/index.html", "_blank");
// });


const generateBtn     = document.getElementById("generateBtn");
const promptInput     = document.getElementById("prompt");
const workspace       = document.getElementById("workspace");
const previewFrame    = document.getElementById("previewFrame");

const fileHtml        = document.getElementById("fileHtml");
const fileCss         = document.getElementById("fileCss");
const fileJs          = document.getElementById("fileJs");
const downloadZipBtn  = document.getElementById("downloadZip");

const previewMaxBtn   = document.getElementById("previewMax");
const previewDlBtn    = document.getElementById("previewDownload");

// Helper: map returned files by name for easy access
const toMapByName = (files) => {
  const map = {};
  (files || []).forEach(f => map[(f.name || "").toLowerCase()] = f.url);
  return map;
};

generateBtn.addEventListener("mouseenter", () => {
  // subtle pulse on hover
  generateBtn.style.transform = "translateY(-1px)";
});
generateBtn.addEventListener("mouseleave", () => {
  generateBtn.style.transform = "";
});

generateBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert("Please enter a description!");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerText = "Generating…";

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
      throw new Error("Generation failed");
    }

    const data = await res.json();
    const filesByName = toMapByName(data.files);

    // Left column links
    fileHtml.href = filesByName["index.html"] || "#";
    fileCss.href  = filesByName["style.css"] || "#";
    fileJs.href   = filesByName["script.js"] || "#";

    // Preview iframe
    previewFrame.src = data.previewUrl;

    // Preview toolbar actions
    previewMaxBtn.onclick = () => {
      if (data.previewUrl) window.open(data.previewUrl, "_blank", "noopener");
    };

    previewDlBtn.onclick = () => {
      // download index.html specifically from preview toolbar
      const url = filesByName["index.html"];
      if (url) {
        const a = document.createElement("a");
        a.href = url;
        a.download = "index.html";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    };

    // Download ZIP button (server route)
    downloadZipBtn.onclick = () => {
      window.location.href = "/download";
    };

    // Reveal workspace with a smooth transition
    workspace.classList.remove("hidden");
    workspace.animate(
      [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
      { duration: 350, easing: "ease-out" }
    );

    // Scroll into view if on small screens
    workspace.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    console.error(err);
    alert("Something went wrong while generating. Please try again.");
  } finally {
    generateBtn.disabled = false;
generateBtn.innerText = "Generate";
  }
});

document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;

    // Close all other open FAQs
    document.querySelectorAll(".faq-item").forEach((faq) => {
      if (faq !== item) faq.classList.remove("active");
    });

    // Toggle this one
    item.classList.toggle("active");
  });
});