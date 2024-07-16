from project import split_pdf,encrypt_pdf,decrypt_pdf,compress_pdf
import pytest
def test_split_pdf():
    assert split_pdf('test.pdf','hello.pdf','m')=='done'
    with pytest.raises(TypeError):
       assert split_pdf("test.pdf")
    with pytest.raises(TypeError):   
        assert split_pdf("hello.docx")
    with pytest.raises(TypeError):
        assert split_pdf('test.pdf','1')

def test_encrypt_pdf():
    assert encrypt_pdf('test.pdf','hello.pdf','hello')=='file is encrypted'
    with pytest.raises(TypeError):
       assert encrypt_pdf("test.pdf")
    with pytest.raises(TypeError):   
        assert encrypt_pdf("test.pdf",'hello.pdf')
    
    assert encrypt_pdf('test.doc','hello.pdf', '1234')=='error encrypting'

def test_decrypt_pdf():
    assert decrypt_pdf('decrypt.pdf','hello.pdf','1234')=='file is decrypted'
    with pytest.raises(TypeError):
       assert decrypt_pdf("decrypt.pdf")
    with pytest.raises(TypeError):   
        assert decrypt_pdf("decrypt.pdf",'hello.pdf')
    
    assert decrypt_pdf('decrypt.pdf','hello.pdf', '12345678')=='passwords doesnt match'


def test_compress_pdf():
    assert compress_pdf('test.pdf','hello.pdf','m')=='file is compressed'
    with pytest.raises(TypeError):
       assert compress_pdf("test.pdf")
    with pytest.raises(TypeError):   
        assert compress_pdf("test.pdf",'hello.pdf')
    with pytest.raises(UnboundLocalError): 
        assert compress_pdf('test.pdf','hello.pdf', 'k')