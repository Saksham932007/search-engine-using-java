import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col, Spinner, ProgressBar, Tab, Tabs } from 'react-bootstrap';
import DocumentService from '../services/DocumentService';

function DocumentUpload() {
  const [activeTab, setActiveTab] = useState('manual');
  
  // Manual document state
  const [manualForm, setManualForm] = useState({
    title: '',
    content: '',
    url: ''
  });
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileForm, setFileForm] = useState({
    title: '',
    url: ''
  });
  
  // Directory indexing state
  const [directoryForm, setDirectoryForm] = useState({
    path: '',
    recursive: false
  });
  
  // File path indexing state
  const [filePathForm, setFilePathForm] = useState({
    path: '',
    title: '',
    url: ''
  });
  
  // Common state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const showMessage = (text, variant = 'success') => {
    setMessage({ text, variant });
    setTimeout(() => setMessage(null), 5000);
  };

  // Manual document indexing
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.title || !manualForm.content) {
      showMessage('Title and content are required', 'danger');
      return;
    }

    setLoading(true);
    try {
      await DocumentService.indexDocument(
        manualForm.title,
        manualForm.content,
        manualForm.url || `manual://document-${Date.now()}`
      );
      showMessage('Document indexed successfully!');
      setManualForm({ title: '', content: '', url: '' });
    } catch (error) {
      showMessage('Error indexing document: ' + (error.response?.data?.message || error.message), 'danger');
    } finally {
      setLoading(false);
    }
  };

  // File upload
  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showMessage('Please select a file', 'danger');
      return;
    }

    setLoading(true);
    setUploadProgress(10);
    
    try {
      setUploadProgress(50);
      await DocumentService.uploadFile(
        selectedFile,
        fileForm.title,
        fileForm.url
      );
      setUploadProgress(100);
      showMessage('File uploaded and indexed successfully!');
      setSelectedFile(null);
      setFileForm({ title: '', url: '' });
      // Reset file input
      document.getElementById('fileInput').value = '';
    } catch (error) {
      showMessage('Error uploading file: ' + (error.response?.data?.message || error.message), 'danger');
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Directory indexing
  const handleDirectorySubmit = async (e) => {
    e.preventDefault();
    if (!directoryForm.path) {
      showMessage('Directory path is required', 'danger');
      return;
    }

    setLoading(true);
    try {
      await DocumentService.indexDirectory(directoryForm.path, directoryForm.recursive);
      showMessage('Directory indexing started successfully!');
      setDirectoryForm({ path: '', recursive: false });
    } catch (error) {
      showMessage('Error indexing directory: ' + (error.response?.data?.message || error.message), 'danger');
    } finally {
      setLoading(false);
    }
  };

  // File path indexing
  const handleFilePathSubmit = async (e) => {
    e.preventDefault();
    if (!filePathForm.path) {
      showMessage('File path is required', 'danger');
      return;
    }

    setLoading(true);
    try {
      await DocumentService.indexFilePath(
        filePathForm.path,
        filePathForm.title,
        filePathForm.url
      );
      showMessage('File indexed successfully!');
      setFilePathForm({ path: '', title: '', url: '' });
    } catch (error) {
      showMessage('Error indexing file: ' + (error.response?.data?.message || error.message), 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setActiveTab('file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div>
      <div className="mb-4">
        <h4>Document Upload & Indexing</h4>
        <p className="text-muted">
          Add documents to the search index using various methods
        </p>
      </div>

      {message && (
        <Alert variant={message.variant} dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {uploadProgress > 0 && (
        <div className="mb-4">
          <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
        </div>
      )}

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        {/* Manual Document Entry */}
        <Tab eventKey="manual" title="Manual Entry">
          <Card>
            <Card.Body>
              <Form onSubmit={handleManualSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter document title"
                        value={manualForm.title}
                        onChange={(e) => setManualForm({...manualForm, title: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>URL (optional)</Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://example.com/document"
                        value={manualForm.url}
                        onChange={(e) => setManualForm({...manualForm, url: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Content *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    placeholder="Enter document content..."
                    value={manualForm.content}
                    onChange={(e) => setManualForm({...manualForm, content: e.target.value})}
                    required
                  />
                </Form.Group>
                
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Index Document'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        {/* File Upload */}
        <Tab eventKey="file" title="File Upload">
          <Card>
            <Card.Body>
              <Form onSubmit={handleFileSubmit}>
                <div
                  className="upload-area mb-3"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <Form.Group>
                    <Form.Label>Select File</Form.Label>
                    <Form.Control
                      id="fileInput"
                      type="file"
                      accept=".txt,.pdf,.doc,.docx,.html,.xml,.rtf,.odt"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <Form.Text className="text-muted">
                      Supported formats: TXT, PDF, DOC, DOCX, HTML, XML, RTF, ODT
                    </Form.Text>
                  </Form.Group>
                  
                  {selectedFile && (
                    <Alert variant="info" className="mt-3">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Alert>
                  )}
                </div>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Custom Title (optional)</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Override filename as title"
                        value={fileForm.title}
                        onChange={(e) => setFileForm({...fileForm, title: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Custom URL (optional)</Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://example.com/file"
                        value={fileForm.url}
                        onChange={(e) => setFileForm({...fileForm, url: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Button type="submit" variant="primary" disabled={loading || !selectedFile}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Upload & Index'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        {/* File Path */}
        <Tab eventKey="filepath" title="File Path">
          <Card>
            <Card.Body>
              <Form onSubmit={handleFilePathSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>File Path *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="/path/to/your/document.pdf"
                    value={filePathForm.path}
                    onChange={(e) => setFilePathForm({...filePathForm, path: e.target.value})}
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter the absolute path to the file on the server
                  </Form.Text>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Custom Title (optional)</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Override filename as title"
                        value={filePathForm.title}
                        onChange={(e) => setFilePathForm({...filePathForm, title: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Custom URL (optional)</Form.Label>
                      <Form.Control
                        type="url"
                        placeholder="https://example.com/file"
                        value={filePathForm.url}
                        onChange={(e) => setFilePathForm({...filePathForm, url: e.target.value})}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Index File'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>

        {/* Directory Indexing */}
        <Tab eventKey="directory" title="Directory">
          <Card>
            <Card.Body>
              <Form onSubmit={handleDirectorySubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Directory Path *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="/path/to/your/documents/"
                    value={directoryForm.path}
                    onChange={(e) => setDirectoryForm({...directoryForm, path: e.target.value})}
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter the absolute path to the directory containing documents
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Index subdirectories recursively"
                    checked={directoryForm.recursive}
                    onChange={(e) => setDirectoryForm({...directoryForm, recursive: e.target.checked})}
                  />
                </Form.Group>
                
                <Alert variant="warning">
                  <strong>Note:</strong> Directory indexing may take time depending on the number of files.
                  This operation runs in the background.
                </Alert>
                
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : 'Index Directory'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}

export default DocumentUpload;