
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Flag, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageSquare,
  FileText,
  Calendar,
  User,
  Shield,
  Clock,
  Ban,
  Check,
  X
} from 'lucide-react';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminService } from '@/services/adminService';
import { ContentReport, ModerationFilters, ModerationAction } from '@/types/admin';

const ContentModeration: React.FC = () => {
  const { adminUser } = useAdminAuth();
  const adminService = new AdminService();
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ModerationFilters>({
    search: '',
    contentType: 'all',
    reportStatus: 'all',
    reportReason: 'all',
    dateRange: 'all',
    page: 1,
    limit: 20
  });
  const [totalReports, setTotalReports] = useState(0);
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [showReportDetails, setShowReportDetails] = useState(false);

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminService.getContentReports(filters);
      setReports(response.data || []);
      setTotalReports(response.total || 0);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: keyof ModerationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleModerationAction = async (reportId: string, action: ModerationAction, notes?: string) => {
    try {
      await adminService.resolveContentReport(reportId, action, notes);
      
      // Reload reports after action
      loadReports();
      
      // Close details dialog if open
      setShowReportDetails(false);
      setSelectedReport(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to perform moderation action');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'dismissed':
        return <Badge className="bg-gray-100 text-gray-800">Dismissed</Badge>;
      case 'escalated':
        return <Badge className="bg-red-100 text-red-800">Escalated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'review':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getReportReasonColor = (reason: string) => {
    switch (reason) {
      case 'spam':
        return 'bg-yellow-100 text-yellow-800';
      case 'inappropriate':
        return 'bg-red-100 text-red-800';
      case 'harassment':
        return 'bg-red-100 text-red-800';
      case 'misinformation':
        return 'bg-orange-100 text-orange-800';
      case 'copyright':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityScore = (report: ContentReport) => {
    let score = 0;
    
    // Reason priority
    switch (report.report_reason) {
      case 'harassment':
        score += 5;
        break;
      case 'inappropriate':
        score += 4;
        break;
      case 'misinformation':
        score += 3;
        break;
      case 'spam':
        score += 2;
        break;
      case 'copyright':
        score += 3;
        break;
      default:
        score += 1;
    }
    
    // Time urgency (recent reports get higher priority)
    const hoursSinceReport = (Date.now() - new Date(report.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursSinceReport < 1) score += 3;
    else if (hoursSinceReport < 24) score += 2;
    else if (hoursSinceReport < 72) score += 1;
    
    return score;
  };

  const sortedReports = [...reports].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

  if (isLoading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AdminAuthGuard requiredPermission="moderation:manage">
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
            <p className="text-gray-600">Review and take action on reported content</p>
          </div>

          {error && (
            <Alert className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reports..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filters.contentType} onValueChange={(value) => handleFilterChange('contentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Content Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content Types</SelectItem>
                    <SelectItem value="post">Posts</SelectItem>
                    <SelectItem value="comment">Comments</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="review">Reviews</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.reportStatus} onValueChange={(value) => handleFilterChange('reportStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.reportReason} onValueChange={(value) => handleFilterChange('reportReason', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Reasons" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    <SelectItem value="spam">Spam</SelectItem>
                    <SelectItem value="inappropriate">Inappropriate</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="misinformation">Misinformation</SelectItem>
                    <SelectItem value="copyright">Copyright</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Content Reports ({totalReports})</CardTitle>
                  <CardDescription>Reported content requiring review</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Flag className="mr-2 h-4 w-4" />
                    Export Reports
                  </Button>
                  <Button>
                    <Shield className="mr-2 h-4 w-4" />
                    Bulk Actions
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedReports.map((report) => {
                    const priorityScore = getPriorityScore(report);
                    return (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {priorityScore >= 7 && <AlertTriangle className="h-4 w-4 text-red-500" />}
                            {priorityScore >= 4 && priorityScore < 7 && <Clock className="h-4 w-4 text-yellow-500" />}
                            {priorityScore < 4 && <Clock className="h-4 w-4 text-gray-400" />}
                            <span className="text-sm font-medium">{priorityScore}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getContentTypeIcon(report.content_type)}
                            <div>
                              <div className="font-medium">{report.content_type}</div>
                              <div className="text-sm text-gray-500">ID: {report.content_id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{report.reporter?.full_name || 'Anonymous'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getReportReasonColor(report.report_reason)}>
                            {report.report_reason}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(report.report_status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(report.created_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setShowReportDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {report.report_status === 'pending' && (
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleModerationAction(report.id, 'approve')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleModerationAction(report.id, 'reject')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {reports.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Flag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All content reports have been reviewed or try adjusting your filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalReports > filters.limit && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, totalReports)} of {totalReports} reports
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page * filters.limit >= totalReports}
                  onClick={() => handlePageChange(filters.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Report Details Dialog */}
        <Dialog open={showReportDetails} onOpenChange={setShowReportDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>
                Review the reported content and take appropriate action
              </DialogDescription>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-6">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList>
                    <TabsTrigger value="details">Report Details</TabsTrigger>
                    <TabsTrigger value="content">Reported Content</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Report ID</label>
                        <p className="text-sm text-gray-900">{selectedReport.id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <div className="mt-1">{getStatusBadge(selectedReport.report_status)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Content Type</label>
                        <p className="text-sm text-gray-900">{selectedReport.content_type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Report Reason</label>
                        <div className="mt-1">
                          <Badge className={getReportReasonColor(selectedReport.report_reason)}>
                            {selectedReport.report_reason}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Reporter</label>
                        <p className="text-sm text-gray-900">{selectedReport.reporter?.full_name || 'Anonymous'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Reported At</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedReport.created_at)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Report Details</label>
                      <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded">
                        {selectedReport.report_details || 'No additional details provided'}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Content Preview</label>
                      <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-600">
                          Content preview would be displayed here based on the content type and ID.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Content ID: {selectedReport.content_id}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="actions" className="space-y-4">
                    {selectedReport.report_status === 'pending' ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Take Action</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Button
                              onClick={() => handleModerationAction(selectedReport.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve Report
                            </Button>
                            <Button
                              onClick={() => handleModerationAction(selectedReport.id, 'reject')}
                              variant="outline"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Dismiss Report
                            </Button>
                            <Button
                              onClick={() => handleModerationAction(selectedReport.id, 'escalate')}
                              variant="outline"
                              className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            >
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Escalate
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-700">Resolution Notes (Optional)</label>
                          <textarea
                            className="mt-1 w-full p-2 border rounded-md"
                            rows={3}
                            placeholder="Add notes about your decision..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Report Already Resolved</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          This report has already been reviewed and resolved.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowReportDetails(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminAuthGuard>
  );
};

export default ContentModeration;
