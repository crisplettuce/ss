import Image from "next/image"
import {useEffect, useState} from "react"
import ConnectButton from '../components/connectButton'
import { useAccount } from "wagmi";
import { BsPersonCircle } from "react-icons/bs";
import Mic from "../assets/platform/mic.png"
import managerABI from '../contract/abi/managerABI.json'
import { ethers } from "ethers";
import PostBox from '../components/post/postBox'
import Moralis  from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils';

export default function Profile(){

    const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/RaE87BYUbEikldKC0TenwQmvq065F7BI');
    const contract = process.env.CONTRACT_MUMBAI

    const manager = new ethers.Contract(contract, managerABI, provider);

    const { address, isConnecting, isDisconnected } = useAccount();
    const [currentTab, selectTab] = useState('broadcasts')
    const[screenSize, setScreenSize] = useState('')

    const[broadcastIDs, setIDs] = useState([])
    const[broadcastInstances, setBroadcastInstances] = useState([])
    const[earnings, setEarnings] = useState('')
    const[likedPostsIds, setLikedPostIds] = useState([])
    const[likeInstances, setLikeInstances] = useState([])
    const[repliedPostsIds, setRepliedPostIds] = useState([])
    const[repliedPostsInstances, setRepliedInstances] = useState([])

    
    // upon render
    useEffect(()=>{
        setScreenSize( window.innerWidth)
        window.addEventListener("resize", (event) => {
          setScreenSize( window.innerWidth)
        });
    },[screenSize])

    //upon loading/connecting
    useEffect(()=>{
       
        fetchBroadcastIds()
        fetchUserEarnings()
        fetchUserInteractionIds()
        
    },[address])

    // upon fetching user broadcasts
    useEffect(()=>{
        fetchBroadcastInstances()
    },[broadcastIDs])

    // upon fetching user broadcasts
    useEffect(()=>{
        fetchLikedInstances()
    },[likedPostsIds])

     // upon fetching user broadcasts
     useEffect(()=>{
        fetchReplyInstances()
    },[repliedPostsIds])

    async function fetchBroadcastIds(){
        try{
        if(address === null || address === undefined) {
            return;
        } else{
            let allBroadcasts = await manager.getUserBroadcasts(address)
            //console.log(allBroadcasts)
            setIDs(allBroadcasts)
        }
        } catch(e){console.log(e)}
    }

    async function fetchBroadcastInstances(){
        if(broadcastIDs.length === 0){
            return;
        } else {
            broadcastIDs.map(async arg=>{
                try{
                    let index = parseInt(arg._hex) - 1;
                    let broadcast = await manager.BroadcastIndex(index)
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
                    setBroadcastInstances(cur => [...cur, obj]);
                }catch(e){
                    console.log('error fetching broadcasts', e)
                }
            })
        }
    }

    async function fetchUserInteractionIds(){
        try{
            if(address === null || address === undefined) {
                return;
            } else{
                let interactionIDs = await manager.getUserInteractions(address)
                interactionIDs.map(async arg=>{
                    // bool
                    let index = parseInt(arg._hex) - 1;
                    let didLike = await manager.BroadcastLikes(index, address)
                    //console.log('didlike',parseInt(arg._hex), didLike)
                    // array of responses
                    let didRespond = await manager.getUserReplies(address, parseInt(arg._hex))
                    console.log('didrespond', parseInt(arg._hex), didRespond )
                    if(didLike === true){
                        setLikedPostIds(cur => [...cur, parseInt(arg._hex)])
                    }
                    if(didRespond.length > 0){
                        setRepliedPostIds(cur => [...cur, parseInt(arg._hex)])
                    }
                })
            }
        } catch(e){
            console.log(e)
        }
    }

    async function fetchLikedInstances(){
        try{
            if(likedPostsIds.length === 0){
                return;
            } else {
                likedPostsIds.map(async arg=>{
                    try{
                        let index = arg - 1;
                        let broadcast = await manager.BroadcastIndex(index)
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
                        setLikeInstances(cur => [...cur, obj]);
                    }catch(e){
                        console.log('error fetching broadcasts', e)
                    }
                })
            }
        } catch(e) {
            console.log(e)
        }
    }

    async function fetchReplyInstances(){
        try{
        if(repliedPostsIds.length === 0){
            return;
        } else {
            repliedPostsIds.map(async arg=>{
                try{
                    let index = arg - 1;
                    let broadcast = await manager.BroadcastIndex(index)
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
                    setRepliedInstances(cur => [...cur, obj]);
                }catch(e){
                    console.log('error fetching broadcasts', e)
                }
            })
        }
        } catch (e) {console.log(e)}
    }

    async function fetchUserEarnings(){
        try{
        if(address === null || address === undefined) {
            return;
        } else{
            let profile = await manager.UserProfile(address)
            //console.log('profile tips', parseInt(profile[4]._hex))
            setEarnings(parseInt(profile[4]._hex))
        }
        } catch(e){console.log(e)}
    }

    /*async function fetchTransactions(){

        const user = address;
        const chain = EvmChain.POLYGON;

        await Moralis.start({
            apiKey: process.env.MORALIS_API_KEY,
            // ...and any other configuration
        });

        const response = await Moralis.EvmApi.transaction.getWalletTransactions({
            user,
            chain,
        });
        console.log(response.result);
    }*/
    /****************  Profile Screen Tabs */ 

    function broadcastsTab(){
        return(
               <div>
                   {
                       broadcastIDs.length === 0 ?
                       <div  style={{marginTop:'20vh', color:'white'}}>
                       <p> No Broadcasts Created Yet  </p>
                       </div>
                       :
                       <div style={{marginTop:'3vh'}}>
                       {
                           broadcastInstances.map(post=>{
                               return(
                                  
                                   <PostBox arg={post}/>
                               )
                           })
                       }
                       </div>
                    }
               </div>
        )
    }

    function likedTab(){
        return(
           <div>
            {
                likedPostsIds.length === 0 ?
                <div  style={{marginTop:'20vh', color:'white'}}>
                <p> No Broadcasts Liked  </p>
                </div>
                :
                <div style={{marginTop:'3vh'}}>
                {
                    likeInstances.map(post=>{
                        return(
                           
                            <PostBox arg={post}/>
                        )
                    })
                }
                </div>
             }
             </div>
        )
    }

    function repliedTab(){
        return(
            <div>
            {
                repliedPostsIds.length === 0 ?
                <div  style={{marginTop:'20vh', color:'white'}}>
                <p> No Broadcasts Responded to  </p>
                </div>
                :
                <div style={{marginTop:'3vh'}}>
                
                {
                    // display from most recent
                    repliedPostsInstances.reverse().map(post=>{
                        return(
                           
                            <PostBox arg={post}/>
                        )
                    })
                }
                </div>
             }
             </div>
        )
    }

    function tipsTab(){
        return(
            <div style={{display:'grid'}}>
                {
                    earnings === 0 ?
                    <div style={{marginTop:'10vh', color:'white'}}>
                    <h1> 0 </h1>
                    <p> Try Making Some Broadcasts 🎙</p>
                    </div>
                    :
                    <div style={{marginTop:'5vh', color:'white'}}>
                    <h1> {earnings} </h1>
                    <h2> Total Earnings </h2>
                    </div>
                }
            </div>
        )
    }

    function tabRender(){
        if(currentTab === 'broadcasts'){
            return broadcastsTab()
        } else if(currentTab === 'liked') {
            return likedTab()
        } else if (currentTab === 'replied') {
            return repliedTab()
        }
        else if (currentTab === 'tips') {
            return tipsTab()
        }
    }

    return (
        <div style={{textAlign:'center', width:'100%'}}>
            {
                address === undefined || address === null ? 
                <div style={{marginTop:'20vh', display:'grid', color:'white'}}>
                    <div style={{textAlign:'center'}}>
                    <p> Connect Polygon Account to Proceed</p>
                    <ConnectButton/>
                    </div>
                    <div style={{height:'50vh', textAlign:'right', overflow:'hidden', opacity:'20%'}}>
                    <div style={screenSize > 500 ? {width:'380px', marginTop:'5vh', marginLeft:'auto'}:{width:'110vw', marginLeft:'10vw', marginTop:'5vh'}}> <Image src={Mic} ></Image></div>
                    </div>
                </div>
                :
                <div style={{marginTop:'10vh'}}>

                    <button style={{backgroundColor:'rgb(11,11,11)', color:'white', border:'0px', transform:'scale(6)'}}>
                    <BsPersonCircle/>
                    </button>
                    <div style={{marginTop:'10vh'}}>
                        <ConnectButton/>
                        <div style={{height:'10vh', width:'90%', padding:'15px 0px', marginLeft:'auto', marginRight:'auto', borderTop:'0.5px solid gray',borderBottom:'0.5px solid gray', marginTop:'5vh'}}>  
                        <button style={buttonStyle} onClick={()=>{selectTab('broadcasts')}}> Broadcasts </button>
                        <button style={buttonStyle} onClick={()=>selectTab('liked')}> likes </button>
                        <button style={buttonStyle} onClick={()=>selectTab('replied')}> Replies </button>
                        <button style={buttonStyle} onClick={()=>selectTab('tips')}> Earnings </button>
                        {/* <button onClick={()=>selectTab('send')}> Message </button> */}
                        </div>
                    </div>
                    <div style={{height:'45vh', backgroundColor:'rgb(11,11,11)', display:'grid'}}>
                        {
                            tabRender()
                        }
                    </div>
                </div>
            }
        </div>
    )
}



const buttonStyle={
    cursor:'pointer',
    color:'black',
    marginRight:'1vw'
}