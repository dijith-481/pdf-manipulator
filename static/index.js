let files = [];
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileInputBtn = document.getElementById("inputFileBtn");
const featureList = document.getElementById("featureList");
let noOfPages = null;
let splitValue = null;
let imageValue=null;
let imageType ="a"
let password = null;
let splitType = "m";
let sessionId = "";
let selectedFeature = null;
let compressOption =null;
let watermark =null;
let watermarkOption='tr';

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});
fileInputBtn.addEventListener("click", () => {
  fileInput.value = null;
});
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));

function handleFiles(newFiles) {
  for (let file of newFiles) {
    if (file.type === "application/pdf") {
      files.push(file);
      console.log(file);
    } else {
      alert(`${file.name} is not a PDF file and was not added.`);
      //implement printing file not of type pdf
    }
  }
  updateFileList();
  if (!selectedFeature) {
    showChooseAction();
    hideDropZone();
  } else  {
    if (selectedFeature=='merge' ){
      if (files.length>1){
        showUpload();
        
      }
    }else{
    showUpload();
    hideDropZone();
    }
    
    
  }
}
function showChooseAction() {
  const specifyAction = document.getElementById("selectAction");
  specifyAction.style.display = "block";
  specifyAction.innerHTML = `<p>Select an action<p>`;
}
function hidechooseAction() {
  document.getElementById("selectAction").style.display = "none";
}
function showDropZone() {
  document.getElementById("dropZone").style.display = "block";
}
function hideDropZone() {
  document.getElementById("dropZone").style.display = "none";
}
function showUpload() {
  document.getElementById("uploadForm").style.display = "block";
}
function hideUpload() {
  document.getElementById("uploadForm").style.display = "none";
}
function showRemoveSomeFile() {
  const specifyAction = document.getElementById("removeSomeFile");
  specifyAction.style.display = "block";
  specifyAction.innerHTML = `<p>remove some file<p>`;
}
function hideRemoveSomeFile() {
  document.getElementById("removeSomeFile").style.display = "none";
}
function removeFile(index) {
  files.splice(index, 1);
  updateFileList();
  if (selectedFeature=='merge'){
    if (files.length<2){
      hideUpload();
      showDropZone();
    }
  }
  else if (files.length == 0) {
    showDropZone();
    hidechooseAction();
    hideUpload();
  }
  else if (files.length>1) {
    showRemoveSomeFile();
   
  }
  else if (files.length==1){
    hideRemoveSomeFile();
    showUpload();
  }
}

function updateFileList() {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";
  files.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
            <span>${file.name}</span>
            <button class="remove-btn" onclick="removeFile(${index})">Remove</button>
        `;
    fileList.appendChild(fileItem);
  });
}

function selectFeature(feature) {
  selectedFeature = feature;
  const items = featureList.getElementsByClassName("feature-item");
  for (let item of items) {
    item.classList.remove("active");
  }
  const clickedButton = document.querySelector(`.${feature}`);
  if (clickedButton) {
    clickedButton.classList.add("active");
  }
  if (selectedFeature == "merge"){
    if (files.length > 1) {
      showUpload();
    } else {
      hideUpload();

    }
    hidechooseAction();
    showDropZone();
  }
  else if (files.length == 0) {
    showUpload();
    hidechooseAction();
    hideDropZone();
  }
  else if (files.length>1) {
    showRemoveSomeFile();
    hideUpload();
    hideDropZone();
  }else{
    showUpload();
    hidechooseAction();
    hideDropZone();
  
  }

  
  
}

///checked until here

const uploadForm = document.getElementById("UploadFile");
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (files.length > 0) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index + 1}`, file);
    });

    //console.log(files)

    console.log(formData);
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    const jsondata = await response.json();
    console.log(jsondata);
    console.log(jsondata["session_id"]);
    console.log(jsondata["details"]);
    if (jsondata["success"]) {
      sessionId = jsondata["session_id"];
      console.log(sessionId);
      const pdfFile = URL.createObjectURL(files[0]);
      renderPdf(pdfFile);

      renderPdfDetails(files[0].name, jsondata["details"][0]);
      if (selectedFeature == "split") {
        renderSplitOptions();
      } else if (selectedFeature == "encrypt") {
        renderEncryptOptions();
      } else if (selectedFeature == "decrypt") {
        renderDecryptOptions();
      } else if (selectedFeature == "compress") {
        renderCompressOptions();
      }else if (selectedFeature == "addText") {
        renderWatermarkOptions();
      }else if (selectedFeature=="image"){
        renderImageOptions()
      }
      renderProcessBtn();
    } else {
      alert(jsondata["error"]);
    }
  }
});

function renderSplitOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");

  const splitOptionDiv = document.createElement("div");
  splitOptionDiv.innerHTML = `
  <div>
                  <span>Splitting Options:
                  </span>
               <select id="splitOption">
                    <option value="m"> Up to Middle</option>
                    <option value="f"> From Middle</option>
                    <option value="o">Odd Pages</option>
                    <option value="e">Even Pages</option>
                    <option value="c">Custom</option>
                </select>
                <input type="text" id="splitPagesCustom" placeholder="1,2,3" style="display: none;"> 
</div>
`;

  PdfDetailPanel.appendChild(splitOptionDiv);
  const splitOptionSelect = document.getElementById("splitOption");
  const splitPagesInput = document.getElementById("splitPagesCustom");

  splitOptionSelect.addEventListener("change", function () {
    // Check if the selected option is "custom"
    splitType = this.value;
    console.log(splitType);
    if (this.value === "c") {
      splitPagesInput.style.display = "block";
      console.log("split");
      splitPagesInput.addEventListener("change", function () {
        splitValue = this.value
          .split(",")
          .map(Number)
          .filter((num) => !isNaN(num) && num != 0);
        console.log(splitValue);

        console.log(splitType);
        console.log(noOfPages);
        for (let i = splitValue.length - 1; i >= 0; i--) {
          const value = splitValue[i];
          if (value > noOfPages) {
            alert(`Page ${value} is not available`);
            console.log("Removing:", value);
            splitValue.splice(i, 1);
            console.log(splitValue);
          } else {
            console.log("OK:", value);
          }
          splitPagesInput.value = splitValue;
        }
      });
    } else {
      splitValue = null;
      splitPagesInput.style.display = "none";
      console.log(splitValue);
      console.log(splitType);
    }
  });
}
function renderEncryptOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");

  const encryptOptionDiv = document.createElement("div");
  encryptOptionDiv.innerHTML = `
                  <span>Choose a Password:
                  </span>
                <input type="password" id="encryptPassword" placeholder="use strong password" ">
                <span>Re-enter Password:
                  </span>
                <input type="password" id="encryptPasswordre" placeholder="use strong password" "> 
`;
  PdfDetailPanel.appendChild(encryptOptionDiv);
  let psswrd;
  const encryptPasswordInput = document.getElementById("encryptPassword");
  const encryptPasswordreInput = document.getElementById("encryptPasswordre");
  encryptPasswordInput.addEventListener("change", function () {
    psswrd = this.value;
    console.log(password);
  });
  const passwordNotMatch = document.createElement("p");
  passwordNotMatch.style.display = "none";
  passwordNotMatch.innerHTML = "Password do not match";
  PdfDetailPanel.appendChild(passwordNotMatch);
  encryptPasswordreInput.addEventListener("change", function () {
    if (psswrd != this.value) {
      alert("Password do not match");
      passwordNotMatch.style.display = "block";

      password = null;
    } else {
      password = psswrd;
      console.log("Password match");
      passwordNotMatch.style.display = "none";
    }
  });
}
function renderDecryptOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");

  const decryptOptionDiv = document.createElement("div");
  decryptOptionDiv.innerHTML = `
                  <span>Enter password:
                  </span>
                <input type="password" id="decryptPassword" placeholder="password" ">
                 
`;
  PdfDetailPanel.appendChild(decryptOptionDiv);
  const decryptPasswordInput = document.getElementById("decryptPassword");
  decryptPasswordInput.addEventListener("change", function () {
    password = this.value;
    console.log(password);
  });
}
function renderCompressOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");

  const compressOptionDiv = document.createElement("div");
  compressOptionDiv.innerHTML = `
  
                  <span>Compress Options:
                  </span><br>
                  <select id="compressOption">
                  <option value="l"> low</option>
                  <option value="m"> medium</option>
                  <option value="h">High</option>
                  
              </select>
               

`;

  PdfDetailPanel.appendChild(compressOptionDiv);
  const compressOptionInput =document.getElementById("compressOption");
  console.log(compressOptionInput)
  compressOptionInput.addEventListener("change", function () {
    compressOption = this.value;
    console.log(compressOption);
  });

}
function renderWatermarkOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");
  const watermarkOptionDiv = document.createElement("div");
  watermarkOptionDiv.innerHTML = `<span>Enter water mark text
                  </span><br>
                  <span>Page No</span><input type="radio" id="watermarkPageNo" value="<pg>">
                  <input type="text" id="watermarkText" placeholder="water mark text"><br>
                  <select id="watermarkOption">
                  <option value="tr"> top right</option>
                  <option value="tl"> top left</option>
                  <option value="br">bottom right</option>
                  <option value="bl">bottom left</option>
                  
              </select>
               `
  PdfDetailPanel.appendChild(watermarkOptionDiv);
  const watermarkText = document.getElementById("watermarkText");
  watermarkText.addEventListener("change", function () {
    watermark = this.value;
    console.log(watermark);
  });
  const watermarkOptionSelect = document.getElementById("watermarkOption");
  watermarkOptionSelect.addEventListener("change", function () {
    watermarkOption = this.value;
    console.log(watermarkOption);
  });
  const watermarkPageNo = document.getElementById("watermarkPageNo");
  watermarkPageNo.addEventListener("change", function () {
    if (this.checked) {
      watermark = "<pg>";
      watermarkText.style.display = "none";
    } else {
      watermark = null;
      watermarkText.style.display = "block";
    
    }
    
    console.log(watermark)
    console.log(watermarkOption);
  });
}
function renderImageOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");

  const imageOptionDiv = document.createElement("div");
  imageOptionDiv.innerHTML = `
  <div>
                  <span>image Options:
                  </span>
               <select id="imageOption">
                    <option value="a"> all pages</option>
                    <option value="m"> Up to Middle</option>
                    <option value="f"> From Middle</option>
                    <option value="o">Odd Pages</option>
                    <option value="e">Even Pages</option>
                    <option value="c">Custom</option>
                </select>
                <input type="text" id="imagePagesCustom" placeholder="1,2,3" style="display: none;"> 
</div>
`;

  PdfDetailPanel.appendChild(imageOptionDiv);
  const imageOptionSelect = document.getElementById("imageOption");
  const imagePagesInput = document.getElementById("imagePagesCustom");

  imageOptionSelect.addEventListener("change", function () {
    // Check if the selected option is "custom"
    imageType = this.value;
    console.log(imageType);
    if (this.value === "c") {
      imagePagesInput.style.display = "block";
      console.log("image");
      imagePagesInput.addEventListener("change", function () {
        imageValue = this.value
          .image(",")
          .map(Number)
          .filter((num) => !isNaN(num) && num != 0);
        console.log(imageValue);

        console.log(imageType);
        console.log(noOfPages);
        for (let i = imageValue.length - 1; i >= 0; i--) {
          const value = imageValue[i];
          if (value > noOfPages) {
            alert(`Page ${value} is not available`);
            console.log("Removing:", value);
            imageValue.splice(i, 1);
            console.log(imageValue);
          } else {
            console.log("OK:", value);
          }
          imagePagesInput.value = imageValue;
        }
      });
    } else {
      imageValue = null;
      imagePagesInput.style.display = "none";
      console.log(imageValue);
      console.log(imageType);
    }
  });
}

function renderPdf(pdfFile) {
  const pdfPanel = document.getElementById("pdfPanel");

  pdfPanel.innerHTML = `<iframe src=${pdfFile} width='600' height='500'></iframe>`;
}

function renderPdfDetails(name, details) {
  const pdfDetailPanel = document.getElementById("pdfDetailPanel");
  const pdfDetailkeys = ["Page Count", "Author", "Subject"];
  if (!details) {
    pdfDetailPanel.innerHTML = "";
  } else {
    noOfPages = details[0];
    let pdfDetailHtml = `<h2>${name}</h2>`;
    console.log(details);
    details.forEach((detail, index) => {
      if (detail) {
        pdfDetailHtml += `<p>${pdfDetailkeys[index]}: ${detail}</p>`;
      }

      console.log(detail);
    });
    pdfDetailPanel.innerHTML = pdfDetailHtml;
  }
}

function renderProcessBtn() {
  const pdfDetailPanel = document.getElementById("pdfDetailPanel");
  const form = document.createElement("form");
  form.id = "processBtn";
  form.enctype = "multipart/form-data";
  const button = document.createElement("button");
  button.className = "process-btn";
  button.textContent = selectedFeature;
  form.appendChild(button);
  pdfDetailPanel.appendChild(form);

  const processFile = document.getElementById("processBtn");
  console.log(processFile);
  processFile.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("docx");
    if (selectedFeature == "convertToDocx") {
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      console.log(formData);
      const response = await fetch("/docx", {
        method: "POST",
        body: formData,
      });
      console.log("waiting");
      const jsondata = await response.json();
      console.log(jsondata);
      console.log(jsondata["file"]);
      const fileUrl = jsondata["file"];
      const link = document.createElement("a");
      link.href = fileUrl;
      console.log(link);
      renderDownload(fileUrl);
    } else if (selectedFeature == "split") {
      if (!(splitType == "c" && splitValue == null)) {
        const formData = new FormData();
        formData.append("sessionId", sessionId);
        formData.append("splitType", splitType);
        if (splitValue) {
          formData.append("splitValue", splitValue);
        }
        console.log(formData);
        const response = await fetch("/split", {
          method: "POST",
          body: formData,
        });
        const jsondata = await response.json();
        console.log(jsondata);
        if (jsondata["success"]) {
        console.log(jsondata["file"]);
        const fileUrl = jsondata["file"];
        const link = document.createElement("a");
        link.href = fileUrl;
        console.log(link);
        renderDownload(fileUrl);
        }
        else {
          console.log(jsondata["error"]);
          alert(jsondata["error"]);
        }
      }
    } else if (selectedFeature == "encrypt" && password) {
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      formData.append("password", password);
      console.log(formData);
      const response = await fetch("/encrypt", {
        method: "POST",
        body: formData,
      });
      const jsondata = await response.json();
      console.log(jsondata);
      console.log(jsondata["file"]);
      const fileUrl = jsondata["file"];
      const link = document.createElement("a");
      link.href = fileUrl;
      console.log(link);
      renderDownload(fileUrl);
    } else if (selectedFeature == "decrypt" && password) {
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      formData.append("password", password);
      console.log(formData);
      const response = await fetch("/decrypt", {
        method: "POST",
        body: formData,
      });
      const jsondata = await response.json();
      console.log(jsondata);
      if (jsondata["success"]) {
        console.log(jsondata["file"]);
        const fileUrl = jsondata["file"];
        const link = document.createElement("a");
        link.href = fileUrl;
        console.log(link);
        renderDownload(fileUrl);
      } else {
        console.log(jsondata["error"]);
        alert(jsondata["error"]);
      }
    } else if (selectedFeature == "compress" && compressOption) {
  const formData = new FormData();
  formData.append("sessionId", sessionId);
  formData.append("compressOption", compressOption)
  console.log(formData);
  const response = await fetch("/compress", {
    method: "POST",
    body: formData,
  });
  const jsondata = await response.json();
      console.log(jsondata);
      if (jsondata["success"]) {
        console.log(jsondata["file"]);

        const fileUrl = jsondata["file"];
       const compressPercent =jsondata['compress_percent']
        renderDownload(fileUrl,compressPercent);
      } else {
        console.log(jsondata["error"]);
        alert(jsondata["error"]);
      }

    }else if (selectedFeature == "addText" && watermark  && watermarkOption) {
  const formData = new FormData();
  formData.append("sessionId", sessionId);
  formData.append("watermark", watermark);
  formData.append("watermarkOption",watermarkOption);
  console.log(formData);
  const response = await fetch("/watermark", {
    method: "POST",
    body: formData,
  });
  const jsondata = await response.json();
      console.log(jsondata);
      if (jsondata["success"]) {
        console.log(jsondata["file"]);

        const fileUrl = jsondata["file"];
       
        renderDownload(fileUrl);
      } else {
        console.log(jsondata["error"]);
        alert(jsondata["error"]);
      }
    
    }else if (selectedFeature == "image" && imageType) {
      if (!(imageType == "c" && imageValue == null)) {
        const formData = new FormData();
        formData.append("sessionId", sessionId);
        formData.append("imageType", imageType);
        if (imageValue) {
          formData.append("imageValue", imageValue);
        }
        console.log(formData);
        const response = await fetch("/image", {
          method: "POST",
          body: formData,
        });
        const jsondata = await response.json();
        console.log(jsondata);
        if (jsondata["success"]) {
          console.log(jsondata["file"]);
          const fileUrl = jsondata["file"];
          renderDownload(fileUrl);
        }
        else {
          console.log(jsondata["error"]);
          alert(jsondata["error"]);
        }
      }}

});
}

let pdfFile1 = null;
function renderDownload(link,CompressPercent=null) {
  fetch(link)
    .then((response) => {
      //if (!response.ok) {
      //  throw new Error();
      //}
      return response.json();
    })
    .then((data) => {
      if (data.error !=null){console.log(data.error)}
      else if (data.files !=null){
        
        let text=''
        data.files.forEach((file) => {
          const linkSource = `data:${file.mime_type};base64,${file.file_data}`;
           text+=  `<a href="${linkSource}" download="${file.filename}"><button >${(file.filename.split(".")[0])}</button></a>`;
        
        });
        text += `<a href="/downloadsendfile/${data.directory_name}"><button >Download All</button></a>`;
        pdfDetailPanel.innerHTML=text
      }
      else{
        const linkSource = `data:${data.mime_type};base64,${data.file_data}`;
        pdfFile1 = linkSource;
        renderPdf(pdfFile1);
        let text = `<a href="${linkSource}" download="${data.filename}"><button >Download File</button></a>`;
        if (CompressPercent!=null) {
            text+=`<br><p>compressed percentage:${CompressPercent}%</p>`
        }
        pdfDetailPanel.innerHTML=text
        console.log("appended");
        console.log(linkSource);
        return pdfFile1;
        
}});
    /*.catch((error) => {
      console.error("Download failed:", error);
      alert("Failed to download the file. Please try again.");
    });*/
}
