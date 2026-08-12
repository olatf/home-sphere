'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { GripVertical, ListChecks, Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import { BrandButton } from '@/components/common/BrandButton';
import { DateTimePicker } from '@/components/common/BrandDatePicker';
import { BrandModal } from '@/components/common/BrandModal';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { baseClass } from '@/config/constants';
import type { useCreateTask } from '@/hooks/useTask';
import type {
  CreateTaskFormData,
  ReferenceTable,
} from '@/lib/schemas/property';
import { createTaskSchema } from '@/lib/schemas/property';
import { cn } from '@/lib/utils';

const REFERENCE_TABLE_OPTIONS = [
  { value: 'properties', label: 'Property' },
  { value: 'tenancies', label: 'Tenancy' },
  { value: 'inspections', label: 'Inspection' },
  { value: 'users', label: 'User' },
] as const;

interface ReferenceItem {
  id: string;
  title: string;
}

interface CreateTaskDialogProps {
  availableUsers: { id: string; full_name: string; role: string }[];
  references?: Partial<Record<string, ReferenceItem[]>>;
  buttonText?: string;
  createMutation: ReturnType<typeof useCreateTask>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onsubmit: (data: CreateTaskFormData) => Promise<void>;
  contextId?: string;
  referenceTable?: string;
}

export const CreateTaskDialog = ({
  availableUsers,
  references = {},
  open,
  onOpenChange,
  createMutation,
  onsubmit,
  contextId,
  referenceTable: defaultReferenceTable,
}: CreateTaskDialogProps) => {
  const [newChecklistLabel, setNewChecklistLabel] = useState('');

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      assigned_to: '',
      due_date: undefined,
      priority: 'medium',
      attachments: [],
      context_id: contextId ?? '',
      reference_table: (defaultReferenceTable as ReferenceTable) ?? undefined,
      checklist: [],
    },
  });

  const {
    fields: checklistFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({ control: form.control, name: 'checklist' });

  const resetForm = () => {
    form.reset({
      title: '',
      description: '',
      assigned_to: '',
      due_date: undefined,
      priority: 'medium',
      attachments: [],
      context_id: contextId ?? '',
      reference_table: (defaultReferenceTable as ReferenceTable) ?? undefined,
      checklist: [],
    });
    setNewChecklistLabel('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const watchedTable = useWatch({
    control: form.control,
    name: 'reference_table',
  });
  const referenceItems: ReferenceItem[] = watchedTable
    ? (references[watchedTable] ?? [])
    : [];

  function addChecklistItem() {
    const label = newChecklistLabel.trim();
    if (!label) return;
    appendItem({ id: uuid(), label, done: false });
    setNewChecklistLabel('');
  }

  async function handleSubmit(data: CreateTaskFormData) {
    await onsubmit(data);
    form.reset();
    setNewChecklistLabel('');
    onOpenChange(false);
  }

  const onFormSubmit = form.handleSubmit(handleSubmit);

  return (
    <BrandModal
      isOpen={open}
      onClose={handleOpenChange}
      title="Create Task"
      className="max-h-[90vh] min-w-0 max-w-sm"
      footer={
        <BrandButton
          onClick={onFormSubmit}
          variant="ghost"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Create Task
        </BrandButton>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Inspect property plumbing"
                    className={baseClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <Textarea
                    className={cn('min-h-24 resize-none', baseClass)}
                    placeholder="What needs to be done, any context the assignee should know..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={baseClass}>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableUsers.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.full_name}{' '}
                          <span className="text-gray-400 capitalize">
                            ({u.role})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className={baseClass}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(['low', 'medium', 'high', 'urgent'] as const).map(v => (
                        <SelectItem key={v} value={v} className="capitalize">
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="reference_table"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Type</FormLabel>
                  <Select
                    onValueChange={v => {
                      field.onChange(v);
                      form.setValue('context_id', '');
                    }}
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger className={baseClass}>
                        <SelectValue placeholder="Table (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REFERENCE_TABLE_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="context_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Record</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                    disabled={!watchedTable || referenceItems.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className={baseClass}>
                        <SelectValue
                          placeholder={
                            !watchedTable
                              ? 'Select type first'
                              : referenceItems.length === 0
                                ? 'No records'
                                : 'Select record'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {referenceItems.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date (optional)</FormLabel>
                <FormControl>
                  <DateTimePicker
                    onChange={field.onChange}
                    value={field.value}
                    fromYear={new Date().getFullYear()}
                    disablePast
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-brand" />
              <p className="font-primary font-semibold text-gray-800 text-sm">
                Checklist
              </p>
              <span className="font-secondary text-gray-400 text-xs">
                (optional)
              </span>
            </div>
            <p className="font-secondary text-gray-500 text-xs">
              Add steps the assignee must complete before submitting for review.
              They can tick each item as they go.
            </p>

            {checklistFields.length > 0 && (
              <div className="w-full space-y-2 rounded-xl border bg-gray-50 p-3">
                {checklistFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex w-full items-center gap-2"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-gray-300" />
                    <Checkbox checked={false} disabled className="shrink-0" />
                    <span className="wrap-break-word min-w-0 flex-1 font-secondary text-gray-700 text-sm">
                      {field.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="shrink-0 rounded p-0.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={newChecklistLabel}
                onChange={e => setNewChecklistLabel(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChecklistItem();
                  }
                }}
                placeholder="Add a checklist item..."
                className={cn(baseClass, 'text-sm')}
              />
              <BrandButton
                type="button"
                variant={'secondary'}
                onClick={addChecklistItem}
                disabled={!newChecklistLabel.trim()}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </BrandButton>
            </div>
          </div>
        </form>
      </Form>
    </BrandModal>
  );
};
