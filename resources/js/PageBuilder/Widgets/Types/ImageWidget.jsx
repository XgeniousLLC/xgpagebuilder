import React from 'react';

const ImageWidget = ({ 
  src = 'https://via.placeholder.com/600x300?text=Click+to+change+image', 
  alt = 'Image', 
  width = 'auto',
  height = 'auto',
  alignment = 'left',
  caption = ''
}) => {
  const getAlignmentClasses = () => {
    const alignments = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    };
    return alignments[alignment] || alignments.left;
  };

  return (
    <div className={getAlignmentClasses()}>
      <img 
        src={src} 
        alt={alt}
        style={{ 
          width: width === 'auto' ? 'auto' : width,
          height: height === 'auto' ? 'auto' : height,
          maxWidth: '100%'
        }}
        className="rounded shadow-sm"
        loading="lazy"
      />
      {caption && (
        <p className="mt-2 text-sm text-gray-600 italic">
          {caption}
        </p>
      )}
    </div>
  );
};

export default ImageWidget;