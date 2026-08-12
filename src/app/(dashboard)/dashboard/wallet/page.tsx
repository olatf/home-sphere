import {
  SummaryChart,
  WalletActions,
  WalletActivities,
  WalletBalanceCard,
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
