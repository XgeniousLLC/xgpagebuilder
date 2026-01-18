import React from 'react';

const HeadingWidget = ({ text = 'Sample Heading', tag = 'h2' }) => {
  const Tag = tag;
  
  const getDefaultStyles = () => {
    const styles = {
      h1: 'text-4xl font-bold',
      h2: 'text-3xl font-bold',
      h3: 'text-2xl font-bold',
      h4: 'text-xl font-bold',
      h5: 'text-lg font-bold',
      h6: 'text-base font-bold'
    };
    return styles[tag] || styles.h2;
  };

  return (
    <Tag className={`${getDefaultStyles()} text-gray-900 mb-4`}>
      {text}
    </Tag>
  );
};

export default HeadingWidget;