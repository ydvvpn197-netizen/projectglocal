/**
 * News Context Definition
 * Context for news functionality
 */

import React, { createContext } from 'react';
import type { NewsContextType } from './NewsContextTypes';

export const NewsContext = createContext<NewsContextType | undefined>(undefined);
