import {css, Input} from '@nextui-org/react';
import { Typography } from 'antd';
import { Button } from "antd";
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import useCheckMobileScreen from '../../hooks/useCheckMobileScreen';
const { Title, Text } = Typography;

export default function LoginCard({...props}) {
    const router = useRouter()
    const { address, connector, isConnected } = useAccount()

    const [displayText, setDisplayText] = useState("Please Connect Wallet");
    const [displayText2, setDisplayText2] = useState("Please Connect Wallet");
    
    const [input, setInput] = useState("");

    useEffect(()=>{
        if(isConnected){
            setDisplayText("Start your web3 membership ➡️")
        }
        else{
            setDisplayText("Please Connect Wallet")
        }
    }, [isConnected])

    useEffect(()=>{
        if(isConnected){
            setDisplayText2("My Plans")
        }
        else{
            setDisplayText2("Please Connect Wallet")
        }
    }, [isConnected])

    return (
        <div
            style={{ width:"100%", borderRadius: "20px"}}
        >
            <div style={{ width: "100%", height: 600, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", }}>
                
                <div style={{
                        width: "80%", position: "absolute", top: 120, rowGap: "20px",
                        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
                    }}>
                        <Title style={{fontSize: 30, fontWeight: 700}}>M3MBER</Title>
                        <Text style={{fontSize: 18, color: "gray"}}>Subscription in Web3 was never possible before without namewrapper.<br/>
Unleash your service or community through M3MBER today.</Text>
                        <div style={{marginTop:"100px"}}></div>
                        
                        <>
                        <Input onChange={(e)=>{setInput(e.target.value)}} style={{width: 250}}
                            
                            labelRight=".eth"
                            placeholder="m3mber"
                        />
                        <Button onClick={()=>{router.push("/admin/"+input.toLowerCase()+".eth")}} disabled={!isConnected || !input || input.length == 0} type="primary" style={{ width: 296, height: 43}}>
                            {displayText}
                        </Button>
                        <Button onClick={()=>{router.push("/my/plans")}} disabled={!isConnected} type="primary" style={{ width: 296, height: 43}}>
                            {displayText2}
                        </Button>
                        </>
                        
                         
                </div>
            </div>
            
        </div>
    )
}