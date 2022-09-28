import { useEffect, useState } from "react"
import { useRouter } from 'next/router'
import {BiUserVoice} from 'react-icons/bi'
import PostBox from "../../components/post/postBox"
import Moralis from "moralis"
import { EvmChain } from '@moralisweb3/evm-utils';
import managerABI from "../../contract/abi/managerABI.json"
import { ethers } from "ethers";

/*
    Page for showing selected broadcast [#topic]
*/

export default function Topic(){

    const router = useRouter()

    const[topic, setTopic] = useState('')
    const[broadcasts, setBroadcasts] = useState([])

    const[mentions, setMentions] = useState([])


    useEffect(()=>(
        // set path once router is loaded
        setTopic(router.asPath.slice(9))
    ),[router.isReady])

    useEffect(()=>{
       
     fetchTopicEvents()
    
   },[topic])

   useEffect(()=>{
    console.log(broadcasts)   
  },[broadcasts])


  
   async function fetchTopicEvents(){

    const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/RaE87BYUbEikldKC0TenwQmvq065F7BI');
    const contract = process.env.CONTRACT_MUMBAI   

    const manager = new ethers.Contract(contract, managerABI, provider);
    let result = await manager.queryFilter('NewBroadcast')
    result.map(async arg =>{
        //console.log(parseInt(arg.args[0]._hex))
        let index = parseInt(arg.args[0]._hex) - 1;
        let toCheck = await manager.BroadcastIndex(index);
        let curTopic = topic;
        //console.log('X', toCheck[3])
        if(toCheck[3] === curTopic){
            //etBroadcasts(cur => [...cur, toCheck]);
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
            setBroadcasts(cur => [...cur, obj]);

        } else {
            console.log('nomatch')
        }
    })

       /* [revise]
       await Moralis.start({
            apiKey: process.env.MORALIS_API_KEY,
        });

        let contract = '0x6F8b65774dFFd2d4F9774d913e29b0b4A98b20e2'
        let chain = EvmChain.MUMBAI

        const response = await Moralis.EvmApi.events.getContractLogs({
            contract,
            chain,
        });

        console.log(response.result);*/
       
   }

    return(
        <div>
            <div style={{textAlign:'center', color:'white', marginTop:'15vh'}}>
            <h1 style={{fontWeight:'300', fontSize:'70px'}}> {'#' + topic} </h1>

            {
                 broadcasts.length === 0 ?
                 null
                 :
                 <>
                 <span> {broadcasts.length + ' broadcasts found'}</span> <span><BiUserVoice/></span>
                 </>
            }
               
               
            </div>

            <div style={{marginTop:'10vh'}}>
                   {
                       broadcasts.length === 0 ?
                       <div  style={{marginTop:'20vh', color:'white', textAlign:'center'}}>
                       <p> No Broadcasts Found  </p>
                       </div>
                       :
                       <div style={{marginTop:'3vh'}}>
                       {
                           broadcasts.map(post=>{
                               return(
                                   <PostBox arg={post}/>
                               )
                           })
                       }
                       </div>
                    }
               </div>
        </div>
    )
}

