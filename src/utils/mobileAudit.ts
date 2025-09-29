/**
 * Mobile Responsiveness Audit Utilities
 * Helps identify and fix mobile responsiveness issues
 */

export interface MobileAuditResult {
  file: string;
  line: number;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

export const mobileAuditPatterns = {
  // Missing responsive breakpoints
  missingBreakpoints: [
    {
      pattern: /className="[^"]*grid[^"]*grid-cols-1[^"]*md:grid-cols-[^"]*"/,
      issue: "Grid missing tablet breakpoint (sm:grid-cols-2)",
      suggestion: "Add sm:grid-cols-2 for tablet view"
    },
    {
      pattern: /className="[^"]*flex[^"]*flex-col[^"]*md:flex-row[^"]*"/,
      issue: "Flex missing tablet breakpoint (sm:flex-row)",
      suggestion: "Add sm:flex-row for tablet view"
    }
  ],
  
  // Poor mobile spacing
  poorSpacing: [
    {
      pattern: /className="[^"]*gap-[0-9]+[^"]*"/,
      issue: "Fixed gap size may be too small on mobile",
      suggestion: "Use responsive gap classes like gap-2 sm:gap-4"
    },
    {
      pattern: /className="[^"]*p-[0-9]+[^"]*"/,
      issue: "Fixed padding may be too small on mobile",
      suggestion: "Use responsive padding like p-2 sm:p-4"
    }
  ],
  
  // Missing touch targets
  touchTargets: [
    {
      pattern: /className="[^"]*button[^"]*"/,
      issue: "Button may be too small for touch",
      suggestion: "Ensure buttons are at least 44px (min-h-[44px] min-w-[44px])"
    }
  ],
  
  // Text readability
  textReadability: [
    {
      pattern: /className="[^"]*text-[0-9]+[^"]*"/,
      issue: "Fixed text size may be too small on mobile",
      suggestion: "Use responsive text classes like text-sm sm:text-base"
    }
  ]
};

export const auditFile = (content: string, filename: string): MobileAuditResult[] => {
  const results: MobileAuditResult[] = [];
  
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for missing responsive breakpoints
    mobileAuditPatterns.missingBreakpoints.forEach(pattern => {
      if (pattern.pattern.test(line)) {
        results.push({
          file: filename,
          line: index + 1,
          issue: pattern.issue,
          severity: 'medium',
          suggestion: pattern.suggestion
        });
      }
    });
    
    // Check for poor spacing
    mobileAuditPatterns.poorSpacing.forEach(pattern => {
      if (pattern.pattern.test(line)) {
        results.push({
          file: filename,
          line: index + 1,
          issue: pattern.issue,
          severity: 'low',
          suggestion: pattern.suggestion
        });
      }
    });
    
    // Check for touch targets
    mobileAuditPatterns.touchTargets.forEach(pattern => {
      if (pattern.pattern.test(line)) {
        results.push({
          file: filename,
          line: index + 1,
          issue: pattern.issue,
          severity: 'high',
          suggestion: pattern.suggestion
        });
      }
    });
    
    // Check for text readability
    mobileAuditPatterns.textReadability.forEach(pattern => {
      if (pattern.pattern.test(line)) {
        results.push({
          file: filename,
          line: index + 1,
          issue: pattern.issue,
          severity: 'medium',
          suggestion: pattern.suggestion
        });
      }
    });
  });
  
  return results;
};

export const generateMobileResponsiveClasses = {
  // Grid responsive classes
  grid: (cols: { mobile: number; tablet: number; desktop: number }) => {
    return `grid grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;
  },
  
  // Flex responsive classes
  flex: (direction: 'row' | 'col', responsive = true) => {
    const base = direction === 'col' ? 'flex-col' : 'flex-row';
    const responsiveClass = responsive && direction === 'col' ? 'sm:flex-row' : '';
    return `flex ${base} ${responsiveClass}`.trim();
  },
  
  // Spacing responsive classes
  spacing: (size: 'sm' | 'md' | 'lg', type: 'gap' | 'padding' | 'margin' = 'gap') => {
    const sizes = {
      sm: { gap: 'gap-2 sm:gap-3', padding: 'p-2 sm:p-3', margin: 'm-2 sm:m-3' },
      md: { gap: 'gap-4 sm:gap-6', padding: 'p-4 sm:p-6', margin: 'm-4 sm:m-6' },
      lg: { gap: 'gap-6 sm:gap-8', padding: 'p-6 sm:p-8', margin: 'm-6 sm:m-8' }
    };
    return sizes[size][type];
  },
  
  // Text responsive classes
  text: (size: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl') => {
    const sizes = {
      sm: 'text-sm sm:text-base',
      base: 'text-base sm:text-lg',
      lg: 'text-lg sm:text-xl',
      xl: 'text-xl sm:text-2xl',
      '2xl': 'text-2xl sm:text-3xl',
      '3xl': 'text-3xl sm:text-4xl',
      '4xl': 'text-4xl sm:text-5xl'
    };
    return sizes[size];
  }
};

export const mobileBestPractices = {
  // Minimum touch target size
  touchTarget: 'min-h-[44px] min-w-[44px]',
  
  // Safe area handling
  safeArea: {
    top: 'pt-safe-area-inset-top',
    bottom: 'pb-safe-area-inset-bottom',
    left: 'pl-safe-area-inset-left',
    right: 'pr-safe-area-inset-right'
  },
  
  // Mobile-first breakpoints
  breakpoints: {
    mobile: 'max-sm',
    tablet: 'sm:md',
    desktop: 'lg:'
  },
  
  // Common responsive patterns
  patterns: {
    heroText: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
    bodyText: 'text-sm sm:text-base',
    button: 'h-10 sm:h-11 px-4 sm:px-6',
    card: 'p-4 sm:p-6',
    container: 'px-4 sm:px-6 lg:px-8'
  }
};
