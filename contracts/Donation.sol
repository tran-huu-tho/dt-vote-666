// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Donation {
    struct Donor {
        address donorAddress;
        uint256 amount;
        uint256 timestamp;
    }
    
    Donor[] public donors;
    address public owner;
    uint256 public totalDonations;
    
    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
    
    constructor() {
        owner = msg.sender;
    }
    
    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than 0");
        
        donors.push(Donor({
            donorAddress: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        totalDonations += msg.value;
        
        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }
    
    function getDonorsCount() public view returns (uint256) {
        return donors.length;
    }
    
    function getDonor(uint256 index) public view returns (address, uint256, uint256) {
        require(index < donors.length, "Index out of bounds");
        Donor memory donor = donors[index];
        return (donor.donorAddress, donor.amount, donor.timestamp);
    }
    
    function getAllDonors() public view returns (Donor[] memory) {
        return donors;
    }
    
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
    }
    
    receive() external payable {
        donate();
    }
}
