import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Save, AlertCircle, Check, Code, FileText } from 'lucide-react';
import { businessApi } from '@/lib/business-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner, LoadingPage } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { toast } from '@/hooks/use-toast';

interface KnowledgeBaseForm {
  businessName: string;
  address: string;
  phone: string;
  hours: string;
  services: string;
  policies: string;
  additionalInfo: string;
}

export function KnowledgeBasePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [jsonContent, setJsonContent] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [formData, setFormData] = useState<KnowledgeBaseForm>({
    businessName: '',
    address: '',
    phone: '',
    hours: '',
    services: '',
    policies: '',
    additionalInfo: '',
  });

  const { data: business, isLoading, error, refetch } = useQuery({
    queryKey: ['business'],
    queryFn: () => businessApi.getBusiness(),
  });

  const updateMutation = useMutation({
    mutationFn: (knowledgeBase: Record<string, unknown>) =>
      businessApi.updateKnowledgeBase(knowledgeBase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] });
      toast({
        title: 'Success',
        description: 'Knowledge base updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update knowledge base',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (business?.knowledgeBase) {
      const kb = business.knowledgeBase as Record<string, unknown>;
      setFormData({
        businessName: (kb.businessName as string) || business.name || '',
        address: (kb.address as string) || '',
        phone: (kb.phone as string) || business.phoneNumber || '',
        hours: (kb.hours as string) || '',
        services: (kb.services as string) || '',
        policies: (kb.policies as string) || '',
        additionalInfo: (kb.additionalInfo as string) || '',
      });
      setJsonContent(JSON.stringify(kb, null, 2));
    } else {
      setFormData({
        businessName: business?.name || '',
        address: '',
        phone: business?.phoneNumber || '',
        hours: '',
        services: '',
        policies: '',
        additionalInfo: '',
      });
      setJsonContent('{}');
    }
  }, [business]);

  const handleFormChange = (field: keyof KnowledgeBaseForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleJsonChange = (value: string) => {
    setJsonContent(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch {
      setJsonError('Invalid JSON format');
    }
  };

  const handleSaveForm = () => {
    const knowledgeBase: Record<string, unknown> = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value.trim()) {
        knowledgeBase[key] = value.trim();
      }
    });
    updateMutation.mutate(knowledgeBase);
  };

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      updateMutation.mutate(parsed);
    } catch {
      toast({
        title: 'Invalid JSON',
        description: 'Please fix the JSON syntax errors before saving',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load knowledge base"
        message={error instanceof Error ? error.message : 'An error occurred'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Knowledge Base</h1>
          <p className="page-description">
            Configure the information your AI assistant uses to help customers
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            This information helps the AI provide accurate responses about your business
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'form' | 'json')}>
            <TabsList className="mb-6">
              <TabsTrigger value="form" className="gap-2">
                <FileText className="h-4 w-4" />
                Form Editor
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2">
                <Code className="h-4 w-4" />
                JSON Editor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => handleFormChange('businessName', e.target.value)}
                    placeholder="Your Business Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours">Business Hours</Label>
                <Textarea
                  id="hours"
                  value={formData.hours}
                  onChange={(e) => handleFormChange('hours', e.target.value)}
                  placeholder="Monday - Friday: 9am - 5pm&#10;Saturday: 10am - 2pm&#10;Sunday: Closed"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="services">Services Offered</Label>
                <Textarea
                  id="services"
                  value={formData.services}
                  onChange={(e) => handleFormChange('services', e.target.value)}
                  placeholder="List your services, products, or offerings..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policies">Booking Policies</Label>
                <Textarea
                  id="policies"
                  value={formData.policies}
                  onChange={(e) => handleFormChange('policies', e.target.value)}
                  placeholder="Cancellation policy, booking requirements, etc..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => handleFormChange('additionalInfo', e.target.value)}
                  placeholder="Any other information the AI should know..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveForm}
                  disabled={updateMutation.isPending}
                  className="gap-2"
                >
                  {updateMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="json" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>JSON Content</Label>
                  {jsonError ? (
                    <span className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {jsonError}
                    </span>
                  ) : jsonContent !== '{}' && (
                    <span className="flex items-center gap-1 text-sm text-success">
                      <Check className="h-4 w-4" />
                      Valid JSON
                    </span>
                  )}
                </div>
                <Textarea
                  value={jsonContent}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className="font-mono text-sm min-h-[400px]"
                  placeholder='{"key": "value"}'
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveJson}
                  disabled={updateMutation.isPending || !!jsonError}
                  className="gap-2"
                >
                  {updateMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save JSON
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-info/5 to-info/10 border-info/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-info/10">
              <AlertCircle className="h-5 w-5 text-info" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tips for a Great Knowledge Base</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Be specific about your business hours including holidays</li>
                <li>• List all services with pricing if applicable</li>
                <li>• Include cancellation and booking policies clearly</li>
                <li>• Add FAQs that customers commonly ask</li>
                <li>• Update regularly when services or hours change</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
