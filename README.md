# PDF Manipulator

This repository contains a PDF manipulator tool and website designed to do various PDF operations.
Created with Flask PyMuPDF

    #### Video Demo:  https://youtu.be/qyKWyEYmvpk?si=Cew8cnrARntcvD83

## Functionality

This provides the following functionalities:

- **Merging PDFs:** Combine multiple PDF files into a single document.
- **Splitting PDFs:** create a PDF file with individual pages or sections options include odd,even,custom upto middle and from middle.
- **Encrypt Pdf:** Encrypt the PDf with a secure password.
- **Decrypt Pdf:** Decrypt the PDf with password.
  **Compress Pdf:**: compress Pdf to smaller file.
- **Adding Header Footer and PageNo:** Embed Header Footer or PageNo into PDF pages.
  **Convert to Images:** Convert individual pages or sections options include odd,even,custom upto middle, from middle and all Pages.

## Frameworks and Libraries

The project uses the following Python libraries:

- **PyMuPDF:** A powerful library for interacting with PDF files, enabling operations like merging, splitting, and other page manipulation.
- **Flask:** A powerful Flask is a micro web framework written in Python.

This project also uses **Tailwind Css** for CSS for styling and Material Symbols for icons.

## Requirements

To run the PDF manipulator tool, ensure you have the following Python libraries installed:

```bash
pip install  Flask Flask-Session Werkzeug PyMuPDF Flask-APScheduler
```

or simply run

```bash
pip install -r Requirements.txt
```

## Project Structure

project.py -main python file
test.py -unit test
some pdf files for unit test

/static -static files for js,css ,tailwind
templates - index.html

## Usage

```bash
flask --app project run
```
