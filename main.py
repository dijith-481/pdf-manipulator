import os

from flask import Flask, send_file,request,send_from_directory,render_template
from pdf2docx import Converter
from PyPDF2 import PdfReader,PdfWriter
import pdfminer
app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

@app.route('/download',methods=['post'])
def download():
    files = list_files_in_directory('temp/')
    return render_template('merge/merge.html', files=files)


@app.route("/merge",methods=['post'])
def merge():
    file=[]
    if 'file1' not in request.files or 'file2' not in request.files:
        return "No file part"
    for file_name in request.files:
        file.append(request.files[file_name])
    merge_pdf(file)
    return send_file('merge/merge.html')

@app.route("/docx", methods=['post'])
def docx():
    merger=PdfWriter()
    filename=request.files['file1']
    merger.append(PdfReader(filename))
    merger.write('test.pdf')
    todocx('test.pdf')
    return send_file('merge/merge.html')
@app.route('/split',methods=['post'])
def split():
    filename=request.files['file1']
    pageNo=request.form['pageNo']
    get_file_details(filename)
    split_pdf(filename,pageNo)
    files = list_files_in_directory('temp/')
    return render_template('merge/merge.html', files=files)
    
def todocx(filename):

    pdf_file = filename
    docx_file = 'sample.docx'

    # convert pdf to docx
    cv = Converter(pdf_file)
    cv.convert(docx_file)      # all pages by default
    cv.close()

def  merge_pdf(pdfs):
    merger=PdfWriter()
    for pdf in pdfs:
        merger.append(PdfReader(pdf))
    merger.write('test.pdf')
    merger.close()
def split_pdf(pdf,pageNo):
    pageNo=pageNo.split(',')
    pageNo=[int(i) for i in pageNo]
    split=[]
    
    input_pdf=PdfReader(pdf)
    prev=0
    for splitNo in pageNo:
        split.append(PdfWriter())
        
        for n in range(prev,splitNo):
            split[-1].add_page(input_pdf.pages[n])
        prev=splitNo
    i=0        
    for pdf in split:
        
        pdf.write(f'test{pageNo[i]}.pdf')
        i+=1
        pdf.close()
    
def get_file_details(file):
    ...
def list_files_in_directory(directory_path):
    try:
        files = os.listdir(directory_path)
        return files
    except FileNotFoundError:
        print(f"Directory not found: {directory_path}")
        return []

def main():
    app.run(port=int(os.environ.get('PORT', 80)))
    
if __name__ == "__main__":
    main()