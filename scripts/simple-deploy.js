// Simple deploy with manual confirmation
import hre from "hardhat";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    console.log("\n🚀 Starting deployment...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deployer:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "CET\n");

    // Deploy
    const Donation = await hre.ethers.getContractFactory("Donation");
    console.log("⏳ Deploying contract...");
    
    const donation = await Donation.deploy({
      gasLimit: 3000000
    });
    
    console.log("📤 Transaction sent! Hash:", donation.deploymentTransaction()?.hash);
    console.log("⏳ Waiting for confirmation (this may take 30-60 seconds)...\n");
    
    // Wait with timeout
    const deployPromise = donation.waitForDeployment();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Deployment timeout after 90 seconds')), 90000)
    );
    
    await Promise.race([deployPromise, timeoutPromise]);
    
    const contractAddress = await donation.getAddress();
    
    console.log("\n✅ Contract deployed successfully!");
    console.log("📍 Address:", contractAddress);
    console.log("🔗 Explorer: https://testnet.coinex.net/address/" + contractAddress);
    
    // Update contract.ts
    const contractFilePath = path.join(__dirname, '../app/utils/contract.ts');
    let content = fs.readFileSync(contractFilePath, 'utf8');
    
    const regex = /export const CONTRACT_ADDRESS = ".*"\.toLowerCase\(\);/;
    const newLine = `export const CONTRACT_ADDRESS = "${contractAddress}".toLowerCase();`;
    
    content = content.replace(regex, newLine);
    fs.writeFileSync(contractFilePath, content);
    
    console.log("✅ Updated contract address in contract.ts");
    console.log("\n🎉 DEPLOYMENT COMPLETE!\n");
    
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    
    if (error.message.includes('timeout')) {
      console.log("\n💡 TIP: The transaction may still be processing on the blockchain.");
      console.log("   Check your address at: https://testnet.coinex.net/address/0xFedbD76cAEB345e2d1dDaC06C442b86638B65bCA");
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
