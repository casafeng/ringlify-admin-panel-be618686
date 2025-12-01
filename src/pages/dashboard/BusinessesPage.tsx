import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Building2, Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, Business } from '@/lib/api';
import { businessFormSchema, BusinessFormData } from '@/lib/schemas';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function BusinessesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [deletingBusiness, setDeletingBusiness] = useState<Business | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['businesses'],
    queryFn: () => api.getBusinesses(),
  });

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      timezone: '',
      description: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: BusinessFormData) => api.createBusiness({
      name: data.name,
      phoneNumber: data.phoneNumber,
      timezone: data.timezone || undefined,
      description: data.description || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      setIsFormOpen(false);
      form.reset();
      toast({ title: 'Business created successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create business',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BusinessFormData }) =>
      api.updateBusiness(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      setEditingBusiness(null);
      form.reset();
      toast({ title: 'Business updated successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update business',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBusiness(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      setDeletingBusiness(null);
      toast({ title: 'Business deleted successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete business',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const openCreateForm = () => {
    form.reset({ name: '', phoneNumber: '', timezone: '', description: '' });
    setIsFormOpen(true);
  };

  const openEditForm = (business: Business) => {
    form.reset({
      name: business.name,
      phoneNumber: business.phoneNumber,
      timezone: business.timezone || '',
      description: business.description || '',
    });
    setEditingBusiness(business);
  };

  const onSubmit = (data: BusinessFormData) => {
    if (editingBusiness) {
      updateMutation.mutate({ id: editingBusiness.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredBusinesses = data?.data.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.phoneNumber.includes(searchQuery)
  ) || [];

  const columns = [
    {
      key: 'name',
      header: 'Business Name',
      render: (item: Business) => (
        <Link
          to={`/dashboard/businesses/${item.id}`}
          className="font-medium hover:underline flex items-center gap-1"
        >
          {item.name}
          <ExternalLink className="h-3 w-3" />
        </Link>
      ),
    },
    {
      key: 'phoneNumber',
      header: 'Phone',
      render: (item: Business) => (
        <span className="font-mono text-sm">{item.phoneNumber}</span>
      ),
    },
    {
      key: 'timezone',
      header: 'Timezone',
      render: (item: Business) => item.timezone || '-',
    },
    {
      key: 'stats',
      header: 'Stats',
      render: (item: Business) => (
        <div className="text-sm text-muted-foreground">
          {item._count?.appointments || 0} appointments · {item._count?.callLogs || 0} calls
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: Business) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openEditForm(item);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingBusiness(item);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
      className: 'w-24',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Businesses
          </h1>
          <p className="page-description">
            Manage your business profiles
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          Add Business
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search businesses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error State */}
      {error && (
        <ErrorMessage
          message={error instanceof Error ? error.message : 'Failed to load businesses'}
          onRetry={() => refetch()}
        />
      )}

      {/* Table */}
      {!error && (
        <DataTable
          columns={columns}
          data={filteredBusinesses}
          loading={isLoading}
          emptyMessage="No businesses found"
          rowKey={(item) => item.id}
        />
      )}

      {/* Create/Edit Form Dialog */}
      <Dialog
        open={isFormOpen || !!editingBusiness}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditingBusiness(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBusiness ? 'Edit Business' : 'Create Business'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="My Restaurant"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                {...form.register('phoneNumber')}
                placeholder="+1234567890"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                {...form.register('timezone')}
                placeholder="America/New_York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="A short description of the business"
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingBusiness(null);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                {editingBusiness ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingBusiness}
        onOpenChange={() => setDeletingBusiness(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingBusiness?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBusiness && deleteMutation.mutate(deletingBusiness.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
