import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError, language }) => {
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const html5QrCode = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: 250 },
        false
      );

      html5QrCode.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          setIsScanning(false);
        },
        (errorMessage) => {
          onScanError && onScanError(errorMessage);
        }
      );

      setScanner(html5QrCode);

      return () => {
        if (scanner) {
          scanner.clear().catch(error => {
            console.error("Failed to clear html5Qrcode scanner", error);
          });
        }
      };
    }
  }, [isScanning, onScanSuccess, onScanError]);

  const startScanning = () => {
    setIsScanning(true);
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5Qrcode scanner", error);
      });
    }
    setIsScanning(false);
  };

  return (
    <div className="qr-scanner-container">
      <h3>QR Code Check-In</h3>
      
      {!isScanning ? (
        <div>
          <div className="qr-placeholder">
            <div style={{ 
              width: '300px', 
              height: '300px', 
              border: '3px dashed #ccc', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '20px auto',
              borderRadius: '10px'
            }}>
              <div style={{ textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '3rem' }}>📱</div>
                <p>Place QR code in front of camera</p>
              </div>
            </div>
          </div>
          <button 
            className="next-btn" 
            onClick={startScanning}
            style={{ marginBottom: '20px' }}
          >
            📷 Start Scanning
          </button>
        </div>
      ) : (
        <div>
          <div id="qr-reader" style={{ width: '100%' }}></div>
          <button 
            className="back-btn" 
            onClick={stopScanning}
            style={{ marginTop: '20px' }}
          >
            Stop Scanning
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
