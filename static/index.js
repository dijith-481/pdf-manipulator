

let files = [];
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileInputBtn = document.getElementById("inputFileBtn");
const featureList = document.getElementById("featureList");
let noOfPages = null;
let type=null;
let value=null;
let splitValue = null;
let imageValue=null;
let imageType ="a"
let password = null;
let splitType = "m";
let selectedFeature = null;
let compressOption =null;
let watermark =null;
let watermarkOption='tr';
//to style dragover behavior of dropzone
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});
//call handle files function when file is added
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});
//set file input value to null
fileInputBtn.addEventListener("click", () => {
  fileInput.value = null;
});
//call handle files when file is added through file input
fileInput.addEventListener("change", (e) => handleFiles(e.target.files));
//handles the gives file
function handleFiles(newFiles) {
  for (let file of newFiles) {
    if (file.type === "application/pdf") {
      
      files.push(file); //add file to files array
      console.log(file);
    } else {
      alert(`${file.name} is not a PDF file and was not added.`);
    }
  }
  updateFileList(); //calls function to update file list
  }
  //add file to file list container
function updateFileList() {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";
  files.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
            <span class="overflow-hidden text-ellipses">${file.name}</span>
            <button class="remove-btn" onclick="removeFile(${index})">Remove</button>
        `;
    fileList.appendChild(fileItem);
  });
  showMessage();
  
}
//checks and show relevent containers during upload
function showMessage(){
  if (!selectedFeature) { //check if any action is selected
    showChooseAction(); //show choose an action cotainer
    hideDropZone(); //hide the drop zone container
  } else {
    hidechooseAction(); //hide the choose action container
    if(selectedFeature=='merge') {  //handles if action is merge
      showDropZone();
      if (files.length>1){
        showUpload();
      }else{
        hideUpload();
      }
    } 
    else if (files.length==1){
      hideRemoveSomeFile();
      hideDropZone();
      showUpload();

    }else if(files.length>1){
      showRemoveSomeFile();
      hideDropZone()
      hideUpload();
    }else{
      hideRemoveSomeFile()
      showDropZone();
      hideUpload();
    }}
}
function showChooseAction() {
  document.getElementById("selectAction").style.display ="flex";
  
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
  document.getElementById("removeSomeFile").style.display="flex";
  
}
function hideRemoveSomeFile() {
  document.getElementById("removeSomeFile").style.display = "none";
}
//remove file from file list
function removeFile(index) {
  files.splice(index, 1);
  updateFileList();
}
//set style to acton containers
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
  showMessage();
  

  
  
}


//handle uploading file
const uploadForm = document.getElementById("UploadFile");
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (files.length > 0) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index + 1}`, file);
    });
    showLoading("Uploading") //show processing overlay
    console.log(formData);
    const response = await fetch("/upload", { //send files to server
      method: "POST",
      body: formData,
    });
   
    const jsondata = await response.json();
    hideLoading();//hide processing overlay
    console.log(jsondata);
    console.log(jsondata["details"]);
    if (jsondata["success"]) {
      const pdfFile = URL.createObjectURL(files[0]);
      renderPdf(pdfFile); //render the uploaded file in pdf panel
      renderPdfDetails(files[0].name, jsondata["details"][0]); //render pdf details
      //render options based on action
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
      console.log(jsondata["error"]);//print the error text returned from server
    }
  }
});

//render the file in pdf panel 
function renderPdf(pdfUrl) {
  const pdfPanel = document.getElementById("pdfPanel");
  pdfPanel.innerHTML = `<iframe src=${pdfUrl}  class="w-full aspect-3/4"  style="border:none;"></iframe>`;
}
//renders pdf details
function renderPdfDetails(name, details) {
  const pdfDetailPanel = document.getElementById("pdfDetailPanel");
  const pdfDetailkeys = ["Page Count", "Author", "Subject"];
  if (!details) {
    pdfDetailPanel.innerHTML = "";
  } else {
    noOfPages = details[0];//get total number of pages
    let pdfDetailHtml = `<h2 class="text-ellispses overflow-hidden">${name}</h2>`;
    details.forEach((detail, index) => {
      if (detail) {
        pdfDetailHtml += `<p>${pdfDetailkeys[index]}: ${detail}</p>`;
      }
    });
    pdfDetailPanel.innerHTML = pdfDetailHtml;
  }
}
//renders button to submit  action and options
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
  processFile.addEventListener("submit", async (e) => {
    e.preventDefault();
    //handles the submit as split
     if (selectedFeature == "split") {
      if ((type == "c" && value == null)) {
        return
      }
    } else if (selectedFeature == "encrypt" && !password) {
      return
    } else if (selectedFeature == "decrypt" && !password) {
      return
    } else if (selectedFeature == "compress" && !value) {
    }else if (selectedFeature == "addText" && !(value  && watermarkOption)) {
      return
    }else if (selectedFeature == "image" && type) {
      if ((type == "c" && value == null)) {
        return
    }
    }
    const formData = new FormData();
          if(type){
          formData.append("type", type);
          }
          if (value) {
            formData.append("value", value);
          }
          if (password) {
            formData.append("password", password);
          }
          showLoading("Processing")
          const response = await fetch(`/process/${selectedFeature}`, {
            method: "POST",
            body: formData,
          });
          const jsondata = await response.json();
          hideLoading()
          console.log(jsondata);
          if (jsondata["success"]) {
          console.log(jsondata["file"]);
          const fileUrl = jsondata["file"];
          if(jsondata["compress_percent"]){
            const compressPercent =jsondata['compress_percent']
            renderDownload(fileUrl,compressPercent);
          }else{
             renderDownload(fileUrl);
          }
         
          }
          else {
            console.log(jsondata["error"]);
            alert(jsondata["error"]);
          }
        

});
}



//render options for split
function renderSplitOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");

  const splitOptionDiv = document.createElement("div");
  //insert split related  html
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
    type = this.value;
    console.log(type);
    //add pages to value if custom
    if (type === "c") {
      splitPagesInput.style.display = "block";
      console.log("split");
      splitPagesInput.addEventListener("change", function () {
        value = this.value
          .split(",")
          .map(Number)
          .filter((num) => !isNaN(num) && num != 0); // Convert and filter non-numeric values
        console.log(value);
        console.log(noOfPages);
        //check if values are valid and remove others
        for (let i = value.length - 1; i >= 0; i--) {
          const v = value[i];
          if (v > noOfPages) {
            alert(`Page ${v} is not available`);
            console.log("Removing:",v);
            value.splice(i, 1);
            console.log(value);
          } else {
            console.log("OK:", v);
          }
          splitPagesInput.value = value; //reinput the valid values back to  input
        }
      });
    } else {
      value = null;
      splitPagesInput.style.display = "none";
      console.log(type);
    }
  });
}
//render options for encrypt
function renderEncryptOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");

  const encryptOptionDiv = document.createElement("div");
  //input html related to encrypt
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
  });
  //create element to display if password doesnot match
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
//render options for decrypt
function renderDecryptOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");
//create html for decrypt options
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
//render options for compress
function renderCompressOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");
//html options for compress
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
    value = this.value;
    console.log(value);
  });

}
//render options for watermark
function renderWatermarkOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");
  //create html for watermark options
  const watermarkOptionDiv = document.createElement("div");
  watermarkOptionDiv.innerHTML = `<span>Enter water mark text
                  </span><br>
                  <span>Page No</span><input type="checkbox" id="watermarkPageNo" value="<pg>">
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
    value = this.value;  //sets the text to input in header or footer
    console.log(value);
  });
  const watermarkOptionSelect = document.getElementById("watermarkOption");
  watermarkOptionSelect.addEventListener("change", function () {
    type = this.value; //set the position of text 
    console.log(type);
  });
  const watermarkPageNo = document.getElementById("watermarkPageNo");
  watermarkPageNo.addEventListener("change", function () {
    if (this.checked) {
      value = "<pg>";  //set value to page no if pageno is choosen
      watermarkText.style.display = "none";
    } else {
      value = null;
      watermarkText.style.display = "block";
    
    }
    
  
  });
}
//render options for convert to image
function renderImageOptions() {
  const PdfDetailPanel = document.getElementById("pdfDetailPanel");
//html for image options
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
    type = this.value;
    console.log(type);
    if (this.value === "c") {  //if value is custom then show input
      imagePagesInput.style.display = "block";
      console.log("image");
      imagePagesInput.addEventListener("change", function () {
        value = this.value
          .split(",")
          .map(Number)
          .filter((num) => !isNaN(num) && num != 0);
        console.log(value);

        console.log(type);
        console.log(noOfPages);
        for (let i = value.length - 1; i >= 0; i--) {  //removes invalid values and update imput
          const v = value[i];
          if (v > noOfPages) {
            alert(`Page ${v} is not available`);
            console.log("Removing:", v);
            value.splice(i, 1);
            console.log(value);
          } else {
            console.log("OK:", value);
          }
          imagePagesInput.value = value;
        }
      });
    } else {
      value = null;
      imagePagesInput.style.display = "none"; //hide value input
    }
  });
}
//checked until here
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
           text+=  `<a href="${linkSource}" download="${file.filename}"><button class='downloadBtn' >${(file.filename.split(".")[0])}</button></a>`;
        
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
function showLoading(message = "Processing...") {
  console.log('loading')
  document.getElementById('loading-overlay').style.display = 'block';
  document.getElementById('loading-message').querySelector('p').textContent = message;
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Function to hide the loading overlay
function hideLoading() {
  document.getElementById('loading-overlay').style.display = 'none';
  document.body.style.overflow = 'auto'; // Re-enable scrolling
}

