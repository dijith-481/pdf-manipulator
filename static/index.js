
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
    if (selectedFeature=="merge"){
      console.log('hi')
    }
    else{
      showSelected();
    }
   
}

function removeFile(index) {
    files.splice(index, 1);
    updateFileList();
    showSelect();
    
}
function showSelect(){
  document.getElementById("dropZone").style.display="block";
  document.getElementById("fileSelected").style.display="none";
}
function showSelected(){
  document.getElementById("fileSelected").style.display="block";
  document.getElementById("dropZone").style.display="none";
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
    event.target.classList.add('active');
    if (selectedFeature == 'merge'){
      showSelect();

    }
    else{
      if (fileList.)
    }
}

function processFiles() {
    if (files.length === 0) {
        alert('Please add at least one PDF file.');
        return;
    }
    if (!selectedFeature) {
        alert('Please select a PDF tool.');
        return;
    }
    // Here you would implement the actual file processing logic
    console.log('Processing files:', files);
    console.log('Selected feature:', selectedFeature);
    alert(`Processing ${files.length} file(s) with the ${selectedFeature} feature. This feature is not yet implemented.`);
}