'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, COINEX_TESTNET_CONFIG } from '../utils/contract';

interface Donor {
  address: string;
  amount: string;
  timestamp: number;
}

interface DonorsListProps {
  refreshTrigger: number;
}

export default function DonorsList({ refreshTrigger }: DonorsListProps) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [totalDonations, setTotalDonations] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadDonors();
  }, [refreshTrigger]);

  const loadDonors = async () => {
    try {
      setIsLoading(true);
      setError('');

      const provider = new ethers.JsonRpcProvider(COINEX_TESTNET_CONFIG.rpcUrls[0]);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Lấy tổng số tiền quyên góp
      try {
        const total = await contract.totalDonations();
        const totalFormatted = ethers.formatEther(total);
        setTotalDonations(totalFormatted);
      } catch (err) {
        console.error('Error reading totalDonations:', err);
        setTotalDonations('0');
      }

      // Lấy danh sách người quyên góp
      try {
        const donorsData = await contract.getAllDonors();
        
        const formattedDonors = donorsData.map((donor: any) => ({
          address: donor.donorAddress,
          amount: ethers.formatEther(donor.amount),
          timestamp: Number(donor.timestamp),
        }));

        // Sắp xếp theo thời gian mới nhất
        formattedDonors.sort((a: Donor, b: Donor) => b.timestamp - a.timestamp);
        
        setDonors(formattedDonors);
      } catch (err) {
        console.error('Error reading donors:', err);
        setDonors([]);
      }
    } catch (error: any) {
      console.error('Error loading donors:', error);
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

  // Tính toán pagination
  const totalPages = Math.ceil(donors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDonors = donors.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-6xl mx-auto fade-in-up" style={{animationDelay: '0.4s'}}>
      <div className="glass-strong rounded-3xl overflow-hidden gradient-border">
        {/* Header */}
        <div className="p-6 bg-white/5 border-b border-white/10 text-center">
          <div>
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-white">Danh sách quyên góp</h2>
            </div>
            <p className="text-sm text-white/60">Minh bạch và công khai trên blockchain</p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="p-8 border-b border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-5">
              <p className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wider">Tổng quyên góp</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-blue-400">
                  {parseFloat(totalDonations).toFixed(4)}
                </p>
                <span className="text-lg font-semibold text-white/60">CET</span>
              </div>
            </div>
            <div className="glass rounded-xl p-5">
              <p className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wider">Số lượt đóng góp</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-blue-400">
                  {donors.length}
                </p>
                <span className="text-lg font-semibold text-white/60">lượt</span>
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-8">
          {error ? (
            <div className="glass rounded-2xl border border-red-400/30 p-8 text-center scale-in">
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
                onClick={loadDonors}
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
          ) : donors.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white font-bold text-2xl mb-2">Chưa có ai quyên góp</p>
              <p className="text-white/50 text-sm">Hãy là người đầu tiên quyên góp!</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl glass border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-linear-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm">
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-6 font-bold text-sm text-white/70 uppercase tracking-wider w-20">STT</th>
                        <th className="text-left py-4 px-6 font-bold text-sm text-white/70 uppercase tracking-wider">Địa chỉ ví</th>
                        <th className="text-right py-4 px-6 font-bold text-sm text-white/70 uppercase tracking-wider w-48">Số tiền (CET)</th>
                        <th className="text-right py-4 px-6 font-bold text-sm text-white/70 uppercase tracking-wider w-56">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDonors.map((donor, index) => (
                        <tr
                          key={startIndex + index}
                          className="border-b border-white/5 hover:bg-white/5 transition-all"
                        >
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg text-sm font-bold">
                              {startIndex + index + 1}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <a
                              href={`${COINEX_TESTNET_CONFIG.blockExplorerUrls[0]}/address/${donor.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-sm font-semibold text-blue-400 hover:text-blue-300 hover:underline transition-all break-all"
                              title="Xem trên explorer"
                            >
                              {donor.address}
                            </a>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="inline-block px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg font-bold text-sm">
                              {parseFloat(donor.amount).toFixed(4)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right text-sm text-white/60 font-semibold">
                            {formatDate(donor.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
                  >
                    ← Trước
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
