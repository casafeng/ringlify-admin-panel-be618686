import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingPage, LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { toast } from '@/hooks/use-toast';

export function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [kbJson, setKbJson] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const { data: business, isLoading, error, refetch } = useQuery({
    queryKey: ['business', id],
    queryFn: () => api.getBusiness(id!),
    enabled: !!id,
  });

  // Initialize KB JSON when business data loads
  useState(() => {
    if (business?.knowledgeBase) {
      setKbJson(JSON.stringify(business.knowledgeBase, null, 2));
    }
  });

  const kbMutation = useMutation({
    mutationFn: (knowledgeBase: Record<string, unknown>) =>
      api.updateKnowledgeBase(id!, knowledgeBase),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business', id] });
      toast({ title: 'Knowledge base updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update knowledge base',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const handleKbChange = (value: string) => {
    setKbJson(value);
    setJsonError('');
    try {
      JSON.parse(value);
    } catch {
      setJsonError('Invalid JSON format');
    }
  };

  const handleSaveKb = () => {
    try {
      const parsed = JSON.parse(kbJson);
      kbMutation.mutate(parsed);
    } catch {
      setJsonError('Invalid JSON format');
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(kbJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'Failed to load business'}
        onRetry={() => refetch()}
      />
    );
  }

  if (!business) {
    return (
      <ErrorMessage
        title="Not Found"
        message="Business not found"
      />
    );
  }

  const currentKb = business.knowledgeBase
    ? JSON.stringify(business.knowledgeBase, null, 2)
    : '{}';

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/businesses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="page-title">{business.name}</h1>
            <p className="page-description font-mono">{business.phoneNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle>Business Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">ID</Label>
              <p className="font-mono text-sm break-all">{business.id}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p>{business.name}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <p className="font-mono">{business.phoneNumber}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Timezone</Label>
              <p>{business.timezone || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <p className="text-sm">{business.description || 'No description'}</p>
            </div>
            {business._count && (
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Appointments</span>
                  <span className="font-medium">{business._count.appointments}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Call Logs</span>
                  <span className="font-medium">{business._count.callLogs}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Knowledge Base Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Knowledge Base</CardTitle>
            <CardDescription>
              Edit the business knowledge base as JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit">
              <TabsList className="mb-4">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-4">
                <div className="relative">
                  <Textarea
                    value={kbJson || currentKb}
                    onChange={(e) => handleKbChange(e.target.value)}
                    className="font-mono text-sm min-h-[400px] resize-y"
                    placeholder='{"address": "123 Main St", "hours": {...}}'
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {jsonError && (
                  <p className="text-sm text-destructive">{jsonError}</p>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveKb}
                    disabled={!!jsonError || kbMutation.isPending}
                  >
                    {kbMutation.isPending && (
                      <LoadingSpinner size="sm" className="mr-2" />
                    )}
                    <Save className="h-4 w-4 mr-2" />
                    Save Knowledge Base
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="rounded-lg bg-muted p-4 min-h-[400px] overflow-auto">
                  <pre className="font-mono text-sm whitespace-pre-wrap">
                    {(() => {
                      try {
                        return JSON.stringify(
                          JSON.parse(kbJson || currentKb),
                          null,
                          2
                        );
                      } catch {
                        return 'Invalid JSON';
                      }
                    })()}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
