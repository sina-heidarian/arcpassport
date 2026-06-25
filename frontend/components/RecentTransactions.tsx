import type { Transaction } from "@/lib/types";

type RecentTransactionsProps = {
  transactions: Transaction[];
};

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-6 space-y-4">
      <h2 className="text-2xl font-bold">Recent Transactions</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-gray-400 text-sm">
            <tr>
              <th className="py-3">Hash</th>
              <th className="py-3">Type</th>
              <th className="py-3">Status</th>
              <th className="py-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td className="py-4 text-gray-500" colSpan={4}>
                  No transactions found.
                </td>
              </tr>
            )}

            {transactions.map((tx) => (
              <tr key={tx.hash} className="border-t border-zinc-800 text-sm">
                <td className="py-4 text-blue-300">
                  <a
                    href={`https://testnet.arcscan.app/tx/${tx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {tx.short_hash}
                  </a>
                </td>
                <td className="py-4">{tx.type}</td>
                <td className="py-4">{tx.status}</td>
                <td className="py-4 text-gray-400">
                  {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
