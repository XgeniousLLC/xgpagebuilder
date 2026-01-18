<?php

namespace Xgenious\PageBuilder\Core\FieldTypes;

class BorderShadowField extends AbstractField
{
    protected string $type = 'border_shadow_group';
    protected mixed $defaultValue = [
        'border' => [
            'style' => 'solid',
            'width' => ['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0],
            'color' => '#000000',
            'radius' => ['top' => 0, 'right' => 0, 'bottom' => 0, 'left' => 0],
            'linked' => true
        ],
        'shadow' => [
            'type' => 'none',
            'x_offset' => 0,
            'y_offset' => 2,
            'blur_radius' => 4,
            'spread_radius' => 0,
            'color' => 'rgba(0,0,0,0.1)',
            'inset' => false,
            'shadows' => []
        ]
    ];

    public function getType(): string
    {
        return $this->type;
    }

    public function validate($value, array $rules = []): array
    {
        $errors = $this->validateCommon($value, $rules);

        if (!is_array($value)) {
            return $errors;
        }

        // Validate border structure
        if (isset($value['border'])) {
            $border = $value['border'];
            
            // Validate border width values
            if (isset($border['width']) && is_array($border['width'])) {
                foreach (['top', 'right', 'bottom', 'left'] as $side) {
                    if (isset($border['width'][$side]) && !is_numeric($border['width'][$side])) {
                        $errors[] = "Invalid border width for {$side} side";
                    }
                }
            }

            // Validate border color
            if (isset($border['color']) && !$this->isValidColor($border['color'])) {
                $errors[] = 'Invalid border color format';
            }
        }

        // Validate shadow structure
        if (isset($value['shadow'])) {
            $shadow = $value['shadow'];
            
            // Validate shadow offsets and radii
            foreach (['x_offset', 'y_offset', 'blur_radius', 'spread_radius'] as $prop) {
                if (isset($shadow[$prop]) && !is_numeric($shadow[$prop])) {
                    $errors[] = "Invalid shadow {$prop} value";
                }
            }

            // Validate shadow color
            if (isset($shadow['color']) && !$this->isValidColor($shadow['color'])) {
                $errors[] = 'Invalid shadow color format';
            }
        }

        return $errors;
    }

    private function isValidColor($color): bool
    {
        // Basic color validation (hex, rgb, rgba, hsl, hsla, named colors)
        return preg_match('/^(#[0-9a-f]{3,8}|rgb|hsl|rgba|hsla|\w+)/', strtolower($color));
    }

    public function sanitize($value): mixed
    {
        if (!is_array($value)) {
            return $this->defaultValue;
        }

        $sanitized = [];

        // Sanitize border values
        if (isset($value['border'])) {
            $border = $value['border'];
            $sanitized['border'] = [
                'style' => $border['style'] ?? 'solid',
                'width' => [
                    'top' => max(0, (int)($border['width']['top'] ?? 0)),
                    'right' => max(0, (int)($border['width']['right'] ?? 0)),
                    'bottom' => max(0, (int)($border['width']['bottom'] ?? 0)),
                    'left' => max(0, (int)($border['width']['left'] ?? 0))
                ],
                'color' => $border['color'] ?? '#000000',
                'radius' => [
                    'top' => max(0, (int)($border['radius']['top'] ?? 0)),
                    'right' => max(0, (int)($border['radius']['right'] ?? 0)),
                    'bottom' => max(0, (int)($border['radius']['bottom'] ?? 0)),
                    'left' => max(0, (int)($border['radius']['left'] ?? 0))
                ],
                'linked' => (bool)($border['linked'] ?? true)
            ];
        }

        // Sanitize shadow values
        if (isset($value['shadow'])) {
            $shadow = $value['shadow'];
            $sanitized['shadow'] = [
                'type' => $shadow['type'] ?? 'none',
                'x_offset' => (int)($shadow['x_offset'] ?? 0),
                'y_offset' => (int)($shadow['y_offset'] ?? 2),
                'blur_radius' => max(0, (int)($shadow['blur_radius'] ?? 4)),
                'spread_radius' => (int)($shadow['spread_radius'] ?? 0),
                'color' => $shadow['color'] ?? 'rgba(0,0,0,0.1)',
                'inset' => (bool)($shadow['inset'] ?? false),
                'shadows' => $shadow['shadows'] ?? []
            ];
        }

        return array_merge($this->defaultValue, $sanitized);
    }

    public function render(array $config, $value = null): array
    {
        $borderShadowValue = $value ?? $config['default'] ?? $this->defaultValue;
        
        return [
            'type' => $this->type,
            'value' => $borderShadowValue,
            'border_styles' => $config['border_styles'] ?? [],
            'shadow_presets' => $config['shadow_presets'] ?? [],
            'per_side_controls' => $config['per_side_controls'] ?? true,
            'multiple_shadows' => $config['multiple_shadows'] ?? false,
            'max_shadows' => $config['max_shadows'] ?? 5,
            'config' => $config
        ];
    }

    public function getSchema(): array
    {
        return [
            'type' => $this->type,
            'category' => 'advanced',
            'supports' => [
                'default',
                'required',
                'condition',
                'description',
                'border_styles',
                'shadow_presets',
                'per_side_controls',
                'multiple_shadows',
                'max_shadows'
            ]
        ];
    }
}