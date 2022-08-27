import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const KOVAN_RPC_URL = process.env.RINKEBY_RPC_URL;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // // If you want to do some forking, uncomment this
      // forking: {
      //   url: MAINNET_RPC_URL
      // }
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    kovan: {
      url: KOVAN_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      //accounts: {
      //     mnemonic: MNEMONIC,
      // },
      saveDeployments: true,
      chainId: 42,
    },
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      //   accounts: {
      //     mnemonic: MNEMONIC,
      //   },
      saveDeployments: true,
      chainId: 4,
    },
    // mainnet: {
    //     url: MAINNET_RPC_URL,
    //     accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    //     //   accounts: {
    //     //     mnemonic: MNEMONIC,
    //     //   },
    //     saveDeployments: true,
    //     chainId: 1,
    // },
    // polygon: {
    //     url: POLYGON_MAINNET_RPC_URL,
    //     accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    //     saveDeployments: true,
    //     chainId: 137,
    // },
  },

  solidity: "0.8.9",
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
      default: 1,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-reporter.txt",
    noColors: true,
    currency: "USD",
    // gasPrice: 21
  },
};

export default config;
