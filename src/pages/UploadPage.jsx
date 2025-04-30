// client/src/pages/UploadPage.jsx
import React, { useState } from 'react';
import axios from 'axios';

const UploadPage = ({ token }) => {
  const [file, setFile] = useState(null);
  const [version, setVersion] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [link, setLink] = useState('');

  const handleUpload = async () => {
    if (!file || !version) return alert('File and version required');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('version', version);

    try {
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLink(res.data.downloadUrl);
      setQrCode(res.data.qrCode);
    } catch (err) {
      alert('Upload failed');
    }
  };

  return (
    <div>
      <h4>Upload New File</h4>
      <div className="mb-3">
        <input className="form-control mb-2" type="file" onChange={(e) => setFile(e.target.files[0])} />
        <input
          className="form-control mb-2"
          type="text"
          placeholder="Version"
          onChange={(e) => setVersion(e.target.value)}
        />
        <button className="btn btn-success" onClick={handleUpload}>Upload File</button>
      </div>
      {link && (
        <div className="mt-3">
          <p>Download Link: <a href={link}>{link}</a></p>
          {qrCode && <img src={qrCode} alt="QR Code" style={{ maxWidth: '150px' }} />}
        </div>
      )}
    </div>
  );
};

export default UploadPage;
