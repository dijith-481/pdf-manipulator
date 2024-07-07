
let files = [];
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInputBtn = document.getElementById('inputFileBtn');
const featureList = document.getElementById('featureList');
let noOfPages = null;
let splitValue = null;
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
fileInputBtn.addEventListener('click', () => {
  fileInput.value = null;
});
fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

function handleFiles(newFiles) {
    for (let file of newFiles) {
        if (file.type === 'application/pdf') {
            files.push(file);
            console.log(file)
        } else {
            alert(`${file.name} is not a PDF file and was not added.`);
            //implement printing file not of type pdf
        }
    }
    updateFileList();
    if (!selectedFeature){
      showChooseAction();
    }
    else{
      showUpload();
      hideDropZone();
    }
   
}
function showChooseAction(){
  const specifyAction=document.getElementById('selectAction');
  specifyAction.style.display='block';
  specifyAction.innerHTML=`<p>Select an action<p>`;
  hideDropZone();
}
function hidechooseAction(){
  document.getElementById("selectAction").style.display="none";
}
function showDropZone(){
  document.getElementById("dropZone").style.display="block";
}
function hideDropZone(){
  document.getElementById("dropZone").style.display="none";
}
function showUpload(){
  document.getElementById("uploadForm").style.display="block";
}
function hideUpload(){
  document.getElementById("uploadForm").style.display="none";
}


function removeFile(index) {
    files.splice(index, 1);
    updateFileList();
    if (files.length==0){
      showDropZone();
      hidechooseAction();
      hideUpload();
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
    if (files.length!=0){
    showUpload();
    hidechooseAction();
}}










///checked until here 

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
if (selectedFeature=='split'){
  renderSplitOptions();
}
  renderProcessBtn();



 } 
 else{
  alert(jsondata["error"])
 }
}
});

function renderSplitOptions(){
  const PdfDetailPanel = document.getElementById('pdfDetailPanel');
  
  const splitOptionDiv = document.createElement('div');
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
const splitOptionSelect = document.getElementById('splitOption');
const splitPagesInput = document.getElementById('splitPagesCustom');
let splitPages = null;

// Add an event listener to the select element
splitOptionSelect.addEventListener('change', function() {
  // Check if the selected option is "custom"
  if (this.value === 'c') {
    // Show the input field
    splitPagesInput.style.display = 'block';
    console.log('split')
    splitPagesInput.addEventListener('change', function() {
      splitPages = this.value
      splitValue=splitPages.split(',');
      console.log(splitValue)
      console.log(splitPages);
    });
  } else {
    // Hide the input field
    splitPages=this.value
    splitPagesInput.style.display = 'none';
  }
});



}

function renderPdf(pdfFile){
const pdfPanel = document.getElementById('pdfPanel');

pdfPanel.innerHTML =`<iframe src=${URL.createObjectURL(pdfFile)} width='600' height='500'></iframe>`;

}



function renderPdfDetails(name,details){
    const pdfDetailPanel =document.getElementById('pdfDetailPanel');
    const pdfDetailkeys = ['Page Count','Author','Subject'];
    noOfPages=details[0];
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


  };
  else{
   if (selectedFeature== 'split'){
     //implement 
  


}}});

}

function renderDownload(link){
  const pdfPanel = document.getElementById('pdfDetailPanel');
  console.log('done')
  pdfPanel.innerHTML = `<form action="${link}" id="downloadForm">
  <button onClick=fileDownloadStarted()>Download</button>
</form>`

}
function fileDownloadStarted(){
  const pdfPanel = document.getElementById('main');
  const form = document.getElementById('downloadForm');
  form.submit();
  setTimeout(function() {
     console.log('done')
  pdfPanel.innerHTML = `Thanks for using Pdf Manipulator`
  }, 100);
 
}



