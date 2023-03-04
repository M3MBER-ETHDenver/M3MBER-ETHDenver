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

    const { data: data } = useContractRead({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'names',
        args: [namehash.hash(ensDomain)]
    });
    console.log(namehash.hash(ensDomain), data);

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
        args: [
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
        if (withdraw.isSuccess) {
            toast.success("Successfully withdraw!");
        }
    }, [withdraw.isSuccess])

    if (loading) {
        return (
            <Card style={{
                width: "100%", height: 150, borderRadius: "10px",
                backgroundColor: "rgba(78,134,247,0.1)",
                marginTop: 25
            }} loading={true}>
            </Card>)
    }

    return (
        <div style={{
            width: "100%", height: 150, borderRadius: 20,
            padding: 20, color: "#4E86F7",
            backgroundColor: "rgba(78,134,247,0.1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            marginTop: 25
        }}>
            <div style={{ display: "flex" }}>
                <img src="/user_check_icon.png" alt="icon"
                    style={{
                        lineHeight: "25px", display: "inline-block",
                        marginRight: 10, width: 25, height: 25
                    }} />
                <p style={{ lineHeight: "25px" }}>
                    Membership
                </p>
            </div>
            <p style={{ fontSize: 40, fontWeight: "bold" }}>{ethers.utils.formatEther(data ? data["balance"] : 0)} ETH</p>
        </div>
    )
}