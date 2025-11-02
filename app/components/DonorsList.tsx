'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI } from '../utils/campaign-contract';

interface Donation {
  donor: string;
  campaignId: number;
  amount: string;
  timestamp: number;
}

interface Withdrawal {
  admin: string;
  campaignId: number;
  amount: string;
  timestamp: number;
}

interface Transaction {
  type: 'donation' | 'withdrawal';
  address: string;
  campaignId: number;
  amount: string;
  timestamp: number;
}

interface Campaign {
  id: number;
  title: string;
  totalRaised: string;
  transactionCount: number;
  transactions: Transaction[];
}

interface DonorsListProps {
  refreshTrigger: number;
}

export default function DonorsList({ refreshTrigger }: DonorsListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalDonations, setTotalDonations] = useState<string>('0');
  const [totalDonationCount, setTotalDonationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<number>>(new Set());
  const [currentPages, setCurrentPages] = useState<{[key: number]: number}>({});
  const itemsPerPage = 10;

  useEffect(() => {
    loadCampaignsWithDonations();
  }, [refreshTrigger]);

  const loadCampaignsWithDonations = async () => {
    try {
      setIsLoading(true);
      setError('');

      const provider = new ethers.JsonRpcProvider('https://testnet-rpc.coinex.net');
      const contract = new ethers.Contract(CAMPAIGN_CONTRACT_ADDRESS, CAMPAIGN_CONTRACT_ABI, provider);

      // Lấy số lượng chiến dịch
      const campaignCounter = await contract.campaignCounter();
      const campaignList: Campaign[] = [];
      let totalAmount = BigInt(0);
      let totalCount = 0;

      for (let i = 1; i <= Number(campaignCounter); i++) {
        try {
          // Lấy thông tin campaign
          const campaignData = await contract.getCampaign(i);
          
          // Bỏ qua campaign đã xóa
          if (campaignData.isDeleted) continue;

          // Lấy donations của campaign này
          const donations = await contract.getCampaignDonations(i);
          
          const formattedDonations: Transaction[] = donations.map((donation: any) => ({
            type: 'donation' as const,
            address: donation.donor,
            campaignId: Number(donation.campaignId),
            amount: ethers.formatEther(donation.amount),
            timestamp: Number(donation.timestamp),
          }));

          // Lấy withdrawals của campaign này từ events
          const transactions: Transaction[] = [...formattedDonations];
          
          try {
            const filter = contract.filters.FundsWithdrawn(i);
            const events = await contract.queryFilter(filter);
            
            for (const event of events) {
              const block = await provider.getBlock(event.blockNumber);
              transactions.push({
                type: 'withdrawal',
                address: event.args?.admin || '',
                campaignId: Number(event.args?.campaignId || i),
                amount: ethers.formatEther(event.args?.amount || 0),
                timestamp: block?.timestamp || 0,
              });
            }
          } catch (err) {
            console.error(`Error loading withdrawals for campaign ${i}:`, err);
          }

          // Sắp xếp tất cả transactions theo thời gian mới nhất
          transactions.sort((a, b) => b.timestamp - a.timestamp);

          campaignList.push({
            id: Number(campaignData.id),
            title: campaignData.title,
            totalRaised: ethers.formatEther(campaignData.totalRaised),
            transactionCount: transactions.length,
            transactions: transactions,
          });

          totalAmount += campaignData.totalRaised;
          totalCount += transactions.length;

        } catch (err) {
          console.error(`Error loading campaign ${i}:`, err);
        }
      }

      // Sắp xếp campaigns theo số lượng transactions (nhiều nhất trước)
      campaignList.sort((a, b) => b.transactionCount - a.transactionCount);

      setCampaigns(campaignList);
      setTotalDonations(ethers.formatEther(totalAmount));
      setTotalDonationCount(totalCount);

    } catch (error: any) {
      console.error('Error loading campaigns:', error);
      setError('Không thể kết nối với blockchain. Vui lòng kiểm tra mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleCampaign = (campaignId: number) => {
    const newExpanded = new Set(expandedCampaigns);
    if (newExpanded.has(campaignId)) {
      newExpanded.delete(campaignId);
    } else {
      newExpanded.add(campaignId);
      // Initialize page 1 for this campaign
      if (!currentPages[campaignId]) {
        setCurrentPages({ ...currentPages, [campaignId]: 1 });
      }
    }
    setExpandedCampaigns(newExpanded);
  };

  const goToPage = (campaignId: number, page: number) => {
    setCurrentPages({ ...currentPages, [campaignId]: page });
  };

  const getPaginatedTransactions = (transactions: Transaction[], campaignId: number) => {
    const page = currentPages[campaignId] || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      transactions: transactions.slice(startIndex, endIndex),
      totalPages: Math.ceil(transactions.length / itemsPerPage),
      currentPage: page,
      startIndex,
    };
  };

  return (
    <div className="w-full max-w-6xl mx-auto fade-in-up px-4 sm:px-0" style={{animationDelay: '0.4s'}}>
      <div className="glass-strong rounded-2xl sm:rounded-3xl overflow-hidden gradient-border">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-white/5 border-b border-white/10 text-center">
          <div>
            <div className="mb-1 sm:mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Danh sách quyên góp</h2>
            </div>
            <p className="text-xs sm:text-sm text-white/60">Minh bạch và công khai trên blockchain</p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="p-4 sm:p-6 md:p-8 border-b border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-5">
              <p className="text-xs text-white/50 mb-1 sm:mb-2 font-semibold uppercase tracking-wider">Tổng quyên góp</p>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <p className="text-2xl sm:text-3xl font-bold text-blue-400">
                  {parseFloat(totalDonations).toFixed(4)}
                </p>
                <span className="text-base sm:text-lg font-semibold text-white/60">CET</span>
              </div>
            </div>
            <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-5">
              <p className="text-xs text-white/50 mb-1 sm:mb-2 font-semibold uppercase tracking-wider">Số lượt đóng góp</p>
              <div className="flex items-baseline gap-1 sm:gap-2">
                <p className="text-2xl sm:text-3xl font-bold text-blue-400">
                  {totalDonationCount}
                </p>
                <span className="text-base sm:text-lg font-semibold text-white/60">lượt</span>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-4 sm:p-6 md:p-8">
          {error ? (
            <div className="glass rounded-xl sm:rounded-2xl border border-red-400/30 p-4 sm:p-6 md:p-8 text-center scale-in">
              <p className="text-red-300 font-bold mb-3 text-xl">
                Chưa có Smart Contract
              </p>
              <p className="text-red-200 text-sm mb-6">{error}</p>
              <div className="glass rounded-xl p-6 text-left text-sm text-white/80">
                <p className="font-bold mb-3">
                  Để sử dụng ứng dụng:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Deploy smart contract lên CoinEx Testnet</li>
                  <li>Cập nhật contract address vào code</li>
                  <li>Kết nối MetaMask và bắt đầu quyên góp</li>
                </ol>
                <p className="mt-4 text-xs text-white/50">
                  Xem chi tiết trong file: <code className="bg-white/10 px-2 py-1 rounded">DEPLOY_CONTRACT.md</code>
                </p>
              </div>
              <button
                onClick={loadCampaignsWithDonations}
                className="mt-6 px-6 py-3 btn-gradient text-white rounded-xl font-bold transition-all hover-glow"
              >
                Thử lại
              </button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-purple-500"></div>
              <p className="text-white mt-6 font-bold text-lg">Đang tải dữ liệu từ blockchain...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white font-bold text-2xl mb-2">Chưa có chiến dịch nào</p>
              <p className="text-white/50 text-sm">Chưa có dữ liệu quyên góp</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const isExpanded = expandedCampaigns.has(campaign.id);
                const { transactions, totalPages, currentPage, startIndex} = getPaginatedTransactions(campaign.transactions, campaign.id);

                return (
                  <div key={campaign.id} className="glass rounded-xl border border-white/10 overflow-hidden">
                    {/* Campaign Header - Clickable */}
                    <button
                      onClick={() => toggleCampaign(campaign.id)}
                      className="w-full p-4 sm:p-6 bg-white/5 hover:bg-white/10 transition-all text-left flex items-center justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold px-2 py-1 bg-blue-500 text-white rounded">
                            #{campaign.id}
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-white">{campaign.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="text-white/60">
                            <span className="font-semibold text-green-400">{parseFloat(campaign.totalRaised).toFixed(2)} CET</span> tổng quyên góp
                          </div>
                          <div className="text-white/60">
                            <span className="font-semibold text-blue-400">{campaign.transactionCount}</span> giao dịch
                          </div>
                        </div>
                      </div>
                      <div className="text-white/40">
                        <svg 
                          className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {/* Transactions Table - Expandable */}
                    {isExpanded && campaign.transactions.length > 0 && (
                      <div className="border-t border-white/10">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[720px]">
                            <thead className="bg-white/5">
                              <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 sm:px-6 font-bold text-xs uppercase tracking-wider w-20 text-white">STT</th>
                                <th className="text-left py-3 px-4 sm:px-6 font-bold text-xs uppercase tracking-wider w-32 text-white">Loại</th>
                                <th className="text-left py-3 px-4 sm:px-6 font-bold text-xs uppercase tracking-wider text-white">Địa chỉ ví</th>
                                <th className="text-right py-3 px-4 sm:px-6 font-bold text-xs uppercase tracking-wider w-40 text-white">Số tiền (CET)</th>
                                <th className="text-right py-3 px-4 sm:px-6 font-bold text-xs uppercase tracking-wider w-48 text-white">Thời gian</th>
                              </tr>
                            </thead>
                            <tbody>
                              {transactions.map((transaction, index) => (
                                <tr
                                  key={startIndex + index}
                                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                                >
                                  <td className="py-3 px-4 sm:px-6">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg text-xs font-bold">
                                      {startIndex + index + 1}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 sm:px-6">
                                    {transaction.type === 'donation' ? (
                                      <span className="inline-block px-2 py-1 bg-green-600/20 border border-green-500/30 text-green-400 rounded text-xs font-bold">
                                         Quyên góp
                                      </span>
                                    ) : (
                                      <span className="inline-block px-2 py-1 bg-orange-600/20 border border-orange-500/30 text-orange-400 rounded text-xs font-bold">
                                         Admin rút tiền

                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 sm:px-6">
                                    <a
                                      href={`https://testnet.coinex.net/address/${transaction.address}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mono text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-all break-all"
                                      title="Xem trên explorer"
                                    >
                                      {transaction.address}
                                    </a>
                                  </td>
                                  <td className="py-3 px-4 sm:px-6 text-right">
                                    <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${
                                      transaction.type === 'donation'
                                        ? 'bg-green-600/20 border border-green-500/30 text-green-400'
                                        : 'bg-red-600/20 border border-red-500/30 text-red-400'
                                    }`}>
                                      {transaction.type === 'donation' ? '+' : '-'}{parseFloat(transaction.amount).toFixed(4)}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 sm:px-6 text-right text-xs text-white/60 font-semibold">
                                    {formatDate(transaction.timestamp)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="p-4 border-t border-white/5 flex items-center justify-center gap-2 flex-wrap">
                            <button
                              onClick={() => goToPage(campaign.id, currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all text-xs"
                            >
                              ← Trước
                            </button>
                            
                            <div className="flex gap-1">
                              {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => {
                                let page;
                                if (totalPages <= 4) {
                                  page = i + 1;
                                } else if (currentPage <= 2) {
                                  page = i + 1;
                                } else if (currentPage >= totalPages - 1) {
                                  page = totalPages - 3 + i;
                                } else {
                                  page = currentPage - 1 + i;
                                }
                                return (
                                  <button
                                    key={page}
                                    onClick={() => goToPage(campaign.id, page)}
                                    className={`px-3 py-2 rounded-lg font-semibold transition-all text-xs ${
                                      currentPage === page
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              onClick={() => goToPage(campaign.id, currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all text-xs"
                            >
                              Sau →
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {isExpanded && campaign.transactions.length === 0 && (
                      <div className="p-8 text-center border-t border-white/10">
                        <p className="text-white/60">Chưa có giao dịch nào cho chiến dịch này</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
