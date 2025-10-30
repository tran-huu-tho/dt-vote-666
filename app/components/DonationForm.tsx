'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';

interface DonationFormProps {
  account: string;
  onDonationSuccess: () => void;
}

export default function DonationForm({ account, onDonationSuccess }: DonationFormProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      alert('Vui lòng kết nối ví trước!');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    try {
      setIsLoading(true);
      setTxHash('');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Kiểm tra network
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 53) {
        alert('⚠️ Vui lòng chuyển sang CoinEx Smart Chain Testnet trong MetaMask!');
        setIsLoading(false);
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Gửi transaction thật lên blockchain
      const tx = await contract.donate({
        value: ethers.parseEther(amount),
      });

      setTxHash(tx.hash);
      
      alert('Đã gửi giao dịch!\n\nTransaction Hash: ' + tx.hash.substring(0, 20) + '...\n\nGiao dịch đang được xử lý trên blockchain. Vui lòng đợi vài giây để thấy cập nhật.');
      setAmount('');
      
      // Đợi confirmation trong background (không block UI)
      tx.wait()
        .then(() => {
          console.log('Transaction confirmed!');
          // Tự động refresh danh sách sau khi confirm
          setTimeout(() => {
            onDonationSuccess();
          }, 2000);
        })
        .catch((err: any) => {
          console.error('Transaction confirmation error:', err);
        });
    } catch (error: any) {
      console.error('Error donating:', error);
      if (error.code === 'ACTION_REJECTED') {
        alert('Bạn đã từ chối giao dịch!');
      } else {
        alert('Có lỗi xảy ra: ' + (error.message || 'Vui lòng thử lại!'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = ['0.1', '0.5', '1', '5'];

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleDonate} className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Quyên góp</h2>
        
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng CET</label>
          <div className="relative">
            <input
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              disabled={isLoading || !account}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-base font-medium text-gray-800 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">CET</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">Chọn nhanh</p>
          <div className="grid grid-cols-4 gap-3">
            {quickAmounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                disabled={isLoading || !account}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {value} CET
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !account || !amount}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            'Quyên góp ngay'
          )}
        </button>

        {txHash && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700 font-semibold mb-1">Transaction Hash</p>
            <a
              href={`https://testnet.coinex.net/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-blue-600 hover:text-blue-800 hover:underline break-all block"
            >
              {txHash}
            </a>
          </div>
        )}

        {!account && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-center text-yellow-800 font-medium">
              Vui lòng kết nối ví để quyên góp
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
