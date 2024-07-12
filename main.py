import os
import uuid
from io import BytesIO
from flask import Flask, send_file,request,send_from_directory,render_template,make_response,jsonify,session,url_for
from flask_session import Session
from werkzeug.utils import secure_filename
from pdf2docx import Converter
from PyPDF2 import PdfReader,PdfWriter
import fitz
from flask_apscheduler import APScheduler
import time
import base64
import logging
import mimetypes
from zipfile import ZipFile 

app = Flask(__name__)
logger =app.logger
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
    print('started')
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

def generate_temp_folder():
    return secure_filename(str(uuid.uuid4()))

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
    if os.path.isdir(os.path.join(app.config['TEMP_FOLDER'], filename)):
            directory_path = os.path.join(app.config['TEMP_FOLDER'], filename)
            if not os.path.isdir(directory_path):
                return jsonify({'success': False, 'error': 'Directory not found'}), 404
                
    
        
            
            if os.path.exists(directory_path):
                directory_path=zip_directory(directory_path)
                return send_file(
                    directory_path,
                    as_attachment=True,
                    download_name=f'download.zip',
                    mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                )
            else:
                return 'error'

    else:

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
    sessionId=request.form['sessionId']
    filename=session['files'][0]
    inputFilePath = os.path.join(app.config['TEMP_FOLDER'], filename)
    outputFileName = generate_temp_filename('encrypted.pdf')
    outputFilePath= os.path.join(app.config['TEMP_FOLDER'],outputFileName )
    splitType=request.form['splitType']
    splitValue=None
    if 'splitValue' in request.form:
        splitValue=request.form['splitValue'].split(',')
    
    try:
        err=split_pdf(inputFilePath,outputFilePath,splitType,splitValue)
        
        splitUrl= f'/download/{outputFileName}'
        return jsonify({'success': True, 'file':splitUrl})
        #return jsonify({'success': False, 'error':f"{str(err)}"})
    except:
        return jsonify({'success': False, 'error':'err'})
#changing to pymupdf
@app.route('/encrypt',methods=['post'])
def encrypt():
    sessionId=request.form['sessionId']
    filename=session['files'][0]
    inputFilePath = os.path.join(app.config['TEMP_FOLDER'], filename)
    outputFileName = generate_temp_filename('encrypted.pdf')
    outputFilePath= os.path.join(app.config['TEMP_FOLDER'],outputFileName )
    password=request.form['password']
    
    try:
        
        encrypt_pdf(inputFilePath,outputFilePath,password)
        encryptUrl= f'/download/{outputFileName}'
        return jsonify({'success': True, 'file':encryptUrl})
    except:
        return jsonify({'success': False, 'error':'erorr encrypting'})
@app.route('/decrypt',methods=['post'])
def decrypt():
    sessionId=request.form['sessionId']
    filename=session['files'][0]
    inputFilePath = os.path.join(app.config['TEMP_FOLDER'], filename)
    outputFileName = generate_temp_filename('encrypted.pdf')
    outputFilePath= os.path.join(app.config['TEMP_FOLDER'],outputFileName )
    password=request.form['password']
    try:
        logtext = decrypt_pdf(inputFilePath,outputFilePath,password)
        if logtext=='err':
            return jsonify({'success': False, 'error':'Password Mismatched'})
        else:
            compressUrl= f'/download/{outputFileName}'
            return jsonify({'success': True, 'file':compressUrl})
    except:
        return jsonify({'success': False, 'error':'erorr decrypting'})

@app.route('/compress',methods=['post'])
def compress():
    sessionId=request.form['sessionId']
    filename=session['files'][0]
    inputFilePath = os.path.join(app.config['TEMP_FOLDER'], filename)
    outputFileName = generate_temp_filename('compressed.pdf')
    outputFilePath= os.path.join(app.config['TEMP_FOLDER'],outputFileName )
    compressOption=request.form['compressOption']
    compress_percent= compress_pdf(inputFilePath,outputFilePath,compressOption)
    try:
        
        
        compressUrl= f'/download/{outputFileName}'
        return jsonify({'success': True, 'file':compressUrl,'compress_percent':compress_percent})
        #return jsonify({'success': False, 'error':f'{str(compress_percent)}'})
    except:
        return jsonify({'success': False, 'error':'erorr compressing'})

@app.route('/watermark',methods=['post'])
def watermark():
    sessionId=request.form['sessionId']
    filename=session['files'][0]
    inputFilePath = os.path.join(app.config['TEMP_FOLDER'], filename)
    outputFileName = generate_temp_filename('compressed.pdf')
    outputFilePath= os.path.join(app.config['TEMP_FOLDER'],outputFileName )
    watermark=request.form['watermark']
    watermarkOption=request.form['watermarkOption']
    
    try:
        
        watermark_pdf(inputFilePath,outputFilePath,watermark,watermarkOption)
        watermarkUrl= f'/download/{outputFileName}'
        return jsonify({'success': True, 'file':watermarkUrl})
        #return jsonify({'success': False, 'error':err})
    except:
        return jsonify({'success': False, 'error':'erorr watermarking'})

@app.route('/image',methods=['post'])
def image():
    sessionId=request.form['sessionId']
    filename=session['files'][0]
    inputFilePath = os.path.join(app.config['TEMP_FOLDER'], filename)
    outputFileFolder = generate_temp_folder()
    os.makedirs(os.path.join(app.config['TEMP_FOLDER'], outputFileFolder))
    outputFilePath= os.path.join(app.config['TEMP_FOLDER'], outputFileFolder )
    try:
        
        imageType=request.form['imageType']
        imageValue=None
        if 'imageValue' in request.form:
            imageValue=request.form['imageValue'].split(',')
        image_pdf(inputFilePath,outputFilePath,imageType,imageValue)
        
        imageUrl= f'/download/{outputFileFolder}'
        return jsonify({'success': True, 'file':imageUrl})
        #return jsonify({'success': False, 'error':f"{str(err)}done"})
    except:
        return jsonify({'success': False, 'error':'err'})



@app.route('/download/<filename>', methods=['get'])

def download_file(filename):
    if os.path.isdir(os.path.join(app.config['TEMP_FOLDER'], filename)):
        directory_path = os.path.join(app.config['TEMP_FOLDER'], filename)
        if not os.path.isdir(directory_path):
            return jsonify({'success': False, 'error': 'Directory not found'}), 404
        files_data = []
        try:
        
            for filenames in os.listdir(directory_path):
                
                file_path = os.path.join(directory_path, filenames)
                if os.path.isfile(file_path):
                    try:

                        with open(file_path, 'rb') as f:
                            file_data = f.read()
                        encoded_data = base64.b64encode(file_data).decode('utf-8')
                        files_data.append({
                            'filename': filenames,
                            'file_data': encoded_data,
                            'mime_type': get_mime_type(filenames)
                        })
                    except Exception as e:
                        # Log the error and continue with the next file
                        #print(f"Error reading file {filenames}: {str(e)}")
                        return jsonify({'success': False, 'error': f"{str(file_path)}"}), 404

            if not files_data:
                return jsonify({'success': False, 'error': 'No files found in the directory'}), 404
            try:
                return jsonify({
                    'success': True,
                    'directory_name': filename,
                    'files': files_data
                }), 200
            except:
                return jsonify({'success': False, 'error': 'Directory found'}), 404
        except:
            return jsonify({'success': False, 'error': 'Directory not found'}), 404
    else:

        file_path = os.path.join(app.config['TEMP_FOLDER'], filename)
        try:
            with open(file_path, 'rb') as f:
                file_data = f.read()
            encoded_data = base64.b64encode(file_data).decode('utf-8')
            return jsonify({
                'success': True,
                'filename': filename,
                'file_data': encoded_data,
                'mime_type': get_mime_type(filename)  # Adjust based on your file type
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


def split_pdf(inputFile,outputFile,splitType,splitValue=None):
    input_pdf=fitz.open(inputFile)
    totalPages=len(input_pdf)
    splitPagesList=getPagesList( splitType,totalPages,splitValue)
    output_pdf=fitz.open()
    for pageNo in splitPagesList :
        output_pdf.insert_pdf(input_pdf, from_page=pageNo, to_page=pageNo)
    try:
        
        
        
        
        output_pdf.save(outputFile)
        input_pdf.close()
        output_pdf.close()
        return 'done'
    except:
        return splitPagesList
def getPagesList(Type,totalPages,Value=None):
    try:
        PagesList=[]
        if Type =='a':
            for i in range(totalPages):
                    PagesList.append(i)
        if Type =='m':
            for i in range(totalPages//2):
                    PagesList.append(i)
        elif Type =='f':
            for i in range(totalPages//2,totalPages):
                    PagesList.append(i)
        elif Type =='o':
            for i in range(0,totalPages,2):
                    PagesList.append(i)
        elif Type =='e':
            for i in range(1,totalPages,2):
                    PagesList.append(i)
        elif Type =='c':
            PagesList = [int(x) - 1 for x in Value]

        return PagesList
    except:
        return 'pagelisterr'
def encrypt_pdf(inputFile,outputFile,password):
    input_pdf=fitz.open(inputFile)
    encrypt_meth = fitz.PDF_ENCRYPT_AES_256
    perm = int(
        fitz.PDF_PERM_ACCESSIBILITY  
        | fitz.PDF_PERM_PRINT 
        | fitz.PDF_PERM_COPY  
    )
   
        
    input_pdf.save(
            outputFile,
            encryption=encrypt_meth, 
            user_pw=password,  
            permissions=perm 
    )
    input_pdf.close()


def decrypt_pdf(inputFile,outputFile,password):
    input_pdf=fitz.open(inputFile)
    if input_pdf.is_encrypted:
        if input_pdf.authenticate(password):
                input_pdf.save(outputFile)
                input_pdf.close()
        else:
            return 'err'

def compress_pdf(inputFile,outputFile,compressOption):
    original_size = os.path.getsize(inputFile)
    input_pdf = fitz.open(inputFile)
    if compressOption == 'l':
            
            params = {
                'deflate':True,  
                'clean':True,  
                'garbage':1,  
                'linear':True  

            }
    elif  compressOption == 'h':
        params = {
                'deflate':True,  
                'clean':True,  
                'garbage':1,  
                'linear':True, 
                'pretty':False,
                'ascii':False 

            }
    else:
        params = {
                'deflate':True,  
                'clean':True,  
                'garbage':2,  
                'linear':True  

            }
    input_pdf.save(outputFile,**params)    
    
    
    try:    
        
        
        
        input_pdf.close()
        compressed_size = os.path.getsize(outputFile)
        compression_percent = (1 - compressed_size / original_size) * 100
        return compression_percent
        #return 'done'
    except:
                return compressOption

def watermark_pdf(inputFile,outputFile,watermark,pos):
    input_pdf=fitz.open(inputFile)
    for i,page in enumerate(input_pdf):
        if watermark=='<pg>':
           text=str(i+1)
        else:
            text=watermark
        rect=page.rect
        fontsize=12
        x,y=getPos(pos,rect.width,rect.height)
        p=fitz.Point(x, y)
            
           
            
            
            
            
                
        page.insert_text(
        p,  # position
        text,
        
        fontsize=fontsize,
        color=(0, 0, 0),  # Light gray color
        rotate=0
    )
    
    input_pdf.save(outputFile)
    input_pdf.close()   

def image_pdf(inputFile,outputFile,imageType,imageValue=None):
    input_pdf=fitz.open(inputFile)
    totalPages=len(input_pdf)
    imagePagesList=getPagesList(imageType,totalPages,imageValue)
    
        
    for pageNo in imagePagesList :
        page=input_pdf[pageNo]
        pix=page.get_pixmap()
        
        pix.save(f"{outputFile}/page {pageNo+1}.png")
            
    input_pdf.close()

def getPos(pos,w,h):
    if pos=='tl':
        return w/8,h/24
    elif pos=='tr':
        return 6*w/8,h/24
    elif pos=='bl':
        return w/8,23*h/24
    elif pos=='br':
        return 6*w/8,23*h/24



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

def get_mime_type(filename):
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or 'application/octet-stream'



def zip_directory(directory):
    zip_filename =generate_temp_filename('zip.zip')
    zip_filepath = os.path.join(app.config['TEMP_FOLDER'], zip_filename)

    file_paths=[]
    try:
        
        for root, dirs,files in os.walk(directory):
            
            for filename in files:
                file_path = os.path.join(root, filename)
                file_paths.append(file_path) 
        with ZipFile(zip_filepath,'w') as zip: 
            for file in file_paths: 
                zip.write(file) 
        return zip_filepath
    except:
        return 'faeli'


@scheduler.task('interval', id='do_job_1', seconds=3600, misfire_grace_time=900)
def job1():
    cleanup_temp_files()  # Call the cleanup function



def main():
    
    app.run(port=int(os.environ.get('PORT', 80)))
   
    
    

if __name__ == "__main__":
    main()