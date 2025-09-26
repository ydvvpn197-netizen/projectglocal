import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { LegalAssistant as LegalAssistantComponent } from '@/components/legal/LegalAssistant';

export default function LegalAssistant() {
  return (
    <MainLayout>
      <LegalAssistantComponent />
    </MainLayout>
  );
}
