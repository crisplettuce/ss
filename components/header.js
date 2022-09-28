import Link from 'next/link'
import { useRouter } from 'next/router'
import {useState} from 'react'
import BroadcastButton from "./broadcastButton"
import { AiOutlineClose } from "react-icons/ai";
import { GiFamilyHouse, GiHamburgerMenu } from "react-icons/gi";
import { useSelector, useDispatch } from 'react-redux';
import { setDemoVersion } from './state/slice';

const headerStyle = {

  display: 'grid',
  padding: '15px 30px',
  marginLeft:'auto',
  marginRight:'auto',
  gridTemplateColumns: 'auto auto',
  borderBottom: '0.5px solid gray',
  backgroundColor: 'rgb(11,11,11)',
  position:'sticky',
  top:'0',
  zIndex:1000,
}

export default function Header(){

  const dispatch = useDispatch();
  const router = useRouter()
  const isBroadcasting = useSelector((state) => state.gState.broadcastingState)
  const isDemo = useSelector((state) => state.gState.demoVersion)

  const [modal, setModal] = useState(false)

    return (
        <div style={headerStyle}>

        {
          router.pathname !== "/" ?
          <div>
          <Link href="/">
            <button style={{color:'white', backgroundColor:'rgb(11,11,11)', transform:'scale(1.5)', border:'0px' }}>
              {'{ subspaces }'}
            </button>
          </Link>
          </div>
          :
          <div>
          </div>
        }
      
        <div style={{ color:'white'}}>
         
          {
            modal === false ? 
            <div style={{display:'flex', justifyContent:'right'}}>
              <div style={{marginRight:'2.5vw'}}>
                <BroadcastButton/>
              </div>

            <button 
            style={{color:'white', backgroundColor:'rgb(11,11,11)', border:'0px', transform:'scale(1.5)', cursor:'pointer'}}
            onClick={()=>setModal(true)}
            >
              <GiHamburgerMenu/>
            </button>
            </div>
            :
            <div style={{display:'flex', justifyContent:'right'}}>
            <div style={{marginRight:'2.5vw'}}>
                    <BroadcastButton/>
            </div>
            <button 
            style={{color:'white', backgroundColor:'rgb(11,11,11)', border:'0px', transform:'scale(1.5)', cursor:'pointer'}}
            onClick={()=>setModal(false)}
            >
            <AiOutlineClose/>
            </button>
            </div>
          }
        </div>

        {
          modal === false ?

          null
          :
          <dialog 
          style={{width:'100%', height:'95vh', marginTop:'7vh', border:'1px solid gray', backgroundColor:'black', zIndex:'1'}}
          open
          >
              <div >
                  <div style={{display:'grid'}}>
                    <Link href="/main">
                    <button  onClick={()=>setModal(false)} style={{backgroundColor:'black', color:'white', border:'0px', marginBottom:'5vh', height:'5vh', cursor:'pointer', textAlign:'left', fontSize:'20px'}}> 🏠 Home </button>
                    </Link>
                    {/*<Link href="/broadcast">
                    <button  onClick={()=>setModal(false)} style={{backgroundColor:'black', color:'white', border:'0px', marginBottom:'5vh', height:'5vh', cursor:'pointer', textAlign:'left', fontSize:'20px'}}> 🎙 Broadcast  </button>
                     </Link>*/}
                    <Link href="/profile">
                    <button  onClick={()=>setModal(false)} style={{backgroundColor:'black', color:'white', border:'0px', marginBottom:'5vh', height:'5vh', cursor:'pointer', textAlign:'left', fontSize:'20px'}}>  👤 Profile </button>
                    </Link>
                    <Link href="/explore">
                    <button  onClick={()=>setModal(false)} style={{backgroundColor:'black', color:'white', border:'0px', marginBottom:'5vh', height:'5vh', cursor:'pointer', textAlign:'left', fontSize:'20px'}}>  🔍 Explore </button>
                    </Link>
                    <div>
                    <button onClick={()=>dispatch(setDemoVersion(true))} style={isDemo === true ? {backgroundColor:'black', color:'white', height:'25px', border:'1px solid red',}:{backgroundColor:'black',color:'white', height:'25px'}}>🎭 Demo </button>
                    <button onClick={()=>dispatch(setDemoVersion(false))} style={isDemo === false ? {backgroundColor:'black', color:'white', height:'25px', border:'1px solid red'}:{backgroundColor:'black',color:'white',height:'25px'}}> Testnet ⛓</button>
                    </div>
                  
                  </div>
              </div>
          </dialog>
        }
    </div>
    )
}