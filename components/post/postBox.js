import Head from 'next/head'
import Link from 'next/link'
import {useEffect, useState} from 'react'
import { useSelector } from 'react-redux';
import ReplyButton from './replybutton';
import LikeButton from './likeButton';
import TipButton from './tipButton';
import ShareButton from './shareButton';
import ContextButton from './contextButton';
import { BsShare } from "react-icons/bs";
import { ImImages} from "react-icons/im";
import {BiLike} from "react-icons/bi"
import {GrChatOption, GrMoney} from "react-icons/gr"

const postContainerStyle = {
    backgroundColor:'rgb(20,20,21)', 
    marginBottom:'2vh',  
    height:'210px', 
    width:'95%', 
    padding:'0px 5px', 
    marginLeft:'auto', 
    marginRight:'auto', 
    display:'grid', 
    gridTemplateColumns:'auto auto', 
    color:'white'
}

/* Post Displayer - Used in (Main/Profile/Explore/Share) Pages */
// arg => Broadcast Object
export default function PostBox({arg}){

  const isDemo = useSelector((state) => state.gState.demoVersion)

    const[screenSize, setScreenSize] = useState('')
    useEffect(()=>{
      setScreenSize( window.innerWidth)
      window.addEventListener("resize", (event) => {
        setScreenSize( window.innerWidth)
      });
     
    },[screenSize])
    useEffect(()=>{
      console.log(arg.audio+'/voiceMemo.mp3')
    },[])
          
          
    return(
      <div style={postContainerStyle}>
    
        <div style={{width:'20vw', padding:'70px 0px', textAlign:'center'}}>
          <Link href={"/explore/"+arg.topic}>
          <button style={{backgroundColor:'rgb(20,20,21)', color:'white', border:'0px', cursor:'pointer', fontWeight:'light', fontSize:'3vw'}}> {'#' + arg.topic} </button>
          </Link>
          <div>
          <button style={{backgroundColor:'rgb(20,20,21)', color:'white', border:'0px', cursor:'pointer', fontWeight:'light'}}> {arg.account.substring(0,5)+'...'+arg.account.substring(38,42)} </button>
          </div>
        </div>
    
        <div style={screenSize > 500 ? {fontSize:'18px', width:'50vw',padding:'5px 10px'} : {fontSize:'3.4vw', padding:'5px 15px'}}>
          <div style={{marginBottom:'5vh'}}>
            <p> {arg.title}</p> 
          </div>
  
         <div style={{marginBottom:'3vh'}}>
          <audio controls>
            <source src={arg.audio+'/voiceMemo.mp3'}></source>
          </audio> 
          </div>
  
          <div>
            {
              isDemo === false ?
              <>
              <LikeButton  arg={arg.id}/>
              <ReplyButton  arg={arg.id}/>
              <TipButton  arg={arg.id}/>
              {/* needs work <ContextButton arg={arg.context}/>*/}
              <ShareButton arg={arg.id}/>
              </>
              :
              <div style={{display:'inline'}}>
                    <button style={{cursor:'pointer', marginRight:'1vw', color:'black'}}><BiLike/></button>
                    <button style={{cursor:'pointer', marginRight:'1vw',color:'black'}}><GrChatOption/> </button>
                    <button style={{cursor:'pointer', marginRight:'1vw',color:'black'}}><GrMoney/></button>
                    <button style={{cursor:'pointer', marginRight:'1vw',color:'black'}}><ImImages/></button>
                    <button style={{cursor:'pointer', marginRight:'1vw',color:'black'}}><BsShare/></button>
              </div>
            }
          </div>
        </div>
      </div>
    )
  
  }
  