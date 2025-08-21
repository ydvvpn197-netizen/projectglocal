import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Share Your Link',
      description: 'Share your unique referral link with friends and family.'
    },
    {
      number: 2,
      title: 'Friends Sign Up',
      description: 'When they sign up using your link, they get 100 credits.'
    },
    {
      number: 3,
      title: 'Earn Rewards',
      description: 'You earn 100 credits for each successful referral!'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">How It Works</h3>
      
      <div className="grid gap-4">
        {steps.map((step) => (
          <div key={step.number} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              {step.number}
            </div>
            <div>
              <h4 className="font-semibold">{step.title}</h4>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
