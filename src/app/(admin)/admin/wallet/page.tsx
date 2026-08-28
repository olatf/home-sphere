import {
  SummaryChart,
  WalletActions,
  WalletActivities,
  WalletBalanceCard,
} from '@/wallets';

export default function AdminWalletPage() {
  return (
    <>
      <WalletBalanceCard />
      <WalletActions />
      <SummaryChart />
      <WalletActivities />
    </>
  );
}
