import { message, Space } from "antd";
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
import { Button } from "@ensdomains/thorin";
import { DollarCircleOutlined } from '@ant-design/icons';

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
            marginTop: 25,
            position: "relative"
        }}>
            <div style={{ display: "flex" }}>
                <DollarCircleOutlined style={{ fontSize: 20 }} />
                <p style={{ lineHeight: "25px", marginLeft: 10 }}>
                    Treasuary
                </p>
            </div>
            <p style={{ fontSize: 40, fontWeight: "bold" }}>{ethers.utils.formatEther(data ? data["balance"] : 0)} ETH</p>
            <Button style={{
                position: "absolute", top: 20, right: 20,
                width: 95, height: 25, borderRadius: 20,
                fontSize: 12,
            }}
                onClick={handleWithdraw}
            >Withdraw</Button>
        </div>
    )
}