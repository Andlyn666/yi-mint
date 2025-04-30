'use client';

import Image from 'next/image';

interface NFTDisplayProps {
  hexagram: number;
  txId?: string;
  objectId?: string;
}

export default function NFTDisplay({ hexagram, txId, objectId }: NFTDisplayProps) {
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

  // Function to get image file extension based on hexagram number
  const getImageExtension = (num: number): string => {
    // Special cases for hexagrams 1 and 33 which use JPG
    if (num === 1 || num === 33) {
      return 'JPG';
    }
    return 'PNG';
  };

  // Function to format a blockchain address for display
  const formatAddress = (address: string | undefined): string => {
    if (!address) return '';
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  };

  // Function to render hexagram lines
  const renderHexagramLines = (num: number) => {
    // Convert to binary and pad with zeros
    const binary = (num % 64).toString(2).padStart(6, '0');
    
    return binary.split('').map((bit, index) => (
      <div 
        key={index} 
        className={`h-2 rounded-full mb-2 ${bit === '1' ? 'bg-yellow-500' : 'flex gap-1'}`}
      >
        {bit === '0' && (
          <>
            <div className="h-2 flex-1 bg-yellow-500 rounded-full"></div>
            <div className="h-2 w-4"></div>
            <div className="h-2 flex-1 bg-yellow-500 rounded-full"></div>
          </>
        )}
      </div>
    ));
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">您的易经 NFT</h2>
      <div className="aspect-square w-full max-w-md mx-auto bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center overflow-hidden">
        <div className="text-3xl font-bold mb-4">第 {hexagram} 卦：{getHexagramName(hexagram)}</div>
        
        {/* Display the actual NFT image */}
        <div className="relative w-full aspect-square mb-4">
          <Image 
            src={`/res/${hexagram}.${getImageExtension(hexagram)}`} 
            alt={`Hexagram ${hexagram} - ${getHexagramName(hexagram)}`}
            fill
            className="object-contain rounded-lg"
            priority
          />
        </div>
        
        {/* Display hexagram lines as visual representation */}
        <div className="w-full max-w-[120px]">
          {renderHexagramLines(hexagram)}
        </div>
        
        {/* Display blockchain information if available */}
        {(txId || objectId) && (
          <div className="mt-4 text-xs text-gray-400 w-full">
            {txId && (
              <div className="mb-1">
                <span className="font-semibold">Transaction: </span>
                <a 
                  href={`https://explorer.sui.io/transaction/${txId}?network=testnet`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {formatAddress(txId)}
                </a>
              </div>
            )}
            {objectId && (
              <div>
                <span className="font-semibold">NFT ID: </span>
                <a 
                  href={`https://explorer.sui.io/object/${objectId}?network=testnet`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {formatAddress(objectId)}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}