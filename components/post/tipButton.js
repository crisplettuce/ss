import {useEffect, useState} from 'react'
import {GrMoney} from "react-icons/gr"
import { useDispatch } from 'react-redux';
import { setBroadcastWindow } from '../state/slice';
import { useAccount, usePrepareContractWrite ,useContractWrite } from "wagmi";
import managerABI from '../../contract/abi/managerABI.json'
import { ethers } from "ethers";
import Moralis  from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';

const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/RaE87BYUbEikldKC0TenwQmvq065F7BI');
const contract = process.env.CONTRACT_MUMBAI

export default function TipButton({arg}){

    const [expand, setExpand] = useState(false);
    const [maticPrice, setMaticPrice] = useState('')
    const [tipAmount, setTipAmount] = useState('0.01')

    const dispatch = useDispatch();

    const { address } = useAccount();

    const { config, error } = usePrepareContractWrite({
      addressOrName: contract,
      chainId: 80001,
      contractInterface: managerABI,
      functionName: 'tip',
      args:[arg],
      overrides: {
        from: address,
        value: ethers.utils.parseEther(tipAmount),
      },

    })
    const { write } = useContractWrite(config)

    /*
      Tip only fires if user has sufficient balance 
    */
   

    useEffect(()=>{
      //getMaticPrice()
    },[])

    // use to convert to USD 
    async function getMaticPrice(){

      const maticAddressETH = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
      const chain = EvmChain.ETHEREUM

      await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,
      });

      const response = await Moralis.EvmApi.token.getTokenPrice({
        maticAddressETH,
        chain,
      });
      /*const nativeBalance = await Moralis.EvmApi.balance.getNativeBalance({
        address,
      });*/

      console.log('current matic price', response);
    }

    function handleTipAmount(event){
      if(event.target.value === ''){
        return;
      } else{     
         setTipAmount(event.target.value);
      }
    }

    function handleTipSubmit(){
      if(tipAmount <= 0){
        alert('invalid input')
      } else {
          write?.()
      }
    }
  
    function isActive(){
    if(address === undefined || address === null){
        alert('Connect Account to Leave a Tip')
    }
        else {
        setExpand(true)
        dispatch(setBroadcastWindow(true)) 
        } 
    }

    async function getBalance(){
        const user = address;
        const chain = EvmChain.MUMBAI;
        await Moralis.start({
            apiKey: process.env.MORALIS_API_KEY,
        });
        const response = await Moralis.EvmApi.balance.getNativeBalance({
            user,
            chain,
        });
        console.log(response.result);
    }

    return(
    <div style={{display:'inline'}}>
    <button style={{cursor:'pointer', marginRight:'1vw',color:'black'}} onClick={()=>isActive()}><GrMoney/></button>
    {
        expand === false ? 
        null
        :
        <dialog open style={{backgroundColor:'rgb(20,20,21)', display:'relative', zIndex:'1', marginTop:'2vh', borderTop:'0px', height:'50vh', width:'96vw'}}>
            <div style={{height:'38vh', display:'grid', textAlign:'center'}}>
              <div style={{marginTop:'8vh'}}>
              <h3 style={{color:'white', fontWeight:'300'}}> Send a Tip </h3>
              <input type="number" min="0" onChange={handleTipAmount} placeholder="Enter Amount"></input>
              <div>
              <button style={{padding:'5px 10px', marginTop:'2vh', cursor:'pointer'}} onClick={()=>handleTipSubmit()} > Tip</button>
              </div>
              </div>
            </div>
            <div>    
              <button onClick={()=>{setExpand(false), dispatch(setBroadcastWindow(false))}}>x</button>
            </div>
        </dialog>
    
    }
    </div>
    )
}


