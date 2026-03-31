---
layout: default
title: Field Reference
nav_order: 5
---

# PHP Field Reference

All fields are created via the `FieldManager` static factory class. Every field supports a common set of base methods, plus type-specific options documented below.

---

## Table of Contents

- [Common Base Methods](#common-base-methods)
- [Basic Input](#basic-input)
  - [TEXT](#text)
  - [TEXTAREA](#textarea)
  - [NUMBER](#number)
  - [RANGE](#range)
  - [EMAIL](#email)
  - [PASSWORD](#password)
- [Selection](#selection)
  - [SELECT](#select)
  - [MULTISELECT](#multiselect)
  - [RADIO](#radio)
- [Boolean](#boolean)
  - [TOGGLE](#toggle)
  - [CHECKBOX](#checkbox)
- [Color](#color)
  - [COLOR](#color-1)
  - [GRADIENT](#gradient)
- [Media](#media)
  - [IMAGE](#image)
  - [VIDEO](#video)
  - [ICON / ICON_INPUT](#icon--icon_input)
- [Date & Time](#date--time)
  - [DATE](#date)
  - [TIME](#time)
  - [DATETIME](#datetime)
- [URL & Links](#url--links)
  - [URL / ENHANCED_URL](#url--enhanced_url)
  - [WEB_LINK](#web_link)
  - [EMAIL_LINK](#email_link)
  - [PHONE_LINK](#phone_link)
  - [DOWNLOAD_LINK](#download_link)
  - [INTERNAL_LINK](#internal_link)
  - [LINK_GROUP](#link_group)
- [Editors](#editors)
  - [CODE](#code)
  - [WYSIWYG](#wysiwyg)
- [Layout & Spacing](#layout--spacing)
  - [DIMENSION](#dimension)
  - [ALIGNMENT](#alignment)
- [Advanced Style Groups](#advanced-style-groups)
  - [BACKGROUND_GROUP](#background_group)
  - [TYPOGRAPHY_GROUP](#typography_group)
  - [BORDER_SHADOW_GROUP](#border_shadow_group)
- [Containers & Organization](#containers--organization)
  - [GROUP](#group)
  - [REPEATER](#repeater)
  - [TAB_GROUP](#tab_group)
  - [STYLE_STATES](#style_states)
  - [RESPONSIVE_GROUP](#responsive_group)
  - [CUSTOM_TABS](#custom_tabs)
- [Display](#display)
  - [HEADING](#heading)
  - [DIVIDER](#divider)

---

## Common Base Methods

Every field type inherits these chainable methods from `BaseField`:

| Method | Description |
|---|---|
| `setLabel(string)` | Label shown in the panel |
| `setDefault(mixed)` | Default value |
| `setRequired(bool)` | Mark field as required |
| `setPlaceholder(string)` | Placeholder text |
| `setDescription(string)` | Help text shown below the field |
| `setCondition(array)` | Conditional display rules |
| `dependsOn(string $field, mixed $value, string $operator)` | Show field only when another field matches. Operators: `=`, `!=`, `in`, `not_in`, `not_empty`, `empty` |
| `setValidation(array)` | Validation rules |
| `setSelectors(array)` | CSS selector map for style fields |
| `setAttributes(array)` | Extra HTML attributes |
| `setCssClass(string)` | CSS class on the field element |
| `setResponsive(bool)` | Enable responsive breakpoint support |
| `setUnit(string)` | Unit string (px, em, %, etc.) |
| `toArray()` | Convert field config to array |
| `toJson()` | Convert field config to JSON |

**Example — conditional field:**
```php
FieldManager::TEXT()
    ->setLabel('Custom Label')
    ->setPlaceholder('Enter text...')
    ->dependsOn('show_label', true)
```

---

## Basic Input

### TEXT

Single-line text input.

```php
FieldManager::TEXT()
    ->setLabel('Button Text')
    ->setDefault('Click Me')
    ->setMaxLength(100)
    ->setMinLength(2)
    ->setPattern('^[a-zA-Z]+$')  // regex pattern
```

| Method | Description |
|---|---|
| `setMaxLength(int)` | Maximum character count |
| `setMinLength(int)` | Minimum character count |
| `setPattern(string)` | Regex validation pattern |

---

### TEXTAREA

Multi-line text input.

```php
FieldManager::TEXTAREA()
    ->setLabel('Description')
    ->setDefault('')
    ->setRows(5)
    ->setCols(40)
    ->setResize('vertical')   // 'none', 'horizontal', 'vertical', 'both'
    ->setAllowHtml(true)
```

| Method | Description |
|---|---|
| `setRows(int)` | Number of visible rows |
| `setCols(int)` | Number of visible columns |
| `setResize(string)` | Resize behaviour |
| `setAllowHtml(bool)` | Allow HTML content |

---

### NUMBER

Numeric input with optional min/max/step.

```php
FieldManager::NUMBER()
    ->setLabel('Font Size')
    ->setDefault(16)
    ->setMin(1)
    ->setMax(200)
    ->setStep(1)
    ->setAllowDecimals(false)
    ->setUnit('px')
```

| Method | Description |
|---|---|
| `setMin(int\|float)` | Minimum value |
| `setMax(int\|float)` | Maximum value |
| `setStep(int\|float)` | Step increment |
| `setAllowDecimals(bool)` | Allow decimal values |
| `setRange(int, int)` | Shorthand for min + max |

---

### RANGE

Slider control. Extends `NUMBER` — all number methods apply.

```php
FieldManager::RANGE()
    ->setLabel('Opacity')
    ->setDefault(100)
    ->setMin(0)
    ->setMax(100)
    ->setStep(5)
```

---

### EMAIL

Email input (extends TEXT, same extra methods).

```php
FieldManager::EMAIL()
    ->setLabel('Email Address')
    ->setPlaceholder('you@example.com')
    ->setRequired(true)
```

---

### PASSWORD

Password input (extends TEXT, same extra methods).

```php
FieldManager::PASSWORD()
    ->setLabel('API Key')
    ->setRequired(true)
```

---

## Selection

### SELECT

Dropdown select.

```php
FieldManager::SELECT()
    ->setLabel('Text Align')
    ->setDefault('left')
    ->setOptions([
        'left'   => 'Left',
        'center' => 'Center',
        'right'  => 'Right',
    ])
    ->setSearchable(true)
    ->setClearable(false)
```

Helper presets:

```php
FieldManager::SELECT()
    ->setLabel('Font Family')
    ->addFontFamilyOptions()   // fills with common web-safe fonts

FieldManager::SELECT()
    ->setLabel('Font Weight')
    ->addFontWeightOptions()   // fills 100–900

FieldManager::SELECT()
    ->setLabel('Alignment')
    ->addTextAlignOptions()    // left / center / right / justify
```

| Method | Description |
|---|---|
| `setOptions(array)` | Key → label options array |
| `addOption(string $value, string $label)` | Add a single option |
| `setSearchable(bool)` | Enable option search |
| `setClearable(bool)` | Show clear button |
| `setGroupBy(string)` | Group options by key |
| `addFontFamilyOptions()` | Populate with web-safe fonts |
| `addFontWeightOptions()` | Populate with font weights |
| `addTextAlignOptions()` | Populate with text align options |

---

### MULTISELECT

Multiple-selection dropdown. Extends `SELECT` — all select methods apply.

```php
FieldManager::MULTISELECT()
    ->setLabel('Categories')
    ->setOptions([
        'news'   => 'News',
        'events' => 'Events',
        'blog'   => 'Blog',
    ])
    ->setMaxSelections(3)
    ->setShowCount(true)
```

| Method | Description |
|---|---|
| `setMaxSelections(int)` | Limit selections |
| `setShowCount(bool)` | Show selected count badge |

---

### RADIO

Radio button group. Extends `SELECT` — all select methods apply.

```php
FieldManager::RADIO()
    ->setLabel('Button Style')
    ->setDefault('solid')
    ->setOptions([
        'solid'   => 'Solid',
        'outline' => 'Outline',
        'ghost'   => 'Ghost',
    ])
```

---

## Boolean

### TOGGLE

On/off switch.

```php
FieldManager::TOGGLE()
    ->setLabel('Show Icon')
    ->setDefault(true)
    ->setOnText('Yes')
    ->setOffText('No')
    ->setSize('md')    // 'sm', 'md', 'lg'
    ->setColor('#4caf50')
```

| Method | Description |
|---|---|
| `setOnText(string)` | Label when enabled |
| `setOffText(string)` | Label when disabled |
| `setSize(string)` | Toggle size: `sm`, `md`, `lg` |
| `setColor(string)` | Active color |

---

### CHECKBOX

Checkbox input. Extends `TOGGLE` — same extra methods.

```php
FieldManager::CHECKBOX()
    ->setLabel('Open in new tab')
    ->setDefault(false)
```

---

## Color

### COLOR

Color picker.

```php
FieldManager::COLOR()
    ->setLabel('Background Color')
    ->setDefault('#ffffff')
    ->setFormat('hex')               // 'hex', 'rgb', 'rgba', 'hsl', 'hsla'
    ->setAllowTransparency(true)
    ->setShowInput(true)
    ->setSwatches(['#fff', '#000', '#ff0000'])
    ->addCommonSwatches()            // adds a standard color palette
```

| Method | Description |
|---|---|
| `setFormat(string)` | Output format: `hex`, `rgb`, `rgba`, `hsl`, `hsla` |
| `setAllowTransparency(bool)` | Show alpha/opacity channel |
| `setShowInput(bool)` | Show hex input box |
| `setSwatches(array)` | Custom swatch colors |
| `addCommonSwatches()` | Add standard palette swatches |
| `addBrandSwatches()` | Add brand color swatches |

---

### GRADIENT

Gradient picker.

```php
FieldManager::GRADIENT()
    ->setLabel('Background Gradient')
    ->setAllowedTypes(['linear', 'radial'])
    ->setShowAnglePicker(true)
    ->setShowPreview(true)
    ->setDefaultGradient('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
```

| Method | Description |
|---|---|
| `setDefaultGradient(string)` | Default CSS gradient value |
| `setAllowedTypes(array)` | Allowed types: `linear`, `radial` |
| `setShowPreview(bool)` | Show live preview swatch |
| `setShowAnglePicker(bool)` | Show angle/direction control |

---

## Media

### IMAGE

Image upload / media picker.

```php
FieldManager::IMAGE()
    ->setLabel('Hero Image')
    ->setAllowedTypes(['jpg', 'jpeg', 'png', 'webp', 'gif'])
    ->setMaxSize(5242880)   // bytes — default 5MB
    ->setMultiple(false)
```

| Method | Description |
|---|---|
| `setAllowedTypes(array)` | Allowed file extensions |
| `setMaxSize(int)` | Max file size in bytes |
| `setMultiple(bool)` | Allow multiple uploads |

---

### VIDEO

Video upload / media picker.

```php
FieldManager::VIDEO()
    ->setLabel('Background Video')
    ->setAllowedTypes(['video/mp4', 'video/webm'])
    ->setMaxSize(104857600)   // bytes — default 100MB
    ->setControls(false)
    ->setAutoplay(true)
    ->setLoop(true)
    ->setMuted(true)
    ->setPreload('auto')      // 'none', 'metadata', 'auto'
    ->setAllowPoster(true)
```

| Method | Description |
|---|---|
| `setAllowedTypes(array)` | Allowed MIME types |
| `setMaxSize(int)` | Max file size in bytes |
| `setMultiple(bool)` | Allow multiple uploads |
| `setControls(bool)` | Show video controls |
| `setAutoplay(bool)` | Autoplay the video |
| `setLoop(bool)` | Loop playback |
| `setMuted(bool)` | Mute by default |
| `setPreload(string)` | Preload behaviour |
| `setAllowPoster(bool)` | Allow poster image |

---

### ICON / ICON_INPUT

Visual icon picker with modal (Line Awesome library).

```php
FieldManager::ICON()               // preferred
// or:
FieldManager::ICON_INPUT()         // alias

    ->setLabel('Button Icon')
    ->setDefaultIcon('la-star')
    ->setPreviewSize(24)
    ->setAllowEmpty(true)
    ->setModalTitle('Choose an Icon')
    ->setCategories(['arrows', 'social', 'interface'])
```

| Method | Description |
|---|---|
| `setDefaultIcon(string)` | Default icon class |
| `setPreviewSize(int)` | Preview icon size in px |
| `setAllowEmpty(bool)` | Allow no icon selected |
| `setModalTitle(string)` | Modal window title |
| `setCategories(array)` | Filter available icon categories |

---

## Date & Time

### DATE

Date picker.

```php
FieldManager::DATE()
    ->setLabel('Publish Date')
    ->setDefault('2025-01-01')
    ->setFormat('Y-m-d')    // PHP date format
```

| Method | Description |
|---|---|
| `setFormat(string)` | PHP date format string — default `Y-m-d` |

---

### TIME

Time picker.

```php
FieldManager::TIME()
    ->setLabel('Start Time')
    ->setDefault('09:00')
```

---

### DATETIME

Combined date + time picker. Extends `DATE`.

```php
FieldManager::DATETIME()
    ->setLabel('Event Date & Time')
    ->setDefault('2025-06-01 10:00:00')
    ->setFormat('Y-m-d H:i:s')
```

---

## URL & Links

### URL / ENHANCED_URL

Full-featured URL input with target, rel, and accessibility options.

```php
FieldManager::URL()
    ->setLabel('Button Link')
    ->setDefault('#')
    ->setPlaceholder('https://example.com')
    ->setValidateUrl(true)
    ->setAllowedSchemes(['http', 'https'])
    ->setAllowRelative(true)
    ->setAllowAnchors(true)
    ->setShowTargetOptions(true)
    ->setShowRelOptions(true)
    ->setShowDownloadOptions(false)
    ->setEnablePreview(true)
    ->setEnableAccessibility(true)
    ->setEnableTracking(false)
```

| Method | Description |
|---|---|
| `setValidateUrl(bool)` | Validate URL format |
| `setAllowedSchemes(array)` | Allowed URL schemes |
| `setAllowRelative(bool)` | Allow relative URLs |
| `setAllowAnchors(bool)` | Allow `#anchor` links |
| `setShowTargetOptions(bool)` | Show `_blank`/`_self` target selector |
| `setShowRelOptions(bool)` | Show `nofollow`/`noopener` rel selector |
| `setShowDownloadOptions(bool)` | Show download attribute option |
| `setEnablePreview(bool)` | Show URL preview |
| `setEnableAccessibility(bool)` | Show aria-label field |
| `setEnableTracking(bool)` | Show UTM/tracking options |
| `setAutoDetectType(bool)` | Auto-detect URL type |

---

### WEB_LINK

Preset for external web links.

```php
FieldManager::WEB_LINK()
    ->setLabel('External Link')
```

---

### EMAIL_LINK

Preset for `mailto:` links.

```php
FieldManager::EMAIL_LINK()
    ->setLabel('Email Link')
    ->setDefault('mailto:hello@example.com')
```

---

### PHONE_LINK

Preset for `tel:` links.

```php
FieldManager::PHONE_LINK()
    ->setLabel('Phone Number')
    ->setDefault('tel:+1234567890')
```

---

### DOWNLOAD_LINK

Preset for file download links.

```php
FieldManager::DOWNLOAD_LINK()
    ->setLabel('Download File')
```

---

### INTERNAL_LINK

Preset for internal navigation links.

```php
FieldManager::INTERNAL_LINK()
    ->setLabel('Internal Page')
```

---

### LINK_GROUP

Advanced link manager with multiple link types, UTM tracking, SEO controls, and custom attributes.

```php
FieldManager::LINK_GROUP()
    ->setLabel('Link Settings')
    ->setLinkTypes(['internal', 'external', 'email', 'phone', 'file', 'anchor'])
    ->setDefaultTarget('_blank')
    ->setAllowedTargets(['_blank', '_self', '_parent'])
    ->enableAdvancedOptions(true)
    ->enableSEOControls(true)
    ->enableUTMTracking(true)
    ->enableCustomAttributes(true)
    ->enableLinkTesting(true)
    ->enableResponsiveBehavior(true)
    ->setDescription('Configure link destination and behaviour')
```

| Method | Description |
|---|---|
| `setLinkTypes(array)` | Allowed link types |
| `setDefaultTarget(string)` | Default `target` attribute |
| `setAllowedTargets(array)` | Selectable target options |
| `enableAdvancedOptions(bool)` | Show advanced controls |
| `enableSEOControls(bool)` | Show rel nofollow / noopener |
| `enableUTMTracking(bool)` | Show UTM parameter fields |
| `enableCustomAttributes(bool)` | Allow arbitrary attributes |
| `enableLinkTesting(bool)` | Add link test button |
| `enableResponsiveBehavior(bool)` | Per-breakpoint link targets |

---

## Editors

### CODE

Code editor with syntax highlighting.

```php
FieldManager::CODE()
    ->setLabel('Custom CSS')
    ->setLanguage('css')    // 'html', 'css', 'js', 'php', etc.
    ->setRows(10)
```

| Method | Description |
|---|---|
| `setLanguage(string)` | Syntax language — default `html` |
| (Inherits all TEXTAREA methods) | `setRows()`, `setCols()`, etc. |

---

### WYSIWYG

Rich text editor.

```php
FieldManager::WYSIWYG()
    ->setLabel('Content')
    ->setDefault('<p>Enter your content here.</p>')
    ->setToolbar(['bold', 'italic', 'underline', 'link', 'ul', 'ol'])
    ->setAllowHtml(true)
```

| Method | Description |
|---|---|
| `setToolbar(array)` | Toolbar buttons — default `['bold','italic','underline','link']` |
| (Inherits all TEXTAREA methods) | `setRows()`, etc. |

---

## Layout & Spacing

### DIMENSION

Four-sided dimension control (padding, margin, border-radius, etc.). Responsive by default.

```php
// Full padding control
FieldManager::DIMENSION()
    ->setLabel('Padding')
    ->asPadding()                      // preset: sides top/right/bottom/left, units px/em/rem/%
    ->setDefault(['top' => '10', 'right' => '20', 'bottom' => '10', 'left' => '20', 'unit' => 'px'])
    ->setLinked(true)                  // link all sides together
    ->setAllowNegative(false)

// Custom sides
FieldManager::DIMENSION()
    ->setLabel('Border Radius')
    ->asBorderRadius()                 // preset: sides top-left/top-right/bottom-right/bottom-left
    ->setMin(0)
    ->setMax(500)

// Single value
FieldManager::DIMENSION()
    ->setLabel('Gap')
    ->asSingleValue()
    ->setUnits(['px', 'em', 'rem'])
```

| Method | Description |
|---|---|
| `setSides(array)` | Which sides to show |
| `setUnits(array)` | Available units |
| `setLinked(bool)` | Link all sides to one input |
| `setAllowNegative(bool)` | Allow negative values |
| `setMin(int)` | Minimum value |
| `setMax(int)` | Maximum value |
| `setStep(int)` | Step increment |
| `setShowLabels(bool)` | Show side labels |
| `asPadding()` | Preset: top/right/bottom/left |
| `asMargin()` | Preset: top/right/bottom/left (allows negatives) |
| `asBorderRadius()` | Preset: four corner radii |
| `asSingleValue()` | Single value with unit |

---

### ALIGNMENT

Horizontal / flex alignment picker.

```php
// Text alignment
FieldManager::ALIGNMENT()
    ->setLabel('Text Align')
    ->asTextAlign()        // left / center / right / justify
    ->setDefault('left')

// Flex alignment
FieldManager::ALIGNMENT()
    ->setLabel('Content Align')
    ->asFlexAlign()        // flex-start / center / flex-end / space-between / space-around
    ->setProperty('justify-content')

// Custom alignments
FieldManager::ALIGNMENT()
    ->setLabel('Icon Position')
    ->setAlignments(['left', 'center', 'right'])
    ->setShowNone(false)
    ->setShowJustify(false)
```

| Method | Description |
|---|---|
| `setAlignments(array)` | Which alignment options to show |
| `setShowNone(bool)` | Include "none" option |
| `setShowJustify(bool)` | Include "justify" option |
| `setAllowDisable(bool)` | Allow disabling alignment |
| `setProperty(string)` | CSS property this maps to |
| `asTextAlign()` | Preset: text-align values |
| `asFlexAlign()` | Preset: flexbox alignment values |
| `asElementAlign()` | Preset: element alignment |

---

## Advanced Style Groups

### BACKGROUND_GROUP

Unified background control: solid color, gradient, or image.

```php
FieldManager::BACKGROUND_GROUP()
    ->setLabel('Section Background')
    ->setAllowedTypes(['none', 'color', 'gradient', 'image'])
    ->setDefaultType('color')
    ->setDefaultBackground(['type' => 'color', 'color' => '#ffffff'])
    ->setEnableHover(true)
    ->setEnableImage(true)
```

| Method | Description |
|---|---|
| `setAllowedTypes(array)` | Allowed types: `none`, `color`, `gradient`, `image` |
| `setDefaultType(string)` | Which tab is active by default |
| `setDefaultBackground(array)` | Default background config |
| `setEnableHover(bool)` | Enable hover state background |
| `setEnableImage(bool)` | Enable background image tab |

---

### TYPOGRAPHY_GROUP

Unified typography control: font family, size, weight, style, transforms, spacing.

```php
FieldManager::TYPOGRAPHY_GROUP()
    ->setLabel('Heading Typography')
    ->setEnableResponsive(true)
    ->setEnabledControls([
        'font_family', 'font_size', 'font_weight',
        'font_style', 'text_transform', 'text_decoration',
        'line_height', 'letter_spacing', 'word_spacing',
    ])
    ->setDefaultTypography([
        'font_family'  => 'Arial, sans-serif',
        'font_size'    => ['value' => 16, 'unit' => 'px'],
        'font_weight'  => '400',
        'line_height'  => ['value' => 1.5, 'unit' => 'em'],
    ])
    ->addFontFamily('Poppins', "'Poppins', sans-serif")
```

Disable / restrict controls:

```php
// Only show size and weight
FieldManager::TYPOGRAPHY_GROUP()
    ->setLabel('Badge Text')
    ->enableOnlyControls(['font_size', 'font_weight'])

// Hide specific controls
FieldManager::TYPOGRAPHY_GROUP()
    ->setLabel('Caption')
    ->disableControls(['word_spacing', 'text_decoration'])
```

| Method | Description |
|---|---|
| `setDefaultTypography(array)` | Default values for all controls |
| `setFontFamilies(array)` | Replace full font list |
| `addFontFamily(string $name, string $css)` | Add a custom font |
| `setEnabledControls(array)` | Set exact list of controls |
| `enableOnlyControls(array)` | Show only specified controls |
| `disableControls(array)` | Hide specified controls |
| `setEnableResponsive(bool)` | Enable responsive breakpoints |

Available controls: `font_family`, `font_size`, `font_weight`, `font_style`, `text_transform`, `text_decoration`, `line_height`, `letter_spacing`, `word_spacing`

---

### BORDER_SHADOW_GROUP

Unified border + box-shadow control.

```php
FieldManager::BORDER_SHADOW_GROUP()
    ->setLabel('Card Border & Shadow')
    ->setDefaultBorderShadow([
        'border' => ['width' => 1, 'style' => 'solid', 'color' => '#e0e0e0'],
        'shadow' => 'none',
    ])
    ->setBorderStyles(['solid', 'dashed', 'dotted', 'double'])
    ->setPerSideControls(true)
    ->setMultipleShadows(true)
    ->setMaxShadows(3)
    ->addShadowPreset('card', '0 2px 8px rgba(0,0,0,0.1)')
```

| Method | Description |
|---|---|
| `setDefaultBorderShadow(array)` | Default border + shadow values |
| `setBorderStyles(array)` | Allowed border styles |
| `setPerSideControls(bool)` | Individual per-side border controls |
| `setMultipleShadows(bool)` | Allow multiple layered shadows |
| `setMaxShadows(int)` | Max number of shadow layers |
| `addShadowPreset(string $name, string $css)` | Add a quick shadow preset |

Built-in shadow presets: `none`, `subtle`, `medium`, `strong`, `card`, `floating`

---

## Containers & Organization

### GROUP

Groups several fields together under a collapsible container.

```php
FieldManager::GROUP()
    ->setLabel('Icon Settings')
    ->setCollapsible(true)
    ->setFields([
        'icon'  => FieldManager::ICON()->setLabel('Icon'),
        'size'  => FieldManager::NUMBER()->setLabel('Size')->setDefault(24)->setUnit('px'),
        'color' => FieldManager::COLOR()->setLabel('Color')->setDefault('#333'),
    ])
```

| Method | Description |
|---|---|
| `setFields(array)` | Keyed array of field instances |
| `setCollapsible(bool)` | Make group collapsible |

---

### REPEATER

Repeatable row of fields (e.g. a list of items).

```php
FieldManager::REPEATER()
    ->setLabel('Team Members')
    ->setItemLabel('Member')
    ->setAddButtonText('Add Member')
    ->setMin(1)
    ->setMax(10)
    ->addField('name', FieldManager::TEXT()->setLabel('Name')->setRequired(true))
    ->addField('role', FieldManager::TEXT()->setLabel('Role'))
    ->addField('photo', FieldManager::IMAGE()->setLabel('Photo'))
    ->addField('bio', FieldManager::TEXTAREA()->setLabel('Bio')->setRows(3))
```

| Method | Description |
|---|---|
| `setFields(array)` | Set all fields at once (keyed array) |
| `addField(string $key, BaseField)` | Add a single field |
| `setMin(int)` | Minimum number of items |
| `setMax(int)` | Maximum number of items |
| `setItemLabel(string)` | Label for each row |
| `setAddButtonText(string)` | "Add" button label |

---

### TAB_GROUP

Organises fields into named tabs.

```php
FieldManager::TAB_GROUP()
    ->addTab('general', 'General', [
        'title' => FieldManager::TEXT()->setLabel('Title'),
        'desc'  => FieldManager::TEXTAREA()->setLabel('Description'),
    ])
    ->addTab('style', 'Style', [
        'color' => FieldManager::COLOR()->setLabel('Text Color'),
        'bg'    => FieldManager::COLOR()->setLabel('Background'),
    ])
    ->setDefaultTab('general')
```

| Method | Description |
|---|---|
| `addTab(string $key, string $label, array $fields)` | Add a tab with fields |
| `addCustomTab(array $config)` | Add tab from raw config |
| `setDefaultTab(string)` | Which tab opens by default |
| `setTabLabels(array)` | Override tab labels |
| `setTabIcons(array)` | Set icons for tabs |
| `setTabStyle(string)` | Tab UI style |
| `showLabels(bool)` | Show/hide tab labels |
| `allowStateCopy(bool)` | Allow copying values between states |

---

### STYLE_STATES

Tab group preset for normal / hover / active / focus states.

```php
FieldManager::STYLE_STATES(['normal', 'hover', 'active'], [
    'color'  => FieldManager::COLOR()->setLabel('Text Color'),
    'bg'     => FieldManager::BACKGROUND_GROUP()->setLabel('Background'),
    'border' => FieldManager::BORDER_SHADOW_GROUP()->setLabel('Border & Shadow'),
])
```

Parameters: `array $states` (default `['normal', 'hover']`), `array $fields`

---

### RESPONSIVE_GROUP

Tab group preset for desktop / tablet / mobile breakpoints.

```php
FieldManager::RESPONSIVE_GROUP([
    'font_size' => FieldManager::NUMBER()->setLabel('Font Size')->setUnit('px'),
    'padding'   => FieldManager::DIMENSION()->asPadding()->setLabel('Padding'),
])
```

---

### CUSTOM_TABS

Alias for `TAB_GROUP()` for semantic clarity.

```php
FieldManager::CUSTOM_TABS()
    ->addTab('info', 'Info', [...])
    ->addTab('media', 'Media', [...])
```

---

## Display

### HEADING

Section heading inside the panel (display-only, no value).

```php
FieldManager::HEADING()
    ->setLabel('Typography Settings')
    ->setSize('h4')   // 'h1' – 'h6'
```

| Method | Description |
|---|---|
| `setSize(string)` | Heading level: `h1`–`h6` |

---

### DIVIDER

Visual separator between field groups (display-only, no value).

```php
FieldManager::DIVIDER()
    ->setStyle('solid')   // 'solid', 'dashed', 'dotted'
```

| Method | Description |
|---|---|
| `setStyle(string)` | Line style |

---

## Full Widget Example

```php
<?php

use Xgenious\PageBuilder\Core\FieldManager;
use Xgenious\PageBuilder\Core\ControlManager;

class CardWidget extends BaseWidget
{
    public function getGeneralFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('content', 'Content')
            ->registerField('image', FieldManager::IMAGE()
                ->setLabel('Card Image')
                ->setAllowedTypes(['jpg', 'jpeg', 'png', 'webp'])
            )
            ->registerField('title', FieldManager::TEXT()
                ->setLabel('Title')
                ->setDefault('Card Title')
                ->setRequired(true)
            )
            ->registerField('description', FieldManager::TEXTAREA()
                ->setLabel('Description')
                ->setDefault('')
                ->setRows(4)
            )
            ->registerField('button_text', FieldManager::TEXT()
                ->setLabel('Button Text')
                ->setDefault('Read More')
            )
            ->registerField('button_url', FieldManager::URL()
                ->setLabel('Button URL')
                ->setDefault('#')
            )
            ->registerField('show_badge', FieldManager::TOGGLE()
                ->setLabel('Show Badge')
                ->setDefault(false)
            )
            ->registerField('badge_text', FieldManager::TEXT()
                ->setLabel('Badge Text')
                ->setDefault('New')
                ->dependsOn('show_badge', true)
            )
            ->endGroup();

        return $control->getFields();
    }

    public function getStyleFields(): array
    {
        $control = new ControlManager();

        $control->addGroup('card_style', 'Card Style')
            ->registerField('card_bg', FieldManager::BACKGROUND_GROUP()
                ->setLabel('Card Background')
                ->setDefaultType('color')
                ->setDefaultBackground(['type' => 'color', 'color' => '#ffffff'])
            )
            ->registerField('card_border', FieldManager::BORDER_SHADOW_GROUP()
                ->setLabel('Border & Shadow')
                ->setPerSideControls(false)
                ->setMultipleShadows(false)
            )
            ->registerField('card_padding', FieldManager::DIMENSION()
                ->setLabel('Padding')
                ->asPadding()
                ->setDefault(['top' => '24', 'right' => '24', 'bottom' => '24', 'left' => '24', 'unit' => 'px'])
            )
            ->endGroup();

        $control->addGroup('title_style', 'Title Style')
            ->registerField('title_typography', FieldManager::TYPOGRAPHY_GROUP()
                ->setLabel('Title Typography')
                ->setEnableResponsive(true)
                ->enableOnlyControls(['font_family', 'font_size', 'font_weight', 'line_height'])
            )
            ->registerField('title_color', FieldManager::COLOR()
                ->setLabel('Title Color')
                ->setDefault('#1a1a1a')
                ->setAllowTransparency(false)
            )
            ->endGroup();

        $control->addGroup('button_style', 'Button Style')
            ->registerField('button_states', FieldManager::STYLE_STATES(['normal', 'hover'], [
                'bg'     => FieldManager::COLOR()->setLabel('Background'),
                'color'  => FieldManager::COLOR()->setLabel('Text Color'),
                'border' => FieldManager::BORDER_SHADOW_GROUP()->setLabel('Border'),
            ]))
            ->registerField('button_padding', FieldManager::DIMENSION()
                ->setLabel('Padding')
                ->asPadding()
                ->setDefault(['top' => '10', 'right' => '24', 'bottom' => '10', 'left' => '24', 'unit' => 'px'])
            )
            ->endGroup();

        return $control->getFields();
    }
}
```
