import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { LifeWish as LifeWishComponent } from '@/components/lifeWish/LifeWish';

export default function LifeWish() {
  return (
    <MainLayout>
      <LifeWishComponent />
    </MainLayout>
  );
}
