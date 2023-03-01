// import { Button} from "antd";
import {RightOutlined} from "@ant-design/icons";
import { relative } from "path";
import { Typography } from 'antd';
import { toast } from 'react-toastify';
import { Input, Button, Checkbox} from '@nextui-org/react';
import { useRouter } from "next/router";
import { EthIcon } from "../EthIcon";
import { Fragment, useState } from 'react';

import {
    useAccount,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
    goerli
} from 'wagmi'
import {
    org3RegistrarAddrGoerli,
    org3RegistrarAbiGoerli,
    ensResolverGoerli,
    ensResolverAbi
} from '../../lib/constants';
import namehash from "@ensdomains/eth-ens-namehash";
import { useEffect } from "react";
import { ethers } from 'ethers';
import { addRequestMeta } from "next/dist/server/request-meta";
import useCheckMobileScreen from "../../hooks/useCheckMobileScreen";
const { Title, Text } = Typography;

export default function CommunityInviteCard({...props}) {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [addrResolve, setAddrResolve] = useState(true)
    const { address, connector, isConnected } = useAccount()
    const { communityName,
        ensDomain,
        createdDate,
        memberNum,
        backgroundSrc,
        avatarSrc,
        telegram,
        twitter,
        website,
        discord,
    } = props.data;
    const {data:data} = useContractRead({
        address: org3RegistrarAddrGoerli,
        abi: org3RegistrarAbiGoerli,
        functionName: 'names',
        args: [namehash.hash(ensDomain)]
      }); 
    console.log(namehash.hash(ensDomain),data)

    let resolver = new ethers.utils.Interface(ensResolverAbi);
    
    
    const { config } = usePrepareContractWrite({
        address: org3RegistrarAddrGoerli,
        abi: org3RegistrarAbiGoerli,
        functionName: 'register',
        args: [
            namehash.hash(ensDomain), // parentNode
            input, // label
            address, // newOwner --> just the owner
            ensResolverGoerli, // resolver
            0, // fuses
            addrResolve && address?
                [resolver.encodeFunctionData("setAddr(bytes32,address)", [ namehash.hash(input+"."+ensDomain), address ])]
                :[], // records
            
        ],
        overrides: {
            gasLimit: '300000',
            value: data? data["registrationFee"]:0
        },
      })

    const registerSubname = useContractWrite(config)

      // Wait for the transaction to be mined
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: registerSubname.data?.hash,
    })
    console.log(registerSubname.error)
    
    
    function checkAvailability(label){
        
    }

    const handleChange = (event) => {
        setAddrResolve(event);
    };
    

    const setAddrconfig = usePrepareContractWrite({
        address: ensResolverGoerli,
        abi: ensResolverAbi,
        functionName: 'setAddr',
        args: [
            namehash.hash(input+"."+ensDomain),
            address, // newOwner

        ],
        overrides: {
            gasLimit: '300000'
        },
    })

    useEffect(() => {
        if(typeof isSuccess === undefined){return;}
        if(isSuccess){
            toast.success("Successfully mint subname")
            toast.success("Transaction: " + JSON.stringify(registerSubname.data));
            setTimeout(()=>{
                router.push("/"+ensDomain);
            }, 10000);
            
        } else {
        }
    }, [isSuccess])

    return (
        <div
            style={{
                width: 475, height: 550, overflow: "hidden", borderRadius: "10px",backgroundColor:"rgb(89,186,243)",
                position: "sticky", top: "30px"
            }}
        >
            <div style={{
                width: "100%", height: 180,
                backgroundImage: `url('${backgroundSrc}')`, backgroundSize: "contain"
            }}>
            </div>
            <div style={{ width: "100%", height: 370, position: "relative" }}>
                <div style={{
                    width: 140, height: 140, borderRadius: "50%", overflow: "hidden", border: "5px white",
                    position: "relative", margin: "auto", bottom: 70
                }}>
                    <img src={avatarSrc} alt={`${communityName} avatar`} style={{ width: "100%", height: "100%" }} />
                </div>

                <div style={{
                    width: "100%", position: "absolute", top: 80,
                    display: "flex", flexDirection: "column", alignItems: "center"
                }}>
                    <Text style={{ color: "#707070", margin: "1px 0", fontSize: 16 }}>{"You’re invited to join "} <Text strong style={{ margin: "6px 0", fontSize: 16 }}>{ensDomain}</Text></Text>
                    <Title level={2} style={{ margin: "6px 0" }}>{communityName}</Title>

                    <Text style={{ margin: "6px 0 30px 0", fontSize: 16 }}><b>{memberNum}</b> Members</Text>
                    <Input value={input} onChange={(e) => { 
                        try{
                            namehash.hash(e.target.value+"."+ensDomain)
                            setInput(e.target.value.toLowerCase()); 
                            checkAvailability(e.target.value);
                        }
                        catch{
                            
                        }
                     }} style={{ width: 150 }}

                        labelRight={"." + ensDomain}
                        placeholder=""
                    />
                    {
                    useCheckMobileScreen()?
                    <Button.Group>
                        <Button onClick={() => registerSubname.write?.({})} disabled={!isConnected || !input || input.length == 0 || !registerSubname.write || registerSubname.isLoading} color="primary" style={{ width: 190, height: 43, marginTop: "10px" }} >
                          {isLoading ? 'Minting...' : "Mint Your Subdomain"}
                        </Button>
                        
                        <Button color="primary" disabled={!isConnected || !input || input.length == 0 || !registerSubname.write || registerSubname.isLoading} style={{ height: 43, marginTop: "10px" }}>
                            
                           {ethers.utils.formatEther(data? data["registrationFee"]:0).toString() + " ETH"}
                        </Button>  
                     </Button.Group>:
                    <Button.Group>
                        <Button onClick={() => registerSubname.write?.({})} disabled={!isConnected || !input || input.length == 0 || !registerSubname.write || registerSubname.isLoading} color="primary" style={{ width: 200, height: 43, marginTop: "10px" }} >
                          {isLoading ? 'Minting...' : "Mint Your Subdomain"}
                        </Button>
                        
                        <Button color="primary" disabled={!isConnected || !input || input.length == 0 || !registerSubname.write || registerSubname.isLoading} style={{ height: 43, marginTop: "10px" }}>
                            
                           {ethers.utils.formatEther(data? data["registrationFee"]:0).toString() + " ETH"}
                        </Button>  
                     </Button.Group>
                    
                    }   
                    
                </div>
                
            </div>
        </div>
    )
}