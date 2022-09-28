import Image from 'next/image'
import styles from '../../styles/Components.module.css'
import {useEffect, useState} from 'react'
import {GrChatOption, GrMoney} from "react-icons/gr"
import { BsPersonCircle } from "react-icons/bs";
import { useDispatch } from 'react-redux';
import { setBroadcastWindow } from '../state/slice';
import { useAccount, usePrepareContractWrite ,useContractWrite } from "wagmi";
import managerABI from '../../contract/abi/managerABI.json'
import { ethers } from "ethers";
import MicRecorder from 'mic-recorder-to-mp3';
import { Web3Storage } from 'web3.storage'
import ConnectButton from '../connectButton';
import Mic from '../../assets/platform/mic.png'

const provider = new ethers.providers.JsonRpcProvider('https://polygon-mumbai.g.alchemy.com/v2/RaE87BYUbEikldKC0TenwQmvq065F7BI');
const contract = process.env.CONTRACT_MUMBAI


export default function ReplyButton({arg}){

    const dispatch = useDispatch();
    const { address } = useAccount();
  
    const[screenSize, setScreenSize] = useState('')
  
    const [expand, setExpand] = useState(false);
    const[replies, setReplies] = useState('')
    const[replyModal, setReplyModal] = useState(false);
  
    // recording screen states
    const [recorder, setRecorder] = useState({})
    const [player, setPlayer] = useState('')
    const [liveStatus, setLiveStatus] = useState(false) 
    const [statusBlinker, setStatusBlinker] = useState('')
    const [audioCID, setAudioCID] = useState('')
    const [pos, setPos] = useState('Record') 
  
    const { config, error } = usePrepareContractWrite({
      addressOrName: contract,
      chainId: 80001,
      contractInterface: managerABI,
      functionName: 'reply',
      args:[arg, audioCID]
    })
    const { write, isLoading, isSuccess, data } = useContractWrite(config)
  
  
    useEffect(()=>{
      setScreenSize( window.innerWidth)
      window.addEventListener("resize", (event) => {
        setScreenSize( window.innerWidth)
      });
     
    },[screenSize])
  
  
    useEffect(()=>{
      checkReplies()
    },[isSuccess, data])

  
      /*****************  Recording Functionality ******************/
  
    useEffect(()=>{
      // initialize recorder
      setRecorder(new MicRecorder({bitRate:128}))
    },[])
  
  
    // Record Voice 🎙
    function talkScreen(){
  
      function blinker(){
        if(statusBlinker === '') {
          return <button style={{backgroundColor:'rgb(20,20,21)', border:'0px'}}><div className={styles.blobsContainer}><div className={`${styles.blob} ${styles.idle}`}></div></div></button>
        }
        else if(statusBlinker === 'active') {
          return <div style={screenSize > 500 ? null : {display:'flex'}}><button style={{backgroundColor:'rgb(20,20,21)', border:'0px'}}><div className={styles.blobsContainer}><div className={`${styles.blob} ${styles.red}`}></div></div></button></div>
        } 
        else if(statusBlinker === 'captured') {
          return <button style={{backgroundColor:'rgb(20,20,21)', border:'0px'}}><div className={styles.blobsContainer}><div className={`${styles.blob} ${styles.green}`}></div></div></button>
        }
      }
  
      return(
        
         address === null || address === undefined ? 
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
        <div>
  
          <div style={{marginTop:'5vh', marginLeft:'auto', marginRight:'auto', width:'15vw', textAlign:'center'}}>
            {
              blinker()
            }
          </div>
        {
  
          audioCID === '' ?
  
          <div style={{marginTop:'5vh', marginBottom:'10vh', textAlign:'center'}}>
          <button style={{ backgroundColor:'red', color:'white', fontWeight:'400', padding:'15px 15px', cursor:'pointer'}} onClick={liveStatus === false ? startRecording : stopRecording}> {pos} </button> 
          </div>
  
          :
          <div style={{marginTop:'5vh', marginBottom:'10vh', textAlign:'center'}}>
          <button style={{ width:'20vw'}} onClick={playRecording}>
              play
          </button>
          <div style={{marginTop:'2vh'}}>
          <button  style={{backgroundColor:'red', color:'white', fontWeight:'400', padding:'2px 10px'}} onClick={()=>{setAudioCID(''), setStatusBlinker('')}}>
              redo
          </button>
          </div>
          </div>
          }
     
    </div>
       
    
      )
    }
  
  
    function startRecording(){
  
        // begin streaming from microphone
        recorder.start().then(() => {
  
            setLiveStatus(true)
            setStatusBlinker('active')
            setPos('Stop')
  
  
        }).catch((e) => {
            console.error(e);
            alert('Must Enable Microphone Access to Create Post');
        });
  
    } 
  
    function stopRecording(){
  
        // package audio into a file to be stored 
        recorder.stop().getMp3().then(async ([buffer, blob]) => {
  
        // create file from audio
        const newfile = new File(buffer, 'voiceMemo.mp3', {
            type: blob.type,
            lastModified: Date.now()
        });
  
        // store with IPFS to link with post
        let ipfsLink = await submitToIPFS([newfile])
        setAudioCID(ipfsLink)
  
        setLiveStatus(false)
        setStatusBlinker('captured')
        setPos('Record')
  
        // load for playback
        setPlayer(new Audio(URL.createObjectURL(newfile)))
  
        }).catch((e) => {
            alert('We could not retrieve your message');
            console.log(e);
        });
    }
  
    function playRecording(){
        try{
            player.play();
        } catch(e){
            console.log(e)
        }
    }
  
  
   /*****************  IPFS (WEB3.Storage) Handling ******************/
      
      // note: for fast CID retrieval use the following gateway => https://w3s.link/ipfs/bafybeicuzqoydl37yuip6rpway5xkdsziygcsqolggvvpsnytvfe26pkim/voiceMemo.mp3
    function makeStorageClientIPFS () {
        return new Web3Storage({ token:process.env.WEB3STORAGE_TOKEN})
    }
    async function submitToIPFS(file) {
        const client = makeStorageClientIPFS();
        const cid = await client.put(file);
        let linkFormat = 'https://w3s.link/ipfs/' + cid;
       // console.log(linkFormat)
        return linkFormat;
    }
  
    async function checkReplies(){
      const manager = new ethers.Contract(contract, managerABI, provider);
      let replies = await manager.getBroadcastReplies(arg)
      replies.map(async user=>{

        let userResponse = await manager.BroadcastReplies(arg,user, 0);
        //console.log('UR', userResponse);
        let obj = {user:user,reply:userResponse}
        //setReplies(obj)
        setReplies(cur => [...cur, obj]);
      })
      //console.log('replies', replies)
      //setReplies(replies)
    }
  
    function handleReplySubmit(){
          write?.()
          setReplyModal(false)
          setAudioCID('')
    }
  
  
      return(
      <div style={{display:'inline'}}>
      <button style={{cursor:'pointer', marginRight:'1vw',color:'black'}} onClick={()=>{setExpand(true), dispatch(setBroadcastWindow(true))}}><GrChatOption/> {replies.length} </button>
      {
          expand === false ? 
          null
          :
          
          <dialog open style={{backgroundColor:'rgb(20,20,21)', display:'relative', zIndex:'1', marginTop:'2vh', borderTop:'0px', height:'50vh', width:'96vw', overflowY:'scroll'}}>
            <div style={{textAlign:'right'}}>
            <button style={{color:'black'}} onClick={()=>{setExpand(false), setReplyModal(false), setAudioCID(''), setStatusBlinker(''), dispatch(setBroadcastWindow(false))}}>x</button>  
            </div>
          
          <div style={{overflowY:'scroll', display:'grid',color:'white', }}>
            {
  
              replyModal === false ?
              
            <>
              {
                replies.length === 0 ?
                <div style={{textAlign:'center', marginTop:'10vh', marginBottom:'10vh'}}>
                  <p>No Responses Yet 👤</p> 
                </div>
                :
                replies.map(inst=>{
                    return(
                    <div style={{ display:'grid', gridTemplateColumns:'auto auto', alignItems:'center', height:'15vh', width:'90vw', borderBottom:'0.5px solid gray', marginLeft:'auto', marginRight:'auto', padding:'35px 20px'}}> 
                     
                      <div style={{marginLeft:'-10px', marginRight:'10px'}}>
                      <audio controls>
                          <source src={inst.reply+'/voiceMemo.mp3'}></source>
                        </audio>
                      </div>

                      <div style={{ diaplay:'grid', textAlign:'right'}}>
                      <p style={screenSize > 500 ? {fontSize:'17px'}:{fontSize:'2.5vw'}}>{inst.user.substring(0,5)+'...'+inst.user.substring(38,42)}</p>
                      </div>
                    </div>
                    )
                })
              }
              </>
              :
              talkScreen()
  
            }
          </div>
          <div style={{padding:'5px 0px'}}>    
            <div style={{display:'grid'}}>
              {
                replyModal === false ?
                <button style={{height:'5vh', cursor:'pointer', color:'black'}} onClick={()=>setReplyModal(true)} > Respond 🎙</button>
                  :
                <button onClick={()=>handleReplySubmit()}> Submit ✅ </button>
              }
            </div>
          </div>
          </dialog>
      
      }
      </div>
      )
  }