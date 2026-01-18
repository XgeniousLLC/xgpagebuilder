import React, { useState, useEffect, useRef } from 'react';
import {
  Link, ExternalLink, Mail, Phone, FileText, Hash,
  Monitor, Smartphone, ChevronDown, ChevronRight,
  Plus, Trash2, TestTube, AlertCircle, CheckCircle,
  Target, Shield, Tag, Settings, Eye
} from 'lucide-react';

/**
 * EnhancedLinkPicker - Comprehensive link management component
 *
 * Features:
 * - Smart link type detection with visual indicators
 * - Advanced target and behavior options
 * - SEO controls (rel attributes, title, etc.)
 * - Custom HTML attributes manager
 * - UTM parameter builder
 * - Link validation and testing
 * - Progressive disclosure UI
 */
const EnhancedLinkPicker = ({
  value = {},
  onChange,
  enabledLinkTypes = [ 'external', 'email', 'phone', 'file'],
  enableAdvancedOptions = true,
  enableSEOControls = true,
  enableUTMTracking = false,
  enableCustomAttributes = true,
  enableLinkTesting = true,
  enableResponsiveBehavior = false,
  allowedTargets = { '_self': 'Same Window', '_blank': 'New Window/Tab', '_parent': 'Parent Frame', '_top': 'Top Frame' },
  commonRelValues = ['nofollow', 'noopener', 'noreferrer', 'sponsored']
}) => {
  // Utility to merge value with defaults, replacing null with empty strings
  const sanitizeValue = (val) => {
    if (!val || typeof val !== 'object') return {};
    
    const sanitized = {};
    Object.keys(val).forEach(key => {
      if (val[key] === null) {
        sanitized[key] = '';
      } else if (Array.isArray(val[key])) {
        sanitized[key] = val[key];
      } else if (typeof val[key] === 'object') {
        sanitized[key] = sanitizeValue(val[key]);
      } else {
        sanitized[key] = val[key];
      }
    });
    return sanitized;
  };

  const sanitizedValue = sanitizeValue(value);

  // State management
  const [linkData, setLinkData] = useState({
    url: '',
    text: '',
    type: 'external',
    target: '_self',
    rel: [],
    title: '',
    id: '',
    class: '',
    custom_attributes: [],
    utm_parameters: {
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: ''
    },
    responsive_behavior: {
      desktop_target: '_self',
      mobile_target: '_self'
    },
    ...sanitizedValue
  });

  const [activeAdvancedTab, setActiveAdvancedTab] = useState('advanced');
  const [linkValidation, setLinkValidation] = useState({ isValid: true, message: '' });
  const [isTestingLink, setIsTestingLink] = useState(false);

  // Update parent when linkData changes - Use ref to avoid infinite loops
  const onChangeRef = useRef(onChange);

  // Update ref when onChange prop changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Call onChange only when linkData actually changes
  useEffect(() => {
    onChangeRef.current(linkData);
  }, [linkData]); // Only depend on linkData, not the onChange function

  // Auto-detect link type based on URL
  useEffect(() => {
    if (!linkData.url) return;

    const url = linkData.url.toLowerCase();
    let detectedType = 'external';

    if (url.includes('@') || url.startsWith('mailto:')) {
      detectedType = 'email';
    } else if (url.startsWith('tel:') || /^\+?\d[\d\s\-\(\)]*\d$/.test(url)) {
      detectedType = 'phone';
    } else if (url.startsWith('/') || url.startsWith('#')) {
      detectedType = 'internal';
    } else if (url.includes('.pdf') || url.includes('.doc') || url.includes('.zip')) {
      detectedType = 'file';
    }

    if (detectedType !== linkData.type && enabledLinkTypes.includes(detectedType)) {
      setLinkData(prev => ({ ...prev, type: detectedType }));
    }
  }, [linkData.url, linkData.type, enabledLinkTypes]);

  // Link type configurations
  const linkTypeConfig = {
    external: { icon: ExternalLink, label: 'External URL', color: 'text-green-600', placeholder: 'https://example.com' },
    email: { icon: Mail, label: 'Email Address', color: 'text-purple-600', placeholder: 'user@example.com' },
    phone: { icon: Phone, label: 'Phone Number', color: 'text-orange-600', placeholder: '+1 (555) 123-4567' },
    file: { icon: FileText, label: 'File Download', color: 'text-red-600', placeholder: '/path/to/file.pdf' },
    anchor: { icon: Hash, label: 'Anchor Link', color: 'text-gray-600', placeholder: '#section-id' }
  };

  const updateLinkData = (key, value) => {
    setLinkData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateNestedData = (section, key, value) => {
    setLinkData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const validateURL = (url, type) => {
    if (!url) {
      return { isValid: true, message: '' };
    }

    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cleanEmail = url.replace('mailto:', '');
        return {
          isValid: emailRegex.test(cleanEmail),
          message: emailRegex.test(cleanEmail) ? 'Valid email address' : 'Invalid email format'
        };

      case 'phone':
        const phoneRegex = /^(\+?\d[\d\s\-\(\)]*\d|\d)$/;
        const cleanPhone = url.replace('tel:', '').replace(/[\s\-\(\)]/g, '');
        return {
          isValid: phoneRegex.test(cleanPhone),
          message: phoneRegex.test(cleanPhone) ? 'Valid phone number' : 'Invalid phone format'
        };

      default:
        try {
          new URL(url);
          return { isValid: true, message: 'Valid URL' };
        } catch {
          return { isValid: false, message: 'Invalid URL format' };
        }
    }
  };

  const testLink = async () => {
    setIsTestingLink(true);
    try {
      // Simulate link testing - in real implementation, this would ping the URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLinkValidation({ isValid: true, message: 'Link is accessible' });
    } catch {
      setLinkValidation({ isValid: false, message: 'Link is not accessible' });
    } finally {
      setIsTestingLink(false);
    }
  };

  const addCustomAttribute = () => {
    const newAttributes = [...linkData.custom_attributes, { name: '', value: '' }];
    updateLinkData('custom_attributes', newAttributes);
  };

  const updateCustomAttribute = (index, field, value) => {
    const updatedAttributes = linkData.custom_attributes.map((attr, i) =>
      i === index ? { ...attr, [field]: value } : attr
    );
    updateLinkData('custom_attributes', updatedAttributes);
  };

  const removeCustomAttribute = (index) => {
    const filteredAttributes = linkData.custom_attributes.filter((_, i) => i !== index);
    updateLinkData('custom_attributes', filteredAttributes);
  };

  const toggleRelValue = (relValue) => {
    const currentRel = linkData.rel || [];
    const updatedRel = currentRel.includes(relValue)
      ? currentRel.filter(r => r !== relValue)
      : [...currentRel, relValue];
    updateLinkData('rel', updatedRel);
  };

  const currentTypeConfig = linkTypeConfig[linkData.type] || linkTypeConfig.external;
  const IconComponent = currentTypeConfig.icon;

  return (
    <div className="enhanced-link-picker space-y-4 border border-gray-200 rounded-lg p-4">
      {/* Header with Link Type Indicator */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 ${currentTypeConfig.color}`}>
          <IconComponent className="w-4 h-4" />
          <span className="text-sm font-medium">{currentTypeConfig.label}</span>
        </div>
      </div>

      {/* URL Input with Type Detection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          URL / Link Destination
        </label>
        <div className="block">
          <input
            type="text"
            value={linkData.url ?? ''}
            onChange={(e) => {
              updateLinkData('url', e.target.value);
              setLinkValidation(validateURL(e.target.value, linkData.type));
            }}
            placeholder={currentTypeConfig.placeholder}
            className={`flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              linkValidation.isValid ? 'border-gray-300' : 'border-red-300'
            }`}
          />
            {linkValidation.message && (
                <div className={`flex gap-2 mt-2 text-xs ${linkValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {linkValidation.isValid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {linkValidation.message}
                </div>
            )}
        </div>
      </div>

      {/* Link Type Selector */}
      {enabledLinkTypes.length > 1 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Link Type
          </label>
          <div className="flex gap-2">
            {enabledLinkTypes.map(type => {
              const config = linkTypeConfig[type];
              const TypeIcon = config.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateLinkData('type', type)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
                    linkData.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  title={config.label}
                >
                  <TypeIcon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Basic Target Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Link Target
        </label>
        <select
          value={linkData.target}
          onChange={(e) => updateLinkData('target', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(allowedTargets).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Advanced Tabs Section */}
      {(enableAdvancedOptions || enableSEOControls || enableUTMTracking || enableCustomAttributes) && (
        <div className="border-t pt-4 border-slate-200">
          {/* Tab Navigation - Icon Only */}
          <div className="flex gap-2 mb-4">
            {enableAdvancedOptions && (
              <button
                type="button"
                onClick={() => setActiveAdvancedTab(activeAdvancedTab === 'advanced' ? null : 'advanced')}
                className={`p-2 rounded-md border transition-colors ${
                  activeAdvancedTab === 'advanced'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Advanced Options"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {enableSEOControls && (
              <button
                type="button"
                onClick={() => setActiveAdvancedTab(activeAdvancedTab === 'seo' ? null : 'seo')}
                className={`p-2 rounded-md border transition-colors ${
                  activeAdvancedTab === 'seo'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="SEO & Accessibility"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}

            {enableUTMTracking && (
              <button
                type="button"
                onClick={() => setActiveAdvancedTab(activeAdvancedTab === 'utm' ? null : 'utm')}
                className={`p-2 rounded-md border transition-colors ${
                  activeAdvancedTab === 'utm'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="UTM Tracking Parameters"
              >
                <Target className="w-4 h-4" />
              </button>
            )}

            {enableCustomAttributes && (
              <button
                type="button"
                onClick={() => setActiveAdvancedTab(activeAdvancedTab === 'attributes' ? null : 'attributes')}
                className={`p-2 rounded-md border transition-colors ${
                  activeAdvancedTab === 'attributes'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="Custom HTML Attributes"
              >
                <Tag className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeAdvancedTab === 'advanced' && (
            <div className="space-y-4">
              {/* ID Attribute */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Attribute
                </label>
                <input
                  type="text"
                  value={linkData.id ?? ''}
                  onChange={(e) => updateLinkData('id', e.target.value)}
                  placeholder="unique-id"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* CSS Classes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CSS Classes
                </label>
                <input
                  type="text"
                  value={linkData.class ?? ''}
                  onChange={(e) => updateLinkData('class', e.target.value)}
                  placeholder="class1 class2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {activeAdvancedTab === 'seo' && (
            <div className="space-y-4">
              {/* Title Attribute */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Tooltip)
                </label>
                <input
                  type="text"
                  value={linkData.title ?? ''}
                  onChange={(e) => updateLinkData('title', e.target.value)}
                  placeholder="Link description for accessibility"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Rel Attributes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rel Attributes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {commonRelValues.map(relValue => (
                    <label key={relValue} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={linkData.rel.includes(relValue)}
                        onChange={() => toggleRelValue(relValue)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="capitalize">{relValue}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeAdvancedTab === 'utm' && (
            <div className="space-y-3">
              {Object.entries(linkData.utm_parameters).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key.replace('utm_', '').replace('_', ' ').toUpperCase()}
                  </label>
                  <input
                    type="text"
                    value={value ?? ''}
                    onChange={(e) => updateNestedData('utm_parameters', key, e.target.value)}
                    placeholder={`Enter ${key.replace('utm_', '')}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {activeAdvancedTab === 'attributes' && (
            <div className="space-y-4">
              {linkData.custom_attributes.map((attr, index) => (
                <div key={index} className="space-y-3 p-3 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Attribute {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomAttribute(index)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attribute Name
                    </label>
                    <input
                      type="text"
                      value={attr.name ?? ''}
                      onChange={(e) => updateCustomAttribute(index, 'name', e.target.value)}
                      placeholder="data-id, aria-label, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attribute Value
                    </label>
                    <input
                      type="text"
                      value={attr.value ?? ''}
                      onChange={(e) => updateCustomAttribute(index, 'value', e.target.value)}
                      placeholder="Attribute value"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addCustomAttribute}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm text-gray-700 w-full justify-center"
              >
                <Plus className="w-4 h-4" />
                Add Custom Attribute
              </button>
            </div>
          )}
        </div>
      )}

      {/* Responsive Behavior Section */}
      {enableResponsiveBehavior && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Monitor className="w-4 h-4" />
            Responsive Behavior
          </div>

          <div className="grid grid-cols-2 gap-3 pl-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Monitor className="w-4 h-4 inline mr-1" />
                Desktop Target
              </label>
              <select
                value={linkData.responsive_behavior.desktop_target}
                onChange={(e) => updateNestedData('responsive_behavior', 'desktop_target', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(allowedTargets).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Smartphone className="w-4 h-4 inline mr-1" />
                Mobile Target
              </label>
              <select
                value={linkData.responsive_behavior.mobile_target}
                onChange={(e) => updateNestedData('responsive_behavior', 'mobile_target', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(allowedTargets).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Link Preview */}
      {linkData.url && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Eye className="w-4 h-4" />
            Link Preview
          </div>
          <div class="bg-gray-50 p-3 rounded-md border border-gray-200">
            <div class="text-sm text-gray-600 mb-1">How this link will appear:</div>
            <a
              href={linkData.url}
              target={linkData.target}
              rel={linkData.rel.join(' ')}
              title={linkData.title}
              className="text-blue-600 hover:text-blue-800 underline break-all block w-full text-xs break-all"
              onClick={(e) => e.preventDefault()}
            >
              {linkData.text || linkData.url}
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLinkPicker;
