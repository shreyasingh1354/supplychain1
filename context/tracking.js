"use client";
import React, { useState, useEffect} from "react";
import Web3Modal from "web3modal";

import { ethers } from "ethers";

import tracking from "../context/tracking.json";

const ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ContractABI = tracking.abi;

const fetchContract = (signerOrProvider) =>
new ethers.Contract(ContractAddress, ContractABI, signerOrProvider);


export const TrackingContext= React.createContext();

export const TrackingProvider = ({children}) =>{

    const DappName = "Tracking Dapp";
    const [currentUser, setCurrentUser] = useState("");

    const createShipment = async () => {
      console.log(items);
      const items = {
        receiver,
        pickupTime,
        distance,
        price,
      };
     
  
      try {
          // Check if price is valid (not empty or undefined)
          if (price && typeof price === 'string' && price.trim() !== '') {
              const web3Modal = new Web3Modal();
              const connection = await web3Modal.connect();
              const provider = new ethers.providers.Web3Provider(connection);
              const signer = provider.getSigner();
              const contract = fetchContract(signer);
  
              const createItem = await contract.createShipment(
                  receiver,
                  new Date(pickupTime).getTime(),
                  distance,
                  ethers.utils.formatEther(price.toString()),
                  {   value:receiver,
                    value:pickupTime,
                    value:distance,
                      value: ethers.utils.formatUnits(ethers.utils.parseUnits(price, 18), 18), // Maintain full precision
                  }
              );
  
              await createItem.wait();
              console.log(createItem);
          } else {
              console.error("Error: Invalid price. Please provide a valid price value.");
          }
      } catch (error) {
          console.log("Error:", error);
      }
  };
const getAllShipment = async () =>{
try{
  const provider = new ethers.providers.JsonRpcProvider.send();
  const contract = fetchContract(provider);

  const shipments =  await contract.getAllTransactions();
  const allShipments = shipments.map((shipment) => ({
    sender: shipment.sender,
    receiver: shipment.receiver,
    price: ethers.utils.formatEther(shipment.price.toString()),
    pickupTime: shipment.pickupTime.toNumber(),
    deliveryTime: shipment.deliveryTime.toNumber(),
     distance: shipment.distance.toNumber(),
     isPaid: shipment.isPaid,
     status: shipment.status,
  }));

  return allShipments;
} catch (error){
  console.log("error needed");
}
};

const getShipmentsCount =  async() =>{
  try{
    if(!window.ethereum) return "Install metamask";

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const provider = new ethers.providers.JsonRpcProvider.send();
    const contract = fetchContract(provider);
    const shipmentsCount = await contract.getShipmentsCount(accounts[0]);
    return shipmentsCount.toNumber();
  }catch(error){
    console.log("error want,getting shipment");
  }
  };

  const completeShipment = async (completeShip) => {
  console.log(completeShip);

  const { receiver, index} =  completeShip;
  try{
    if(!window.ethereum) return "install metamask";
     const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
     });
     const web3Modal = new Web3Modal();
     const connection = await web3Modal.connect();
     const provider = new ethers.providers.Web3Provider(connection)
     const signer = provider.getSigner();
     const contract = fetchContract(signer);
     
     const transaction = await contract.completeShipment(
       accounts(0),
       receiver,
       index,
       {
        gasLimit:300000
       }
     );

     transaction.wait();
     console.log(transaction);
      }catch(error) {
console.log("wrong completeShipment",error);
      }
  };
  
  const getShipment = async (index) =>{
    console.log(index * 1);
    try{
      if(!window.ethereum) return "Install metamask";

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider =  new ethers.providers.JsonRpcProvider('http://localhost:3000/');
      const contract = fetchContract(provider);
      const shipment = await contract.getShipment(accounts[0],index * 1);

      const SingleShiplent = {
        sender: shipment[0],
        receiver: shipment[1],
        pickupTime: shipment[2].toNumber(),
        deliveryTime: shipment[3].toNumber(),
        distance: shhipment[4].toNumber(),
        price: ethers.utils.formatEther(shipment[5].toString()),
        status: shipment[6],
        isPaid: shipment[7],
      };

      return SingleShiplent;
    }catch(error){
      console.log("no shipment");
    }
    };

    const startShipment = async (getProduct) => {
      const {receiver, index} = getProduct;

      try{
        if(!window.ethereum) return "Install metamask";

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

      const web3Modal= new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      const contract = fetchContract(signer);
      const shipment = await contract.startShipment(
        accounts[0],
        receiver,
        index * 1
      );

      shipment.wait();
      console.log(shipment);
      } catch (error) {
        console.log("sorry no shipment",error);
      }
    };

    const checkIfWalletConnected = async () =>{
      try{
        if(!window.ethereum) return "Install metamask";

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if(accounts.length){
          setCurrentUser(accounts[0]);
        } else{
          return "no acc";
        }
      } catch (error){
        return "not connected";
      }
    };

   const connectWallet = async () =>{
    try{
      if(!window.ethereum) return "Install metamask";
      
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentUser(accounts[0]);
    } catch (error){
      return "sum went wrong";
    }
  };

  useEffect(()=> {
    checkIfWalletConnected();
  },[]);

  return (
    <TrackingContext.Provider
    value={{
      connectWallet,
      createShipment,
      getAllShipment,
      completeShipment,
      getShipment,
      startShipment,
      getShipmentsCount,
      DappName,
      currentUser,
    }}
    >
    {children}
    </TrackingContext.Provider>
    );
  };
