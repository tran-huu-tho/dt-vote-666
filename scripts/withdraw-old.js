import hre from "hardhat";

async function main() {
  const contractAddress = "0x03CE88601fBdE9375E8BAF25F01694Ca5F1370C0"; // Contract cũ
  
  console.log("Checking old contract balance...");
  
  const provider = hre.ethers.provider;
  const balance = await provider.getBalance(contractAddress);
  
  console.log("Contract balance:", hre.ethers.formatEther(balance), "CET");
  
  if (balance > 0) {
    console.log("\nWithdrawing funds...");
    
    const Contract = await hre.ethers.getContractFactory("Donation");
    const contract = Contract.attach(contractAddress);
    
    const tx = await contract.withdraw();
    console.log("Transaction sent, waiting...");
    await tx.wait();
    
    console.log("✅ Withdrawn successfully!");
  } else {
    console.log("No funds to withdraw");
  }
}

main().catch(console.error);
