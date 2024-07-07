



/*
function setAction(action) {
  document.getElementById("1fileInput").action = action;
}

function submitFile() {
  const form = document.getElementById("1fileInput");
  console.log(form.hasAttribute("action"));
  if (form.hasAttribute("action")) {
    form.submit();
  } else {
    const textNode = document.createTextNode("No action attribue");
    form.appendChild(textNode);

    alert("No action attribute found");
  }
}
const actions = document.querySelectorAll(".action");
var currentAction = ' ';
actions.forEach((action) => {
  action.addEventListener("click", () => {
    if (currentAction !== action) {
      currentAction = action;
      actions.forEach((otherAction) => {
        otherAction.querySelector(".action-child").classList.remove("expanded")
        otherAction.classList.remove("pressed");
      });
      action.querySelector(".action-child").classList.add("expanded")
      action.classList.add("pressed");
      const actionPath = action.dataset.action;
      setAction(actionPath);
      const fileInputs = document.getElementById("fileInputs");
      if (actionPath == "/merge") {
        if (fileInputs.children.length < 2) {
          addFileInput();
        }
      } else {
        setSingleFileInput();
      }
    }
  });
});
function  checkFileInput(){
  const fileInputs = document.getElementById("1fileInputs");
  for (const fileInput of fileInputs.children) {
    if  (fileInput.files.length == 0) {
      console.log('hi')
      const uploadError=document.getElementById("upload-error");
      uploadError.textContent="you haven't chosen enough files";
    }
    else if (!fileInput.files[0].name.endsWith('.pdf')) {
      console.log('di')
      const uploadError=document.getElementById("upload-error");
      uploadError.textContent="choose a pdf file";
    }
    else{
      submitFile();
} 
  }}
*/
let files = [];
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const featureList = document.getElementById('featureList');
let sessionId='';
let selectedFeature = null;

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(newFiles) {
    for (let file of newFiles) {
        if (file.type === 'application/pdf') {
            files.push(file);
        } else {
            alert(`${file.name} is not a PDF file and was not added.`);
        }
    }
    updateFileList();
    if (!selectedFeature){
      showChooseAction();//yet to implement
    }
    if (selectedFeature!="merge"){
      showSelected();
      showSelect();


    }
    else{
      
    }
   
}

function removeFile(index) {
    files.splice(index, 1);
    updateFileList();
    if (files.length==0){
      showSelect();
    }
    else{
      showSelected();
    }
    
    
    
}
function showSelect(){
  document.getElementById("dropZone").style.display="block";
  document.getElementById("fileSelected").style.display="block";
}
function showSelected(){
  if (fileList.children.length!==0){
    
  
  const fileSelected= document.getElementById("fileSelected");
  fileSelected.style.display="block"
  
  document.getElementById("dropZone").style.display="none";
  if (selectedFeature!='merge'){
    console.log('hd')
    const fileList = document.getElementById('fileList');
    if (fileList.children.length>1){
      fileSelected.innerHTML=`<p>You can't take multiple files</p>`;
    }
  }
}
}
function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span>${file.name}</span>
            <button class="remove-btn" onclick="removeFile(${index})">Remove</button>
        `;
        fileList.appendChild(fileItem);
    });
}

function selectFeature(feature) {
    selectedFeature = feature;
    const items = featureList.getElementsByClassName('feature-item');
    for (let item of items) {
        item.classList.remove('active');
    }
    const clickedButton = document.querySelector(`.${feature}`); 
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
     if (selectedFeature == 'merge'){
      showSelect();

    }
    else{
      showSelected();
    }
    switch (feature) {
        case 'merge':
            merge()
            break; 
        case 'split':
            split()
            break;
   
}
}
function merge(){

}
function split(){

}




// Get references to the select element and the input field
const splitOptionSelect = document.getElementById('splitOption');
const splitPagesInput = document.getElementById('splitPages');
let splitPages = [];

// Add an event listener to the select element
splitOptionSelect.addEventListener('change', function() {
  // Check if the selected option is "custom"
  if(this.value === 'middle') {
    splitPages=['m'];
  
  }
   else if (this.value === 'odd') {
    splitPages=['o'];
  
  }
   else if (this.value === 'even') {
    splitPages=['e'];
  
  } 
  if (this.value === 'custom') {
    // Show the input field
    splitPagesInput.style.display = 'block';
  } else {
    // Hide the input field
    splitPagesInput.style.display = 'none';
  }
});

const uploadForm = document.getElementById('UploadFile')
uploadForm.addEventListener('submit',async(e)=>{
  e.preventDefault();
  if (files.length>0){
const formData = new FormData();
files.forEach((file, index) => {
  formData.append(`file${index + 1}`, file);
});

  //console.log(files)
 
  console.log(formData)
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
});
const jsondata = await response.json();
console.log(jsondata)
console.log(jsondata["session_id"]);
console.log(jsondata["details"])
if (jsondata["success"]){
  sessionId=jsondata["session_id"];
  console.log(sessionId)
renderPdf(files[0]);
renderPdfDetails(files[0].name,jsondata['details'][0]);
renderProcessBtn();
 } 
 else{
  alert(jsondata["error"])
 }
}
});


function renderPdf(pdfFile){
const pdfPanel = document.getElementById('pdfPanel');

pdfPanel.innerHTML =`<iframe src=${URL.createObjectURL(pdfFile)} width='600' height='500'></iframe>`;

}



function renderPdfDetails(name,details){
    const pdfDetailPanel =document.getElementById('pdfDetailPanel');
    const pdfDetailkeys = ['Page Count','Author','Subject'];
    let pdfDetailHtml =`<h2>${name}</h2>`
    console.log(details);
details.forEach((detail,index) => {
      if (detail){
        pdfDetailHtml+=`<p>${pdfDetailkeys[index]}: ${detail}</p>`
      }

      console.log(detail);

    });
    pdfDetailPanel.innerHTML=pdfDetailHtml;
}

function renderProcessBtn(){
  const pdfDetailPanel = document.getElementById('pdfDetailPanel'); 
  const form = document.createElement('form');
  form.id = 'processBtn';
  form.enctype = 'multipart/form-data';
  const button = document.createElement('button');
  button.className = 'process-btn';
  button.textContent = selectedFeature; 
  form.appendChild(button);
  pdfDetailPanel.appendChild(form); 

const processFile = document.getElementById('processBtn');
console.log(processFile)
processFile.addEventListener('submit',async(e)=>{
  e.preventDefault();
  if (selectedFeature=='convert to docs'){
    const formData = new FormData();
formData.append('sessionId', sessionId);
const response = await fetch('/docx', {
  method: 'POST',
  body: formData
});
const jsondata = await response.json();
console.log(jsondata)
console.log(jsondata['file'])
const fileUrl = jsondata['file'];
const link = document.createElement('a');
link.href = fileUrl;
console.log(link);
renderDownload(fileUrl);


  }
});

}

function renderDownload(link){
  const pdfPanel = document.getElementById('pdfDetailPanel');
  console.log('done')
  pdfPanel.innerHTML = `<form action="${link}">
  <button type="submit">Download</button>
</form>`

}




