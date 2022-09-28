import { useEffect, useState } from "react";
import {GiOldMicrophone, GiPlainCircle} from "react-icons/gi"
import {BsInfoCircle} from "react-icons/bs"
import {BiHash} from "react-icons/bi"
import styles from '../styles/Components.module.css'
import MicRecorder from 'mic-recorder-to-mp3';
import { Web3Storage } from 'web3.storage'
import { useDispatch, useSelector} from 'react-redux';
import { setBroadcastWindow } from './state/slice';
import ConnectButton from "./connectButton";
import { useAccount } from "wagmi";
import { usePrepareContractWrite, useContractWrite } from 'wagmi'
import Image from "next/image"
import Mic from '../assets/platform/mic.png'
import managerABI from '../contract/abi/managerABI.json'


/*  'Quick Broadcast' Button (and everything in between-stc)
  - Simple Process
    + click button
    + record broadcast
    + set details/account
    + publish
*/

const contract = process.env.CONTRACT_MUMBAI

export default function BroadcastButton() {

  const dispatch = useDispatch();

  const isBroadcasting = useSelector((state) => state.gState.broadcastingWindow)

  // main popup state
  const[talkModal, expandTalkModal] = useState(false)
  const[screenSize, setScreenSize] = useState('')

  // flow screen state
  const[flowScreen, setFlowScreen] = useState('talk')
  
  // recording screen states
  const [recorder, setRecorder] = useState({})
  const [player, setPlayer] = useState('')
  const [liveStatus, setLiveStatus] = useState(false) 
  const [statusBlinker, setStatusBlinker] = useState('')
  const [pos, setPos] = useState('Record') 

  // broadcast details
  const [recording, setRecording] = useState('') 
  const [topic, setTopic] = useState('')
  const [title, setTitle] = useState('')
  const [context, setContext] = useState('')

   // WAGMI stuff
   const { address } = useAccount();
   // Deployed Contract on Mumbai Testnet
   const { config, error } = usePrepareContractWrite({
     addressOrName: contract,
     chainId: 80001,
     contractInterface: managerABI,
     functionName: 'createBroadcast',
     args:[topic, title, recording, context]
   })
   const { write, isLoading, isSuccess, data } = useContractWrite(config)

  useEffect(()=>{
    setScreenSize( window.innerWidth)
    window.addEventListener("resize", (event) => {
      setScreenSize( window.innerWidth)
    });
  },[screenSize])

  /*****************  Recording Functionality ******************/

  useEffect(()=>{
    // initialize recorder
    setRecorder(new MicRecorder({bitRate:128}))
  },[])

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
      setRecording(ipfsLink)

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
    
    // note: for fast CID retrieval use the following gateway => https://w3s.link/ipfs/{cid}/voiceMemo.mp3
  function makeStorageClientIPFS () {
      return new Web3Storage({ token:process.env.WEB3STORAGE_TOKEN})
  }
  async function submitToIPFS(file) {
      const client = makeStorageClientIPFS();
      const cid = await client.put(file);
      let linkFormat = 'https://w3s.link/ipfs/' + cid;
      return linkFormat;
  }

  /***************** Broadcast Flow Screens ******************/


  // Record Voice 🎙
  function talkScreen(){

    function blinker(){
      if(statusBlinker === '') {
        return <button style={{backgroundColor:'rgb(11,11,11)', border:'0px'}}><div className={styles.blobsContainer}><div className={`${styles.blob} ${styles.idle}`}></div></div></button>
      }
      else if(statusBlinker === 'active') {
        return <div style={screenSize > 500 ? null : {display:'flex'}}><button style={{backgroundColor:'rgb(11,11,11)', border:'0px'}}><div className={styles.blobsContainer}><div className={`${styles.blob} ${styles.red}`}></div></div></button></div>
      } 
      else if(statusBlinker === 'captured') {
        return <button style={{backgroundColor:'rgb(11,11,11)', border:'0px'}}><div className={styles.blobsContainer}><div className={`${styles.blob} ${styles.green}`}></div></div></button>
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
      <div style={{textAlign:'center'}}>
      <button style={{backgroundColor:'rgb(11,11,11)', color:'white', border:'0px', transform:'scale(12)', marginTop:'23vh', cursor:'pointer'}}>
        <GiOldMicrophone/>
      </button>
      </div>

      {

        recording === '' ?

        <div style={{marginTop:'18vh', textAlign:'center'}}>
        <button style={{ backgroundColor:'red', color:'white', fontWeight:'400', padding:'15px 15px', cursor:'pointer'}} onClick={liveStatus === false ? startRecording : stopRecording}> {pos} </button> 
        </div>

        :
        <div style={{marginTop:'18vh',  textAlign:'center'}}>
        <button style={{ cursor:'pointer', width:'20vw'}} onClick={playRecording}>
            play
        </button>
        <div style={{marginTop:'2vh'}}>
        <button  style={{cursor:'pointer', backgroundColor:'red', color:'white', fontWeight:'400', padding:'2px 10px'}} onClick={()=>{setRecording(''), setStatusBlinker('')}}>
            redo
        </button>
        </div>
        </div>

        }
        <div style={{marginTop:'8vh', marginLeft:'auto', marginRight:'auto', width:'15vw', textAlign:'center'}}>
          {
            blinker()
          }
        </div>

      <div style={{marginTop:'5vh',textAlign:'right'}}>
      {recording === '' ? null : <button onClick={()=>setFlowScreen('details')}>next</button> }
      </div>
   
  </div>
     
  
    )
  }

  // Add Details 📝
  function detailScreen(){

    let didAsk = false;

    function detailCheck(){
      if(topic === ''){
        alert('fill topic #')
        //return false
      } else if (title === ''){
        alert('fill title')
        //return false
      }
      else {
        setFlowScreen('confirm')
      }
    }

    function handleTopicChange(event) {
        setTopic(event.target.value)
    }

    function handleTitleChange(event) {
        setTitle(event.target.value)
    }

    function handleContextChange(event) {
        setContext(event.target.value)
    }

    return(
      <div style={{textAlign:'center', color:'white'}}>

        <p> Broadcast Details 🎙 </p>

        <div style={{textAlign:'left', marginTop:'10vh'}}>

            <div>
              <p> Topic  </p> 
              <input type="text" placeholder={'#'+topic} onChange={handleTopicChange} ></input>
            </div>

            <div>
              <p> Title </p> 
              <input type="text" placeholder={title} onChange={handleTitleChange} ></input>
            </div>

            <div>
              <div style={{display:'flex', alignItems:'center'}}>
                 <p> Context </p> {/* a reference point to some location on the web (image/tweet/website/video) that adds greater depth on what a user is saying*/}
                 <button onClick={()=>alert('Reference link to some location on the web (article/tweet/website) that adds greater depth to what you are saying')} style={{marginLeft:'3px', backgroundColor:'rgb(11,11,11)', color:'white', border:'0px', height:'20px'}}><BsInfoCircle/></button>
                
              </div>
              <input type="text" placeholder={'optional link'+context} onChange={handleContextChange} ></input>
            </div>
     
        </div>

        <div style={{textAlign:'right', marginTop:'10vh'}}>
            <button onClick={()=>setFlowScreen('talk')}>prev</button> 
           
            <button onClick={()=>detailCheck()}>next</button> 
        </div>

      </div>
    )
  }

  // Check ✅ and Confirm Transaction
  function confirmationScreen(){

    return(
    <div style={{textAlign:'center',  color:'white'}}>
      <p> Confirm Broadcast 📝 </p>

      <div style={{marginTop:'5vh', marginBottom:'10vh'}}>
        
        <div style={{height:'10vh', width:'90%', marginLeft:'auto', marginRight:'auto', borderBottom:'0.5px solid gray', display:'grid', gridTemplateColumns:'auto auto'}}>
          <div style={{textAlign:'left'}}>
          <p>Topic:</p>
          </div>
          <div style={{textAlign:'right'}}>
          <p> {'#'+topic} </p>
          </div>
        </div>

        <div style={{height:'10vh', width:'90%', marginLeft:'auto', marginRight:'auto', borderBottom:'0.5px solid gray', display:'grid', gridTemplateColumns:'auto auto'}}>
        <div style={{textAlign:'left'}}>
          <p>Title:</p>
          </div>
          <div style={{textAlign:'right'}}>
          <p> {title} </p>
          </div>
        </div>
      
        {
          context !== '' ?
          <div style={{height:'10vh', width:'90%', marginLeft:'auto', marginRight:'auto', borderBottom:'0.5px solid gray', display:'grid', gridTemplateColumns:'auto auto'}}>
          <div style={{textAlign:'left'}}>
            <p>Context:</p>
            </div>
            <div style={{textAlign:'right'}}>
            <p> {context} </p>
            </div>
          </div>
        :
        <div style={{height:'10vh', width:'90%', marginLeft:'auto', marginRight:'auto', borderBottom:'0.5px solid gray', display:'grid'}}>
            <p> No Context Selected</p>
        </div>
        }

      </div>
      <p> Audio: </p>
      <button style={{cursor:'pointer', width:'20vw', marginBottom:'5vh'}} onClick={playRecording}>
                play 
      </button>

      <div style={{cursor:'pointer', marginBottom:'5vh'}}>
        <button onClick={()=>{write?.(), setFlowScreen('result')}}>confirm</button> 
      </div>

      <div onClick={()=>setFlowScreen('details')} style={{textAlign:'left'}}>
       <button>back</button> 
      </div>
    </div>
    )
  }

  // Display Transaction Hash 📝
  function resultScreen(){
    return (
      isLoading === true && (data === undefined || data === null) ?
      <div style={{textAlign:'center', marginTop:'25vh', color:'white'}}>
      <p> ⛓ Confirming Broadcast . . .</p>
      </div>
      :
      <div style={{display:'grid', height:'70vh', color:'white'}}>
        {
          isSuccess === true ?
          <div style={{textAlign:'center', marginTop:'20vh'}}>
          <h1> Broadcast Created ✅ </h1>
          <p style={{fontSize:'2vw'}}> {'Hash: ' + data.hash}</p>
          </div>
          :
          <div style={{textAlign:'center', marginTop:'25vh'}}>
          <h1> {'Error Creating Post ⚠️'} </h1>
          </div>
        }
      </div>
    )
  }

  // Render Current Screen Based on Flow State
  function screenRender(){
   
      if(flowScreen === 'talk') {
        return talkScreen()
      } else if(flowScreen === 'details'){
        return detailScreen()
      }
      else if(flowScreen === 'confirm'){
        return confirmationScreen()
      }
      else if(flowScreen === 'result'){
        return resultScreen()
      }
  }

  return (
  <div>

          <button id="broadcastButton" style={{cursor: 'pointer', border:'1px solid white',backgroundColor:'rgb(11,11,11)',color:'white', transform:'scale(1)', padding:'3px 8px'}} onClick={()=>{dispatch(setBroadcastWindow(true)),expandTalkModal(true)}}>
          <div style={{display:'inline', color:'red', marginRight:'5px'}}>•</div>
          {liveStatus === false ? "Broadcast":'Live'}
          </button>
         
          {
            talkModal === false ?
            null
            :
            <div >
              <dialog 
              open
              style={{
                backgroundColor:'rgb(11,11,11)',
                height:'95vh',
                width:'100vw',
                marginTop:'2vh',
                left:'50%', 
                transform: 'translateX(-50%)',
              }}
              >
              <button id="broadcastButtonClose" onClick={()=>{expandTalkModal(false), setRecording(''), setTopic(''), setTitle(''), setContext(''), setStatusBlinker(''), setFlowScreen('talk'), dispatch(setBroadcastWindow(false))}}>x</button> 
              <button style={{backgroundColor:'rgb(11,11,11)', border:'0px', color:'gray'}}> Publish a Broadcast</button>
              {
                screenRender()
              }
              </dialog>
            </div>
          }
    </div>
  );
};

