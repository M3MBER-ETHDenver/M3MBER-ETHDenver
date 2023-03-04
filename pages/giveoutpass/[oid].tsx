import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import React, { useState, useEffect } from "react";
import InputEns from '../../components/inputEns';
import LoginCard from '../../components/communitySpace/LoginCard';
import { useRouter } from 'next/router';
import CommunityInviteCard from '../../components/invite/CommunityInviteCard';
import { SummaryCardData } from '../admin/[oid]';
import { domainData } from '../../lib/ensdata';
import MintRules from '../../components/communitySpace/MintRules';
import { Input, InputNumber, message, Space } from "antd";
import { Modal, Card, Heading, Button, Textarea } from '@ensdomains/thorin'
import {
    useAccount,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
    goerli
} from 'wagmi'
import {
    namewrapperAbiGoerli,
    namewrapperAddrGoerli,
    M3mberRegistrarAbiGoerli,
    M3mberRegistrarAddrGoerli,
    ensResolverAbi,
    ensResolverAbiGoerli,
    ensResolver,
    ensResolverGoerli,
} from '../../lib/constants';
import { toast } from "react-toastify";
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from 'ethers';
import { Typography } from "@ensdomains/thorin";
import CopyShare from "../../utils/CopyShare";
import { CheckCircleSVG } from "@ensdomains/thorin";
import Container from '../../components/Container';

export default function Home() {
    const [oid, setOid] = useState("");
    const router = useRouter();
    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
        }
    })

    const [submitLoading, setSubmitLoading] = useState(false);
    const [stopLoading, setStopLoading] = useState(false);
    const [rule, setRule] = useState("");
    const [fee, setFee] = useState("0.05");
    const [description, setDescription] = useState("")
    const [mintSuccessAndShare, setMintSuccessAndShare] = useState(false);
    // const { address } = useAccount();
    const [subname, setSubname] = useState("");
    const [receiveraddress, setReceiverAddress] = useState("");
    const copyToClipBoard = async (text: string) => {
        try {
          await navigator.clipboard.writeText(text)
          toast.success('Copied to clipboard')
        } catch (err) {
          console.error('Failed to copy text: ', err)
          toast.error('Failed to copy to clipboard')
        }
      }
    //   const setM3mbershipDescriptionConfig = usePrepareContractWrite({
    //     address: ensResolverGoerli,
    //     abi: ensResolverAbiGoerli,
    //     functionName: 'setText',
    //     args: [
    //         namehash.hash(oid), // node
    //         "M3mber Description",
    //         "asdf",
    //     ],
    //     overrides: {
    //         gasLimit: '300000',
    //     },
    // }) 


    // const setM3mbershipDescription = useContractWrite(setM3mbershipDescriptionConfig.config);

    const giveOutNameConfig = usePrepareContractWrite({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'setSubnodeRecord',
        args: [
            namehash.hash(oid), // parentNode
            "subname", // label
            receiveraddress, // owner
            ensResolverGoerli, // resolver
            0, // ttl
            0, // fuses
            0, // expiry
            
        ],
        overrides: {
            gasLimit: '300000',
            value: 0,
        },
      })

    const giveOutName = useContractWrite(giveOutNameConfig)


    const handleGive = () => {
        if(giveOutName.isSuccess){
            copyToClipBoard(router.pathname + "/my/plans");
        } else{
            giveOutName.write();
        }
    }

    const handleResume = () => {
        //TODO: resume minting
        setSubmitLoading(true);
        setTimeout(() => {
            setSubmitLoading(false);
        }, 1000);
    }

    const handleStop = () => {
        //TODO: stop minting
        setStopLoading(true);
        setTimeout(() => {
            setStopLoading(false);
        }, 1000);
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSubname(e.target.value);
    }
    const handleReceiverAddress = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setReceiverAddress(e.target.value);
    }


    const handleFeeChange = (value: string) => {
        setFee(value);
    }

    return (
        <div className={styles.container} style={{ overflow: "hidden" }
        }>
            <Head>
                <title>M3MBER </title>
                <meta name="description" content="M3MBER" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container>
                <Heading style={{ fontSize: "50px", marginBottom: 30 }}>Give out name</Heading>
                <Card style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.12)", padding: 50 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "10px" }}>
                    <div style={{ flex: "1 1 auto" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Subname name</p>
                            <Input value={subname} onChange={handleNameChange} placeholder=""
                                style={{ height: 50 }} />
                        </div>
                        <div style={{ flex: "1 1 auto" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Recipient Address</p>
                            <Input value={receiveraddress} onChange={handleReceiverAddress} placeholder=""
                                style={{ height: 50 }} />
                        </div>
                        <div style={{ flex: "1 1 auto", marginLeft: "10px" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Fee</p>
                            <InputNumber
                                size="large"
                                stringMode
                                className="fee-input"
                                prefix={<img src="/eth.png" alt="etherem" style={{ height: 14, width: "100%" }} />}
                                value={fee}
                                onChange={handleFeeChange}
                                min="0" defaultValue="0.05" step="0.01"
                                style={{ height: 50 }} />
                        </div>
                        <div style={{ flex: "0 1 200px", marginLeft: "10px" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Period</p>
                            <Input disabled value={"Monthly"}
                                style={{ height: 50 }} />
                        </div>
                    </div>
                    <Button key="submit" loading={submitLoading} onClick={handleGive}
                        style={{ width: "200px", marginTop: 20 }}>
                        { giveOutName.isSuccess? "Copy Invite" : "Give"}
                    </Button>

                </Card>

            </Container>
        </div>
    )
}
