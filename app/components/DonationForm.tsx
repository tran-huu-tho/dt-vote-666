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

      // Gửi transaction thật lên blockchain
      const tx = await contract.donate({
        value: ethers.parseEther(amount),
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
      if (error.code === 'ACTION_REJECTED') {
        showNotification('error', 'Bạn đã từ chối giao dịch!');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        showNotification('error', 'Số dư không đủ!');
      } else {
        showNotification('error', error.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
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
    <div className="w-full max-w-2xl fade-in-up relative" style={{animationDelay: '0.2s'}}>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`${getNotificationColor(notif.type)} text-white px-6 py-4 rounded-xl shadow-2xl border-2 max-w-md scale-in flex items-start gap-3`}
          >
            <div className="flex-shrink-0 mt-0.5">
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
              className="flex-shrink-0 text-white/80 hover:text-white"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleDonate} className="glass-strong rounded-2xl p-8 gradient-border">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Quyên góp</h2>
          <p className="text-sm text-white/50">Nhập số lượng CET bạn muốn quyên góp</p>
        </div>
        
        <div className="mb-8">
          <label className="block text-sm font-semibold text-white/70 mb-3">Số lượng CET</label>
          <div className="relative group">
            <input
              type="number"
              step="0.001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số lượng"
              disabled={isLoading || !account}
              className="w-full px-6 py-5 bg-black/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed text-3xl font-bold text-white transition-all border-2 border-white/10 placeholder-white/20 hover:border-white/20"
            />
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold text-white/70 mb-4">Chọn nhanh</p>
          <div className="grid grid-cols-4 gap-3">
            {quickAmounts.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                disabled={isLoading || !account}
                className={`px-4 py-3.5 rounded-xl text-base font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  amount === value 
                    ? 'bg-blue-600 text-white border-2 border-blue-400 shadow-lg shadow-blue-500/30' 
                    : 'bg-white/5 text-white/70 border-2 border-white/10 hover:bg-white/10 hover:border-blue-400/50 hover:text-white'
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
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 text-lg relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-white/20 to-green-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          {isLoading ? (
            <span className="flex items-center justify-center gap-3 relative z-10">
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Đang xử lý giao dịch...
            </span>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Quyên góp ngay</span>
            </span>
          )}
        </button>

        {txHash && (
          <div className="mt-6 p-5 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border-2 border-blue-500/40 scale-in backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="shrink-0">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-blue-300 font-bold mb-2">
                  Giao dịch đã được gửi
                </p>
                <a
                  href={`https://testnet.coinex.net/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-blue-200 hover:text-white hover:underline break-all block bg-black/30 p-3 rounded-lg"
                >
                  {txHash}
                </a>
              </div>
            </div>
          </div>
        )}

        {!account && (
          <div className="mt-6 p-5 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-2xl border-2 border-yellow-500/40 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-yellow-200 font-semibold">
                Vui lòng kết nối ví để quyên góp
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
