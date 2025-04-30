'use client';

import { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import MintButton from './components/MintButton';
import NFTDisplay from './components/NFTDisplay';
import InterpretationDisplay from './components/InterpretationDisplay';
import { WalletAccount, getWallets } from '@mysten/wallet-standard';
import { mintYiJingNFT } from './lib/suiUtils';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  txId?: string;
  objectId?: string;
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  // Store the wallet account for future SUI transactions
  const [connectedAccount, setConnectedAccount] = useState<WalletAccount | null>(null);
  const [question, setQuestion] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  const [mintCompleted, setMintCompleted] = useState(false);
  const [hexagram, setHexagram] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null);
  const [mintStatus, setMintStatus] = useState<string>('');

  const handleWalletConnected = (account: WalletAccount) => {
    setIsConnected(true);
    setConnectedAccount(account);
    console.log(`Connected with address: ${account.address}`);
  };

  // Helper function to generate a random hexagram (1-64)
  const generateHexagram = () => {
    return Math.floor(Math.random() * 64) + 1;
  };

  // Function to get hexagram name based on number
  const getHexagramName = (num: number): string => {
    const names = [
      "乾", "坤", "屯", "蒙", "需", "讼", "师", "比", "小畜", "履", 
      "泰", "否", "同人", "大有", "谦", "豫", "随", "蛊", "临", "观", 
      "噬嗑", "贲", "剥", "复", "无妄", "大畜", "颐", "大过", "坎", "离", 
      "咸", "恒", "遁", "大壮", "晋", "明夷", "家人", "睽", "蹇", "解", 
      "损", "益", "夬", "姤", "萃", "升", "困", "井", "革", "鼎", 
      "震", "艮", "渐", "归妹", "丰", "旅", "巽", "兑", "涣", "节", 
      "中孚", "小过", "既济", "未济"
    ];
    return names[num - 1] || "未知";
  };

  // Helper function to get a sample interpretation based on hexagram
  const getInterpretation = (hexagramNumber: number, userQuestion: string) => {
    const interpretations = [
      "道路坦荡，前程光明。持续当前方向，必有所获。",
      "暂时的困难终将过去，耐心等待转机。",
      "大胆前进，时机已到，不要犹豫。",
      "谨慎行事，潜在风险需要注意。",
      "与志同道合者合作，共同前进。"
    ];
    
    const randomIndex = Math.floor(Math.random() * interpretations.length);
    const question = userQuestion || "您的未来方向";
    
    return `关于「${question}」的解读：\n\n第${hexagramNumber}卦 - ${interpretations[randomIndex]}\n\n宜：谨慎思考，稳步前行\n忌：急躁冒进，贪图小利`;
  };

  // Get file extension for hexagram image
  const getImageExtension = (num: number): string => {
    // Special cases for hexagrams 1 and 33 which use JPG
    if (num === 1 || num === 33) {
      return 'JPG';
    }
    return 'PNG';
  };

  const handleMint = async () => {
    try {
      if (!connectedAccount) {
        throw new Error("Wallet not connected");
      }
      
      setIsMinting(true);
      setMintStatus('Preparing transaction...');
      
      // Log the wallet address being used for minting
      console.log(`Minting with wallet address: ${connectedAccount.address}`);
      
      // Simulate blockchain interaction - step 1: preparing transaction
      setMintStatus('Preparing transaction...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate random hexagram (1-64)
      const newHexagram = generateHexagram();
      const hexagramName = getHexagramName(newHexagram);
      setHexagram(newHexagram);
      
      // Simulate blockchain interaction - step 2: generating NFT metadata
      setMintStatus('Generating NFT metadata...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create NFT metadata
      const metadata: NFTMetadata = {
        name: `Yi Jing Hexagram #${newHexagram}: ${hexagramName}`,
        description: `This NFT represents the ${hexagramName} hexagram (${newHexagram}/64) from the Yi Jing, minted based on a divination for the question: "${question || 'General guidance'}"`,
        image: `/res/${newHexagram}.${getImageExtension(newHexagram)}`,
        attributes: [
          {
            trait_type: "Hexagram Number",
            value: newHexagram.toString()
          },
          {
            trait_type: "Hexagram Name",
            value: hexagramName
          },
          {
            trait_type: "Question",
            value: question || "General guidance"
          },
          {
            trait_type: "Minter",
            value: connectedAccount.address.substring(0, 10) + "..." + connectedAccount.address.substring(connectedAccount.address.length - 6)
          }
        ]
      };
      
      setNftMetadata(metadata);
      
      // Generate interpretation
      const newInterpretation = getInterpretation(newHexagram, question);
      setInterpretation(newInterpretation);
      
      try {
        setMintStatus('Minting NFT on SUI blockchain...');
        // Get the wallet
        const wallets = getWallets();
        const availableWallets = wallets.get();

        if (availableWallets.length === 0) {
          throw new Error("No wallet extensions found. Please install a SUI wallet extension.");
        }

        // Use the first available SUI wallet
        const wallet = availableWallets.find(wallet => 
          wallet.chains.some(chain => chain.startsWith('sui:'))
        );

        if (!wallet) {
          throw new Error("No SUI-compatible wallets found");
        }

        console.log(`Using wallet: ${wallet.name}`);

        // Now call mintYiJingNFT with the standard wallet
        const mintResult = await mintYiJingNFT(
          wallet,
          connectedAccount.address,
          metadata.name,
          metadata.description,
          metadata.image,
          newHexagram,
          hexagramName,
          question || "General guidance"
        );
        
        if (mintResult.success) {
          setMintStatus(`Mint successful! Your NFT has been minted with ID: ${mintResult.objectId}`);
          setNftMetadata({
            ...metadata,
            txId: mintResult.txId,
            objectId: mintResult.objectId
          } as NFTMetadata);
        } else {
          throw new Error(`Minting failed: ${mintResult.error || 'Unknown error'}`);
        }
      } catch (blockchainError) {
        // Log detailed error for debugging
        console.error("Blockchain interaction failed:", blockchainError);
        
        // Set user-friendly error message
        setMintStatus(`Real minting failed - falling back to simulated mint. 
          Error: ${(blockchainError as Error).message || 'Unknown error'}`);
        
        // Continue with simulated minting experience
        console.log("Continuing with simulated minting experience");
      }
      
      setMintCompleted(true);
      setIsMinting(false);
    } catch (error) {
      console.error('Minting failed:', error);
      setMintStatus(`Minting failed: ${(error as Error).message}`);
      setIsMinting(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">易经 NFT 占卜</h1>
        
        <WalletConnect onConnected={handleWalletConnected} />

        {isConnected && !mintCompleted && (
          <div className="mt-8 bg-gray-800/50 p-6 rounded-lg">
            {connectedAccount && (
              <div className="mb-4 text-sm text-gray-400">
                Wallet: {connectedAccount.address.substring(0, 6)}...{connectedAccount.address.substring(connectedAccount.address.length - 4)}
              </div>
            )}
            <div className="mb-6">
              <label htmlFor="question" className="block text-lg mb-2">
                输入您的问题（选填）
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 text-white"
                rows={4}
                placeholder="请输入您想要占卜的问题..."
                disabled={isMinting}
              />
            </div>
            <MintButton onMint={handleMint} disabled={isMinting} />
            
            {isMinting && (
              <div className="mt-4">
                <div className="flex justify-center items-center gap-2 mb-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                  <span>{mintStatus || '占卜中，请稍候...'}</span>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {mintCompleted && hexagram && (
          <div className="mt-8 space-y-8">
            <div className="bg-green-800/20 p-4 rounded-lg text-green-400 text-center font-medium">
              {mintStatus}
            </div>
            
            <NFTDisplay 
              hexagram={hexagram} 
              txId={nftMetadata?.txId}
              objectId={nftMetadata?.objectId}
            />
            <InterpretationDisplay interpretation={interpretation} />
            
            {nftMetadata && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">NFT Metadata</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <p><span className="text-gray-400">Name:</span> {nftMetadata.name}</p>
                  <p><span className="text-gray-400">Description:</span> {nftMetadata.description}</p>
                  <div>
                    <span className="text-gray-400">Attributes:</span>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      {nftMetadata.attributes.map((attr, index) => (
                        <li key={index}>{attr.trait_type}: {attr.value}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => {
                setMintCompleted(false);
                setHexagram(null);
                setInterpretation(null);
                setQuestion('');
                setNftMetadata(null);
                setMintStatus('');
              }}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              再次占卜
            </button>
          </div>
        )}
      </div>
    </main>
  );
}