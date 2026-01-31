<?php

namespace Xgenious\XgPageBuilder\Core\Traits;

/**
 * Trait ExtractsFieldValues
 * 
 * Provides helper methods for extracting values from complex field types
 * like IMAGE and URL fields that can return either simple values or structured objects.
 * 
 * @package Xgenious\XgPageBuilder\Core\Traits
 */
trait ExtractsFieldValues
{
    /**
     * Extract numeric image ID from IMAGE field value.
     * 
     * IMAGE fields can return:
     * - Numeric ID (legacy)
     * - Array/Object with structure: {id, url, alt, title, filename, size, mime_type}
     * 
     * This method safely extracts the ID for use with render_image_markup_by_attachment_id()
     * 
     * @param mixed $imageValue
     * @return int|string
     */
    protected function extractImageId($imageValue)
    {
        if (is_array($imageValue)) {
            return $imageValue['id'] ?? '';
        }

        if (is_object($imageValue)) {
            return $imageValue->id ?? '';
        }

        return $imageValue ?? '';
    }

    /**
     * Extract URL string from URL field value.
     * 
     * URL fields can return:
     * - String URL (legacy/simple)
     * - Array/Object with structure: {url, target, rel, title, aria_label, ...}
     * 
     * This method safely extracts the URL string for use in href attributes
     * 
     * @param mixed $urlValue
     * @return string
     */
    protected function extractUrl($urlValue)
    {
        if (is_array($urlValue)) {
            return $urlValue['url'] ?? '#';
        }

        if (is_object($urlValue)) {
            return $urlValue->url ?? '#';
        }

        return $urlValue ?? '#';
    }

    /**
     * Extract link target from URL field value.
     * 
     * @param mixed $urlValue
     * @return string
     */
    protected function extractUrlTarget($urlValue)
    {
        if (is_array($urlValue)) {
            return $urlValue['target'] ?? '_self';
        }

        if (is_object($urlValue)) {
            return $urlValue->target ?? '_self';
        }

        return '_self';
    }

    /**
     * Extract image IDs from a repeater field that contains image fields.
     * 
     * @param array $repeaterItems
     * @param string $imageFieldName
     * @return array
     */
    protected function extractRepeaterImageIds(array $repeaterItems, string $imageFieldName): array
    {
        $ids = [];

        foreach ($repeaterItems as $item) {
            if (isset($item[$imageFieldName])) {
                $ids[] = $this->extractImageId($item[$imageFieldName]);
            }
        }

        return array_filter($ids);
    }

    /**
     * Extract multiple image IDs from a repeater field with multiple image fields.
     * 
     * @param array $repeaterItems
     * @param array $imageFieldNames
     * @return array
     */
    protected function extractRepeaterMultipleImageIds(array $repeaterItems, array $imageFieldNames): array
    {
        $ids = [];

        foreach ($repeaterItems as $item) {
            foreach ($imageFieldNames as $fieldName) {
                if (isset($item[$fieldName])) {
                    $ids[] = $this->extractImageId($item[$fieldName]);
                }
            }
        }

        return array_filter($ids);
    }

    /**
     * Extract image URL directly from IMAGE field value.
     * 
     * @param mixed $imageValue
     * @return string
     */
    protected function extractImageUrl($imageValue)
    {
        if (is_array($imageValue)) {
            return $imageValue['url'] ?? '';
        }

        if (is_object($imageValue)) {
            return $imageValue->url ?? '';
        }

        return '';
    }

    /**
     * Extract image alt text from IMAGE field value.
     * 
     * @param mixed $imageValue
     * @param string $fallback
     * @return string
     */
    protected function extractImageAlt($imageValue, string $fallback = '')
    {
        if (is_array($imageValue)) {
            return $imageValue['alt'] ?? $fallback;
        }

        if (is_object($imageValue)) {
            return $imageValue->alt ?? $fallback;
        }

        return $fallback;
    }
}
