'use client';

import { useEffect, useState } from 'react';
import { getWallets, Wallet, WalletAccount } from '@mysten/wallet-standard';

interface WalletConnectProps {
  onConnected: (account: WalletAccount) => void;
}

// Define a type for browser-injected wallets 
type BrowserWallet = {
  name: string;
  connect?: () => Promise<unknown>;
  getAccounts?: () => Promise<{address: string; publicKey?: Uint8Array}[]>;
  accounts?: {address: string; publicKey?: Uint8Array}[];
  getAccount?: () => Promise<{address: string; publicKey?: Uint8Array}>;
};

// Define a Window with wallet extensions
interface WindowWithWallets extends Window {
  suiWallet?: BrowserWallet;
  ethosWallet?: BrowserWallet;
  martian?: BrowserWallet;
  slushWallet?: BrowserWallet;
}

// Define wallet feature interfaces
interface StandardConnectFeature {
  connect(): Promise<{ accounts: WalletAccount[] }>;
}

interface GenericWallet {
  name: string;
  connect(): Promise<void>;
  accounts: readonly WalletAccount[];
  features: Record<string, unknown>;
}

// Add a SuiConnectFeature interface
interface SuiConnectFeature {
  connect(): Promise<{ accounts: WalletAccount[] }>;
}

// Manual wallet detection
const detectSuiWallets = (): Array<{name: string, wallet: BrowserWallet}> => {
  const detectedWallets: Array<{name: string, wallet: BrowserWallet}> = [];
  
  // Check if we're in browser environment
  if (typeof window === 'undefined') return detectedWallets;
  
  const win = window as WindowWithWallets;
  
  // Check for Sui Wallet
  if (win.suiWallet) {
    detectedWallets.push({
      name: 'Sui Wallet',
      wallet: win.suiWallet
    });
  }
  
  // Check for Ethos Wallet
  if (win.ethosWallet) {
    detectedWallets.push({
      name: 'Ethos Wallet',
      wallet: win.ethosWallet
    });
  }
  
  // Check for Martian Wallet
  if (win.martian) {
    detectedWallets.push({
      name: 'Martian',
      wallet: win.martian
    });
  }
  
  // Check for Slush Wallet
  if (win.slushWallet) {
    detectedWallets.push({
      name: 'Slush Wallet',
      wallet: win.slushWallet
    });
  }
  
  return detectedWallets;
};

// Helper to convert browser wallet account to standard wallet account
const createWalletAccount = (address: string, publicKey?: Uint8Array): WalletAccount => {
  return {
    address,
    publicKey: publicKey || new Uint8Array(),
    chains: ['sui:mainnet'],
    features: ['sui:signAndExecuteTransaction']
  };
};

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [currentAccount, setCurrentAccount] = useState<WalletAccount | null>(null);
  const [connectStatus, setConnectStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [manualWallets, setManualWallets] = useState<Array<{name: string, wallet: BrowserWallet}>>([]);

  useEffect(() => {
    try {
      // Debug what's available in window
      console.log('Window object keys:', Object.keys(window));
      
      // Standard detection
      const availableWallets = getWallets();
      const allWallets = [...availableWallets.get()];
      
      console.log('All detected wallets via wallet-standard:', allWallets);
      
      // Log wallet chains and features for debugging
      allWallets.forEach(wallet => {
        console.log(`Wallet: ${wallet.name}`);
        console.log(`- Chains:`, wallet.chains);
        console.log(`- Features:`, wallet.features);
        console.log(`- Methods available:`, Object.getOwnPropertyNames(wallet));
      });
      
      // Filter for SUI wallets - include any wallet that has SUI features
      const supportedWallets = allWallets.filter(
        wallet => {
          // Check for any SUI-related feature
          const hasSuiFeatures = Object.keys(wallet.features || {}).some(
            feature => feature.startsWith('sui:')
          );
          
          // Could also check chains for SUI chain
          const hasSuiChain = wallet.chains?.some(
            chain => chain.startsWith('sui:')
          );
          
          return hasSuiFeatures || hasSuiChain;
        }
      );
      
      setDebugInfo(`Standard detection found ${supportedWallets.length} SUI wallets`);
      setWallets(supportedWallets);
      
      // Manual detection for browser extensions
      const detected = detectSuiWallets();
      console.log('Manually detected wallets:', detected);
      setManualWallets(detected);
      
      if (detected.length > 0) {
        setDebugInfo(prev => `${prev}, Manual detection: ${detected.map(w => w.name).join(', ')}`);
      }
      
      // Listen for wallet changes
      const unsubscribe = availableWallets.on('register', () => {
        console.log('New wallet registered!');
        const newAllWallets = [...availableWallets.get()];
        const newWalletNames = newAllWallets.map(w => w.name).join(', ');
        
        const updatedWallets = newAllWallets.filter(
          wallet => Object.keys(wallet.features || {}).some(feature => feature.startsWith('sui:'))
        );
        setWallets(updatedWallets);
        
        // Also check manual wallets again
        const updatedManual = detectSuiWallets();
        setManualWallets(updatedManual);
        
        setDebugInfo(`Updated standard: ${newWalletNames || 'None'}, Manual: ${updatedManual.map(w => w.name).join(', ')}`);
      });
      
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error('Error detecting wallets:', error);
      setDebugInfo(`Error: ${(error as Error).message}`);
      
      // Try manual detection if standard detection fails
      const detected = detectSuiWallets();
      console.log('Fallback to manual detection:', detected);
      setManualWallets(detected);
      
      if (detected.length > 0) {
        setDebugInfo(prev => `${prev}, Manual fallback: ${detected.map(w => w.name).join(', ')}`);
      }
    }
  }, []);

  const connectWallet = async (wallet: Wallet) => {
    try {
      setConnectStatus('connecting');
      
      console.log('Connecting to wallet:', wallet.name);
      console.log('Wallet features:', Object.keys(wallet.features || {}));
      
      // Check for general connect feature first
      if (wallet.features && wallet.features['standard:connect']) {
        console.log('Using standard:connect feature');
        const connectFeature = wallet.features['standard:connect'] as StandardConnectFeature;
        const response = await connectFeature.connect();
        
        if (response.accounts && response.accounts.length > 0) {
          const account = response.accounts[0];
          setSelectedWallet(wallet);
          setCurrentAccount(account);
          setConnectStatus('connected');
          onConnected(account);
          return;
        }
      }
      
      // Check if wallet has the required SUI features
      if (!wallet.features || !('sui:connect' in wallet.features)) {
        console.log('No sui:connect feature, trying generic connection');
        // Try accessing connect method directly
        const genericWallet = wallet as unknown as GenericWallet;
        if (genericWallet.connect) {
          await genericWallet.connect();
          if (genericWallet.accounts && genericWallet.accounts.length > 0) {
            const account = genericWallet.accounts[0];
            setSelectedWallet(wallet);
            setCurrentAccount(account);
            setConnectStatus('connected');
            onConnected(account);
            return;
          }
        }
        
        throw new Error('Wallet does not support SUI connection');
      }
      
      // Get the SUI feature from the wallet
      console.log('Using sui:connect feature');
      const connectFeature = wallet.features['sui:connect'] as SuiConnectFeature;
      
      if (typeof connectFeature !== 'object' || typeof connectFeature.connect !== 'function') {
        throw new Error('Invalid wallet connection feature');
      }
      
      // Connect to the wallet
      const response = await connectFeature.connect();
      
      // Set the wallet and accounts
      setSelectedWallet(wallet);
      
      // Set the current account (using the first one by default)
      if (response.accounts && response.accounts.length > 0) {
        const account = response.accounts[0];
        setCurrentAccount(account);
        setConnectStatus('connected');
        onConnected(account);
      } else {
        throw new Error('No accounts available in the wallet');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setConnectStatus('disconnected');
      setDebugInfo(`Connection error: ${(error as Error).message}`);
    }
  };

  const connectManualWallet = async (walletInfo: {name: string, wallet: BrowserWallet}) => {
    try {
      setConnectStatus('connecting');
      
      const wallet = walletInfo.wallet;
      
      // Different wallets have different APIs, try to handle the common ones
      if (typeof wallet.connect === 'function') {
        await wallet.connect();
      }
      
      let address = '';
      let publicKey: Uint8Array | undefined;
      
      if (typeof wallet.getAccounts === 'function') {
        const accounts = await wallet.getAccounts();
        if (accounts && accounts.length > 0) {
          address = accounts[0].address;
          publicKey = accounts[0].publicKey;
        }
      } else if (wallet.accounts && wallet.accounts.length > 0) {
        address = wallet.accounts[0].address;
        publicKey = wallet.accounts[0].publicKey;
      } else if (typeof wallet.getAccount === 'function') {
        const account = await wallet.getAccount();
        if (account) {
          address = account.address;
          publicKey = account.publicKey;
        }
      }
      
      if (!address) {
        throw new Error('Could not get account from wallet');
      }
      
      // Convert to standard wallet account format
      const standardAccount = createWalletAccount(address, publicKey);
      
      setCurrentAccount(standardAccount);
      setConnectStatus('connected');
      onConnected(standardAccount);
      
    } catch (error) {
      console.error('Failed to connect manual wallet:', error);
      setConnectStatus('disconnected');
      setDebugInfo(`Manual connection error: ${(error as Error).message}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {connectStatus !== 'connected' ? (
        <>
          <h2 className="text-xl font-semibold">Connect Wallet</h2>
          
          <div className="flex flex-wrap gap-4 justify-center">
            {/* Standard wallets */}
            {wallets.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm mb-2 text-gray-400">Standard Wallets</h3>
                <div className="flex flex-wrap gap-2">
                  {wallets.map((wallet, index) => (
                    <button
                      key={index}
                      onClick={() => connectWallet(wallet)}
                      disabled={connectStatus === 'connecting'}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 
                        ${connectStatus === 'connecting' ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {wallet.name}
                      {connectStatus === 'connecting' && (
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Manual wallets */}
            {manualWallets.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm mb-2 text-gray-400">Detected Browser Wallets</h3>
                <div className="flex flex-wrap gap-2">
                  {manualWallets.map((wallet, index) => (
                    <button
                      key={index}
                      onClick={() => connectManualWallet(wallet)}
                      disabled={connectStatus === 'connecting'}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 
                        ${connectStatus === 'connecting' ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {wallet.name}
                      {connectStatus === 'connecting' && (
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {wallets.length === 0 && manualWallets.length === 0 && (
              <div className="text-yellow-500">
                No SUI wallets detected. Please install a compatible wallet extension.
                {debugInfo && (
                  <div className="mt-2 text-xs text-white/70 p-2 bg-gray-800 rounded overflow-auto max-w-xl">
                    Debug info: {debugInfo}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg w-full">
          <div className="text-green-500 font-semibold mb-2">
            Connected to {selectedWallet?.name || 'wallet'}
          </div>
          {currentAccount && (
            <div className="text-sm text-gray-300 break-all">
              Address: {currentAccount.address}
            </div>
          )}
        </div>
      )}
    </div>
  );
}