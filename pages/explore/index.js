import Link from 'next/link'
import {useEffect, useState} from 'react'
import {useRouter} from 'next/router'
import { createSlice } from '@reduxjs/toolkit'
import { useSelector, useDispatch } from 'react-redux';
import Moralis from "moralis"
import { EvmChain } from '@moralisweb3/evm-utils';
import managerABI from "../../contract/abi/managerABI.json"
import { ethers } from "ethers";

// demo topics
let sampleTopics = ["#markets","#science","#news","#gaming", '#thesearedemos','#technology',"#moralis","#politics","crypto"]

export default function Explore(){

    const isDemo = useSelector((state) => state.gState.demoVersion)

    const router = useRouter()
    const[query, setQuery] = useState('')
    const[topics, setTopics] = useState([])

    useEffect(()=>{
        fetchTopics()
    },[])

    function handleQueryChange(event) {
        setQuery(event.target.value)
    }

    function handleSubmit() {
        router.push({
            pathname: '/explore/[topic]',
            query: { topic: query },
          })
      }

      async function fetchTopics(){

        const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/RaE87BYUbEikldKC0TenwQmvq065F7BI');
        const contract = process.env.CONTRACT_MUMBAI   
    
        const manager = new ethers.Contract(contract, managerABI, provider);
        let result = await manager.queryFilter('NewBroadcast')

        result.map(async arg =>{
            //console.log(parseInt(arg.args[0]._hex))
            let index = parseInt(arg.args[0]._hex) - 1;
            let toCheck = await manager.BroadcastIndex(index);
            console.log('topics', toCheck[3])
            setTopics(cur => [...cur, toCheck[3]]);
          
        })

      }

    return (
        <div style={{padding:'0px 20px'}}>

        <div style={{textAlign:'center', marginTop:'15vh'}}>
            <h1  style={{color:'white', fontWeight:'300'}}> Explore Topics </h1>
            <input 
            type="text" 
            placeholder="#"  
            onChange={handleQueryChange}
            style={{textAlign:'center', width:'90%'}}>
            </input>
            <div>
            <Link href={"/explore/"+query}>
            <button style={{marginTop:'3vh', cursor:'pointer'}}> Search</button>
            </Link>
            </div>
        </div>

        <div style={{marginTop:'10vh', marginLeft:'5vw', color:'gray', overflow:'auto'}}>
            <p> Recent mentions: </p> 
            <div style={{display:'flex', flexWrap:'wrap', justifyContent:'center', marginTop:'5vh'}}>
                {
                    isDemo !== false ?

                    sampleTopics.map(arg=>{
                       return(
                           <Link href={"/explore/"+arg.slice(1)}>
                           <button style={{cursor:'pointer', margin:'10px 10px', fontSize:'3vw', backgroundColor:'rgb(11,11,11)', border:'0px', color:'gray'}}> {arg} </button>
                           </Link>
                       )
                    })
                    :
                    
                        topics.length === 0 ?
                       null
                       :
                       topics.map(arg=>{
                           return(
                            <Link href={"/explore/"+arg}>
                            <button style={{cursor:'pointer', margin:'10px 10px', fontSize:'3vw', backgroundColor:'rgb(11,11,11)', border:'0px', color:'gray'}}> {'#'+arg} </button>
                            </Link>
                           )
                       }) 
                    
                }
            </div>
        </div>
    </div>
    )
}