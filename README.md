# 💝 Ứng dụng Quyên góp - CoinEx Smart Chain DApp

> Ứng dụng quyên góp phi tập trung trên **CoinEx Smart Chain Testnet** - Nhanh hơn, rẻ hơn, hiện đại hơn!

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8-orange)](https://soliditylang.org/)
[![CoinEx](https://img.shields.io/badge/CoinEx-Testnet-red)](https://www.coinex.org/)

## ⚡ Tại sao CoinEx Smart Chain?

| Feature | CoinEx | Ethereum Sepolia |
|---------|--------|------------------|
| **Tốc độ** | ~3 giây ⚡ | ~12 giây |
| **Gas Fee** | Rất thấp 💰 | Cao hơn |
| **Faucet** | Dễ dàng ✅ | Khó khăn |
| **UX** | Mượt mà | Chậm hơn |

## ✨ Tính năng

- 🦊 **Kết nối MetaMask** - Tự động thêm CoinEx network
- 💰 **Quyên góp CET** - Transaction nhanh chóng (~3s)
- 📊 **Danh sách minh bạch** - Real-time updates
- 🎨 **Giao diện hiện đại** - Gradient, animations, glass effects
- 🔒 **An toàn** - Smart contract đã deploy và test
- 📱 **Responsive** - Hoạt động tốt trên mọi thiết bị

## 🚀 Quick Start (3 bước - 5 phút)

### 1️⃣ Cài đặt & Chạy

```bash
npm install
npm run dev
```

→ Mở [http://localhost:3000](http://localhost:3000)

### 2️⃣ Lấy CET miễn phí

1. Truy cập [CoinEx Faucet](https://testnet.coinex.net/faucet)
2. Kết nối ví MetaMask
3. Click "Get CET" → Nhận 10 CET ✅

### 3️⃣ Test quyên góp

1. Mở app → Click "🦊 Kết nối MetaMask"
2. App tự động thêm CoinEx network
3. Nhập số CET → Click "🎁 Quyên góp ngay"
4. Xem kết quả trong danh sách! 🎉

## 📝 Contract đã Deploy!

**✅ Contract Address**: 
```
0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8
```

**Bạn có thể dùng ngay mà không cần deploy!**

Xem trên Explorer: [View Contract](https://testnet.coinex.net/address/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8)

## 🎨 Giao diện mới

### Highlights
- 🌈 **Gradient colors** - Blue → Purple → Pink
- ✨ **Smooth animations** - Fade, slide, scale effects  
- 💎 **Glass morphism** - Backdrop blur & transparency
- 🌊 **Blob animations** - Dynamic background
- 🎯 **Hover effects** - Interactive & responsive
- 💫 **Loading states** - Custom spinners

### Screenshots

```
┌─────────────────────────────────────────┐
│  💝 Quyên góp                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Phi tập trung trên CoinEx Smart Chain  │
│                                         │
│  🟢 Minh bạch • 🔵 An toàn • 🟣 Nhanh  │
├─────────────────────────────────────────┤
│  [🦊 Kết nối MetaMask]                 │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 💝 Quyên góp                      │ │
│  │ Số lượng CET: [_____]             │ │
│  │ [0.1] [0.5] [1] [5]               │ │
│  │ [🎁 Quyên góp ngay]               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 📊 Danh sách quyên góp            │ │
│  │ 💰 Tổng: 5.2500 CET               │ │
│  │ 👥 Số lượt: 15                    │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 📚 Tài liệu

| File | Mô tả | Khi nào đọc |
|------|-------|-------------|
| **[COINEX_QUICK_START.md](./COINEX_QUICK_START.md)** | Quick start 3 bước | ⭐ Đọc đầu tiên |
| **[COINEX_DEPLOY.md](./COINEX_DEPLOY.md)** | Deploy contract mới | Khi cần deploy lại |
| **[WHAT_CHANGED.md](./WHAT_CHANGED.md)** | Những gì đã thay đổi | Xem updates |
| **[HUONG_DAN.md](./HUONG_DAN.md)** | Hướng dẫn đầy đủ | Chi tiết toàn diện |

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, Custom animations
- **Blockchain**: Solidity, CoinEx Smart Chain
- **Web3**: ethers.js v6
- **Wallet**: MetaMask

## 🔐 Smart Contract

```solidity
// Main functions
donate() payable              // Quyên góp CET
getAllDonors()                // Lấy danh sách
withdraw() onlyOwner          // Rút tiền (owner only)

// Public data
totalDonations                // Tổng số tiền (CET)
donors[]                      // Mảng người quyên góp
```

Contract: [`contracts/Donation.sol`](./contracts/Donation.sol)

## 🌐 CoinEx Smart Chain

### Network Info
- **Chain ID**: 53 (0x35)
- **RPC URL**: https://testnet-rpc.coinex.net
- **Explorer**: https://testnet.coinex.net
- **Currency**: CET (CoinEx Token)
- **Faucet**: https://testnet.coinex.net/faucet

### Thêm vào MetaMask
App sẽ tự động thêm khi bạn kết nối ví! ✨

Hoặc thêm thủ công:
```
Network Name: CoinEx Smart Chain Testnet
RPC URL: https://testnet-rpc.coinex.net
Chain ID: 53
Symbol: CET
Block Explorer: https://testnet.coinex.net
```

## 📋 Cấu trúc dự án

```
dt-vote-666/
├── app/
│   ├── components/
│   │   ├── WalletConnect.tsx      # Kết nối ví + Switch network
│   │   ├── DonationForm.tsx       # Form quyên góp CET
│   │   └── DonorsList.tsx         # Danh sách + Stats
│   ├── utils/
│   │   └── contract.ts            # Config + ABI + Address
│   ├── globals.css                # Custom animations
│   └── page.tsx                   # Main page
│
├── contracts/
│   └── Donation.sol               # Smart contract
│
├── COINEX_QUICK_START.md          # ⭐ BẮT ĐẦU TỪ ĐÂY
├── COINEX_DEPLOY.md               # Deploy guide
└── WHAT_CHANGED.md                # Changelog
```

## 🎯 Features Showcase

### 1. Kết nối Ví
- ✅ Auto-add CoinEx network
- ✅ Network detection & switch
- ✅ Balance display với gradient
- ✅ Disconnect option

### 2. Quyên góp
- ✅ Custom amount input
- ✅ Quick select buttons
- ✅ Transaction hash link
- ✅ Success/error handling
- ✅ Loading states

### 3. Danh sách
- ✅ Real-time updates
- ✅ Stats cards (Total, Count)
- ✅ Sortable table
- ✅ Explorer links
- ✅ Refresh button

## ⚠️ Lưu ý quan trọng

### Contract Address
Nếu bạn deploy contract mới, cập nhật trong `app/utils/contract.ts`:
```typescript
export const CONTRACT_ADDRESS = "0xYourNewContractAddress";
```

### Network
Đảm bảo MetaMask đang kết nối **CoinEx Smart Chain Testnet** (Chain ID: 53)

### Testnet Only
- ⚠️ Đây là **TESTNET** - CET không có giá trị thật
- ⚠️ **KHÔNG** dùng trên mainnet trước khi audit kỹ
- ⚠️ **KHÔNG** chia sẻ private key

## 🚦 Status

**✅ 100% Ready!**

- [x] ✅ CoinEx Smart Chain integration
- [x] ✅ Contract deployed
- [x] ✅ Modern UI/UX
- [x] ✅ Animations & effects
- [x] ✅ Full documentation
- [x] ✅ Tested & working

## 🔗 Links

### CoinEx
- **Website**: https://www.coinex.org/
- **Testnet Explorer**: https://testnet.coinex.net
- **Faucet**: https://testnet.coinex.net/faucet
- **Docs**: https://docs.coinex.org/

### Tools
- **MetaMask**: https://metamask.io/
- **Remix IDE**: https://remix.ethereum.org/
- **ethers.js**: https://docs.ethers.org/v6/

## 🤝 Contributing

Mọi đóng góp đều được chào đón! Hãy:
1. Fork repo
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License

## 👨‍💻 Tác giả

Được xây dựng với 💝 cho cộng đồng CoinEx & blockchain Việt Nam

## 🎉 Ready to go!

```bash
npm run dev
```

→ **http://localhost:3000** 🚀

**Enjoy the modern UI and fast transactions on CoinEx! ⚡💝**

---

Made with 💝 | Powered by CoinEx Smart Chain | Version 2.0.0
