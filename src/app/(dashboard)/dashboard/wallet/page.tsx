import {
  WalletBalanceCard,
  SummaryChart,
  WalletActions,
  WalletActivities,
} from '@/wallets';

export default function WalletPage() {
  return (
    <>
      <WalletBalanceCard />
      <WalletActions />
      <SummaryChart />
      <WalletActivities />
    </>
  );
}
