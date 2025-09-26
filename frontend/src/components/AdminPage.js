import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tab, Tabs } from 'react-bootstrap';
import DocumentUpload from './DocumentUpload';
import DocumentManager from './DocumentManager';
import SearchAnalytics from './SearchAnalytics';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <div className="admin-panel">
            <div className="p-4 border-bottom">
              <h2 className="mb-1">Admin Panel</h2>
              <p className="text-muted mb-0">
                Manage documents, monitor search performance, and configure the search engine
              </p>
            </div>

            <Tabs
              activeKey={activeTab}
              onSelect={setActiveTab}
              className="px-4"
            >
              <Tab eventKey="upload" title="Document Upload">
                <div className="p-4">
                  <DocumentUpload />
                </div>
              </Tab>

              <Tab eventKey="manage" title="Document Management">
                <div className="p-4">
                  <DocumentManager />
                </div>
              </Tab>

              <Tab eventKey="analytics" title="Search Analytics">
                <div className="p-4">
                  <SearchAnalytics />
                </div>
              </Tab>
            </Tabs>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminPage;