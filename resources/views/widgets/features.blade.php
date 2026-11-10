@php
    $title = $helper->getText('general', 'title', 'Unlock the Power of Your Data');
    $description = $helper->generalSettings('description', 'Transform your business with intelligent analytics that deliver insights, not just data. Our platform combines cutting-edge AI with intuitive design to make data analysis accessible to everyone.');
    $headerIcon = $helper->generalSettings('header_icon', 'las la-star');
    $items = $helper->getArray('general', 'cta_list_items', []);
    $ctaText = $helper->generalSettings('cta_text', 'Ready to see these features in action?');
    $buttons = $helper->getArray('general', 'cta_buttons_repeater', []);

    $renderIcon = function ($icon, $fallback = 'las la-check') {
        if (is_array($icon)) {
            if (($icon['type'] ?? '') === 'svg' && ! empty($icon['content'])) {
                return $icon['content'];
            }
            $icon = $icon['icon'] ?? '';
        }

        return '<i class="' . e($icon ?: $fallback) . '"></i>';
    };
@endphp

<section class="{{ $helper->cssClasses('py-20 bg-gray-50') }}" style="{{ $helper->inlineStyles() }}">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
            @if(!empty($headerIcon))
                <div class="flex justify-center mb-6">
                    <div class="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span class="text-orange-600 text-2xl">{!! $renderIcon($headerIcon, 'las la-star') !!}</span>
                    </div>
                </div>
            @endif
            <h2 class="text-4xl font-bold text-gray-900 mb-4">{!! $title !!}</h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">{!! $description !!}</p>
        </div>

        @if(!empty($items))
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                @foreach($items as $item)
                    @php
                        $itemTitle = $item['list_text'] ?? '';
                        $itemDescription = $item['list_description'] ?? '';
                        $itemUrl = $item['list_url'] ?? '';
                        $itemIcon = $item['list_icon'] ?? null;
                    @endphp
                    <div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100">
                        <div class="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-colors duration-300">
                            <span class="text-orange-600 text-2xl">{!! $renderIcon($itemIcon, 'las la-check') !!}</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">{{ $itemTitle }}</h3>
                        @if($itemDescription)
                            <p class="text-gray-600 leading-relaxed">{{ $itemDescription }}</p>
                        @endif
                        @if($itemUrl)
                            <div class="mt-6">
                                <a href="{{ $itemUrl }}"
                                   class="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors duration-300">
                                    {{ __('Learn more') }}
                                    <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </a>
                            </div>
                        @endif
                    </div>
                @endforeach
            </div>
        @endif

        @if($ctaText || !empty($buttons))
            <div class="text-center mt-16">
                @if($ctaText)
                    <p class="text-lg text-gray-600 mb-8">{{ $ctaText }}</p>
                @endif
                @if(!empty($buttons))
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        @foreach($buttons as $index => $button)
                            <a href="{{ $button['btn_url'] ?? '#' }}"
                               class="{{ $index === 0
                                   ? 'bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-300 shadow-lg'
                                   : 'border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300' }}">
                                {{ $button['btn_text'] ?? '' }}
                            </a>
                        @endforeach
                    </div>
                @endif
            </div>
        @endif
    </div>
</section>
