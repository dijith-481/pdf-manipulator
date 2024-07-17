from project import split_pdf,encrypt_pdf,decrypt_pdf,compress_pdf
import pytest
def test_split_pdf():
    assert split_pdf('test.pdf','hello.pdf','m')=={'message': 'done', 'success': True}
    with pytest.raises(TypeError):
       assert split_pdf("test.pdf")
    with pytest.raises(TypeError):   
        assert split_pdf("hello.docx")
    with pytest.raises(TypeError):
        assert split_pdf('test.pdf','1')

def test_encrypt_pdf():
    assert encrypt_pdf('test.pdf','hello.pdf','hello')=={'message': 'done', 'success': True}
    with pytest.raises(TypeError):
       assert encrypt_pdf("test.pdf")
    with pytest.raises(TypeError):   
        assert encrypt_pdf("test.pdf",'hello.pdf')
    
    assert encrypt_pdf('test.doc','hello.pdf', '1234')=={'error': 'Fail Encrypting', 'success': False}

def test_decrypt_pdf():
    assert decrypt_pdf('decrypt.pdf','hello.pdf','1234')=={'message': 'done', 'success': True}
    with pytest.raises(TypeError):
       assert decrypt_pdf("decrypt.pdf")
    with pytest.raises(TypeError):   
        assert decrypt_pdf("decrypt.pdf",'hello.pdf')
    
    assert decrypt_pdf('decrypt.pdf','hello.pdf', '12345678')=={'error': 'Password Mismatched', 'success': False}


def test_compress_pdf():
    assert compress_pdf('test.pdf','hello.pdf','m')=={'message': 'done', 'success': True}
    with pytest.raises(TypeError):
       assert compress_pdf("test.pdf")
    with pytest.raises(TypeError):   
        assert compress_pdf("test.pdf",'hello.pdf')
    with pytest.raises(UnboundLocalError): 
        assert compress_pdf('test.pdf','hello.pdf', 'k')