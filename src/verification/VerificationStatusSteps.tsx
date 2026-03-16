import { BrandAvatar } from '@/components/common/BrandAvatar';
import { safeStr } from '@/helpers/data.helpers';

type Props = {
  verificationSteps?: {
    email: boolean;
    documents: boolean;
    live: boolean;
  };
  fullName?: string;
  avatarUrl?: string;
};
export const VerificationStatusSteps = ({
  verificationSteps,
  fullName,
  avatarUrl,
}: Props) => {
  const avatarStyle = avatarUrl ? 'image' : 'character';

  return (
    <div>
      <BrandAvatar
        value={safeStr(fullName, '?')}
        size={50}
        style={avatarStyle}
        src={avatarUrl || undefined}
        verificationSteps={verificationSteps}
      />
    </div>
  );
};
