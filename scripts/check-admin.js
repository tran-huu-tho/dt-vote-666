import hre from "hardhat";

async function main() {
  const contractAddress = "0x63d20F02C98D1c3ce1a868845Df2ddc49893d458";
  
  console.log("🔍 Kiểm tra địa chỉ Admin của Contract...\n");
  
  const DonationCampaign = await hre.ethers.getContractAt("DonationCampaign", contractAddress);
  
  const admin = await DonationCampaign.admin();
  
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Admin Address:", admin);
  console.log("✅ Expected Admin:", "0xfedbd76caeb345e2d1ddac06c442b86638b65bca");
  console.log("");
  
  if (admin.toLowerCase() === "0xfedbd76caeb345e2d1ddac06c442b86638b65bca".toLowerCase()) {
    console.log("✅ ĐÚNG RỒI! Tiền sẽ rút về địa chỉ này khi bạn gọi withdrawFunds()");
  } else {
    console.log("❌ SAI RỒI! Admin của contract khác với địa chỉ bạn muốn!");
    console.log("   Contract được deploy bởi:", admin);
    console.log("   Địa chỉ bạn muốn:", "0xfedbd76caeb345e2d1ddac06c442b86638b65bca");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
