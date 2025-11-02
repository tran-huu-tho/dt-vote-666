// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonationCampaign {
    address public admin;
    uint256 public campaignCounter;

    struct Campaign {
        uint256 id;
        string title;
        string description;
        uint256 targetAmount;
        uint256 totalRaised;
        uint256 createdAt;
        bool isActive;
        bool isDeleted;
        address creator;
    }

    struct Donation {
        address donor;
        uint256 campaignId;
        uint256 amount;
        uint256 timestamp;
    }

    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => uint256) public campaignBalance;
    Donation[] public donations;

    event CampaignCreated(
        uint256 indexed campaignId,
        string title,
        string description,
        uint256 targetAmount
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp
    );

    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed admin,
        uint256 amount
    );

    event CampaignClosed(
        uint256 indexed campaignId,
        uint256 totalRaised
    );

    event CampaignDeleted(
        uint256 indexed campaignId,
        address indexed admin
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor() {
        admin = msg.sender;
        campaignCounter = 0;
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _targetAmount
    ) public onlyAdmin returns (uint256) {
        campaignCounter++;
        
        campaigns[campaignCounter] = Campaign({
            id: campaignCounter,
            title: _title,
            description: _description,
            targetAmount: _targetAmount,
            totalRaised: 0,
            createdAt: block.timestamp,
            isActive: true,
            isDeleted: false,
            creator: msg.sender
        });

        emit CampaignCreated(
            campaignCounter,
            _title,
            _description,
            _targetAmount
        );

        return campaignCounter;
    }

    function donate(uint256 _campaignId) public payable {
        require(_campaignId > 0 && _campaignId <= campaignCounter, "Invalid campaign ID");
        require(campaigns[_campaignId].isActive, "Campaign is not active");
        require(!campaigns[_campaignId].isDeleted, "Campaign has been deleted");
        require(msg.value > 0, "Donation amount must be greater than 0");

        campaigns[_campaignId].totalRaised += msg.value;
        campaignBalance[_campaignId] += msg.value;

        donations.push(Donation({
            donor: msg.sender,
            campaignId: _campaignId,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit DonationReceived(
            _campaignId,
            msg.sender,
            msg.value,
            block.timestamp
        );
    }

    function withdrawFunds(uint256 _campaignId) public onlyAdmin {
        require(_campaignId > 0 && _campaignId <= campaignCounter, "Invalid campaign ID");
        require(campaignBalance[_campaignId] > 0, "No funds to withdraw");

        uint256 amount = campaignBalance[_campaignId];
        campaignBalance[_campaignId] = 0;

        payable(admin).transfer(amount);

        emit FundsWithdrawn(_campaignId, admin, amount);
    }

    function closeCampaign(uint256 _campaignId) public onlyAdmin {
        require(_campaignId > 0 && _campaignId <= campaignCounter, "Invalid campaign ID");
        require(campaigns[_campaignId].isActive, "Campaign is already closed");

        campaigns[_campaignId].isActive = false;

        emit CampaignClosed(_campaignId, campaigns[_campaignId].totalRaised);
    }

    function openCampaign(uint256 _campaignId) public onlyAdmin {
        require(_campaignId > 0 && _campaignId <= campaignCounter, "Invalid campaign ID");
        require(!campaigns[_campaignId].isActive, "Campaign is already active");

        campaigns[_campaignId].isActive = true;
    }

    function deleteCampaign(uint256 _campaignId) public onlyAdmin {
        require(_campaignId > 0 && _campaignId <= campaignCounter, "Invalid campaign ID");
        require(!campaigns[_campaignId].isDeleted, "Campaign is already deleted");
        require(campaignBalance[_campaignId] == 0, "Cannot delete campaign with remaining funds");

        campaigns[_campaignId].isDeleted = true;

        emit CampaignDeleted(_campaignId, admin);
    }

    function getCampaign(uint256 _campaignId) public view returns (Campaign memory) {
        require(_campaignId > 0 && _campaignId <= campaignCounter, "Invalid campaign ID");
        return campaigns[_campaignId];
    }

    function getAllDonations() public view returns (Donation[] memory) {
        return donations;
    }

    function getCampaignDonations(uint256 _campaignId) public view returns (Donation[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < donations.length; i++) {
            if (donations[i].campaignId == _campaignId) {
                count++;
            }
        }

        Donation[] memory result = new Donation[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < donations.length; i++) {
            if (donations[i].campaignId == _campaignId) {
                result[index] = donations[i];
                index++;
            }
        }

        return result;
    }
}
