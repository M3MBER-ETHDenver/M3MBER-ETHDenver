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
import { Modal, Card } from '@ensdomains/thorin';
import { Heading, Button } from '@ensdomains/thorin'
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
} from '../../lib/constants';
import { toast } from "react-toastify";
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from 'ethers';
import { Typography } from "@ensdomains/thorin";
import CopyShare from "../../utils/CopyShare";
import { CheckCircleSVG } from "@ensdomains/thorin";

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
    const [mintSuccessAndShare, setMintSuccessAndShare] = useState(false);
    const { address } = useAccount();

    const isApprovedForAll = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'isApprovedForAll',
        args: [
            address,
            M3mberRegistrarAddrGoerli,
        ]
    })
    const isApprovedForAllResult: boolean = isApprovedForAll.data as boolean;
    const isCanUnwrapBurnt = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'allFusesBurned',
        args: [
            namehash.hash(oid),
            1,
        ]
    })
    console.log(isCanUnwrapBurnt);
    const wrapETH2LDConfig = usePrepareContractWrite({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'wrapETH2LD',
        args: [
            M3mberRegistrarAddrGoerli, // parentNode
            true, // label
        ],
        overrides: {
            gasLimit: '300000',
        },
    })

    const wrapETH2LD = useContractWrite(wrapETH2LDConfig.config)
    useWaitForTransaction({
        hash: wrapETH2LD.data?.hash,
    })


    const setApprovalForAllConfig = usePrepareContractWrite({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'setApprovalForAll',
        args: [
            M3mberRegistrarAddrGoerli, // parentNode
            true, // label
        ],
        overrides: {
            gasLimit: '300000',
        },
    })

    const setApprovalForAll = useContractWrite(setApprovalForAllConfig.config)
    useWaitForTransaction({
        hash: setApprovalForAll.data?.hash,
    })

    const burnCanUnwrapConfig = usePrepareContractWrite({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'setFuses',
        args: [
            namehash.hash(oid), // parentNode
            1, // CANNOT_UNWRAP
        ],
        overrides: {
            gasLimit: '300000',
        },
    })
    const burnCanUnwrap = useContractWrite(burnCanUnwrapConfig.config)
    useWaitForTransaction({
        hash: burnCanUnwrap.data?.hash,
    })


    useEffect(() => {
        if (burnCanUnwrap.isSuccess) {
            toast.success("Successfully burn CAN_UNWRAP!")
        }
        else if (burnCanUnwrap.isSuccess === false) {
        }
    }, [burnCanUnwrap.isSuccess])

    // burnCanUnwrap.isSuccess
    const { config } = usePrepareContractWrite({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'setupDomain',
        args: [
            namehash.hash(oid), // node
            ethers.utils.parseEther(fee)
        ],
        overrides: {
            gasLimit: '300000',
        },
    })

    const setupDomain = useContractWrite(config)
    useEffect(() => {
        if (setupDomain.isSuccess === false) {
        } else {
            setMintSuccessAndShare(true);
            setSubmitLoading(false);
        }
    }, [setupDomain.isSuccess])

    const handleCreate = () => {

        setSubmitLoading(true);

        setupDomain?.write({
            recklesslySetUnpreparedArgs: [
                namehash.hash(oid), // node
                ethers.utils.parseEther(fee) // fee (in wei)
            ]
        })
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

    const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRule(e.target.value);
    }

    const handleFeeChange = (value: string) => {
        setFee(value);
    }

    return (
    <div className={styles.container} style={{ overflow: "hidden"}
    }>
        <Head>
        <title>M3MBER </title>
        <meta name="description" content="M3MBER" />
        <link rel="icon" href="/favicon.ico" />
        </Head>
        <div style={{marginTop: "10%"}}>
        <Heading>Create Membership</Heading>
        <div style = {{flex: "center"}}>
        <Card title="Create mint rule"
                    style={{
                        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                        padding: 30, width: "90%"
                    }}>
                    <div style = {{display: "flex"}}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: 30, width: "100%" }}>
                        <div style={{ flex: "1 1 auto" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Subname of</p>
                            <Input disabled value={oid} onChange={handleRuleChange} placeholder="Feature comming soom" />
                        </div>
                        <div style={{ flex: "0 1 130px", marginLeft: "10px" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Fee</p>
                            <InputNumber
                                stringMode
                                className="fee-input"
                                prefix={<img src="/eth.png" alt="etherem" style={{ height: 14, width: "100%" }} />}
                                value={fee}
                                onChange={handleFeeChange}
                                min="0" defaultValue="0.05" step="0.01" />
                        </div>
                        <div style={{ flex: "1 1 auto" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Subname of</p>
                            <Input disabled value={"Monthly"} onChange={handleRuleChange}  />
                        </div>
                    </div>
                    </div>
                    <div style={{ width: "100%", padding: "0 30px 20px 30px" }}>
                        <Button size="small" key="submit" loading={submitLoading} onClick={handleCreate} style={{ width: "100%" }}>
                            Create
                        </Button>
                    </div>
                </Card>

                </div>

        </div>
    </div>
    )
}
    