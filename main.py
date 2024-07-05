import os
import uuid
from flask import Flask, send_file,request,send_from_directory,render_template,make_response,jsonify,session
from werkzeug.utils import secure_filename
from pdf2docx import Converter
from PyPDF2 import PdfReader,PdfWriter
import pdfminer
from flask_apscheduler import APScheduler
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secure_secret_key'
app.config['TEMP_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp')
if not os.path.exists(app.config['TEMP_FOLDER']):
    os.makedirs(app.config['TEMP_FOLDER'])
TEMP_FILE_TIMEOUT = 1800




@app.route("/")
def index():
    return render_template('index.html')


@app.route("/upload",methods=['post'])
def upload():
    if 'file' not in request.files:
            return 'nofile'

    file = request.files['file']
    if file.filename == '':
        return 'noselected file'
    if not file.filename.endswith('.pdf'):
        return 'not a pdf file'

    temp_filename = generate_temp_filename(file.filename)
    temp_filepath = os.path.join(app.config['TEMP_FOLDER'], temp_filename)
    try:
        file.save(temp_filepath)
    except:
        return 'error saving file'
    session_id = str(uuid.uuid4())
    store_session_data(session_id, temp_filename)
    return jsonify({'success': True, 'session_id': session_id})
    

@app.route('/download',methods=['post'])
def download():
   ...

def generate_temp_filename(filename):
    extension = os.path.splitext(filename)[1]
    return secure_filename(str(uuid.uuid4())) + extension




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

@app.route('/splitCheck')
def splitCheck():
    filenme=request.files['file1']
    pageNo=request.form['pageNo']
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
    


def cleanup_temp_files():
    """Deletes temporary files that have exceeded the timeout."""
    now = time.time()
    for filename in os.listdir(app.config['TEMP_FOLDER']):
        file_path = os.path.join(app.config['TEMP_FOLDER'], filename)
        if os.path.isfile(file_path) and (now - os.path.getmtime(file_path)) > TEMP_FILE_TIMEOUT:
            os.remove(file_path)


def store_session_data(uuid, filename):
    session['uuid']= uuid
    session['filename']= filename




scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()
@scheduler.task('interval', id='do_job_1', seconds=360, misfire_grace_time=900)
def job1():
    app.cleanup_temp_files()  # Call the cleanup function







def main():
    
    app.run(port=int(os.environ.get('PORT', 80)))
    
if __name__ == "__main__":
    main()