# PDF Manipulator

This repository contains a  PDF manipulator tool and website designed to do various PDF operations. 
Created with Flask PyMuPDF

## Functionality

This provides the following functionalities:

* **Merging PDFs:** Combine multiple PDF files into a single document.
* **Splitting PDFs:** create  a PDF file with individual pages or sections options include odd,even,custom upto middle and from middle.
* **Encrypt Pdf:** Encrypt the PDf with a secure password.
* **Decrypt Pdf:** Decrypt the PDf with  password.
**Compress Pdf:**: compress Pdf to smaller file.
* **Adding Header Footer and PageNo:** Embed Header Footer or  PageNo  into PDF pages.
**Convert to Images:** Convert individual pages or sections options include odd,even,custom upto middle, from middle and all Pages.

## Frameworks and Libraries

The project uses the following Python libraries:

* **PyMuPDF:** A powerful library for interacting with PDF files, enabling operations like merging, splitting, and other page manipulation.
* **Flask:** A powerful Flask is a micro web framework written in Python. 

This project also uses **Tailwind Css** for CSS for styling and Material Symbols for icons.

## Requirements

To run the PDF manipulator tool, ensure you have the following Python libraries installed:

```bash
pip install  Flask Flask-Session Werkzeug PyMuPDF Flask-APScheduler
```
## Project Structure
 project.py -main python file
 test.py -unit test
 some pdf files for unit test


 /static  -static files for js,css ,tailwind
 templates - index.html


## Usage

Detailed instructions on using the tool.

Tool can either be used on the project website or as a command line toll by importing respective pdf manipulation functions.
each names as [action]_pdf().

Website is a single page Application that  offers Upload Option  with any selected action.
/Upload of flask recieves it and save securely at temp folder and returns page details including total pages.

page will be rendered in the website then user can select options regrading their selected action which will be sent to /process of flask app.
after processing the  either the direct url or the file is returned as json which  will be rendered in the page.

