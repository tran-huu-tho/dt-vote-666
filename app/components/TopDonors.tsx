'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI } from '../utils/campaign-contract';

interface CampaignDonation {
  campaignId: number;
  campaignTitle: string;
  amount: string;
  count: number;
}

interface TopDonor {
  address: string;
  totalAmount: string;
  donationCount: number;
  campaignDonations: CampaignDonation[]; // Chi tiết quyên góp theo từng campaign
}

interface TopDonorsProps {
  refreshTrigger: number;
}

export default function TopDonors({ refreshTrigger }: TopDonorsProps) {
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [expandedDonors, setExpandedDonors] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTopDonors();
  }, [refreshTrigger]);

  const toggleDonor = (address: string) => {
    const newExpanded = new Set(expandedDonors);
    if (newExpanded.has(address)) {
      newExpanded.delete(address);
    } else {
      newExpanded.add(address);
    }
    setExpandedDonors(newExpanded);
  };

  const loadTopDonors = async () => {
    try {
      setIsLoading(true);
      setError('');

      const provider = new ethers.JsonRpcProvider('https://testnet-rpc.coinex.net');
      const contract = new ethers.Contract(CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI, provider);

      // Lấy tất cả donations từ tất cả campaigns
      const campaignCounter = await contract.campaignCounter();
      
      // Map để gom nhóm theo địa chỉ donor
      const donorMap = new Map<string, { 
        totalAmount: bigint; 
        count: number;
        campaignMap: Map<number, { title: string; amount: bigint; count: number }>;
      }>();

      // Duyệt qua tất cả campaigns
      for (let i = 1; i <= Number(campaignCounter); i++) {
        try {
          // Kiểm tra campaign có bị xóa không
          const campaignData = await contract.getCampaign(i);
          if (campaignData.isDeleted) continue;

          const campaignTitle = campaignData.title;
          const campaignId = Number(campaignData.id);

          // Lấy tất cả donations của campaign này
          const donations = await contract.getCampaignDonations(i);
          
          donations.forEach((donation: any) => {
            const address = donation.donor.toLowerCase(); // Lowercase để tránh trùng lặp
            const amount = donation.amount;

            if (donorMap.has(address)) {
              const existing = donorMap.get(address)!;
              
              // Cập nhật campaign map
              if (existing.campaignMap.has(campaignId)) {
                const campaignData = existing.campaignMap.get(campaignId)!;
                existing.campaignMap.set(campaignId, {
                  title: campaignTitle,
                  amount: campaignData.amount + amount,
                  count: campaignData.count + 1
                });
              } else {
                existing.campaignMap.set(campaignId, {
                  title: campaignTitle,
                  amount: amount,
                  count: 1
                });
              }

              donorMap.set(address, {
                totalAmount: existing.totalAmount + amount,
                count: existing.count + 1,
                campaignMap: existing.campaignMap
              });
            } else {
              const campaignMap = new Map();
              campaignMap.set(campaignId, {
                title: campaignTitle,
                amount: amount,
                count: 1
              });
              
              donorMap.set(address, {
                totalAmount: amount,
                count: 1,
                campaignMap: campaignMap
              });
            }
          });
        } catch (err) {
          console.error(`Error loading donations for campaign ${i}:`, err);
        }
      }

      // Chuyển map thành array và format
      const topDonorsArray: TopDonor[] = Array.from(donorMap.entries()).map(([address, data]) => {
        const campaignDonations: CampaignDonation[] = Array.from(data.campaignMap.entries()).map(([campaignId, campaignData]) => ({
          campaignId,
          campaignTitle: campaignData.title,
          amount: ethers.formatEther(campaignData.amount),
          count: campaignData.count
        }));

        // Sắp xếp campaigns theo số tiền giảm dần
        campaignDonations.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

        return {
          address,
          totalAmount: ethers.formatEther(data.totalAmount),
          donationCount: data.count,
          campaignDonations
        };
      });

      // Sắp xếp theo tổng số tiền giảm dần và lấy top 10
      topDonorsArray.sort((a, b) => parseFloat(b.totalAmount) - parseFloat(a.totalAmount));
      const top10 = topDonorsArray.slice(0, 10);

      setTopDonors(top10);
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
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Top 10 Người Quyên Góp</h2>
            <p className="text-xs sm:text-sm text-white/60">Bảng xếp hạng tổng hợp từ tất cả các chiến dịch</p>
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
                    index === 0 ? 'border-2 border-red-500/50' : 
                    index === 1 ? 'border-2 border-green-500/50' : 
                    index === 2 ? 'border-2 border-blue-500/50' : 
                    index === 3 ? 'border-2 border-purple-500/50' :
                    index === 4 ? 'border-2 border-yellow-400/50' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    {/* Rank & Address */}
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`text-3xl sm:text-4xl font-black shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-red-500/20 text-red-500 border-2 border-red-500/50' : 
                        index === 1 ? 'bg-green-500/20 text-green-500 border-2 border-green-500/50' : 
                        index === 2 ? 'bg-blue-500/20 text-blue-500 border-2 border-blue-500/50' : 
                        index === 3 ? 'bg-purple-500/20 text-purple-500 border-2 border-purple-500/50' :
                        index === 4 ? 'bg-yellow-400/20 text-yellow-400 border-2 border-yellow-400/50' :
                        'bg-white/10 text-white/60 border-2 border-white/20'
                      }`}>
                        {getMedalEmoji(index + 1)}
                      </div>

                      {/* Address */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/50 mb-1 font-semibold">Địa chỉ ví</p>
                        <a
                          href={`https://testnet.coinex.net/address/${donor.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs sm:text-sm font-bold text-blue-400 hover:text-blue-300 hover:underline transition-all break-all block"
                          title="Xem trên explorer"
                        >
                          {donor.address}
                        </a>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs items-center">
                          <p className="text-white/50">
                            <span className="text-white/70 font-semibold">{donor.donationCount}</span> lượt quyên góp
                          </p>
                          <span className="text-white/30">•</span>
                          <button
                            onClick={() => toggleDonor(donor.address)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all font-semibold"
                          >
                            <span>{donor.campaignDonations.length} chiến dịch</span>
                            <svg
                              className={`w-3.5 h-3.5 transition-transform ${
                                expandedDonors.has(donor.address) ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Expandable campaign details */}
                        {expandedDonors.has(donor.address) && (
                          <div className="mt-3 pt-3 border-t border-white/10 dark:border-white/10">
                            <p className="text-xs text-white/50 mb-2 font-semibold">Chi tiết quyên góp:</p>
                            <div className="space-y-2">
                              {donor.campaignDonations.map((cd) => (
                                <div
                                  key={cd.campaignId}
                                  className="flex justify-between items-start gap-3 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                                        #{cd.campaignId}
                                      </span>
                                      <span className="text-sm font-medium text-white truncate">
                                        {cd.campaignTitle}
                                      </span>
                                    </div>
                                    <span className="text-xs text-white">
                                      {cd.count} lượt
                                    </span>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="text-sm font-bold text-green-400">
                                      {parseFloat(cd.amount).toFixed(4)}
                                    </div>
                                    <div className="text-xs text-white/50">CET</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="text-left sm:text-right shrink-0 pl-10 sm:pl-0">
                      <p className="text-xs text-white/50 mb-1 font-semibold">Tổng quyên góp</p>
                      <div className={`text-2xl sm:text-3xl font-black ${
                        index === 0 ? 'text-red-500' : 
                        index === 1 ? 'text-green-500' : 
                        index === 2 ? 'text-blue-500' : 
                        index === 3 ? 'text-purple-500' :
                        index === 4 ? 'text-yellow-400' :
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
