import os
import uuid
from io import BytesIO
from flask import Flask, send_file,request,send_from_directory,render_template,make_response,jsonify,session,url_for
from flask_session import Session
from werkzeug.utils import secure_filename
from pdf2docx import Converter
from PyPDF2 import PdfReader,PdfWriter
import pdfminer
from flask_apscheduler import APScheduler
import time
import base64

app = Flask(__name__)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()
app.config['TEMP_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp')
if not os.path.exists(app.config['TEMP_FOLDER']):
    os.makedirs(app.config['TEMP_FOLDER'])
TEMP_FILE_TIMEOUT =3600



@app.route("/")
def index():
    return render_template('index.html')


@app.route("/upload",methods=['post'])
def upload():
    try:
        uploaded_files = []   
        fileDetails = [] 
        for file_key in request.files:
            if file_key not in request.files:
                return jsonify({'success': False, 'error':f'no {file_key}part'})
            file = request.files[file_key]
            if file.filename == '':
                return jsonify({'success': False, 'error':f'No selected file for {file_key}'})
            if not file.filename.endswith('.pdf'):
                return jsonify({'success': False, 'error':f'Not a PDF file for {file_key}'})
            temp_filename = generate_temp_filename(file.filename)
            temp_filepath = os.path.join(app.config['TEMP_FOLDER'], temp_filename)
            try:
                file.save(temp_filepath)
                uploaded_files.append(temp_filename)
                fileDetails.append(pdfDetails(file))
            except:
                return jsonify({'success': False, 'error':'Error saving file'})
        session_id = str(uuid.uuid4())
        store_session_data(session_id,uploaded_files)
        
        return jsonify({'success': True, 'session_id': session_id, 'details':fileDetails})
    except:
        pt=str(request.files)
        return jsonify({'success': False, 'error':pt})

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

@app.route('/download/<filename>', methods=['get'])
def download_file(filename):
    file_path = os.path.join(app.config['TEMP_FOLDER'], filename)
    if os.path.exists(file_path):
        return send_file(
            file_path,
            as_attachment=True,
            download_name='sample.docx',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    else:
        return jsonify({'error': file_path}), 404

@app.route("/docx", methods=['post'])
def docx():
    sessionId=request.form['sessionId']
    filename=session['files'][0]
    temp_filepath = os.path.join(app.config['TEMP_FOLDER'], filename)
    docxFileName=todocx(temp_filepath)
    docxUrl= f'/download/{docxFileName}'


    try:
        return jsonify({'success': True, 'file': docxUrl})

    except:
        return jsonify({'success': False, 'error':'session id'})

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
    temp_filename = generate_temp_filename('document.docx')
    temp_filepath = os.path.join(app.config['TEMP_FOLDER'], temp_filename)
    docx_file = temp_filepath
    cv = Converter(pdf_file)
    cv.convert(docx_file)    
    cv.close()
    return temp_filename


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


def store_session_data(uuid, filenames):
    session['id']= uuid
    session['files']=[]
    for filename in (filenames):
        session['files'].append(filename)

def pdfDetails(pdf):
    pdf_reader=PdfReader(pdf)
    meta=pdf_reader.metadata
    No_of_pages=len(pdf_reader.pages)
    author=meta.author
    subject=meta.subject
    try:
        return (No_of_pages,author,subject)
        
        
    except:
        return 'error in acessing pdf details'






@scheduler.task('interval', id='do_job_1', seconds=3600, misfire_grace_time=900)
def job1():
    cleanup_temp_files()  # Call the cleanup function








def main():
    
    app.run(port=int(os.environ.get('PORT', 80)))
    
if __name__ == "__main__":
    main()
    #working