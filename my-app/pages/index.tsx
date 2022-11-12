import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Web3Modal from "web3modal";
import { Contract, providers} from "ethers";
import { useEffect, useRef, useState } from 'react';
import { WHITELIST_CONTRACT_ADDRESS, abi } from"../constants";

export default function Home() {
const [walletConnected, setWalletConnected] = useState(false);
const [numofWhitelisted, setNumOfWhitelisted] = useState(0);
const [_joinedWhitelist, setJoinedWhitelist] = useState(false);
const [Lädt, setLädt] = useState(false);
const web3ModalRef = useRef();

const getProviderOrSigner = async(needSigner = false) => {
  try{
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const {chainId} = await web3Provider.getNetwork();
    if(chainId !== 5) {
      window.alert("Ändere das Netzwerk zu Görli");
      throw new Error("Ändere das Netzwerk zu Görli");
    }
    if(needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  } catch(err) {
    console.error(err)
  }
};

const addAddressToWhitelist = async () => {
  try {
const signer = await getProviderOrSigner(true);
const whitelistContract = new Contract(
  WHITELIST_CONTRACT_ADDRESS,
  abi,
  signer
);
  const tx = await whitelistContract.addAddressToWhitelist()
  setLädt(true);
  await tx.wait();
  setLädt(false);
  await getNumberOfWhitelisted();
  setJoinedWhitelist(true);
  }catch(err) {
    console.error(err);
  }

};
const checkIfAddressInWhitelist = async () => {
  try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
        );

      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch(err) {
    console.error(err)
  }
};

const getNumberOfWhitelisted = async() => {
  try {
    const provider = await getProviderOrSigner();
    const whitelistContract = new Contract(
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      provider,
      );
      const _numOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumOfWhitelisted(_numOfWhitelisted)

  } catch(err) {
    console.error(err)
  }


};

const renderButton = () => {
  if(walletConnected) {
    if(_joinedWhitelist) {
      return (
        <div className={styles.description}>
          Herzlich Willkommen auf der Whitelist! 
        </div>
      );
    } else if(Lädt) {
      return <button className={styles.button}>
        Lädt...
      </button>
    } else {
      return (
        <button onClick={addAddressToWhitelist} className={styles.button}>
          Join der Whiltelist
        </button>
      );
    }
   } else {
    <button onClick={connectWallet} className={styles.button}>
      Connect your wallet
    </button>

   }
};

const connectWallet = async() => {
  try {
    await getProviderOrSigner();
    setWalletConnected(true);
    checkIfAddressInWhitelist();
    getNumberOfWhitelisted();
  } catch(err){
    console.error(err)
  }
}
useEffect (() => {
if (!walletConnected) {
  web3ModalRef.current = new Web3Modal({
    network:"goerli",
    providerOptions:{},
    disableInjectedProvider: false,
  });
  connectWallet(); 
  }
}, [walletConnected]);

  return (
    <div>
      <head>
        <title>Whitelist dApp</title>
        <meta name='description' content="WhitelistDapp" />
      </head>
      <div className={styles.main}>
        <h1 className={styles.title}>
          Willkommen bei CannBen!
        </h1>
        <div className={styles.description}>
          {numofWhitelisted} sind der Whitelist bereits beigetreten
        </div>
        {renderButton()}
        <div>
        <img className={styles.image} src="./crypto-devs.svg.jpg"/>
        </div>
      </div>
      <footer className={styles.footer}>
        Gemacht für Cannben &#10084;


      </footer>
    </div>
  )
}
