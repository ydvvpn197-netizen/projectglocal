import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Eye, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Activity
} from 'lucide-react';
import CommunityTransparencyDashboard from '@/components/CommunityTransparencyDashboard';
import CommunityFeedbackForm from '@/components/CommunityFeedbackForm';

const CommunityTransparency: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Transparency</h1>
              <p className="text-gray-600 mt-2">
                Transparent, community-driven moderation for a safer platform
              </p>
            </div>
            <CommunityFeedbackForm />
          </div>

          {/* Key Principles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Community-Driven
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Reports are submitted by community members and reviewed by our moderation team
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-green-600" />
                  Transparent Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  All moderation actions are logged and visible to the community
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Community Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Community members can provide feedback on moderation quality
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Dashboard */}
        <CommunityTransparencyDashboard />

        {/* Community Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Community Guidelines
            </CardTitle>
            <CardDescription>
              Our community standards and moderation policies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">What We Moderate</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Spam and unwanted content
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Harassment and bullying
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Hate speech and discrimination
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    False information
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Violence and threats
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Privacy violations
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Our Process</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Reports reviewed within 24 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-600" />
                    Transparent moderation logs
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    Community feedback integration
                  </li>
                  <li className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    Continuous improvement
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Report */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              How to Report Content
            </CardTitle>
            <CardDescription>
              Simple steps to help keep our community safe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold">1</span>
                </div>
                <h4 className="font-medium text-sm mb-1">Find Content</h4>
                <p className="text-xs text-gray-600">Locate the post, comment, or user you want to report</p>
              </div>

              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold">2</span>
                </div>
                <h4 className="font-medium text-sm mb-1">Click Report</h4>
                <p className="text-xs text-gray-600">Click the "Report" button on the content</p>
              </div>

              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold">3</span>
                </div>
                <h4 className="font-medium text-sm mb-1">Select Reason</h4>
                <p className="text-xs text-gray-600">Choose the most appropriate reason for reporting</p>
              </div>

              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold">4</span>
                </div>
                <h4 className="font-medium text-sm mb-1">Submit</h4>
                <p className="text-xs text-gray-600">Provide details and submit your report</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityTransparency;
