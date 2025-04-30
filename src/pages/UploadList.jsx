// client/src/pages/UploadList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UploadList = ({ token }) => {
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await axios.get('http://localhost:5000/uploads', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUploads(res.data);
      } catch (err) {
        alert('Failed to fetch uploads');
      }
    };

    fetchUploads();
  }, [token]);

  return (
    <div>
      <h4>Uploaded Files</h4>
      <ul className="list-group">
        {uploads.map((file) => (
          <li className="list-group-item" key={file.id}>
            <strong>{file.filename}</strong> (v{file.version})<br />
            <a href={file.download_url}>{file.download_url}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UploadList;
