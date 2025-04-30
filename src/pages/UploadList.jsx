import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UploadList = ({ token }) => {
  const [uploads, setUploads] = useState([]); // Initialize with an empty array
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const res = await axios.get('http://localhost:5000/upload/list', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(res);

        // Assuming the response structure is { success: true, data: [...] }
        if (res.data.success) {
          setUploads(res.data.data); // Set the uploads array from response
        } else {
          setError('Failed to fetch files');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching files');
      } finally {
        setLoading(false); // Stop loading once fetch is complete
      }
    };

    fetchUploads();
  }, [token]);

  if (loading) {
    return <p>Loading uploads...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  // Helper function to download the QR code as a PNG
  const downloadQRCode = (qrCodeUrl) => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qr-code.png'; // Set the name of the downloaded file
    link.click();
  };

  return (
    <div>
      <h4>Uploaded Files</h4>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Version</th>
            <th>Download Link</th>
            <th>QR Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {uploads.length > 0 ? (
            uploads.map((file) => (
              <tr key={file.id}>
                <td>{file.filename}</td>
                <td>{file.version}</td>
                <td>
                  <a href={`http://localhost:5000${file.downloadUrl}`} target="_blank" rel="noopener noreferrer">
                    Download File
                  </a>
                </td>
                <td>
                  <img
                    src={file.qrCode}
                    alt="QR Code"
                    style={{ width: '100px', height: '100px' }}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-info"
                    onClick={() => downloadQRCode(file.qrCode)}
                  >
                    Download QR Code
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No files uploaded</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UploadList;
