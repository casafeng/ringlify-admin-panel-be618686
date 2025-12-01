import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Phone, FileText, Clock, Globe, CheckCircle2, 
  ChevronRight, ChevronLeft, Sparkles, AlertCircle
} from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { businessApi, Business } from '@/lib/business-api';
import { getStoredAuth } from '@/lib/auth';
import { LoadingSpinner, LoadingPage } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const businessInfoSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  description: z.string().optional(),
});

const hoursSchema = z.object({
  timezone: z.string().min(1, 'Please select a timezone'),
  businessHoursStart: z.string().min(1, 'Please enter opening time'),
  businessHoursEnd: z.string().min(1, 'Please enter closing time'),
});

interface StepProps {
  business: Business | null;
  onNext: () => void;
  onBack?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function StepBusinessInfo({ business, onNext }: StepProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: business?.name || '',
    phoneNumber: business?.phoneNumber || '',
    description: business?.description || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    setErrors({});
    const result = businessInfoSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await businessApi.updateBusiness(formData);
      toast({ title: 'Business info saved!' });
      onNext();
    } catch (err) {
      toast({ 
        title: 'Failed to save', 
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Business Name</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            placeholder="Your Business Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
          />
        </div>
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            placeholder="+1 (555) 123-4567"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className={`pl-10 ${errors.phoneNumber ? 'border-destructive' : ''}`}
          />
        </div>
        {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Tell us about your business..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
        {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
        Continue
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

function StepHours({ business, onNext, onBack }: StepProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    timezone: business?.timezone || 'America/New_York',
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    setErrors({});
    const result = hoursSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await businessApi.updateBusiness({ timezone: formData.timezone });
      toast({ title: 'Hours saved!' });
      onNext();
    } catch (err) {
      toast({ 
        title: 'Failed to save', 
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select value={formData.timezone} onValueChange={(v) => setFormData({ ...formData, timezone: v })}>
          <SelectTrigger className={errors.timezone ? 'border-destructive' : ''}>
            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>{tz}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.timezone && <p className="text-sm text-destructive">{errors.timezone}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start">Opening Time</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="start"
              type="time"
              value={formData.businessHoursStart}
              onChange={(e) => setFormData({ ...formData, businessHoursStart: e.target.value })}
              className={`pl-10 ${errors.businessHoursStart ? 'border-destructive' : ''}`}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">Closing Time</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="end"
              type="time"
              value={formData.businessHoursEnd}
              onChange={(e) => setFormData({ ...formData, businessHoursEnd: e.target.value })}
              className={`pl-10 ${errors.businessHoursEnd ? 'border-destructive' : ''}`}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepKnowledgeBase({ onNext, onBack }: StepProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    services: '',
    walkIns: '',
    policies: '',
    faq: '',
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const knowledgeBase = {
        services: formData.services,
        walkIns: formData.walkIns,
        policies: formData.policies,
        faq: formData.faq,
        updatedAt: new Date().toISOString(),
      };
      await businessApi.updateKnowledgeBase(knowledgeBase);
      toast({ title: 'Knowledge base saved!' });
      onNext();
    } catch (err) {
      toast({ 
        title: 'Failed to save', 
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-3 rounded-lg bg-info/10 border border-info/30 text-sm text-info">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>This information helps our AI assistant answer questions about your business accurately.</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="services">What services do you offer?</Label>
        <Textarea
          id="services"
          placeholder="Describe your main services..."
          value={formData.services}
          onChange={(e) => setFormData({ ...formData, services: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="walkIns">Do you accept walk-ins?</Label>
        <Textarea
          id="walkIns"
          placeholder="Yes, we accept walk-ins during business hours..."
          value={formData.walkIns}
          onChange={(e) => setFormData({ ...formData, walkIns: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="policies">Any policies customers should know?</Label>
        <Textarea
          id="policies"
          placeholder="Cancellation policy, payment methods, etc..."
          value={formData.policies}
          onChange={(e) => setFormData({ ...formData, policies: e.target.value })}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="faq">Common questions & answers</Label>
        <Textarea
          id="faq"
          placeholder="Q: Do you offer discounts? A: Yes, we have..."
          value={formData.faq}
          onChange={(e) => setFormData({ ...formData, faq: e.target.value })}
          rows={2}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepFinish({ onBack }: StepProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center space-y-6">
      <div className="mx-auto h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">You're all set!</h3>
        <p className="text-muted-foreground">
          Your business is ready to go. Start managing your appointments and calls from your dashboard.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => navigate('/business')} className="flex-1">
          <Sparkles className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

const STEPS = [
  { id: 1, title: 'Business Info', icon: Building2, description: 'Basic details about your business' },
  { id: 2, title: 'Hours & Timezone', icon: Clock, description: 'When are you open?' },
  { id: 3, title: 'Knowledge Base', icon: FileText, description: 'Help AI understand your business' },
  { id: 4, title: 'Finish', icon: CheckCircle2, description: 'Ready to go!' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { isAuthenticated } = getStoredAuth();
    if (!isAuthenticated) {
      navigate('/business/login');
      return;
    }

    const fetchBusiness = async () => {
      try {
        const data = await businessApi.getBusiness();
        setBusiness(data);
      } catch (err) {
        console.error('Failed to fetch business:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [navigate]);

  if (isLoading) {
    return <LoadingPage />;
  }

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const stepProps: StepProps = {
    business,
    onNext: handleNext,
    onBack: handleBack,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors
                  ${currentStep >= step.id 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'border-border text-muted-foreground'}
                `}>
                  <step.icon className="h-5 w-5" />
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`
                    hidden sm:block w-12 md:w-20 h-0.5 mx-2
                    ${currentStep > step.id ? 'bg-primary' : 'bg-border'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Step {currentStep} of {STEPS.length}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-border/50 shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 1 && <StepBusinessInfo {...stepProps} />}
                {currentStep === 2 && <StepHours {...stepProps} />}
                {currentStep === 3 && <StepKnowledgeBase {...stepProps} />}
                {currentStep === 4 && <StepFinish {...stepProps} />}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
