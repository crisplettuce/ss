import Head from 'next/head'
import {useEffect, useState} from 'react'
import managerABI from '../contract/abi/managerABI.json'
import { ethers } from "ethers";
import PostBox from '../components/post/postBox'
import { GiConsoleController } from 'react-icons/gi';
import { useSelector, useDispatch } from 'react-redux';

/*
  Main Feed Page
*/

export default function Main() {

  const isDemo = useSelector((state) => state.gState.demoVersion)

  const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/RaE87BYUbEikldKC0TenwQmvq065F7BI');
  const contract = process.env.CONTRACT_MUMBAI

  const[broadcasts, setBroadcasts] = useState([])

  useEffect(()=>{
   fetchBroadcastCount()
  },[])

  async function fetchBroadcastCount(){
    try{
      const manager = new ethers.Contract(contract, managerABI, provider);
      let totalCount = await manager.totalBroadcasts()
      console.log(parseInt(totalCount._hex))

      let instances = []
      for(let i = 0; i < totalCount; i++){
        let broadcast = await manager.BroadcastIndex(i)
        // create on object of the broadcast to pass it to the 'Post' display component
        let obj = {
          id: parseInt(broadcast[0]._hex),
          date:parseInt(broadcast[1]._hex),
          account: broadcast[2],
          topic: broadcast[3],
          title: broadcast[4],
          audio: broadcast[5],
          context: broadcast[6], 
          earnings: parseInt(broadcast[7]._hex)
      }
        instances.push(obj)
      }
      setBroadcasts(instances);

    } catch(e){
      console.log('trouble fetching broadcasts', e);
    }
  }

  return (
    <div style={{backgroundColor:'rgb(11,11,11)'}}>
      <Head>
        <title> {'{ subspaces }'}</title>
        <meta name="description" content="Voice Your Opinions"/>
        <link rel="icon" href="/favicon.ico" />
      </Head>
        {
          isDemo !== false ?
          
          samplePosts.map(post=>
            <PostBox arg={post}/>
          )
          
          :
          <>
          {
            broadcasts.length === 0 ? 
            <div style={{textAlign:'center', marginTop:'34vh', color:'White'}}>
            <p> 🎙 Loading . . . </p> 
            </div>
            :
              broadcasts.reverse().map(post=> {
                console.log('MP POST', post)
                return(
                  <PostBox arg={post}/>
                )
                
              }
              )
          }
          </>
         
        }
    </div>
  )
}

// FOR DEMO PURPOSES 

const samplePosts = [{
  topic:'crypto',
  title:'Debating the role of crypto regulation',
  account:'0x009D884Ae653a4338F276B724eA810C0CA5Edemo',
},
{
  topic:'traveling',
  title:'On my journeys around the world',
  account:'0x009D884Ae653a4338F276B724eA810C0CA5Edemo',
  context:''
},
{
  topic:'hacking',
  title:'Brainstorming new project ideas',
  account:'0x009D884Ae653a4338F276B724eA810C0CA5Edemo',
  context:''
},
{
  topic:'politics',
  title:'Thoughts on the upcoming midterms',
  account:'0x009D884Ae653a4338F276B724eA810C0CA5Edemo',
  context:''
},
{
  topic:'television',
  title:'Interesting take on the new LOTR series',
  account:'0x009D884Ae653a4338F276B724eA810C0CA5Edemo',
  context:''
},
]
