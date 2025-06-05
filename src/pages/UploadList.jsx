import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Popconfirm, Typography, Image, Tooltip, Card, message } from 'antd';
import { FaDownload, FaTrash, FaCopy } from 'react-icons/fa';
import toast from 'react-hot-toast';

const { Title } = Typography;

const UploadList = ({ token }) => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploads();
  }, [token]);

  const fetchUploads = async () => {
    try {
      const res = await axios.get('http://localhost:5000/upload/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUploads(res.data.data);
      } else {
        message.error('Failed to fetch files');
      }
    } catch (err) {
      console.error(err);
      message.error('Error fetching files');
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (qrCodeUrl) => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qr-code.png';
    link.click();
  };

  const handleDelete = async (fileId) => {
    try {
      await axios.delete(`http://localhost:5000/upload/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploads((prev) => prev.filter((file) => file.id !== fileId));
      toast.success('File deleted successfully');
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      message.success('File link copied to clipboard');
    }).catch(() => {
      message.error('Failed to copy');
    });
  };

  const columns = [
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Project name',
      dataIndex: 'project_name',
      key: 'project_name',
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: 'Download Link',
      dataIndex: 'downloadUrl',
      key: 'downloadUrl',
      render: (url) => {
        const fullUrl = `http://localhost:5000${url}`;
        return (
          <Tooltip title="Click to copy">
            <Button
              type="link"
              icon={<FaCopy />}
              onClick={() => copyToClipboard(fullUrl)}
            >
              Copy Link
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title: 'QR Code',
      dataIndex: 'qrCode',
      key: 'qrCode',
      render: (qr) => (
        <div style={{ backgroundColor: '#f0f2f5', padding: 6, borderRadius: 6, textAlign: 'center' }}>
          <Image
            src={qr}
            alt="QR Code"
            width={80}
            height={80}
            preview={false}
          />
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, file) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="primary"
            icon={<FaDownload />}
            size="small"
            onClick={() => downloadQRCode(file.qrCode)}
          >
            QR
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this file?"
            onConfirm={() => handleDelete(file.id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Button danger size="small" icon={<FaTrash />}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Card
      title={<Title level={4} style={{ marginBottom: 0 }}>📁 Uploaded Files</Title>}
      bordered={false}
      style={{ margin: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
    >
      <Table
        columns={columns}
        dataSource={uploads}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 5 }}
        bordered
      />
    </Card>
  );
};

export default UploadList;
