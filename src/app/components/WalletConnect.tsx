 'use client';

import { useEffect, useState } from 'react';
import { getWallets, Wallet } from '@mysten/wallet-standard';

interface WalletConnectProps {
  onConnected: () => void;
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    const availableWallets = getWallets();
    setWallets(Array.from(availableWallets.get()));
  }, []);

  const connectWallet = async (wallet: Wallet) => {
    try {
      // await wallet.connect();
      setSelectedWallet(wallet);
      onConnected();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!selectedWallet ? (
        <>
          <h2 className="text-xl font-semibold">Wallet Connet</h2>
          <div className="flex gap-4">
            {wallets.map((wallet, index) => (
              <button
                key={index}
                onClick={() => connectWallet(wallet)}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {wallet.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-green-500">
          已连接到 {selectedWallet.name}
        </div>
      )}
    </div>
  );
}