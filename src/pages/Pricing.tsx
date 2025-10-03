import React from 'react';
import { Check, Star, Zap, Shield, Users, Globe } from 'lucide-react';
import { UnifiedContainer, UnifiedCard, UnifiedButton, UnifiedTypography } from '@/design-system/UnifiedDesignSystem';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Community',
      price: 'Free',
      period: 'forever',
      description: 'Perfect for local community members',
      features: [
        'Unlimited posts and discussions',
        'Local event discovery',
        'Community chat',
        'Basic privacy controls',
        'Mobile app access'
      ],
      popular: false,
      icon: Users
    },
    {
      name: 'Business',
      price: '$9.99',
      period: 'per month',
      description: 'For local businesses and entrepreneurs',
      features: [
        'Everything in Community',
        'Business profile & listings',
        'Event promotion tools',
        'Analytics dashboard',
        'Priority support',
        'Advanced privacy controls'
      ],
      popular: true,
      icon: Globe
    },
    {
      name: 'Enterprise',
      price: '$29.99',
      period: 'per month',
      description: 'For organizations and large communities',
      features: [
        'Everything in Business',
        'Custom branding',
        'Advanced analytics',
        'API access',
        'Dedicated support',
        'White-label options',
        'Custom integrations'
      ],
      popular: false,
      icon: Shield
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Privacy-First',
      description: 'Your data stays local and secure. No tracking, no selling your information.'
    },
    {
      icon: Users,
      title: 'Community-Driven',
      description: 'Built by locals, for locals. Real connections in your neighborhood.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed and performance, even on slower connections.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <UnifiedContainer size="xl" padding="lg">
        {/* Header */}
        <div className="text-center mb-16">
          <UnifiedTypography variant="h1" className="mb-6">
            Simple, Transparent Pricing
          </UnifiedTypography>
          <UnifiedTypography variant="lead" className="max-w-2xl mx-auto">
            Choose the plan that fits your community needs. All plans include our core privacy-first features.
          </UnifiedTypography>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <UnifiedCard
              key={plan.name}
              variant={plan.popular ? 'default' : 'outline'}
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <plan.icon className="w-12 h-12 text-blue-600" />
                </div>
                <UnifiedTypography variant="h3" className="mb-2">
                  {plan.name}
                </UnifiedTypography>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                <UnifiedTypography variant="muted" className="text-sm">
                  {plan.description}
                </UnifiedTypography>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <UnifiedButton
                variant={plan.popular ? 'default' : 'outline'}
                size="lg"
                className="w-full"
              >
                {plan.price === 'Free' ? 'Get Started' : 'Choose Plan'}
              </UnifiedButton>
            </UnifiedCard>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="text-center mb-16">
          <UnifiedTypography variant="h2" className="mb-8">
            Why Choose Glocal?
          </UnifiedTypography>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <benefit.icon className="w-12 h-12 text-blue-600" />
                </div>
                <UnifiedTypography variant="h4" className="mb-3">
                  {benefit.title}
                </UnifiedTypography>
                <UnifiedTypography variant="muted">
                  {benefit.description}
                </UnifiedTypography>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <UnifiedTypography variant="h2" className="text-center mb-8">
            Frequently Asked Questions
          </UnifiedTypography>
          <div className="space-y-6">
            <UnifiedCard padding="lg">
              <UnifiedTypography variant="h4" className="mb-3">
                Is there a free trial?
              </UnifiedTypography>
              <UnifiedTypography variant="muted">
                Yes! The Community plan is completely free forever. Business and Enterprise plans come with a 14-day free trial.
              </UnifiedTypography>
            </UnifiedCard>
            
            <UnifiedCard padding="lg">
              <UnifiedTypography variant="h4" className="mb-3">
                Can I change plans anytime?
              </UnifiedTypography>
              <UnifiedTypography variant="muted">
                Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </UnifiedTypography>
            </UnifiedCard>
            
            <UnifiedCard padding="lg">
              <UnifiedTypography variant="h4" className="mb-3">
                What about data privacy?
              </UnifiedTypography>
              <UnifiedTypography variant="muted">
                Your privacy is our priority. We never sell your data, and all information is stored securely with end-to-end encryption.
              </UnifiedTypography>
            </UnifiedCard>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <UnifiedTypography variant="h2" className="mb-4">
            Ready to Build Your Local Community?
          </UnifiedTypography>
          <UnifiedTypography variant="lead" className="mb-8">
            Join thousands of communities already using Glocal to connect locally.
          </UnifiedTypography>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <UnifiedButton size="lg" className="px-8">
              Start Free Today
            </UnifiedButton>
            <UnifiedButton variant="outline" size="lg" className="px-8">
              Contact Sales
            </UnifiedButton>
          </div>
        </div>
      </UnifiedContainer>
    </div>
  );
};

export default Pricing;
