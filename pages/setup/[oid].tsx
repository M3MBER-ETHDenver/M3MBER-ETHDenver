import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
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
import AccessCard from '../../components/AccessCard';
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
    useEffect(() => {
        if (setupDomain.isSuccess === false) {
        } else {
            setMintSuccessAndShare(true);
            setSubmitLoading(false);
        }
    }, [setupDomain.isSuccess])

    //handle continue
    useEffect(() => {
        if (
            //TODO: update first line
            (setApprovalForAll.isSuccess || isApprovedForAll.data) &&
            (setApprovalForAll.isSuccess || isApprovedForAll.data) &&
            (burnCanUnwrap.isSuccess)
        ) {
            router.push(`/create/${oid}`);
        }
    }, [setApprovalForAll.isSuccess, isApprovedForAll.data, burnCanUnwrap.isSuccess])



    return (
        <div className={styles.container} style={{ overflow: "hidden" }
        }>
            <Head>
                <title>M3MBER </title>
                <meta name="description" content="M3MBER" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Container>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <img style={{ width: 70, height: 70 }} src="/metamask_logo.png" alt="Metamask logo" />
                    <Heading style={{ fontSize: "50px", marginLeft: 20 }}>Grant Access</Heading>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: 30 }}>
                    <AccessCard
                        wrapETH2LD={wrapETH2LD}
                        isApprovedForAll={isApprovedForAll}
                        setApprovalForAll={setApprovalForAll}
                        isApprovedForAllResult={isApprovedForAllResult}
                        burnCanUnwrap={burnCanUnwrap}
                        step={1}
                    />
                    <AccessCard
                        wrapETH2LD={wrapETH2LD}
                        isApprovedForAll={isApprovedForAll}
                        setApprovalForAll={setApprovalForAll}
                        isApprovedForAllResult={isApprovedForAllResult}
                        burnCanUnwrap={burnCanUnwrap}
                        step={2}
                    />
                    <AccessCard
                        wrapETH2LD={wrapETH2LD}
                        isApprovedForAll={isApprovedForAll}
                        setApprovalForAll={setApprovalForAll}
                        isApprovedForAllResult={isApprovedForAllResult}
                        burnCanUnwrap={burnCanUnwrap}
                        step={3}
                    />
                </div>
            </Container>
        </div>
    )
}
