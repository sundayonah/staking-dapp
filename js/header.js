const _NETWORK_ID = 8001;
let SELECT_CONTRACT = {};

const _API_URL ='http://'

SELECT_CONTRACT[_NETWORK_ID] = {
    network_name: 'Polygon Mumbai',
    explorer_url: 'https://mumbai.polygonscan.com/',
    STACKING:{
        //0x4CA2a661F6bA50c59Eb0854ff6F1B06e228f72b6
        sevenDays: {
           address: "Ox51168d2D1B935932959Bd7617892a5C1DB7Fb0AA",
        },
        tenDays:{
            address: "Ox18E6d0eb4Cf368b4089BdEE8158a46EAF5003aA3",
        },
        thirtyTwoDays: {
            address: "0xD4623098a915D254810dc9E8f210733E4108ebaD",
        },
        ninetyDays: {
             address: "Ox4aafc4309Decf7Fc9cBD560a9c65A0052486f97b",
        },
        abi: [],
  },
  TOKEN: {
    symbol: 'XTC',
    address: '0x66cD16968A1cd625b13103A6199BcE679Ead8ED0',
    abi: [],
  },
};


let countDownGlobal;
 
//wallet connection
let web3; 
let contractToken;

let contractCall = 'sevenDays';
let currentAddress;

let web3Main = new web3('https://rpc.ankr.com/polygon_mumbai');

// Create an instance of Notify

var notify = new Notify({
    duration: 3000,
    position: {x: 'right', y: 'bottom'},
});