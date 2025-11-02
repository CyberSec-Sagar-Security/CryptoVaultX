/**
 * FileViewerModal Component
 * Displays file content for view-only access (no download)
 * Supports: PDF, Images, Text, Office documents
 * 
 * Features:
 * - Auto-responsive PDF viewer with dynamic height adjustment
 * - Perfect centering and alignment
 * - Smooth animations and modern styling
 * - Responsive breakpoints for all screen sizes
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, ZoomIn, ZoomOut, RotateCw, Download, AlertCircle, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { base64ToArrayBuffer, decryptFile, getSessionKey } from '../../lib/crypto';

// Add CSS animations for smooth transitions
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  
  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out;
  }
  
  .pdf-viewer-frame {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Responsive PDF viewer adjustments */
  @media (max-width: 767px) {
    .pdf-viewer-frame {
      min-height: 75vh !important;
    }
  }
  
  @media (min-width: 768px) and (max-width: 991px) {
    .pdf-viewer-frame {
      min-height: 80vh !important;
    }
  }
  
  @media (min-width: 992px) {
    .pdf-viewer-frame {
      min-height: 85vh !important;
    }
  }
`;
document.head.appendChild(style);

interface FileViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  fileName: string;
  contentType: string;
  permission: 'full_access' | 'view' | 'download';
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  isOpen,
  onClose,
  fileId,
  fileName,
  contentType,
  permission,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth * 0.9);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Dynamic height adjustment for PDF viewer
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setContainerWidth(width * 0.85); // Desktop: 85%
      } else if (width >= 992) {
        setContainerWidth(width * 0.90); // Laptop: 90%
      } else if (width >= 768) {
        setContainerWidth(width * 0.95); // Tablet: 95%
      } else {
        setContainerWidth(width * 0.98); // Mobile: 98%
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-adjust iframe height for PDF content
  useEffect(() => {
    if (!iframeRef.current || contentType !== 'application/pdf') return;

    const adjustHeight = () => {
      try {
        const iframe = iframeRef.current;
        if (!iframe) return;

        // Try to access iframe content (may fail due to CORS)
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc && iframeDoc.body) {
          const scrollHeight = iframeDoc.body.scrollHeight;
          if (scrollHeight > 0) {
            iframe.style.height = `${Math.min(scrollHeight, window.innerHeight * 0.92)}px`;
          }
        }
      } catch (err) {
        // CORS restrictions - use default auto height
        console.debug('Auto height adjustment skipped (CORS)');
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', adjustHeight);
      // Retry after a delay in case content loads slowly
      const timer = setTimeout(adjustHeight, 500);
      
      return () => {
        iframe.removeEventListener('load', adjustHeight);
        clearTimeout(timer);
      };
    }
  }, [fileUrl, contentType]);

  useEffect(() => {
    if (isOpen && fileId) {
      loadFile();
    }
    
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [isOpen, fileId]);

  const loadFile = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

      console.log('🔍 Loading file for viewing:', fileId);

      // Fetch encrypted file
      const response = await fetch(`${apiUrl}/api/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to load file');
      }

      // Get decryption metadata from headers
      const ivBase64 = response.headers.get('X-File-IV');
      let algo = response.headers.get('X-File-Algo') || 'HIGH';
      const fileNameFromHeader = response.headers.get('X-File-Name');
      
      // Use content type from props, but fallback to response header if available
      const actualContentType = contentType || response.headers.get('Content-Type') || 'application/octet-stream';
      
      console.log('📄 File details:', {
        fileName: fileNameFromHeader || fileName,
        contentType: actualContentType,
        originalContentType: contentType
      });
      
      // Map algorithm names to encryption levels
      let encryptionLevel: 'HIGH' | 'MEDIUM' | 'LOW';
      algo = algo.toUpperCase();
      
      if (algo.includes('AES-256') || algo === 'HIGH') {
        encryptionLevel = 'HIGH';
      } else if (algo.includes('AES-192') || algo === 'MEDIUM') {
        encryptionLevel = 'MEDIUM';
      } else if (algo.includes('AES-128') || algo === 'LOW') {
        encryptionLevel = 'LOW';
      } else {
        console.warn(`Unknown encryption algo: ${algo}, defaulting to HIGH`);
        encryptionLevel = 'HIGH';
      }
      
      console.log('📦 Received encrypted file, IV:', ivBase64, 'Algo:', algo, '→ Level:', encryptionLevel);

      if (!ivBase64) {
        throw new Error('Missing encryption metadata (IV)');
      }

      // Get encrypted data
      const encryptedData = await response.arrayBuffer();
      console.log('📥 Encrypted data size:', encryptedData.byteLength, 'bytes');
      
      // Decrypt file
      console.log('🔓 Decrypting file...');
      const sessionKey = await getSessionKey(encryptionLevel);
      const ivBuffer = base64ToArrayBuffer(ivBase64);
      
      const decryptedData = await decryptFile(
        encryptedData,
        ivBuffer,
        sessionKey,
        encryptionLevel
      );
      
      console.log('✅ Decryption successful! Size:', decryptedData.byteLength, 'bytes');

      // Create blob URL from decrypted data with correct MIME type
      const mimeType = actualContentType;
      const blob = new Blob([decryptedData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      console.log('🎨 Created blob URL for viewing with MIME type:', mimeType);
      setFileUrl(url);
    } catch (err: any) {
      console.error('❌ File load error:', err);
      setError(err.message || 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = () => {
    if (permission === 'view') {
      alert('Download is not permitted for view-only files');
      return;
    }

    if (!fileUrl) return;

    // Trigger download
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderFileContent = () => {
    const fileType = contentType.toLowerCase();

    // PDF Files - Auto-responsive with perfect fit and dynamic height
    if (fileType === 'application/pdf') {
      return (
        <div className="relative flex justify-center items-start w-full h-full min-h-[85vh] max-h-[95vh] bg-gradient-to-br from-slate-800/30 to-slate-900/50 rounded-xl overflow-hidden p-2 sm:p-3 md:p-4">
          <iframe
            ref={iframeRef}
            src={`${fileUrl}#view=FitH&toolbar=1&navpanes=0&scrollbar=1&zoom=page-fit`}
            className="pdf-viewer-frame w-full h-auto min-h-[80vh] max-h-[92vh] border-0 rounded-lg shadow-2xl transition-all duration-300"
            title={fileName}
            style={{
              height: 'auto',
              aspectRatio: 'auto',
              objectFit: 'contain',
              backgroundColor: 'white',
              width: `${Math.min(containerWidth, window.innerWidth * 0.95)}px`
            }}
          />
        </div>
      );
    }

    // Image Files
    if (fileType.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center h-full overflow-auto">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      );
    }

    // Text Files
    if (fileType.startsWith('text/') || fileType === 'application/json') {
      return (
        <iframe
          src={fileUrl}
          className="w-full h-full border-0 bg-white"
          title={fileName}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
          }}
        />
      );
    }

    // Microsoft Office Documents (Word, Excel, PowerPoint)
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileType === 'application/msword' ||
      fileType === 'application/vnd.ms-excel' ||
      fileType === 'application/vnd.ms-powerpoint'
    ) {
      // Use Microsoft Office Online Viewer
      const encodedUrl = encodeURIComponent(fileUrl);
      return (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`}
          className="w-full h-full border-0"
          title={fileName}
        />
      );
    }

    // Video Files
    if (fileType.startsWith('video/')) {
      return (
        <video
          src={fileUrl}
          controls
          className="w-full h-full"
          style={{ maxHeight: '100%', objectFit: 'contain' }}
        >
          Your browser does not support video playback.
        </video>
      );
    }

    // Audio Files
    if (fileType.startsWith('audio/')) {
      return (
        <div className="flex items-center justify-center h-full">
          <audio src={fileUrl} controls className="w-full max-w-2xl">
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    // Unsupported file type
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <FileText className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg mb-2">Preview not available</p>
        <p className="text-sm">File type: {contentType}</p>
        {permission !== 'view' && (
          <Button
            onClick={handleDownload}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download to View
          </Button>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4 md:p-6 lg:p-8 animate-fadeIn">
      <div
        className="bg-slate-900 border-2 border-blue-500/50 rounded-2xl shadow-2xl 
                   w-full h-auto
                   min-h-[85vh] max-h-[95vh]
                   max-w-full sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-7xl
                   flex flex-col overflow-hidden animate-scaleIn"
        style={{ backgroundColor: 'rgb(15, 23, 42)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 md:p-4 border-b-2 border-blue-500/30 flex-shrink-0"
          style={{ backgroundColor: 'rgb(30, 41, 59)' }}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white truncate">{fileName}</h2>
              <p className="text-xs text-gray-400">
                {permission === 'view' ? 'View Only (No Download)' : 
                 permission === 'download' ? 'Download Only' : 
                 'Full Access'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            {(contentType.startsWith('image/') || contentType === 'application/pdf') && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleZoomOut}
                  className="text-gray-400 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-400 min-w-[50px] text-center">{zoom}%</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleZoomIn}
                  className="text-gray-400 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Rotate Control */}
            {contentType.startsWith('image/') && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRotate}
                className="text-gray-400 hover:text-white"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            )}

            {/* Download Button */}
            {permission !== 'view' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                className="text-gray-400 hover:text-white"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}

            {/* Close Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              title="Close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content Area - Auto-responsive container with dynamic height */}
        <div className="flex-1 overflow-auto relative bg-slate-900" style={{ minHeight: '80vh' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[80vh]">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="ml-3 text-white">Loading file...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[80vh] text-red-400">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="text-lg">{error}</p>
              <Button onClick={loadFile} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          ) : (
            renderFileContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default FileViewerModal;
