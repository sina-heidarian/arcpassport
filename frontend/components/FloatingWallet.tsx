"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function FloatingWallet() {
  return (
    <div className="fixed right-4 top-4 z-[99999] sm:right-8 sm:top-6">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          mounted,
          openAccountModal,
          openChainModal,
          openConnectModal,
        }) => {
          const ready = mounted;
          const connected = ready && account && chain;

          if (!connected) {
            return (
              <button
                type="button"
                onClick={openConnectModal}
                className="h-11 whitespace-nowrap rounded-2xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-blue-100 sm:h-12"
              >
                Connect
              </button>
            );
          }

          if (chain.unsupported) {
            return (
              <button
                type="button"
                onClick={openChainModal}
                className="h-11 whitespace-nowrap rounded-2xl bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400 sm:h-12"
              >
                Wrong network
              </button>
            );
          }

          return (
            <button
              type="button"
              onClick={openAccountModal}
              className="flex h-11 items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-white shadow-2xl shadow-black/30 transition hover:border-blue-500 sm:h-12 sm:gap-3 sm:px-4"
            >
              {account.displayBalance && (
                <span className="hidden whitespace-nowrap font-medium text-gray-300 lg:inline">
                  {account.displayBalance}
                </span>
              )}
              <span className="hidden h-8 w-px bg-zinc-800 lg:block" />
              <span className="font-semibold">{shortAddress(account.address)}</span>
              <span className="text-sm leading-none text-gray-500">v</span>
            </button>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

function shortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
