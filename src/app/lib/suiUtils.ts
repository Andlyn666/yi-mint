import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';
import { Wallet, signAndExecuteTransaction } from '@mysten/wallet-standard';

// Connect to SUI blockchain - use testnet for development
const provider = new SuiClient({ url: getFullnodeUrl('devnet') });

// Package ID of your deployed Move package (to be replaced with your actual package ID)
const PACKAGE_ID = '0x...'; // Replace with your actual package ID after deployment
// Module name in your Move package
const MODULE_NAME = 'yi_jing_nft';
// Function name to mint NFT in your Move package
const MINT_FUNCTION = 'mint';

// Function to mint a new Yi Jing NFT
export async function mintYiJingNFT(
  wallet: Wallet,
  recipientAddress: string,
  name: string,
  description: string,
  imageUrl: string,
  hexagramNumber: number,
  hexagramName: string,
  question: string
) {
  try {
    // Create a new transaction
    const tx = new Transaction();
    
    // Add arguments using bcs serialization
    const args = [
      bcs.string().serialize(name),
      bcs.string().serialize(description),
      bcs.string().serialize(imageUrl),
      bcs.u64().serialize(hexagramNumber),
      bcs.string().serialize(hexagramName),
      bcs.string().serialize(question),
      bcs.string().serialize(recipientAddress)
    ];
    
    // Call the mint function from your Move package
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::${MINT_FUNCTION}`,
      arguments: args
    });

    // Execute the transaction using the wallet's features
    console.log('Executing transaction with wallet:', wallet.name);
    
    // Use the signAndExecuteTransaction helper
    const result = await signAndExecuteTransaction(wallet, {
      transaction: tx,
      account: wallet.accounts[0],
      chain: wallet.chains[0]
    });
    
    return {
      success: true,
      txId: result.digest,
      objectId: extractCreatedObjectId(result),
      error: null // Add this to match the type used in error case
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

// Helper function to extract created object ID from transaction result
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractCreatedObjectId(result: any): string | null {
  try {
    // This is a simplification - in a real app, you'd need to parse the actual transaction result structure
    // based on the SDK version you're using
    
    // Check if response has a data property with a created array
    if (result.data?.effects?.created?.length > 0) {
      return result.data.effects.created[0].reference.objectId;
    }
    
    // Check for events if available
    if (result.data?.events?.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newObjectEvent = result.data.events.find((event: any) => 
        event.type && event.type.includes('::NewObject')
      );
      
      if (newObjectEvent?.parsedJson?.objectId) {
        return String(newObjectEvent.parsedJson.objectId);
      }
    }
    
    // Alternative for direct effects
    if (result.effects?.created?.length > 0) {
      return result.effects.created[0].reference.objectId;
    }
    
    console.log('Transaction result structure:', JSON.stringify(result, null, 2));
    return null;
  } catch (e) {
    console.error('Error extracting object ID:', e);
    return null;
  }
}

// Function to get transaction status and details
export async function getTransactionStatus(txId: string) {
  try {
    const txInfo = await provider.getTransactionBlock({
      digest: txId,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });
    
    return {
      success: true,
      data: txInfo,
    };
  } catch (error) {
    console.error('Error getting transaction status:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

// Function to get NFT details by object ID
export async function getNftDetails(objectId: string) {
  try {
    const object = await provider.getObject({
      id: objectId,
      options: {
        showContent: true,
        showDisplay: true,
      },
    });
    
    return {
      success: true,
      data: object,
    };
  } catch (error) {
    console.error('Error getting NFT details:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

// Helper function to connect to a wallet
export async function connectToWallet(wallet: Wallet) {
  if (!wallet) {
    throw new Error('Wallet is not initialized');
  }
  
  try {
    console.log('Connecting to wallet:', wallet.name);
    console.log('Available features:', Object.keys(wallet.features || {}));
    
    // Use the standard wallet accounts
    const accounts = wallet.accounts;
    
    console.log('Wallet accounts:', accounts);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in wallet');
    }
    
    // Check if the wallet supports SUI transactions
    if (!wallet.chains.some(chain => chain.startsWith('sui:'))) {
      throw new Error('Wallet does not support SUI blockchain');
    }
    
    // Check if the wallet has the SUI-specific feature
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walletWithFeatures = wallet as any;
    if (!walletWithFeatures.features || !walletWithFeatures.features['sui:signAndExecuteTransactionBlock']) {
      throw new Error('Wallet does not support SUI transaction signing');
    }
    
    return {
      success: true,
      adapter: wallet,
      account: accounts[0]
    };
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
} 