import {useState, useEffect} from 'react'
import { useRouter } from 'next/router'
import { BsShare } from "react-icons/bs";
import { useDispatch } from 'react-redux';
import { setBroadcastWindow } from '../state/slice';
import QRCode from "react-qr-code";

export default function ShareButton({arg}){

    const [expand, setExpand] = useState(false);
    const [shareURL, setURL] = useState('')
    const dispatch = useDispatch();
    const router = useRouter();

    
    useEffect(()=>(
        console.log('SHARE PATH', window.location.host)
    ),[])

    return(
    <div style={{display:'inline'}}>
    <button style={{cursor:'pointer', marginRight:'1vw',color:'black'}} onClick={()=>{setExpand(true), dispatch(setBroadcastWindow(true))}}><BsShare/></button>
    {
        expand === false ? 
        null
        :
        
        <dialog open style={{backgroundColor:'rgb(20,20,21)', display:'relative', zIndex:'1', marginTop:'2vh', borderTop:'0px', height:'50vh', width:'96vw'}}>
        
        <div style={{height:'38vh', textAlign:'center', color:'white'}}>

        <p style={{fontSize:'12px'}}> Share </p> 
        <div style={{ backgroundColor:'white', color:'black',fontSize:'12px', width:'60%', marginLeft:'auto', marginRight:'auto', marginBottom:'3vh', overflowY:'scroll'}}>
            <p> {window.location.host + '/share/'+ arg} </p>
        </div>
        <QRCode 
        value={'http://'+ window.location.host + '/share/'+ arg} 
        size={150}
        />

        </div>

        <div>    

            <button onClick={()=>{setExpand(false), dispatch(setBroadcastWindow(false))}}>x</button>

        </div>
        </dialog>
    
    }
    </div>
    )
}