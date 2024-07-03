
    function addFileInput() {
      const fileInputs = document.getElementById('fileInputs');
      const newInput = document.createElement('input');
      newInput.type = 'file';
      newInput.name = 'file' + (fileInputs.children.length + 1); 
      fileInputs.appendChild(newInput);
    }
    function removeFileInput() {
        const fileInputs = document.getElementById('fileInputs');
        if (fileInputs.children.length > 2) {
          fileInputs.removeChild(fileInputs.lastChild);
        }
      }
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
    const split = document.getElementById('merge');
    const convert = document.getElementById('merge');
    const extract = document.getElementById('merge');
merge.addEventListener('click', setAction('/merge'));
merge.addEventListener('click', setAction('/merge'));
merge.addEventListener('click', setAction('/merge'));
merge.addEventListener('click', setAction('/merge'));


