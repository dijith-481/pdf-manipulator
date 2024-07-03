
function addFileInput() {
  const fileInputs = document.getElementById('fileInputs');
  const fileNumber = fileInputs.children.length + 1;
 
  const customHTML = `
  <input type="file" name="file${fileNumber}" class="file:mr-6 file:py-2 file:px-4
    file:rounded-full file:border-0
    file:text-sm file:font-semibold
    file:bg-teal-100 file:text-teal-700 
    hover:file:bg-teal-300" />
    `;
    fileInputs.insertAdjacentHTML('beforeend', customHTML); 
    }


    function removeFileInput() {
        const fileInputs = document.getElementById('fileInputs');
        if (fileInputs.children.length > 2) {
          fileInputs.removeChild(fileInputs.lastChild);
        }
    }
    function setSingleFileInput() {
            const fileInputs = document.getElementById('fileInputs');
            while (fileInputs.children.length > 1) {
              fileInputs.removeChild(fileInputs.lastChild);
            }}
          
      function setAction(action) {
      document.getElementById('fileInput').action = action;
      
    }
    

function submitFile(){
      const form=document.getElementById('fileInput')
      console.log(form.hasAttribute('action'))
      if(form.hasAttribute('action')){
        form.submit()
      }
      else{
        const textNode=document.createTextNode('No action attribue')
        form.appendChild(textNode)

        alert('No action attribute found');
      }
    }
    const merge = document.getElementById('merge');
    const split = document.getElementById('split');
    const convert = document.getElementById('split');
    const extract = document.getElementById('split');
merge.addEventListener('click',addFileInput, setAction('/merge'));
split.addEventListener('click',setSingleFileInput, setAction('/split'),setSingleFileInput());
merge.addEventListener('click', setAction('/merge'));
merge.addEventListener('click', setAction('/merge'));


