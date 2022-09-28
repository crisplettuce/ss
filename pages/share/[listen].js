import { useEffect, useState } from "react"
import { useRouter } from 'next/router'
import { BsShare } from "react-icons/bs";
import managerABI from '../../contract/abi/managerABI.json'
import { ethers } from "ethers"
import PostBox from '../../components/post/postBox'
import Moralis from "moralis"
import { EvmChain } from '@moralisweb3/evm-utils';

/*
    Page for displaying shared broadcast links
*/

export default function Listen(){

    const router = useRouter()

    const[id, setID] = useState('')
    const[postInstance, setPostInstance] = useState('')
   

    useEffect(()=>(
        console.log('PATH', router.asPath.slice(7)),
        setID(parseInt(router.asPath.slice(7)))
    ),[router.isReady])

    useEffect(()=>{
        fetchPostInstance()
    },[id])

 
    async function fetchPostInstance(){
            //console.log('IDD', id)
            if(id <= 0){
                return;
            }
            try{
            const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/RaE87BYUbEikldKC0TenwQmvq065F7BI');
            const contract = process.env.CONTRACT_MUMBAI   

            const manager = new ethers.Contract(contract, managerABI, provider);
            let index = parseInt(id) - 1;
           
            let toCheck = await manager.BroadcastIndex(index)
               
            let obj = {
                id: parseInt(toCheck[0]._hex),
                date:parseInt(toCheck[1]._hex),
                account: toCheck[2],
                topic: toCheck[3],
                title: toCheck[4],
                audio: toCheck[5],
                context: toCheck[6], 
                earnings: parseInt(toCheck[7]._hex)
            }

                setPostInstance(obj);
            } catch(e){
                console.log(e)
            }
           
          /* [revise]
             await Moralis.start({  
                 apiKey: process.env.MORALIS_API_KEY,  
             });

             let contract = '0x9507a4C004Ffb6BF103fD09412C0A309279DF57B'
             let chain = EvmChain.MUMBAI

             const response = await Moralis.EvmApi.events.getContractLogs({
                 contract,
                 chain,
             });
             console.log(response.result);
             */
        }
        
    return(
        <div>

            <div style={{textAlign:'center', color:'white', marginTop:'15vh', marginBottom:'10vh'}}>
             <h1 style={{fontWeight:'300'}}> Listen to this Broadcast <BsShare/>  </h1>
            </div>

            <div style={{textAlign:'center'}}>
               
                {
                postInstance === '' ?

                null
                :
                 <PostBox arg={postInstance}/>
                 
                }
          
            </div>

           
        </div>
    )
}