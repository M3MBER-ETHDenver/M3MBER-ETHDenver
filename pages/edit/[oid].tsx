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
import { provider } from '../../lib/ensdata';

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
    const { address } = useAccount();
    const [originalDescription, setOriginalDescription] = useState("");
    const [originalFee, setOriginalFee] = useState("");

    const { data: data } = useContractRead({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'names',
        args: [namehash.hash(oid)]
    });




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
            gasLimit: '1000000',
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
            gasLimit: '1000000',
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
            gasLimit: '1000000',
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

    useEffect(() => {
        if (data) {
            let fee = ethers.utils.formatEther(data ? data["registrationFee"] : 0).toString();
            setFee(fee);
            setOriginalFee(fee);
        }
    }, [data])

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
            gasLimit: '1000000',
        },
    })

    const setupDomain = useContractWrite(config)

    const setM3mbershipDescriptionConfig = usePrepareContractWrite({
        address: ensResolverGoerli,
        abi: ensResolverAbiGoerli,
        functionName: 'setText',
        args: [
            namehash.hash(oid), // node
            "M3mber Description",
            description,
        ],
        overrides: {
            gasLimit: '1000000',
        },
    })


    const setM3mbershipDescription = useContractWrite(setM3mbershipDescriptionConfig.config);

    useEffect(() => {
        if (setupDomain.isSuccess) {
            toast.success("setup successfully")
            if (originalDescription === description) {
                router.push("/admin/" + oid);
            }
        }
    }, [setupDomain.isSuccess])

    useEffect(() => {
        if (setM3mbershipDescription.isSuccess) {
            toast.success("M3mbership Rule Created Successfully: " + oid)
            router.push("/admin/" + oid)
        }
    }, [setM3mbershipDescription.isSuccess])

    useEffect(() => {
        getDescription();
    }, [oid])
    const handleCreate = () => {
        if (setupDomain.isSuccess || fee === originalFee) {
            toast.success("here yayay")
            if (description !== originalDescription)
                setM3mbershipDescription.write();
        } else {
            setSubmitLoading(true);
            setupDomain?.write({
                recklesslySetUnpreparedArgs: [
                    namehash.hash(oid), // node
                    ethers.utils.parseEther(fee) // fee (in wei)
                ]
            })
        }
    }

    const getDescription = async () => {
        let originalDescription = await (await provider.getResolver(oid)).getText("M3mber Description");
        setDescription(originalDescription);
        setOriginalDescription(originalDescription);
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
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDescription(e.target.value);
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
                <Heading style={{ fontSize: "50px", marginBottom: 30 }}>Edit Membership</Heading>
                <Card style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.12)", padding: 50 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "10px" }}>
                        <div style={{ flex: "1 1 auto" }}>
                            <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Subname of</p>
                            <Input value={oid} onChange={handleRuleChange} placeholder=""
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
                            <Input disabled value={"Monthly"} onChange={handleRuleChange}
                                style={{ height: 50 }} />
                        </div>
                    </div>
                    <div>
                        <p style={{ color: "#9B9BA5" }}>Description</p>
                        <Textarea label="" value={description} onChange={handleDescriptionChange}
                            style={{ height: "200px" }}
                            maxLength={1000}
                            placeholder="Describe what benefit this membership will provide" />
                    </div>
                    <div style={{ display: "flex" }}>
                        <Button key="submit" loading={submitLoading} onClick={handleCreate}
                            style={{ width: "200px", marginTop: 20 }}>
                            {setupDomain.isSuccess ? "Set Record" : "Save"}
                        </Button>
                        <Button colorStyle="blueSecondary" onClick={() => { router.push("/admin/" + oid) }}
                            style={{ width: "200px", marginTop: 20, marginLeft: 10 }}>
                            Cancel
                        </Button>
                    </div>
                </Card>

            </Container>
        </div>
    )
}
