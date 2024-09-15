import React from 'react';

const getFileType = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp',"heic", "HEIC"].includes(extension)) {
      return 'image';
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
      return 'video';
    } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
      return 'audio';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else {
      return 'unknown';
    }
  };
  

const FileViewer = ({ fileUrl }) => {
  const fileType = getFileType(fileUrl);

  if (fileType === 'image') {
    return <img src={fileUrl} alt="File" style={{ width: '100%', height: 'auto' }} />;
  } else if (fileType === 'video') {
    return (
      <video controls style={{ width: '100%' }}>
        <source src={fileUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  } else if (fileType === 'audio') {
    return (
      <audio controls style={{ width: '100%' }}>
        <source src={fileUrl} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    );
  } else if (fileType === 'pdf') {
    return (
      <iframe
        src={fileUrl}
        title="PDF"
        style={{ width: '100%', height: '500px', border: 'none' }}
      ></iframe>
    );
  } else {
    return <p>Cannot display this file type.</p>;
  }
};

export default FileViewer;
