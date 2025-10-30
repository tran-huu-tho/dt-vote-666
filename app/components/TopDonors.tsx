'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, COINEX_TESTNET_CONFIG } from '../utils/contract';

interface TopDonor {
  address: string;
  totalAmount: string;
  donationCount: number;
}

interface TopDonorsProps {
  refreshTrigger: number;
}

export default function TopDonors({ refreshTrigger }: TopDonorsProps) {
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadTopDonors();
  }, [refreshTrigger]);

  const loadTopDonors = async () => {
    try {
      setIsLoading(true);
      setError('');

      const provider = new ethers.JsonRpcProvider(COINEX_TESTNET_CONFIG.rpcUrls[0]);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Lấy danh sách tất cả người quyên góp
      const donorsData = await contract.getAllDonors();
      
      // Tạo map để gom nhóm theo địa chỉ
      const donorMap = new Map<string, { totalAmount: bigint; count: number }>();

      donorsData.forEach((donor: any) => {
        const address = donor.donorAddress;
        const amount = donor.amount;

        if (donorMap.has(address)) {
          const existing = donorMap.get(address)!;
          donorMap.set(address, {
            totalAmount: existing.totalAmount + amount,
            count: existing.count + 1
          });
        } else {
          donorMap.set(address, {
            totalAmount: amount,
            count: 1
          });
        }
      });

      // Chuyển map thành array và format
      const topDonorsArray: TopDonor[] = Array.from(donorMap.entries()).map(([address, data]) => ({
        address,
        totalAmount: ethers.formatEther(data.totalAmount),
        donationCount: data.count
      }));

      // Sắp xếp theo tổng số tiền giảm dần và lấy top 5
      topDonorsArray.sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount));
      const top5 = topDonorsArray.slice(0, 5);

      setTopDonors(top5);
    } catch (error: any) {
      console.error('Error loading top donors:', error);
      setError('Không thể tải dữ liệu top quyên góp');
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto fade-in-up px-4 sm:px-0">
      <div className="glass-strong rounded-2xl sm:rounded-3xl overflow-hidden gradient-border">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-white/5 border-b border-white/10">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Top 5 Người Quyên Góp</h2>
            <p className="text-xs sm:text-sm text-white/60">Bảng xếp hạng những người đóng góp nhiều nhất</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          {error ? (
            <div className="glass rounded-xl sm:rounded-2xl border border-red-400/30 p-4 sm:p-6 md:p-8 text-center">
              <p className="text-red-300 font-bold mb-2 sm:mb-3 text-base sm:text-lg md:text-xl">Lỗi tải dữ liệu</p>
              <p className="text-red-200 text-xs sm:text-sm">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8 sm:py-12 md:py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-white/20 border-t-yellow-400"></div>
              <p className="text-white mt-4 sm:mt-6 font-bold text-base sm:text-lg">Đang tải dữ liệu...</p>
            </div>
          ) : topDonors.length === 0 ? (
            <div className="text-center py-8 sm:py-12 md:py-16">
              <p className="text-white font-bold text-xl sm:text-2xl mb-2">Chưa có dữ liệu</p>
              <p className="text-white/50 text-xs sm:text-sm">Hãy là người đầu tiên quyên góp!</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {topDonors.map((donor, index) => (
                <div
                  key={donor.address}
                  className={`glass rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all hover:scale-102 ${
                    index === 0 ? 'border-2 border-yellow-400/50' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    {/* Rank & Address */}
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`text-3xl sm:text-4xl font-black shrink-0 ${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-gray-300' : 
                        index === 2 ? 'text-orange-400' : 
                        'text-white/60'
                      }`}>
                        {getMedalEmoji(index + 1)}
                      </div>

                      {/* Address */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/50 mb-1 font-semibold">Địa chỉ ví</p>
                        <a
                          href={`${COINEX_TESTNET_CONFIG.blockExplorerUrls[0]}/address/${donor.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs sm:text-sm font-bold text-blue-400 hover:text-blue-300 hover:underline transition-all break-all block"
                          title="Xem trên explorer"
                        >
                          {donor.address}
                        </a>
                        <p className="text-xs text-white/50 mt-1">
                          Số lần quyên góp: <span className="text-white/70 font-semibold">{donor.donationCount}</span>
                        </p>
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="text-left sm:text-right shrink-0 pl-10 sm:pl-0">
                      <p className="text-xs text-white/50 mb-1 font-semibold">Tổng quyên góp</p>
                      <div className={`text-2xl sm:text-3xl font-black ${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-gray-300' : 
                        index === 2 ? 'text-orange-400' : 
                        'text-blue-400'
                      }`}>
                        {parseFloat(donor.totalAmount).toFixed(4)}
                      </div>
                      <p className="text-xs sm:text-sm text-white/60 font-semibold">CET</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
