import { createContext } from 'react';
import { LayoutContextType } from './LayoutContext.types';

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);