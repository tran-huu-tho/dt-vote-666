# 💝 Ứng dụng Quyên góp - Donation DApp

Ứng dụng quyên góp phi tập trung (DApp) được xây dựng trên blockchain Ethereum, cho phép người dùng quyên góp ETH một cách minh bạch và an toàn.

## ✨ Tính năng

- 🦊 **Kết nối MetaMask**: Kết nối ví MetaMask và hiển thị địa chỉ ví + số dư ETH
- 💰 **Quyên góp ETH**: Nhập số tiền và gửi giao dịch lên blockchain Sepolia testnet
- 📊 **Danh sách quyên góp**: Hiển thị công khai tất cả các giao dịch quyên góp
- 🔒 **Minh bạch**: Mọi giao dịch được lưu trữ trên blockchain, không thể thay đổi
- ⚡ **Real-time**: Tự động cập nhật danh sách sau mỗi lần quyên góp

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Blockchain**: Solidity, Ethereum (Sepolia Testnet)
- **Web3**: ethers.js v6
- **Wallet**: MetaMask

## 📋 Yêu cầu trước khi bắt đầu

1. **Node.js**: Phiên bản 18 trở lên
2. **MetaMask**: Cài đặt extension MetaMask trên trình duyệt
3. **Sepolia ETH**: Lấy test ETH từ faucet (miễn phí)
4. **Hardhat hoặc Remix**: Để deploy smart contract

## 🚀 Hướng dẫn cài đặt

### Bước 1: Clone và cài đặt dependencies

```bash
cd dt-vote-666
npm install
```

### Bước 2: Deploy Smart Contract lên Sepolia

#### Option 1: Sử dụng Remix IDE (Dễ nhất)

1. Truy cập https://remix.ethereum.org/
2. Tạo file mới `Donation.sol` và copy nội dung từ `contracts/Donation.sol`
3. Compile contract (Ctrl + S hoặc click nút Compile)
4. Chuyển sang tab "Deploy & Run Transactions"
5. Chọn Environment: "Injected Provider - MetaMask"
6. Đảm bảo MetaMask đang kết nối mạng Sepolia
7. Click nút "Deploy" và confirm transaction trong MetaMask
8. Copy địa chỉ contract sau khi deploy thành công

#### Option 2: Sử dụng Hardhat

```bash
# Cài đặt Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Khởi tạo Hardhat
npx hardhat init

# Deploy script (tạo file scripts/deploy.js)
npx hardhat run scripts/deploy.js --network sepolia
```

### Bước 3: Cấu hình địa chỉ Contract

Sau khi deploy thành công, mở file `app/utils/contract.ts` và cập nhật địa chỉ contract:

```typescript
export const CONTRACT_ADDRESS = "0xYourContractAddressHere";
```

### Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Mở trình duyệt tại: http://localhost:3000

## 📝 Cách sử dụng

### 1. Lấy Sepolia Test ETH

Truy cập các faucet sau để lấy test ETH miễn phí:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://cloud.google.com/application/web3/faucet/ethereum/sepolia

### 2. Kết nối MetaMask

1. Đảm bảo MetaMask đã cài đặt và đang ở mạng Sepolia
2. Click nút "🦊 Kết nối MetaMask"
3. Chấp nhận yêu cầu kết nối trong MetaMask
4. Địa chỉ ví và số dư sẽ hiển thị

### 3. Quyên góp

1. Nhập số ETH muốn quyên góp (hoặc chọn nhanh)
2. Click "🎁 Quyên góp ngay"
3. Xác nhận giao dịch trong MetaMask
4. Đợi transaction được confirm (khoảng 15-30 giây)
5. Danh sách quyên góp sẽ tự động cập nhật

### 4. Xem danh sách quyên góp

- Danh sách hiển thị tất cả các lượt quyên góp
- Thông tin bao gồm: địa chỉ ví, số tiền, thời gian
- Click vào địa chỉ ví để xem chi tiết trên Etherscan
- Click "🔄 Làm mới" để cập nhật danh sách

## 🏗️ Cấu trúc dự án

```
dt-vote-666/
├── app/
│   ├── components/
│   │   ├── WalletConnect.tsx      # Component kết nối ví
│   │   ├── DonationForm.tsx       # Form quyên góp
│   │   └── DonorsList.tsx         # Danh sách người quyên góp
│   ├── utils/
│   │   └── contract.ts            # ABI và địa chỉ contract
│   ├── types/
│   │   └── window.d.ts            # TypeScript declarations
│   ├── layout.tsx
│   └── page.tsx                   # Trang chính
├── contracts/
│   └── Donation.sol               # Smart contract
├── package.json
└── README.md
```

## 📄 Smart Contract Functions

### Public Functions

- `donate()`: Quyên góp ETH
- `getDonorsCount()`: Lấy tổng số người quyên góp
- `getDonor(index)`: Lấy thông tin người quyên góp theo index
- `getAllDonors()`: Lấy danh sách tất cả người quyên góp
- `withdraw()`: Rút tiền (chỉ owner)

### Events

- `DonationReceived(address donor, uint256 amount, uint256 timestamp)`

## 🔧 Troubleshooting

### MetaMask không kết nối được?

- Kiểm tra xem đã cài đặt MetaMask chưa
- Đảm bảo đang ở mạng Sepolia
- Thử refresh trang và kết nối lại

### Transaction failed?

- Kiểm tra số dư ETH có đủ không
- Kiểm tra địa chỉ contract đã đúng chưa
- Xem chi tiết lỗi trên Sepolia Etherscan

### Danh sách không hiển thị?

- Kiểm tra địa chỉ CONTRACT_ADDRESS đã được cập nhật chưa
- Click nút "Làm mới" để load lại dữ liệu
- Kiểm tra console để xem lỗi

## 🌐 Links hữu ích

- **Sepolia Etherscan**: https://sepolia.etherscan.io/
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **MetaMask**: https://metamask.io/
- **Remix IDE**: https://remix.ethereum.org/
- **ethers.js Docs**: https://docs.ethers.org/v6/

## 📱 Screenshots

*Thêm screenshots của ứng dụng khi đã hoàn thành*

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📜 License

MIT License

## 👨‍💻 Tác giả

Được xây dựng với ❤️ cho cộng đồng blockchain

---

**Lưu ý**: Đây là ứng dụng demo trên testnet. Không sử dụng với ETH thật trên mainnet trước khi kiểm tra kỹ lưỡng!
