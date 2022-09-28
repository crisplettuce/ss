import {useEffect, useState} from 'react'
import {BiLike} from "react-icons/bi"
import { useDispatch } from 'react-redux';
import { setBroadcastWindow } from '../state/slice';
import { useAccount, usePrepareContractWrite ,useContractWrite } from "wagmi";
import managerABI from '../../contract/abi/managerABI.json'
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/RaE87BYUbEikldKC0TenwQmvq065F7BI');
const contract = process.env.CONTRACT_MUMBAI;

export default function LikeButton({arg}){

  const [expand, setExpand] = useState(false);
  const [likes, setLikes] = useState('');

  const { config, error } = usePrepareContractWrite({
    addressOrName: contract,
    chainId: 80001,
    contractInterface: managerABI,
    functionName: 'like',
    args:[arg]
  })
  const { write, isLoading, isSuccess, data } = useContractWrite(config)

    const dispatch = useDispatch();
    const { address } = useAccount();

    useEffect(()=>{
     checkLikes()
    },[data,isSuccess])

    async function checkLikes(){
      const manager = new ethers.Contract(contract, managerABI, provider);
      let result = await manager.getBroadcastLikes(arg)
      setLikes(result.length)
    }

    async function didLike(){
      const manager = new ethers.Contract(contract, managerABI, provider);
      let result = await manager.BroadcastLikes(arg, address)
      console.log('didLike', result)
    }

    function isActive(){
      if(address === undefined || address === null){
          alert('Connect Account to Like')
      }
      else {
        let x = didLike()
        if(x === true){
          return;
        } else {
          write?.()
        }
      } 
    }

    return(
    <div style={{display:'inline'}}>
        <button style={{cursor:'pointer', marginRight:'1vw', color:'black'}} onClick={()=>isActive()}><BiLike/> {likes}</button>
    </div>
    )
}