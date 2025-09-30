/**
 * Unified Page Template
 * Provides consistent layout and UI across all pages in the platform
 */

import React, { ReactNode } from 'react';
import { ResponsiveLayout } from '@/components/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, HelpCircle, Settings, Share2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';

export interface PageAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface UnifiedPageTemplateProps {
  children: ReactNode;
  
  // Page Header
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  
  // Navigation
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  backButtonHref?: string;
  backButtonLabel?: string;
  
  // Actions
  primaryAction?: PageAction;
  secondaryActions?: PageAction[];
  
  // Layout
  showRightSidebar?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  containerClassName?: string;
  headerClassName?: string;
  
  // Content Wrapper
  useCard?: boolean;
  cardTitle?: string;
  cardDescription?: string;
  
  // Tabs/Sections Support
  tabs?: ReactNode;
  
  // Loading State
  loading?: boolean;
  loadingText?: string;
}

export const UnifiedPageTemplate: React.FC<UnifiedPageTemplateProps> = ({
  children,
  title,
  subtitle,
  description,
  icon: Icon,
  badge,
  breadcrumbs,
  showBackButton = false,
  backButtonHref,
  backButtonLabel = 'Back',
  primaryAction,
  secondaryActions = [],
  showRightSidebar = false,
  maxWidth = 'xl',
  containerClassName,
  headerClassName,
  useCard = false,
  cardTitle,
  cardDescription,
  tabs,
  loading = false,
  loadingText = 'Loading...',
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (backButtonHref) {
      navigate(backButtonHref);
    } else {
      navigate(-1);
    }
  };

  // Loading State
  if (loading) {
    return (
      <ResponsiveLayout showRightSidebar={false} maxWidth={maxWidth}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">{loadingText}</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout showRightSidebar={showRightSidebar} maxWidth={maxWidth}>
      <div className={cn('space-y-6', containerClassName)}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Back Button */}
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {backButtonLabel}
          </Button>
        )}

        {/* Page Header */}
        <div className={cn('space-y-4', headerClassName)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    {badge && (
                      <Badge variant={badge.variant || 'default'}>
                        {badge.label}
                      </Badge>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-lg text-muted-foreground mt-1">{subtitle}</p>
                  )}
                </div>
              </div>
              {description && (
                <p className="text-muted-foreground max-w-3xl">{description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  variant={primaryAction.variant || 'default'}
                  disabled={primaryAction.disabled}
                  asChild={!!primaryAction.href}
                  className="gap-2"
                >
                  {primaryAction.href ? (
                    <Link to={primaryAction.href}>
                      {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
                      <span className="hidden sm:inline">{primaryAction.label}</span>
                      <span className="sm:hidden">{primaryAction.label.split(' ')[0]}</span>
                    </Link>
                  ) : (
                    <>
                      {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
                      <span className="hidden sm:inline">{primaryAction.label}</span>
                      <span className="sm:hidden">{primaryAction.label.split(' ')[0]}</span>
                    </>
                  )}
                </Button>
              )}

              {secondaryActions.length > 0 && (
                <div className="flex items-center gap-1">
                  {secondaryActions.map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.onClick}
                      variant={action.variant || 'outline'}
                      size="icon"
                      disabled={action.disabled}
                      asChild={!!action.href}
                    >
                      {action.href ? (
                        <Link to={action.href}>
                          {action.icon && <action.icon className="h-4 w-4" />}
                        </Link>
                      ) : (
                        <>
                          {action.icon && <action.icon className="h-4 w-4" />}
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {tabs && (
            <>
              <Separator />
              {tabs}
            </>
          )}
        </div>

        {/* Content */}
        {useCard ? (
          <Card>
            {(cardTitle || cardDescription) && (
              <CardHeader>
                {cardTitle && <CardTitle>{cardTitle}</CardTitle>}
                {cardDescription && <CardDescription>{cardDescription}</CardDescription>}
              </CardHeader>
            )}
            <CardContent className="pt-6">
              {children}
            </CardContent>
          </Card>
        ) : (
          children
        )}
      </div>
    </ResponsiveLayout>
  );
};

// Preset templates for common page types
export const FeedPageTemplate: React.FC<Omit<UnifiedPageTemplateProps, 'showRightSidebar' | 'maxWidth'>> = (props) => (
  <UnifiedPageTemplate {...props} showRightSidebar={true} maxWidth="full" />
);

export const ProfilePageTemplate: React.FC<Omit<UnifiedPageTemplateProps, 'maxWidth'>> = (props) => (
  <UnifiedPageTemplate {...props} maxWidth="2xl" />
);

export const SettingsPageTemplate: React.FC<Omit<UnifiedPageTemplateProps, 'maxWidth' | 'useCard'>> = (props) => (
  <UnifiedPageTemplate {...props} maxWidth="xl" useCard={false} />
);

export const FormPageTemplate: React.FC<Omit<UnifiedPageTemplateProps, 'maxWidth' | 'useCard'>> = (props) => (
  <UnifiedPageTemplate {...props} maxWidth="lg" useCard={true} />
);

export const DashboardPageTemplate: React.FC<Omit<UnifiedPageTemplateProps, 'maxWidth'>> = (props) => (
  <UnifiedPageTemplate {...props} maxWidth="full" />
);
