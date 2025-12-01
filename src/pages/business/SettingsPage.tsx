import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Copy, Check, Building2, Phone, Globe, FileText } from 'lucide-react';
import { z } from 'zod';
import { businessApi } from '@/lib/business-api';
import { getBusinessId } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner, LoadingPage } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { toast } from '@/hooks/use-toast';

const settingsSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100, 'Name too long'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  description: z.string().max(500, 'Description too long').optional(),
});

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

export function SettingsPage() {
  const queryClient = useQueryClient();
  const businessId = getBusinessId();
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    timezone: 'America/New_York',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: business, isLoading, error, refetch } = useQuery({
    queryKey: ['business'],
    queryFn: () => businessApi.getBusiness(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name?: string; phoneNumber?: string; timezone?: string; description?: string }) =>
      businessApi.updateBusiness(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business'] });
      toast({
        title: 'Settings saved',
        description: 'Your business settings have been updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        phoneNumber: business.phoneNumber || '',
        timezone: business.timezone || 'America/New_York',
        description: business.description || '',
      });
    }
  }, [business]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSave = () => {
    const result = settingsSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    updateMutation.mutate(formData);
  };

  const copyBusinessId = () => {
    if (businessId) {
      navigator.clipboard.writeText(businessId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied',
        description: 'Business ID copied to clipboard',
      });
    }
  };

  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load settings"
        message={error instanceof Error ? error.message : 'An error occurred'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-description">Manage your business settings and preferences</p>
        </div>
      </div>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Business Details
          </CardTitle>
          <CardDescription>
            Update your business information
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  className={`pl-10 ${errors.phoneNumber ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone *</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
              <Select
                value={formData.timezone}
                onValueChange={(value) => handleChange('timezone', value)}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of your business..."
                className={`pl-10 min-h-[100px] ${errors.description ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
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
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Information
          </CardTitle>
          <CardDescription>
            Technical details for integration purposes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business ID</Label>
            <div className="flex gap-2">
              <Input
                value={businessId || ''}
                readOnly
                className="font-mono text-sm bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyBusinessId}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Your unique business identifier for API integrations
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium mb-2">API Endpoints</h4>
            <div className="space-y-2 text-sm font-mono">
              <p className="text-muted-foreground">
                GET /admin/businesses/{businessId?.slice(0, 8)}...
              </p>
              <p className="text-muted-foreground">
                PUT /admin/businesses/{businessId?.slice(0, 8)}...
              </p>
              <p className="text-muted-foreground">
                POST /admin/businesses/{businessId?.slice(0, 8)}... /kb
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
