import { Button, message, Space } from "antd";
import { relative } from "path";
import { Typography, Card, Skeleton, Avatar } from 'antd';
const { Meta } = Card;
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
const { Title, Text } = Typography;
import {
    useAccount,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
    goerli
} from 'wagmi'
import {
    M3mberRegistrarAddrGoerli,
    M3mberRegistrarAbiGoerli,
    ensResolverGoerli,
} from '../../lib/constants';
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from 'ethers';

export default function CommunityTreasuryCard(props) {

    const { 
        communityName,
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
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'names',
        args: [namehash.hash(ensDomain)]
      }); 
    console.log(namehash.hash(ensDomain),data);

    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (props.data.ensDomain && props.data.createdDate && props.data.avatarSrc) {
            setLoading(false);
        }
    }, [props.data])

    const withdrawConfig = usePrepareContractWrite({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'withdraw',
        args:[
            namehash.hash(ensDomain), // node
        ],
        overrides: {
            gasLimit: '300000'
        },
      })

        const withdraw = useContractWrite(withdrawConfig.config);

    const handleWithdraw = () => {
        
        withdraw.write();
    }

    useEffect(() => {
        if(withdraw.isSuccess){
            toast.success("Successfully withdraw!");
        }
    }, [withdraw.isSuccess])

    if (loading) {
        return (
        <Card style={{
            width: 365, height: 550, borderRadius: "10px", backgroundColor: "white"
        }} loading={true}>
        </Card>)
    }

    return (
        <Card
            style={{
                width: 365, overflow: "hidden", borderRadius: "10px", backgroundColor: "white", marginBottom: "30px"
            }}
            className={"mint-rule-card"}
        >
            <div style={{ width: "100%", height: "auto", position: "relative" }}>
                <div style={{
                    width: "100%", display: "flex", flexDirection: "column"
                }}>
                    <div>
                        <Text style={{ fontSize: "24px", fontWeight: "700" }}>Treasury</Text>
                    </div>

                    <div style={{marginTop: "20px"}}>
                        <div>
                            <Text style={{ fontSize: "16px", fontWeight: "500", color: "rgba(155, 155, 165, 1)" }}>{ethers.utils.formatEther(data ? data["balance"] : 0)} ETH</Text>
                            <Button 
                                type="primary" 
                                size="small" 
                                style={{ height: "26px", float: "right", color:"white", backgroundColor: "rgba(59, 142, 252, 1)"}}
                                onClick={handleWithdraw}
                            >
                                Withdraw
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}