// function call
loadInitialData('sevenDays');
connectMe('metamask_wallet');
function connectWallet() {};

function openTab(event, name){
    console.log(name);
    contractCall = name;
    getSelectedTab(name);
    loadInitialData(name);
}

async function loadInitialData(sClass) {
    console.log(sClass);
    try {
        clearInterval(countDownGlobal);
      let cObj =  new web3Main.eth.Contract(
            SELECT_CONTRACT[_NETWORK_ID].STACKING.abi,
            SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address
        );

        //Id Element data
        let totalUsers = await cObj.methods.getTotalUsers().call();
        let cApy = await cObj.methods.getApy().call();

        //get user
        let userDetail = await cObj.methods.getUser(currentAddress).call();
         const user = {
            lastRewardCalculationTime: userDetail.lastRewardCalculationTime,
            lastStakeTime: userDetail.lastStakeTime,
            rewardAmount: userDetail.rewardAmount,
            rewardsClaimedSoFar: userDetail.rewardsClaimedSoFar,
            stakeAmount: userDetail.stakeAmount,
            address: currentAddress,
         };
         console.log(user, 'user ')
            localStorage.setItem("User", JSON.stringify(user));
        let userDetailBal = userDetail.stakeAmount / 10 ** 18;

        document.getElementById(
            'total-locked.user-token'
        ).innerHTML = `${userDetailBal}`;
 
        //elements --id
        document.getElementById(
            'num-of-stackers-value'
        ).innerHTML = `${totalUsers}`;
        document.getElementById('apy-value-feature').innerHTML = `${cApy} %`;

        
        // elements class
        document.getElementById('total-locked-tokens-value').innerHTML = `${totalLockedTokens / 10 ** 18}
        ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}
        `;

        document.querySelectorAll('.early-unstake-fee-value')
        .forEach(function (element){
            element.innerHTML = `${earlyUnstakeFee / 100}%`;
        });

        let minStakeAmount = await cObj.methods.getMinimumStakeAmount().call();
        minStakeAmount = Number(minStakeAmount);
         let minA;

         if(minStakeAmount) {
            minA = `${(minStakeAmount / 10 ** 18).toLocaleString()} ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`;
         } else {
            minA = 'N/A';
         }

         document.querySelectorAll('.Minimum-Staking-Amount')
         .forEach(function (element) {
            element.innerHTML = `${minA}`
         });
           document.querySelectorAll('.Maximun-Staking-Amount')
           .forEach(function (element) {
            element.innerHTML = `${(10000000).toLocaleString()} ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.symbol}`;
           });


           let isStakingPaused = await cObj.methods.getStakingStatus().call();
                let isStakingPausedText;
                let startDate = await cObj.methods.getStakeStartDate().call();
                startDate = Number(startDate) * 1000;
                let endDate = await cObj.methods.getStakeEndDate().call();
                endDate = Number(endDate) * 1000;
                let stakeDays = await cObj.methods.getStakeDays().call();
                let days = Math.floor(Number(stakeDays ) / (3600 * 24));
                let dayDisplay = days > 0 ? days + (days == 1 ? " day, " : " days, ") : '';


                document.querySelectorAll(".Lock-period-value").forEach(function (element) {
                    element. innerHTML = `${dayDisplay}`;
                })
                    let rewardBal = await cObj.methods
                    .getUserEstimatedRewards()
                    .call({ from: currentAddress });

                    document.getElementById("user-reward-balance-value").value = `Reward: ${
                    rewardBal / 10 ** 18
                    } ${SELECT_CONTRACT[_NETWORK_ID].TOKEN.Symbol}`;

                    //USER TOKEN BALANCE
                    let balMainUser = currentAddress
                    ? await oContractToken.methods.balance0f(currentAddress).call() : '';
                    balMainUser = Number(balMainUser) / 10 ** 18;
                    document.getElementById(
                    "user-token-balance"
                    ).innerHTML = `Balance: ${balMainUser}`;
                    let currentDate = new Date().getTime();
                    if (isStakingPaused) {
                        isStakingPausedText = 'Paused';
                    } else if(currentDate < startDate) {
                        isStakingPausedText = 'Locked';
                    } else if(currentDate > startDate) {
                        isStakingPausedText = 'Ended';
                    } else {
                        isStakingPausedText = 'Active';
                    } 

                    document.querySelectorAll('.active-status-staking')
                    .forEach(function (element) {
                        element.innerHTML = `${isStakingPausedText}`;
                    })

                    if(currentDate > startDate && currentDate < endDate) {
                        const ele = document.getElementById('countdown-time-value');
                        generateCountDown(ele, endDate);

                        document.getElementById(
                            'countdown-title-value'
                        ).innerHTML = `Staking Ends In`;
                     }

                     if(currentDate < startDate) {
                        const ele = document.getElementById('countdown-time-value');
                        generateCountDown(ele, endDate);

                        document.getElementById(
                            'countdown-title-value'
                        ).innerHTML = `Staking Starts In`;
                     }

                     document.querySelectorAll('.apy-value')
                     .forEach(function (element) {
                         element.innerHTML = `${cApy} %`;
                     })
                        } catch (error) {
                            console.log(error);
                            notify.error(
                                `Unable to fetch data from ${SELECT_CONTRACT[_NETWORK_ID].network_name}!\n Please refresh this page`
                            );
                        }
                    }

function generateCountDown(ele, claimDate) {
    clearInterval(countDownGlobal);
    var countDownDate = new Date(claimDate).getTime();

    countDownGlobal = setInterval(function () {
        var now= new Date().getTime();

        var distance = countDownDate - now;

        var days = Math.floor(distance / (1000 * 60 * 60 * 24))
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        var seconds = Math.floor((distance % (1000 * 60 * 60)) / 1000)

        ele.innerHTML = days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's ';

        if (distance < 0) {
            clearInterval(countDownGlobal);
            ele.html('Refresh Page');
        }
    }, 1000);
}

async function connectMe(_provider) {
    try {
        let _comm_res = await commonProviderDetector(_provider);
        console.log(_comm_res);
        if(!_comm_res){
            console.log('Please Connect');
        } else {
            let sClass = getSelectedTab();
            console.log(sClass)
        }
    } catch (error) {
        notify.error(error.message);
    }
  } 

    async function stackTokens() {
        try {
            let nTokens = document.getElementById('amount-to-stack-value-new').value;

            if(!nTokens) {
                return;
            }

            if(isNaN(nTokens) || nTokens == 0 || Number(nTokens) < 0) {
                console.log(`Invalid token amount!`);
                return;
            }

            nTokens = Number(nTokens);

            let tokenTransfer = addDecimal(nTokens, 18);
            console.log(tokenTransfer);

            let balMainUser = await contractToken.methods.balance0f(currentAddress).call();

            balMainUser = Number(balMainUser) / 10 ** 18;
            console.log(balMainUser)

                if(balMainUser < nTokens){
                    notify.error(
                        `insufficient tokens on ${SELECT_CONTRACT[_NETWORK_ID].network_name}.\n Please buy some token first !`
                    );
                    return;
                }

                let sClass = getSelectedTab(contractCall);

                console.log(sClass)

                let balMainAllowance = await contractToken.methods
                .allowance(
                    currentAddress, SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address
                ).call();
            
                if(Number(balMainAllowance) < Number(tokenTransfer)) {
                    approveTokenSpend(tokenToTransfer, sClass);
                } else {
                    stackTokenMain(tokenToTransfer, sClass);
                }

        } catch (error) {
            console.log(error)
            notify.dismiss(notification);
            notify.error(formatEthErrorMsg(error));
        }
    }

 async function approveTokenSpend(_mint_fee_wei, sClass) {
    let gasEstimation;

    try {
        gasEstimation = await contractToken.methods.approve(
            SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address, _mint_fee_wei
        ).estimateGas({
            from: currentAddress,
        })
    } catch (error) {
       console.log(error)
        notify.error(formatEthErrorMsg(error))
        return;
    }

    contractToken.methods.approve(SELECT_CONTRACT[_NETWORK_ID].STACKING[sClass].address, _mint_fee_wei )
    .send({
        from: currentAddress,
        gas: gasEstimation,
    })
    .on('transactionHash', (hash) => {
        console.log('TransactionHash: ', hash);
    })
    .on('reciept', (reciept) => {
        console.log(reciept)
        stackTokenMain(_mint_fee_wei);
    })
    .catch((error) => {
        console.log(error)
        notify.error(formatEthErrorMsg(error))
        return;
    })
 };


 async function stackTokenMain(_amount_wei, sClass) {
    let gasEstimation;

    let contractToken = getContractObj(sClass);

    try {
        gasEstimation = await contractToken.methods.stake(_amount_wei).estimateGas({
            from: currentAddress,
        });
    } catch (error) {
        console.log(error)
        notify.error(formatEthErrorMsg(error))
        return;
    }

    contractToken.methods.stake(_amount_wei).send({
        from: currentAddress,
        gas: gasEstimation,
    })
    .on('receipt', (reciept) => {
        console.log(reciept);
        const receiptObj = {
            token: _amount_wei,
            from: reciept.from,
            to: reciept.to,
            blockHash: reciept.blockHash,
            blockNumber: reciept.blockNumber,
            cumulativeGasUsed: reciept.cumulativeGasUsed,
            effectiveGasUsed: reciept.effectiveGasUsed,
            gasUsed: reciept.gasUsed,
            status: reciept.status,
            transactionHash: reciept.transactionHash,
            type: reciept.type
        };

        let transactionHistory = [];
            const allUserTransaction = localStorage.getItem("transactions");
            if (allUserTransaction) {
            transactionHistory = JSON.parse(localStorage.getItem("transactions"));
            transactionHistory.push(receiptObj);
            localStorage.setItem(
            "transactions",
            JSON.stringify(transactionHistory)
            )
            } else {
            transactionHistory.push(receiptObj);
            localStorage.setItem(
            "transactions",
            JSON.stringify(transactionHistory)
            )}

            console.log(allUserTransaction, 'allUserTransaction');

            window.location.href = 'http://127.0.0.1:5500/analytic.html';
    })
    .on('transactionHash', (hash) => {
        console.log('Transaction hash: ', hash)
    })
    .catch((error) => {
        console.log(error)
        notify.error(formatEthErrorMsg(error))
        return;
    });
   }


   async function unstackTokens() {
    try {
        let nTokens = document.getElementById('amount-to-unstack-value').value;

        if(!nTokens) {
            return;
        }

        if(isNaN(nTokens) || nTokens == 0 || Number(nTokens) < 0) {
            console.log(`Invalid token amount!`);
            notify.error(`Invalid token amount!`);
            return;
        }

        nTokens = Number(nTokens);

        let tokenToTransfer = addDecimal(nTokens, 18);
    
            let sClass = getSelectedTab(contractCall);
            let contractStacking  = getContractObj(sClass)

            let balMainUser = await contractStacking.methods
            .getUser(currentAddress).call();
        
            balMainUser = Number(balMainUser.stakeAmount) / 10 ** 18;
            console.log(balMainUser)
    
                if(balMainUser < nTokens){
                    notify.error(
                        `insufficient staked tokens on ${SELECT_CONTRACT[_NETWORK_ID].network_name}!`
                    );
                    return;
                }
                unstackTokenMain(tokenToTransfer, contractStacking, sClass);
            } catch (error) {
                console.log(error)
                notify.dismiss(notification);
                notify.error(formatEthErrorMsg(error));
            }
        }


 async function unstackTokenMain(_amount_wei, contractStacking, sClass) {  
    let gasEstimation;

    try {
        gasEstimation = await contractStacking.methods.unstake(_amount_wei).estimateGas({
            from: currentAddress,
        });
    } catch (error) {
        console.log(error)
        notify.error(formatEthErrorMsg(error))
        return;
    }

    contractStacking.methods.unstake(_amount_wei).send({
        from: currentAddress,
        gas: gasEstimation,
    })
    .on('receipt', (reciept) => {
        console.log(reciept);
        const receiptObj = {
            token: _amount_wei,
            from: reciept.from,
            to: reciept.to,
            blockHash: reciept.blockHash,
            blockNumber: reciept.blockNumber,
            cumulativeGasUsed: reciept.cumulativeGasUsed,
            effectiveGasUsed: reciept.effectiveGasUsed,
            gasUsed: reciept.gasUsed,
            status: reciept.status,
            transactionHash: reciept.transactionHash,
            type: reciept.type
        };

        let transactionHistory = [];
            const allUserTransaction = localStorage.getItem("transactions");
            if (allUserTransaction) {
            transactionHistory = JSON.parse(localStorage.getItem("transactions"));
            transactionHistory.push(receiptObj);
            localStorage.setItem(
            "transactions",
            JSON.stringify(transactionHistory)
            )
            } else {
            transactionHistory.push(receiptObj);
            localStorage.setItem(
            "transactions",
            JSON.stringify(transactionHistory)
            )} 
             window.location.href = 'http://127.0.0.1:5500/analytic.html';
    })
    .on('transactionHash', (hash) => {
        console.log('Transaction hash: ', hash)
    })
    .catch((error) => {
        console.log(error)
        notify.error(formatEthErrorMsg(error))
        return;
    });
   }


   async function claimTokens () {
        try {
            let sClass = getSelectedTab(contractCall) ;
            let contractStacking = getContract0bj(sClass);
            let rewardBal = await contractStacking.methods
            .getUserEstimatedRewards()
            .call({ from: currentAddress });
            rewardBal = Number(rewardBal);
            console.log(" rewa rdBal", rewardBal) ;
            if (!rewardBal){
            notify.dismiss(notification );
            notify.error(`insufficient Reward tokens to claim`)
            return;
        }
        claimTokensMain(contractStacking, sClass);
    } catch (error){
        console.log(error)
        notify.dismiss(notification);
        notify.error(formatEthErrorMsg(error))

    }
}


async function claimTokensMain(contractStacking, sClass) {  
    let gasEstimation;

    try {
        gasEstimation = await contractStacking.methods.claimReward().estimateGas({
            from: currentAddress,
        });
        console.log(estimateGas, 'estimateGas')
    } catch (error) {
        console.log(error)
        notify.error(formatEthErrorMsg(error))
        return;
    }

    contractStacking.methods.claimReward().send({
        from: currentAddress,
        gas: gasEstimation,
    })
    .on('receipt', (reciept) => {
        console.log(reciept);
        const receiptObj = {
            token: _amount_wei,
            from: reciept.from,
            to: reciept.to,
            blockHash: reciept.blockHash,
            blockNumber: reciept.blockNumber,
            cumulativeGasUsed: reciept.cumulativeGasUsed,
            effectiveGasUsed: reciept.effectiveGasUsed,
            gasUsed: reciept.gasUsed,
            status: reciept.status,
            transactionHash: reciept.transactionHash,
            type: reciept.type
        };

        let transactionHistory = [];
            const allUserTransaction = localStorage.getItem("transactions");
            if (allUserTransaction) {
            transactionHistory = JSON.parse(localStorage.getItem("transactions"));
            transactionHistory.push(receiptObj);
            localStorage.setItem(
            "transactions",
            JSON.stringify(transactionHistory)
            )
            } else {
            transactionHistory.push(receiptObj);
            localStorage.setItem(
            "transactions",
            JSON.stringify(transactionHistory)
            )} 
             window.location.href = 'http://127.0.0.1:5500/analytic.html';
    })
    .on('transactionHash', (hash) => {
        console.log('Transaction hash: ', hash)
    })
    .catch((error) => {
        console.log(error)
        notify.error(formatEthErrorMsg(error))
        return;
    });
   }


   