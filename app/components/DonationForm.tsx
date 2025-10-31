'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';

interface DonationFormProps {
  account: string;
  onDonationSuccess: () => void;
}

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
}

export default function DonationForm({ account, onDonationSuccess }: DonationFormProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (type: NotificationType, message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      showNotification('warning', 'Vui lòng kết nối ví trước!');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showNotification('error', 'Vui lòng nhập số tiền hợp lệ!');
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
        showNotification('warning', 'Vui lòng chuyển sang CoinEx Smart Chain Testnet trong MetaMask!');
        setIsLoading(false);
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const amountInWei = ethers.parseEther(amount);
      
      // Kiểm tra số dư
      const userBalance = await provider.getBalance(account);
      const gasPrice = (await provider.getFeeData()).gasPrice || BigInt(0);
      const estimatedGasCost = gasPrice * BigInt(150000); // Ước tính chi phí gas
      const totalRequired = amountInWei + estimatedGasCost;
      
      if (userBalance < totalRequired) {
        showNotification('error', 'Tài khoản không đủ để thực hiện giao dịch!');
        setIsLoading(false);
        return;
      }

      // Gửi transaction với gas limit cố định
      const tx = await contract.donate({
        value: amountInWei,
        gasLimit: 150000,
      });

      setTxHash(tx.hash);
      showNotification('success', `Giao dịch đã được gửi! Đang chờ xác nhận...`);
      setAmount('');
      
      // Đợi confirmation trong background
      tx.wait()
        .then(() => {
          showNotification('success', 'Quyên góp thành công! Cảm ơn bạn đã đóng góp.');
          setTimeout(() => {
            onDonationSuccess();
            setTxHash('');
          }, 2000);
        })
        .catch((err: any) => {
          console.error('Transaction confirmation error:', err);
          showNotification('error', 'Giao dịch thất bại. Vui lòng thử lại!');
        });
    } catch (error: any) {
      console.error('Error donating:', error);
      
      // Xử lý các loại lỗi cụ thể
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        showNotification('error', 'Bạn đã từ chối giao dịch!');
      } else if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
        showNotification('error', 'Tài khoản không đủ để thực hiện giao dịch!');
      } else if (error.code === -32603) {
        showNotification('error', 'Tài khoản không đủ để thực hiện giao dịch!');
      } else if (error.message?.includes('gas')) {
        showNotification('error', 'Tài khoản không đủ để thực hiện giao dịch!');
      } else {
        showNotification('error', 'Có lỗi xảy ra. Vui lòng thử lại!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = ['0.1', '0.5', '1', '5'];

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-green-600 border-green-500';
      case 'error': return 'bg-red-600 border-red-500';
      case 'warning': return 'bg-yellow-600 border-yellow-500';
      case 'info': return 'bg-blue-600 border-blue-500';
      default: return 'bg-gray-600 border-gray-500';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto fade-in-up relative px-4 sm:px-0" style={{animationDelay: '0.2s'}}>
      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 left-4 sm:left-auto z-50 space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`${getNotificationColor(notif.type)} text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl border-2 max-w-md scale-in flex items-start gap-2 sm:gap-3 text-sm sm:text-base`}
          >
            <div className="shrink-0 mt-0.5">
              {notif.type === 'success' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {notif.type === 'error' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {notif.type === 'warning' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {notif.type === 'info' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{notif.message}</p>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              className="shrink-0 text-white/80 hover:text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleDonate} className="glass-strong rounded-xl p-4 sm:p-6 gradient-border w-full">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-1">Quyên góp</h2>
          <p className="text-xs sm:text-sm text-white/60">Nhập số lượng CET bạn muốn quyên góp</p>
        </div>
        
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-semibold text-white/70 mb-2">Số lượng CET</label>
          <div className="relative">
            <input
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isLoading || !account}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-xl sm:text-2xl font-semibold text-white transition-all border border-white/10 placeholder-white/30 hover:border-white/20"
            />
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm font-semibold text-white/70 mb-2 sm:mb-3">Chọn nhanh</p>
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                disabled={isLoading || !account}
                className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  amount === value 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !account || !amount}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            <span>Quyên góp ngay</span>
          )}
        </button>

        {txHash && (
          <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 scale-in">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-blue-300 font-semibold mb-1">
                  Giao dịch đã được gửi
                </p>
                <a
                  href={`https://testnet.coinex.net/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-blue-400 hover:text-blue-300 hover:underline break-all block"
                >
                  {txHash}
                </a>
              </div>
            </div>
          </div>
        )}

        {!account && (
          <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-300 font-semibold">
                Vui lòng kết nối ví để quyên góp
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
