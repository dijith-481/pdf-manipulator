function addFileInput() {
  const newInput = document.createElement("input");
  const fileNumber = document.getElementById("fileInputs").children.length + 1;

  newInput.type = "file";
  newInput.name = `file${fileNumber}`;
  newInput.classList.add("file-choser");
  fileInputs.appendChild(newInput);
}

function removeFileInput() {
  const fileInputs = document.getElementById("fileInputs");
  if (fileInputs.children.length > 2) {
    fileInputs.removeChild(fileInputs.lastChild);
  }
}
function setSingleFileInput() {
  const fileInputs = document.getElementById("fileInputs");
  while (fileInputs.children.length > 1) {
    fileInputs.removeChild(fileInputs.lastChild);
  }
}

function setAction(action) {
  document.getElementById("fileInput").action = action;
}

function submitFile() {
  const form = document.getElementById("fileInput");
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
        otherAction.querySelector(".action-child").classList.add("hidden")
        otherAction.querySelector(".action-child").classList.remove("flex")
        otherAction.classList.remove("pressed");
      });
      action.querySelector(".action-child").classList.add("flex")
        action.querySelector(".action-child").classList.remove("hidden")
      action.classList.add("pressed");
      const actionPath = action.dataset.action;
      setAction(actionPath);
      const fileInputs = document.getElementById("fileInputs");
      if (actionPath == "/merge") {
        merge();
        if (fileInputs.children.length < 2) {
          addFileInput();
        }
      } else {
        setSingleFileInput();
      }
    }
  });
});

function merge() {
}
function split() {
}
