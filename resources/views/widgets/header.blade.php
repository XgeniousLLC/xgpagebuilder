<section class="{{ $helper->cssClasses('py-16 bg-gradient-to-r from-blue-50 to-indigo-100') }}" style="{{ $helper->inlineStyles() }}">
    <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-2 gap-8 items-center">
            <!-- Left Content -->
            <div class="space-y-6">
                @if($helper->generalSettings('header_icon'))
                <div class="flex items-center space-x-3 mb-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i class="{{ $helper->generalSettings('header_icon') }} text-2xl text-blue-600" aria-hidden="true"></i>
                    </div>
                </div>
                @endif
                <h1 class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {!! $helper->getText('general', 'title', 'Turn Raw Data Into <span class="text-blue-600">Actionable Insights</span> Instantly') !!}
                </h1>
                <p class="text-lg text-gray-600 leading-relaxed">
                    {!! $helper->generalSettings('description', 'CogniAI is an advanced AI-powered data analytics platform designed to transform raw data into actionable insights.') !!}
                </p>

                <!-- CTA Buttons -->
                <div class="flex flex-col sm:flex-row gap-4">
                    <button class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        {{ $helper->generalSettings('primary_button_text', 'Get Started Free') }}
                    </button>
                    <button class="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                        {{ $helper->generalSettings('secondary_button_text', 'Watch Demo') }}
                    </button>
                </div>
                <!-- Trust Indicators -->
                @if(!empty($helper->generalSettings('cta_list_items')))
                <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                    @foreach($helper->generalSettings('cta_list_items') as $item)
                        <div class="flex items-center">
                            <span class="text-green-500 mr-2">✓</span>
                            {{$item['list_text']}}
                        </div>
                    @endforeach
                </div>
                @endif
            </div>

            <!-- Right Content - Placeholder Image -->
            <div class="flex justify-center">
                <div class="bg-white rounded-lg shadow-xl p-8 max-w-md">
                    <div class="text-center">
                        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                        <p class="text-gray-600">Real-time insights and data visualization</p>
                        <div class="mt-4 flex justify-center space-x-1">
                            <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                            <div class="w-2 h-2 bg-orange-400 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
