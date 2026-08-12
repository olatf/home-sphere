'use client';

import { format } from 'date-fns';
import {
  Calendar,
  Check,
  ChevronDown,
  Crown,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { BrandAvatar } from '@/components/common/BrandAvatar';
import { BrandButton } from '@/components/common/BrandButton';
import { BrandInput } from '@/components/common/BrandInput';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatCurrency } from '@/helpers/currency.helpers';
import { safeStr } from '@/helpers/data.helpers';
import {
  useSuspendUser,
  useUnsuspendUser,
  useUpdateUserRole,
  useUserDetail,
} from '@/hooks/useAdminActions';
import { cn } from '@/lib/utils';
import { ROLE_COLORS, VERIFICATION_STATUS_COLORS } from './AdminUsers';

type Property = {
  id: string;
  title: string;
  status: string;
};

export const AdminUserDetails = ({
  userId,
  currentUserRole,
  onClose,
}: {
  userId: string;
  currentUserRole: string;
  onClose: () => void;
}) => {
  const { data, isLoading } = useUserDetail(userId);
  const suspendMutation = useSuspendUser();
  const _unsuspendMutation = useUnsuspendUser();
  const roleMutation = useUpdateUserRole();

  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const profile = data?.data?.profile;
  const wallet = data?.data?.wallet;
  const userRole = data?.data?.role;

  async function handleSuspend() {
    if (!suspendReason.trim()) {
      toast.error('Reason required');
      return;
    }
    const r = await suspendMutation.mutateAsync({
      userId,
      reason: suspendReason,
    });
    if (r.success) {
      toast.success('Account suspended');
      setShowSuspendDialog(false);
      setSuspendReason('');
    } else toast.error(r.error);
  }

  async function handleRoleChange(newRole: string) {
    const r = await roleMutation.mutateAsync({ userId, role: newRole });
    if (r.success) toast.success(`Role updated to ${newRole}`);
    else toast.error(r.error);
    setShowRoleMenu(false);
  }

  return (
    <>
      <Sheet open={!!userId} onOpenChange={o => !o && onClose()}>
        <SheetContent
          className="w-full overflow-y-auto rounded-l-lg p-3 sm:max-w-lg"
          side="right"
        >
          <SheetHeader className="mb-2">
            <SheetTitle className="font-primary text-lg">
              User Profile
            </SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-brand" />
            </div>
          ) : !profile ? (
            <p className="text-center font-secondary text-gray-400 text-sm">
              User not found
            </p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <BrandAvatar
                  value={profile.full_name}
                  style={profile.avatar_url ? 'image' : 'character'}
                  src={safeStr(profile.avatar_url)}
                  size={60}
                />
                <div>
                  <p className="font-bold font-primary text-gray-900 text-lg">
                    {profile.full_name ?? '—'}
                  </p>
                  <p className="font-secondary text-gray-500 text-sm">
                    {profile.email}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 font-semibold text-xs capitalize',
                        ROLE_COLORS[userRole ?? 'tenant'] ??
                          'bg-gray-100 text-gray-500'
                      )}
                    >
                      {userRole ?? 'tenant'}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 font-semibold text-xs capitalize',
                        VERIFICATION_STATUS_COLORS[
                          profile.verification_status ?? 'not_started'
                        ]
                      )}
                    >
                      {(profile.verification_status ?? 'not_started').replace(
                        '_',
                        ' '
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet */}
              {wallet && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Balance', value: formatCurrency(wallet.balance) },
                    {
                      label: 'Total In',
                      value: formatCurrency(wallet.total_deposit),
                    },
                    {
                      label: 'Total Out',
                      value: formatCurrency(wallet.total_spent),
                    },
                  ].map(s => (
                    <div
                      key={s.label}
                      className="rounded-xl bg-gray-50 px-3 py-2.5 text-center"
                    >
                      <p className="font-bold font-primary text-gray-800 text-sm">
                        {s.value}
                      </p>
                      <p className="font-secondary text-gray-400 text-xs">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              {/* Profile details */}
              <div className="space-y-3">
                <h3 className="font-primary font-semibold text-gray-700 text-sm">
                  Profile Details
                </h3>
                {[
                  { icon: Mail, label: 'Email', value: profile.email },
                  { icon: Phone, label: 'Phone', value: profile.phone },
                  { icon: MapPin, label: 'City', value: profile.city },
                  {
                    icon: Calendar,
                    label: 'Date of Birth',
                    value: profile.date_of_birth
                      ? format(new Date(profile.date_of_birth), 'MMM d, yyyy')
                      : null,
                  },
                  {
                    icon: MapPin,
                    label: 'Nationality',
                    value: profile.nationality,
                  },
                ]
                  .filter(r => r.value)
                  .map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 text-sm"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="w-24 shrink-0 font-secondary text-gray-500">
                        {label}
                      </span>
                      <span className="font-secondary text-gray-800">
                        {value}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Verification flags */}
              <div className="space-y-2">
                <h3 className="font-primary font-semibold text-gray-700 text-sm">
                  Verification
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    {
                      label: 'Email verified',
                      value: profile.is_email_verified,
                    },
                    {
                      label: 'Account verified',
                      value: profile.is_account_verified,
                    },
                    {
                      label: 'Documents verified',
                      value: profile.is_documents_verified,
                    },
                    { label: 'Live verified', value: profile.is_live_verified },
                    {
                      label: 'Onboarding done',
                      value: profile.onboarding_completed,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      {value ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-400" />
                      )}
                      <span
                        className={value ? 'text-gray-700' : 'text-gray-400'}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent properties (landlord) */}
              {(data?.data?.properties ?? []).length > 0 && (
                <div>
                  <h3 className="mb-2 font-primary font-semibold text-gray-700 text-sm">
                    Properties
                  </h3>
                  <div className="space-y-1.5">
                    {data!.data!.properties!.map((p: Property) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs"
                      >
                        <span className="truncate font-secondary text-gray-700">
                          {p.title}
                        </span>
                        <span className="ml-2 shrink-0 font-secondary text-gray-400 capitalize">
                          {p.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent tenancies */}
              {(data?.data?.tenancies ?? []).length > 0 && (
                <div>
                  <h3 className="mb-2 font-primary font-semibold text-gray-700 text-sm">
                    Tenancies
                  </h3>
                  <div className="space-y-1.5">
                    {data!.data!.tenancies!.map(t => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs"
                      >
                        <span className="truncate font-secondary text-gray-700">
                          {Array.isArray(t.properties)
                            ? t.properties[0]?.title
                            : ''}
                        </span>
                        <span className="ml-2 shrink-0 font-medium font-secondary text-brand">
                          {formatCurrency(t.total_amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {/* Role change — superAdmin only */}
                {currentUserRole === 'superAdmin' && (
                  <DropdownMenu
                    open={showRoleMenu}
                    onOpenChange={setShowRoleMenu}
                  >
                    <DropdownMenuTrigger asChild>
                      <BrandButton className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Crown className="h-4 w-4" /> Change Role
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </BrandButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full min-w-50">
                      {[
                        'tenant',
                        'landlord',
                        'admin',
                        'administrator',
                        'superAdmin',
                      ].map(r => (
                        <DropdownMenuItem
                          key={r}
                          onClick={() => handleRoleChange(r)}
                          className={cn(
                            'capitalize',
                            userRole === r && 'font-semibold text-brand'
                          )}
                        >
                          {r} {userRole === r && '✓'}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <BrandButton
                  variant="outline"
                  className="mx-auto w-full border-red-200 px-4 text-red-500 hover:bg-red-50 md:w-[50%] md:px-0"
                  onClick={() => setShowSuspendDialog(true)}
                >
                  <ShieldAlert className="mr-2 h-4 w-4" /> Suspend Account
                </BrandButton>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog
        open={showSuspendDialog}
        onOpenChange={o => !o && setShowSuspendDialog(false)}
      >
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-primary">Suspend Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-secondary text-gray-600 text-sm">
              The user will be locked out immediately. Provide a clear reason.
            </p>

            <BrandInput
              name="suspended_reason"
              placeholder="Reason for suspension..."
              className="font-secondary"
              variant="textarea"
              value={suspendReason}
              onChange={value => {
                if (typeof value === 'string') {
                  setSuspendReason(value);
                }
              }}
            />
            <div className="flex gap-3">
              <BrandButton
                variant="secondary"
                className="flex-1 bg-black text-white"
                onClick={() => setShowSuspendDialog(false)}
              >
                Cancel
              </BrandButton>

              <BrandButton
                variant="secondary"
                className="mx-auto w-full bg-red-500 px-4 hover:bg-red-600 md:w-[50%] md:px-0"
                disabled={suspendMutation.isPending || !suspendReason.trim()}
                onClick={handleSuspend}
              >
                {suspendMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldAlert className="mr-2 h-4 w-4" />
                )}
                Suspend
              </BrandButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
