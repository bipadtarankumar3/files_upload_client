import React, { useState } from 'react';
import { Card, Upload, Input, Button, Typography, Image, message, Row, Col } from 'antd';
import { UploadOutlined, CopyOutlined } from '@ant-design/icons';
import axios from 'axios';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

const UploadPage = ({ token }) => {
  const [file, setFile] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [version, setVersion] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !version || !projectName.trim()) {
      message.error('Please select a file, enter project name, and version.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_name', projectName);
    formData.append('version', version);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setLink(res.data.downloadUrl);
      setQrCode(res.data.qrCode);
      toast.success('Upload successful!');
    } catch (err) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: 24,
        minHeight: '80vh',
        backgroundColor: '#f0f2f5',
      }}
    >
      <Card
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%' }}
        title={<Title level={4} style={{ marginBottom: 0 }}>📤 Upload New File</Title>}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col span={6}>
            <Upload
              beforeUpload={(file) => {
                setFile(file);
                return false; // prevent automatic upload
              }}
              maxCount={1}
              showUploadList={file ? [{ name: file.name }] : false}
            >
              <Button icon={<UploadOutlined />} block>
                Select File
              </Button>
            </Upload>
          </Col>

          <Col span={6}>
            <Input
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </Col>

          <Col span={6}>
            <Input
              placeholder="Version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </Col>

          <Col span={6}>
            <Button
              type="primary"
              block
              onClick={handleUpload}
              loading={loading}
              style={{ height: '40px' }}
            >
              Upload File
            </Button>
          </Col>
        </Row>

        {link && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Text strong>Download Link:</Text>
            <br />
            <Input
              readOnly
              value={link}
              style={{ marginTop: 8, maxWidth: '100%', userSelect: 'all', cursor: 'text' }}
              addonAfter={
                <Button
                  type="link"
                  icon={<CopyOutlined />}
                  onClick={() => {
                    navigator.clipboard.writeText(link);
                    message.success('Link copied to clipboard!');
                  }}
                />
              }
            />

            {qrCode && (
              <div style={{ marginTop: 16 }}>
                <Image
                  src={qrCode}
                  alt="QR Code"
                  width={150}
                  style={{ borderRadius: 8 }}
                  preview={false}
                />
                <Button
                  type="primary"
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    const linkEl = document.createElement('a');
                    linkEl.href = qrCode;
                    linkEl.download = 'qr-code.png';
                    document.body.appendChild(linkEl);
                    linkEl.click();
                    document.body.removeChild(linkEl);
                  }}
                >
                  Download QR Code
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default UploadPage;
