// News context for TheGlocal project
import React, { createContext, useContext, ReactNode } from 'react';
import type { NewsArticle, NewsTab, LocationData } from '@/types/news';
import { NewsContextType } from './NewsContextTypes';

const NewsContext = createContext<NewsContextType | undefined>(undefined);


export { NewsContext };
