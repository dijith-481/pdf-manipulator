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
                try:
                    fileDetails.append(pdfDetails(file))
                except:
                    None
            except:
                return jsonify({'success': False, 'error':'Error saving file'})
        session_id = str(uuid.uuid4())
        store_session_data(session_id,uploaded_files)
        
        return jsonify({'success': True, 'session_id': session_id, 'details':fileDetails})
    except:
        pt=str(request.files)
        return jsonify({'success': False, 'error':pt})


def generate_temp_filename(filename):
    extension = os.path.splitext(filename)[1]
    return secure_filename(str(uuid.uuid4())) + extension



#need to change
@app.route("/merge",methods=['post'])
def merge():
    file=[]
    if 'file1' not in request.files or 'file2' not in request.files:
        return "No file part"
    for file_name in request.files:
        file.append(request.files[file_name])
    merge_pdf(file)
    return send_file('merge/merge.html')
#not used
@app.route('/downloadsendfile/<filename>', methods=['get'])
def download_fileSendAsFile(filename):
    file_path = os.path.join(app.config['TEMP_FOLDER'], filename)
    extension = os.path.splitext(filename)[1]
    if os.path.exists(file_path):
        return send_file(
            file_path,
            as_attachment=True,
            download_name=f'download.{extension}',
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    else:
        return jsonify({'error': file_path}), 404

@app.route("/docx", methods=['post'])
def docx():
    try:
        sessionId=request.form['sessionId']
        filename=session['files'][0]
        temp_filepath = os.path.join(app.config['TEMP_FOLDER'], filename)
        docxFileName=todocx(temp_filepath)
        docxUrl= f'/download/{docxFileName}'
        return jsonify({'success': True, 'file': docxUrl})
    except:
        return jsonify({'success': False, 'error':'erorr converting docx'})

@app.route('/split',methods=['post'])
def split():
    try:
        sessionId=request.form['sessionId']
        filename=session['files'][0]
        inputFilePath = os.path.join(app.config['TEMP_FOLDER'], filename)
        splitType=request.form['splitType']
        splitValue=None
        if 'splitValue' in request.form:
            splitValue=request.form['splitValue'].split(',') 
        outputFileName = split_pdf(inputFilePath,splitType,splitValue)
        splitUrl= f'/download/{outputFileName}'
        return jsonify({'success': True, 'file':splitUrl})
    except:
        return jsonify({'success': False, 'error':'erorr splitting'})

@app.route('/encrypt',methods=['post'])
def encrypt():
    try:
        sessionId=request.form['sessionId']
        filename=session['files'][0]
        inputFilePath = os.path.join(app.config['TEMP_FOLDER'], filename)
        password=request.form['password']
        outputFileName = encrypt_pdf(inputFilePath,password)
        encryptUrl= f'/download/{outputFileName}'
        return jsonify({'success': True, 'file':encryptUrl})
    except:
        return jsonify({'success': False, 'error':'erorr encrypting'})
@app.route('/decrypt',methods=['post'])
def decrypt():
    sessionId=request.form['sessionId']
    filename=session['files'][0]
    inputFilePath = os.path.join(app.config['TEMP_FOLDER'], filename)
    password=request.form['password']
    
    try:
        
        outputFileName = decrypt_pdf(inputFilePath,password)
        if outputFileName=='err':
            return jsonify({'success': False, 'error':'Password Mismatched'})
        else:
            compressUrl= f'/download/{outputFileName}'
            return jsonify({'success': True, 'file':compressUrl})
    except:
        return jsonify({'success': False, 'error':'erorr decrypting'})

@app.route('/compress',methods=['post'])
def compress():
    try:
        sessionId=request.form['sessionId']
        filename=session['files'][0]
        inputFilePath = os.path.join(app.config['TEMP_FOLDER'], filename)
        compressOption=request.form['compressOption']
        compressOption=compressOption.split(',')
        outputFileName = compress_pdf(inputFilePath,compressOption)
        
        compressUrl= f'/download/{outputFileName}'
        return jsonify({'success': True, 'file':compressUrl})
        #return jsonify({'success': False, 'error':f'{str(compressOption)}'})
    except:
        return jsonify({'success': False, 'error':'erorr compressing'})

@app.route('/download/<filename>', methods=['get'])
def download_file(filename):
    file_path = os.path.join(app.config['TEMP_FOLDER'], filename)
    try:
        with open(file_path, 'rb') as f:
            file_data = f.read()
        encoded_data = base64.b64encode(file_data).decode('utf-8')
        return jsonify({
            'success': True,
            'filename': filename,
            'file_data': encoded_data,
            'mime_type': 'application/pdf'  # Adjust based on your file type
        }), 200
    except Exception as e:
        return jsonify({'sucess': False, 'error': filename}), 404

def todocx(filename):
    pdf_file = filename
    temp_filename = generate_temp_filename('document.docx')
    temp_filepath = os.path.join(app.config['TEMP_FOLDER'], temp_filename)
    docx_file = temp_filepath
    cv = Converter(pdf_file)
    cv.convert(docx_file)    
    cv.close()
    return temp_filename

#need to check
def  merge_pdf(pdfs):
    merger=PdfWriter()
    for pdf in pdfs:
        merger.append(PdfReader(pdf))
    merger.write('test.pdf')
    merger.close()


def split_pdf(pdf,splitType,splitValue=None):

    input_pdf=PdfReader(pdf)
    temp_filename = generate_temp_filename('split.pdf')
    temp_filepath = os.path.join(app.config['TEMP_FOLDER'], temp_filename)
    totalPages=len(input_pdf.pages)
    splitPagesList=getSplitPagesList( splitType,totalPages,splitValue)
    outputPdf=PdfWriter()
    for pageNo in splitPagesList :
        outputPdf.add_page(input_pdf.pages[pageNo])
    outputPdf.write(temp_filepath)        
    outputPdf.close()        
    return temp_filename
def getSplitPagesList(splitType,totalPages,splitValue=None):
    splitPagesList=[]
    if splitType =='m':
        for i in range(totalPages//2):
                splitPagesList.append(i)
    elif splitType =='f':
        for i in range(totalPages//2,totalPages):
                splitPagesList.append(i)
    elif splitType =='o':
        for i in range(0,totalPages,2):
                splitPagesList.append(i)
    elif splitType =='e':
        for i in range(1,totalPages,2):
                splitPagesList.append(i)
    elif splitType =='c':
        splitPagesList = [int(x) - 1 for x in splitValue]

    return splitPagesList

def encrypt_pdf(pdf,password):
    input_pdf=PdfReader(pdf)
    temp_filename = generate_temp_filename('encrypted.pdf')
    temp_filepath = os.path.join(app.config['TEMP_FOLDER'], temp_filename)
    outputPdf=PdfWriter()
    for page in input_pdf.pages:
        outputPdf.add_page(page)
    outputPdf.encrypt(password)
    outputPdf.write(temp_filepath)        
    outputPdf.close() 
    return temp_filename       

def decrypt_pdf(pdf,password):
    input_pdf=PdfReader(pdf)
    if input_pdf.is_encrypted:
        input_pdf.decrypt(password)
    temp_filename = generate_temp_filename('encrypted.pdf')
    temp_filepath = os.path.join(app.config['TEMP_FOLDER'], temp_filename)
    outputPdf=PdfWriter()
    try:     
        for page in input_pdf.pages:
            outputPdf.add_page(page)
        
    except:
        return 'err'
    outputPdf.write(temp_filepath)        
    outputPdf.close() 
    return temp_filename

def compress_pdf(pdf,compressOption):
    input_pdf=PdfReader(pdf)
    temp_filename = generate_temp_filename('compressed.pdf')
    temp_filepath = os.path.join(app.config['TEMP_FOLDER'], temp_filename)
    outputPdf=PdfWriter()
    if 'd' in compressOption:
        for page in input_pdf.pages:
            outputPdf.add_page(page)
        outputPdf.add_metadata(input_pdf.metadata)
        input_pdf=outputPdf
        outputPdf.close() 
    if 'i' in compressOption:
        outputPdf=PdfWriter()
        for page in input_pdf.pages:
            outputPdf.add_page(page)
        outputPdf.remove_images()
        input_pdf=outputPdf
        outputPdf.close() 
    if 'l' in compressOption:
        outputPdf=PdfWriter()
        for page in input_pdf.pages:
            page.compress_content_streams()
            outputPdf.add_page(page)    
    outputPdf.write(temp_filepath)        
    outputPdf.close() 
    return temp_filename





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
    return (No_of_pages,author,subject)






@scheduler.task('interval', id='do_job_1', seconds=3600, misfire_grace_time=900)
def job1():
    cleanup_temp_files()  # Call the cleanup function








def main():
    
    app.run(port=int(os.environ.get('PORT', 80)))
    
if __name__ == "__main__":
    main()