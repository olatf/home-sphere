'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Save,
  Settings,
  Shield,
  Upload,
  User,
} from 'lucide-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { uploadFile } from '@/actions/uploadFile';
import { BrandAvatar } from '@/components/common/BrandAvatar';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QUERY_KEYS } from '@/config/property';
import {
  useChangeAdminPassword,
  useUpdateAdminProfile,
} from '@/hooks/useAdminActions';
import { useInspectionFees } from '@/hooks/useProperty';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name required'),
  phone: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().max(300, 'Max 300 characters').optional(),
  avatar_url: z.string().optional(),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, 'Minimum 8 characters'),
    confirmPassword: z.string(),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white">
      <div className="flex items-start gap-4 border-b px-6 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
          <Icon className="h-5 w-5 text-brand" />
        </div>
        <div>
          <h2 className="font-primary font-semibold text-base text-gray-900">
            {title}
          </h2>
          <p className="mt-0.5 font-secondary text-gray-500 text-xs">
            {description}
          </p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function InspectionFeeRow({
  propertyType,
  currentFee,
  description,
}: {
  propertyType: string;
  currentFee: number;
  description?: string;
}) {
  const qc = useQueryClient();
  const [fee, setFee] = useState(currentFee.toString());
  const [saving, startSaving] = useTransition();

  function handleSave() {
    startSaving(async () => {
      const res = await fetch(`/api/inspection-fees/${propertyType}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fee: parseFloat(fee) }),
      });
      if (res.ok) {
        toast.success(`${propertyType} fee updated`);
        qc.invalidateQueries({ queryKey: QUERY_KEYS.inspectionFees() });
      } else {
        toast.error('Failed to update fee');
      }
    });
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border p-4">
      <div className="min-w-0 flex-1">
        <p className="font-primary font-semibold text-gray-800 text-sm capitalize">
          {propertyType}
        </p>
        {description && (
          <p className="font-secondary text-gray-400 text-xs">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-sm">
            ₦
          </span>
          <Input
            type="number"
            value={fee}
            onChange={e => setFee(e.target.value)}
            className="w-32 pl-7 text-sm"
          />
        </div>
        <Button
          size="sm"
          className="bg-brand hover:bg-brand-dark"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

interface AdminSettingsPageProps {
  currentUser: {
    id: string;
    full_name?: string;
    email: string;
    phone?: string;
    city?: string;
    bio?: string;
    avatar_url?: string;
    role: string;
  };
}

export function AdminSettingsPage({ currentUser }: AdminSettingsPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [_uploading, startUploading] = useTransition();

  const updateProfile = useUpdateAdminProfile();
  const changePassword = useChangeAdminPassword();
  const { data: fees, isLoading: feesLoading } = useInspectionFees();

  const profileForm = useForm<ProfileFormData, unknown, ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: currentUser.full_name ?? '',
      phone: currentUser.phone ?? '',
      city: currentUser.city ?? '',
      bio: currentUser.bio ?? '',
      avatar_url: currentUser.avatar_url ?? '',
    },
  });

  const passwordForm = useForm<PasswordFormData, unknown, PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  async function handleProfileSave(data: ProfileFormData) {
    const response = await updateProfile.mutateAsync(data);

    if (response.success) toast.success('Profile updated');
    else toast.error(response.error ?? 'Failed to update profile');
  }

  async function handleAvatarUpload(file: File) {
    startUploading(async () => {
      const r = await uploadFile(file, 'avatars', '', false);
      if (r.success && r.url) {
        profileForm.setValue('avatar_url', r.url);
        await updateProfile.mutateAsync({ avatar_url: r.url });
        toast.success('Avatar updated');
      } else {
        toast.error(r.error ?? 'Upload failed');
      }
    });
  }

  async function handlePasswordChange(data: PasswordFormData) {
    const r = await changePassword.mutateAsync(data.newPassword);
    if (r.success) {
      toast.success('Password changed');
      passwordForm.reset();
    } else toast.error(r.error ?? 'Failed to change password');
  }

  const avatarUrl = profileForm.watch('avatar_url');
  const isSuperAdmin = currentUser.role === 'superAdmin';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-bold font-primary text-2xl text-gray-900">
          Settings
        </h1>
        <p className="mt-1 font-secondary text-gray-500 text-sm">
          Manage your profile and platform configuration
        </p>
      </div>

      <SettingsSection
        icon={User}
        title="Profile"
        description="Update your personal information and avatar"
      >
        {/* Avatar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <BrandAvatar
              value={currentUser.full_name ?? ''}
              style={avatarUrl ? 'image' : 'character'}
              src={avatarUrl}
              size={59}
            />
            <label className="absolute -right-1 -bottom-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-brand text-white shadow transition hover:bg-brand-dark">
              <Upload className="h-3 w-3" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e =>
                  e.target.files?.[0] && handleAvatarUpload(e.target.files[0])
                }
              />
            </label>
          </div>
          <div>
            <p className="font-primary font-semibold text-gray-800 text-sm">
              {currentUser.full_name ?? '—'}
            </p>
            <p className="font-secondary text-gray-500 text-xs">
              {currentUser.email}
            </p>
            <span
              className={cn(
                'mt-1 inline-block rounded-full px-2 py-0.5 font-semibold text-xs capitalize',
                currentUser.role === 'superAdmin'
                  ? 'bg-brand/10 text-brand'
                  : 'bg-amber-100 text-amber-700'
              )}
            >
              {currentUser.role}
            </span>
          </div>
        </div>

        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(handleProfileSave)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={profileForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+234..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={profileForm.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Lagos, Nigeria" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Tell us a bit about yourself..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="bg-brand hover:bg-brand-dark"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </Form>
      </SettingsSection>

      <SettingsSection
        icon={Lock}
        title="Password"
        description="Change your account password"
      >
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
            className="space-y-4"
          >
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="bg-brand hover:bg-brand-dark"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              Change Password
            </Button>
          </form>
        </Form>
      </SettingsSection>

      {isSuperAdmin && (
        <SettingsSection
          icon={Settings}
          title="Inspection Fees"
          description="Set the inspection fee tenants pay per property type. Landlords cannot override these."
        >
          {feesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : (
            <div className="space-y-3">
              {(fees ?? []).map(f => (
                <InspectionFeeRow
                  key={f.property_type}
                  propertyType={f.property_type}
                  currentFee={f.fee}
                  description={f.description}
                />
              ))}
            </div>
          )}
        </SettingsSection>
      )}

      <SettingsSection
        icon={Shield}
        title="Platform Fees"
        description="Fixed fees applied to all transactions"
      >
        <div className="space-y-3 text-sm">
          {[
            { label: 'Tenant Platform Fee', value: '5% of base price' },
            { label: 'Landlord Platform Fee', value: '5% of base price' },
            { label: 'Legal Services (opt-in)', value: '5% of base price' },
            { label: 'Admin Share', value: '10% total (5% each side)' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3"
            >
              <span className="font-secondary text-gray-600">{label}</span>
              <span className="font-primary font-semibold text-gray-800">
                {value}
              </span>
            </div>
          ))}
          <p className="pt-1 font-secondary text-gray-400 text-xs">
            These fees are fixed and cannot be changed from this interface.
            Contact your developer to adjust them.
          </p>
        </div>
      </SettingsSection>
    </div>
  );
}
