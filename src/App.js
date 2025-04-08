import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one PDF file.');
      return;
    }

    let pdfData = '';
    const formData = new FormData();
    files.forEach(file => {
      // var data = readFileSync(file);
      // console.log("data : " + data);
      // pdfData = data;
      formData.append('pdfs', file);
    });

    setLoading(true);
    setErrorMsg('');
    setResults([]);

    try {
      const res = await axios.post('http://localhost:8000/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = res.data.results;
      if (!Array.isArray(data) || data.length === 0) {
        setErrorMsg('No valid OCR results were returned.');
        return;
      }

      setResults(Array.isArray(res.data.results) ? res.data.results : []);


      alert('Upload and OCR processing successful!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Upload failed. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Upload PDF Files</h2>
      <input type="file" accept="application/pdf" multiple onChange={handleChange} />
      <button onClick={handleUpload} style={{ marginLeft: '10px' }}>
        {loading ? 'Processing...' : 'Upload & Process'}
      </button>

      {errorMsg && <p style={{ color: 'red', marginTop: '20px' }}>{errorMsg}</p>}

      {results.length > 0 &&
        results.map((result, index) => (
          <div key={index} style={{ marginTop: '40px', border: '1px solid #ccc', padding: '20px' }}>
            <h3>File: {result.filename}</h3>
            <p><strong>Match %:</strong> {result.matchPercentage ?? 0}%</p>
            <p><strong>Mismatch %:</strong> {result.mismatchPercentage ?? 0}%</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <div style={{ width: '48%' }}>
                <h4>Original PDF Text (utf-8)</h4>
                <textarea
                  readOnly
                  value={result.pdfText || 'Not available'}
                  style={{ width: '100%', height: '300px' }}
                ></textarea>
              </div>
              <div style={{ width: '48%' }}>
                <h4>OCR Result (JSON)</h4>
                <textarea
                  readOnly
                  value={JSON.stringify(result.ocrJson, null, 2) || 'Not available'}
                  style={{ width: '100%', height: '300px' }}
                ></textarea>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

export default App;
