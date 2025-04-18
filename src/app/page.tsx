'use client';

import { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import MintButton from './components/MintButton';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  const handleWalletConnected = () => {
    setIsConnected(true);
  };

  const handleMint = async () => {
    try {
      // TODO: Implement minting logic
      console.log('Minting...');
    } catch (error) {
      console.error('Minting failed:', error);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto">
        
        <WalletConnect onConnected={handleWalletConnected} />

        {isConnected && (
          <div className="mt-8">
            <div className="mb-6">
              <textarea
                id="question"
                className="w-full p-3 rounded-lg bg-gray-800 text-white"
                rows={4}
                placeholder="Tell us the question you want to divine..."
              />
            </div>
            <MintButton onMint={handleMint} />
          </div>
        )}
      </div>
    </main>
  );
}