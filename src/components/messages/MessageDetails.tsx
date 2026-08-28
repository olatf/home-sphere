import { ChevronLeft, Trash2 } from 'lucide-react';
import { BrandButton } from '@/components/common/BrandButton';
import type { Message } from '@/types/property';
import { MessageDetailContent } from './MessageDetailContent';

export const MessageDetail = ({
  message,
  onClose,
  onDelete,
}: {
  message: Message;
  onClose: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b px-6 py-3">
        <BrandButton
          onClick={onClose}
          variant="outline"
          className="text-gray-500 text-sm transition hover:text-gray-800"
          leftIcon={<ChevronLeft className="size-4" />}
        >
          Back
        </BrandButton>
        <BrandButton
          onClick={onDelete}
          variant="outline"
          className="text-red-500 text-sm transition hover:text-red-600"
          leftIcon={<Trash2 className="size-4" />}
        >
          Delete
        </BrandButton>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <MessageDetailContent message={message} />
      </div>
    </div>
  );
};
