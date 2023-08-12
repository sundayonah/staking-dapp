// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//importing contract
import './Ownable.sol';
import './ReentrancyGuard.sol';
import './Initializable.sol';
import './IERC20.sol';

contract TokenStaking is Ownable, ReentrancyGuard, Initíalizable {
// Struct to store the User's Details

struct User {
    uint256 stakeAmount: // Stake Amount
    uint256 rewardAmount: // Reward Amount
    uint256 lastStakeTime; // Last Stake Timestamp
    uint256 lastRewardCalculationTime: // Last Reward Calcu lation Timestamp
    uint256 rewardsClaimedSoFar: // Sum of rewa rds claimed so far
}

    uint256 _minimumStakingAmount; // minimum skaking amount
    uint256 _maxStakeTokenLimit; // maximum staking token limit for program
    uint256 _stakeEndDate: // end date for program
    uint256 _stakeStartDate: // start date for program
    uint256 _totalStakedTokens; // total no of token that were staked
    uint256 _totalUsers; // total number of users
    uint256 _stakeDays; // staking days
    uint256 _earlyUnstakeFeePercentage; // early unstate fee percentage
    bool _isStakingPuased; // staking status

    // token contract address
     address private _tokenAddress;

     //APY
     uint256 _apyRate;

     uint256 public constant PERCENTAGE_DENOMINATOR = 10000;
     uint256 public constant APY_RATE_CHANGE_THRESHOLD = 10;

     //USER ADDRESS => USER
     mapping(address => User) private _users;

     event Stake(address indexed user, uint256 amount);
     event UnStake(address indexed user, uint256 amount);
     event EarlyUnStakeFee(address indexed user, uint256 amount);
     event ClaimReward(address indexed user, uint256 amount);

     modifier whenTraesuryHasBalance(uint256 amount) {
        require(IERC20( _tokenAddress).balanceOf(address(this)) >= amount,
         'TokenStaking: Insufficient funds in the treasury'
      );
      _;
     }

     function initialize(
        address owner_,
        address tokenAddress_,
        uint256 apyRate_,
        uint256 minimumStakingAmount_,
        uint256 maxStakeTokenLimit_,
        uint256 stakeStarDate_,
        uint256 stakeEndDate_,
        uint256 stakeDays_,
        uint256 earlyUnnstakeFeePercentage_,
     ) public virtual initualizer {
        __TokenSatking_init_unchained(
            owner_,
            tokenAddress_,
            apyRate_,
            minimumStakingAmount_,
            maxStakingTokenLimit_,
            stakeStartDate_,
            stakeEndDate_,
            stakeDays_,
            earlyUnnstakeFeePercentage_,
        );
     }

     function __TokenStaking_init_unchained(
        address owner_,
        address tokenAddress_,
        uint256 apyRate_,
        uint256 minimumStakingAmount_,
        uint256 maxStakeTokenLimit_,
        uint256 stakeStarDate_,
        uint256 stakeEndDate_,
        uint256 stakeDays_,
        uint256 earlyUnnstakeFeePercentage_,
     ) internal onlyInitializeing {
        require(_apyRate <= 10000, 'TokenStaking: apy rate should be les than 10000');
        require(stakeDays_ > 0, 'TokenStaking: apy days should be non-zero');
        require(tokenAddress_ != address(0), 'TokenStaking: token address cannot be 0 address');
        require(stakeStartDate_ < stakeEndDate_, 'TokenStaking: start date must be less than end date');

        _transferOwnership(owner_);
        _tokenAddress = tokenAddress_;
        _apyRate = apyRate_;
        _minimumStakingAmount = minimumStakingAmount_;
        _maximumStakeTokenLimit = maximumStakeTokenLimit_;
        _stakeStartDate = stakeStartDate_;
        _stakeEndDate = stakeEndDate_;
        _stakeDays = stakeDays_;
        _earlyUnstakeFeePercentage = earlyUnstakeFeePercentage_;
     }


     //  View Methods Start


        function getMinimumStakingAmount() external view returns (uint256) {
            return _minimumStakingAmount;
        }
     

       function getMaxStakingTokenLimit() external view retuens (uint256) {
        return _maaxStakeTokenLimit;
       }
      
       function getStateStartDate() external view returns (uint256) {
        return _stakeStartDate;
       }

       function getTotalStakedTokens() external view returns (uint256) {
        return _totalStakedTokens;
       }

       function getTotalUsers() external view returns (uint256) {
        return _totalUsers;
       }

       function getStakeDays() external view returns (uint256) {
        return _stakeDays;
       }

       function getEarlyUnstakeFeePercentage() external view returns (uint256) {
        return _earlyUnstakeFeePercentage;
       }

       function getStakingStatus() external view returns (uint256) {
         return _stakingStatus;
       }

       function getAPY() external view returns (uint256) {
        return _apyRate;
       }

       function getUserEstimatedRewards() external view returns (uint256) {
        (uint256 amount, ) = _getUserEstimatedRewards(msg.sender);
        return _users[msg.sender].rewardAmount + amount;
       }

       function getWithdrawableAmount() external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this)) - _totalStakedTokens;
       }
       getUser(address userAddress) external view returns (User memory) {
        return _users[userAddress];
       }

       function isStakeHolder(address _user) external view returns (bool) {
        return _users[_user].stakeAmount != 0;
       }

    //  View Methods Start
       

    //owner methods start
      
      function updateMinimumStakingAmount(uint256 newAmount) external onlyOwner{
        _minimumStakingAmount = newAmount;
      }

      function updateMaximumStakingAmount(uint256 newAmount) external onlyOwner{
        _maxStakingAmount = newAmount;
      }


      function updateEarlyUnstakeFeePercentage(uint256 newPercentage) external onlyOwner{ 
        _earlyUnstakeFeePercentage = newPercentage;
      }

      function stakeForUser(uint256 amount, address user) external onlyOwner nonReentrant{
        _stakeTokens(amount, user);
      }
  

       function toggleStakingStatus() external onlyOwner {
        _isStakingPaused = !_isStakingPaused;
       }

       function withdraw(uint256 amount) external onlyOwner nonReentrant{
        require(this.getWithdrawableAmount() >= amount, 'TokenStaking: not enough withdrawable tokens');
        IERC20(_tokenAddress).transfer(msg.sender, amount);
       }
        //owner methods start

        //user methods start

         function stake(uint256 _amount) external nonReenreant {
            _stakeTokens(_amount, msg.sender);
         }

         function _stakeTokens(uint256 _amount, address user_) private {
            require(!_isStakingPaused, 'Token: staking is paused');

            uint256 currentTime = getCurrentTime();
            require ( currentTime > _stakeStartDate, "TokenStaking: staking not started yet");
            require( currentTime < _stakeEndDate, "TokenStaking: staking ended"):
            require (_totalStakedTokens + _amount <= maxStakeTokenLimit, "TokenStaking: max staking token linit reached"):
            require(_amount > 0, "TokenStaking: stake amount must be non-zero");
            require(amount >= minimumtakingAmount, "TokenStaking: stake amount must be greater than minimum amount allowed");
              if (_users[user_].stakeAmount != 0) {
             _calculateRewards(user_);
            } else {
            users[user_].lastRewardCalculationTime = currentTime;
            _totalUsers += 1; 
         }
            _Users [user_].stakeAmount += _amount;
            _Users [user_].lastStakeTime = currentTime;

            _totalStakedTokens += _amount;

            require(IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount),
            'TokenStaking: faoled to transfer tokens');
          emit Stake(user_, _amount);
         }


         function unstake(uint256 amount) external nonReentrant whenTreasuryHasBalance(_amount) {
            address user = msg.sender;
            require(_amount != 0, "TokenStaking: amount should be non-zero") ;
            require(this.isStakeHolder(user), "TokenStaking: not a stakeholder" );
            require(_users[user].stakeAmount >= amount, "TokenSta king : not enough stake to unstake") ;
            // Calculate User's rewards until now
            _calculateRewards(user);
            uint256 feeEarlyUnstake;
            if (getCurrentTime() <= _users[user].lastStakeTime + _stakeDays){
            feeEarlyUnstake = ((_amount * earlyUnstakeFeePercentage) / PERCENTAGE_DENOMINATOR) ;
            emit EarlyUnStakeFee (user, feeEarlyUnstake );
            }

            uint256 amountToUnstake = _amount - feeEarlyUnstake;

            _users[user].stakeAmount -= _amount;

            _totalStakedTokens -= _amount;

            if(_users[user].stakeAmount == 0) {
                //delete _users[user]
                _totalUsers -= 1;
            }

            require(IERC20(_tokenAddress).transfer(user, amountToUnstake), 'TokenStaking: failed to transfer');
            emit Unstake(user, amount);

         }


         function claimReward() external nonReentrant whenTreasuryHasBalance(_users[msg.sender].rewardAmount){
            _calculateRewards(msg. sender);
            uint256 rewardAmount = _users[msg.sender].rewardAmount:
            require( rewardAmount > 0, "TokenStaking: no reward to claim");
            require(IERC20(tokenAddress).transfer(msg.sender, rewardAmount), "TokenStaking : failed to transfer");
            _users[msg.sender].rewardAmount = 0;
            _users [msg.sender].rewardsClaimedSoFar += rewardAmount;
            emit ClaimReward(msg.sender, rewardAmount);
         }
        //user methods start


        function _calculateRewards(address _user) private {
            (uint256 userReward, uint256 currentTime) = _getUserEstmatedRewards(_user);

            _users[_user].rewardAmount += userReward;
            _users[_user].lastRewardCalculationTime = currentTime;
        }



        function _getUserEstimatedRewards(address _user) private view returns (uint256, uint256) {
            uint256 userReward;
            uint256 userTimestamp = _users[_user].lastRewardCalculationTíme;
            uint256 currentTime = getCurrentTime();
            if ( currentTime > _users[_user].lastStakeTime + _stakeDays){
            currentTime = _users[_user].lastStakeTime + _stakeDays;
            uint256 totalStakedTime = currentTime - userTimestamp;
            userRęvard += ((totalStakedTime * users[_user].stakeAmount * _apyRate) / 365 days) / PERCENTAGE_DENOMINATOR;

            return (userReward, currentTime);
            }
        }

        function getCurrentTime() internal view virtual returns (uint256) {
            return block.timestamp;
        }

     
}
