import { css, Input } from '@nextui-org/react';
import { Typography } from 'antd';
import { Button } from "antd";
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { useContractRead } from 'wagmi';
import { namewrapperAddrGoerli, namewrapperAbiGoerli, M3mberRegistrarAddrGoerli, M3mberRegistrarAbiGoerli } from '../../lib/constants';
import useCheckMobileScreen from '../../hooks/useCheckMobileScreen';
import namehash from "@ensdomains/eth-ens-namehash";
import { redirect } from 'next/dist/server/api-utils';

const { Title, Text } = Typography;

export default function LoginCard({ ...props }) {
    const router = useRouter()
    const { address, connector, isConnected } = useAccount()

    const [displayText, setDisplayText] = useState("Please Connect Wallet");
    const [displayText2, setDisplayText2] = useState("Please Connect Wallet");

    const [input, setInput] = useState("");

    useEffect(() => {
        if (isConnected) {
            setDisplayText("Start your web3 membership ➡️")
        }
        else {
            setDisplayText("Please Connect Wallet")
        }
    }, [isConnected])

    useEffect(() => {
        if (isConnected) {
            setDisplayText2("My Plans")
        }
        else {
            setDisplayText2("Please Connect Wallet")
        }
    }, [isConnected])


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
            namehash.hash(input.toLowerCase() + ".eth"),
            1,
        ]
    })

    const { data: namesResult } = useContractRead({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'names',
        args: [
            namehash.hash(input.toLowerCase() + ".eth"),
        ]
    })

    // useEffect(() => {
    //     if (isApprovedForAll.data || isCanUnwrapBurnt.data) {
    //         // toast.error("TODO: Already grant access but Create Mint Rules button still go to wrong modal. mintRuleAccess is still false.");
    //         setMintRuleAccess(true);

    //         console.log(isCanUnwrapBurnt.data);
    //         console.log(domainName);
    //     } else {
    //         setMintRuleAccess(false);
    //     }
    // }, [])

    // useEffect(() => {
    //     if (isCanUnwrapBurnt.data) {
    //         setMintRuleAccess(true);
    //     }
    // }, [isCanUnwrapBurnt.data])


    function adminRedirect() {
        if(isApprovedForAll.data && isCanUnwrapBurnt.data && namesResult[1]) {
            router.push("/admin/" + input.toLowerCase() + ".eth") 
        }
        else if(isApprovedForAll.data && isCanUnwrapBurnt.data){
            router.push("/create/" + input.toLowerCase() + ".eth")
        }
        else{
         router.push("/setup/" + input.toLowerCase() + ".eth") 
        }
    }
    return (
        <div
            style={{ width: "100%", borderRadius: "20px" }}
        >
            <div style={{ width: "100%", height: 600, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", }}>

                <div style={{
                    width: "80%", position: "absolute", top: 120, rowGap: "20px",
                    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
                }}>
                    <Title style={{ fontSize: 30, fontWeight: 700 }}>M3MBER</Title>
                    <Text style={{ fontSize: 18, color: "gray" }}>Subscription in Web3 was never possible before without namewrapper.<br />
                        Unleash your community through M3MBER today.</Text>
                    <div style={{ marginTop: "100px" }}></div>

                    <>
                        <Input onChange={(e) => { setInput(e.target.value) }} style={{ width: 250 }}
                            labelRight=".eth"
                            placeholder="m3mber"
                        />
                        <Button onClick={() => { adminRedirect(); }} disabled={!isConnected || !input || input.length == 0} type="primary" style={{ width: 296, height: 43 }}>
                            {displayText}
                        </Button>
                        <Button onClick={() => { router.push("/my/plans") }} disabled={!isConnected} type="primary" style={{ width: 296, height: 43 }}>
                            {displayText2}
                        </Button>
                    </>


                </div>
            </div>

        </div>
    )
}