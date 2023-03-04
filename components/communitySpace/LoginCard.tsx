import { Input } from '@ensdomains/thorin';
import { Typography } from 'antd';
import { Button } from '@ensdomains/thorin';
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
            setDisplayText2("Check out my current membership")
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
        if (isApprovedForAll.data && isCanUnwrapBurnt.data && namesResult[1]) {
            router.push("/admin/" + input.toLowerCase() + ".eth")
        }
        else if (isApprovedForAll.data && isCanUnwrapBurnt.data) {
            router.push("/create/" + input.toLowerCase() + ".eth")
        }
        else {
            router.push("/setup/" + input.toLowerCase() + ".eth")
        }
    }
    return (
        <div
            style={{ width: 600, borderRadius: "20px" }}
        >
            <Title style={{ fontSize: 48, fontWeight: 700, color: "white", marginBottom: 20 }}>
                Subscription in Web3 was <br />
                never standardized before <br />
                without namewrapper<br />
            </Title>
            <Text style={{ fontSize: 20, fontWeight: 500, color: "white" }}>
                Unleash your community through M3MBER today.
            </Text>
            <div style={{
                width: "100%", backgroundColor: "white", borderRadius: 25, height: 200,
                padding: 15, margin: "25px 0"
            }}>
                <Text style={{ fontSize: 24, fontWeight: 500, display: "block" }}>
                    Host
                </Text>
                <Input
                    label=""
                    placeholder="Create or manage your domain here"
                    value={input}
                    onChange={(e) => { setInput(e.target.value) }}
                    suffix=".eth"
                    size="large"
                    className='host-input'
                />
                <Button onClick={() => { adminRedirect(); }}
                    disabled={!isConnected || !input || input.length == 0}
                    style={{ borderRadius: 30, marginTop: 10 }}
                    colorStyle="blueGradient">
                    {displayText}
                </Button>

            </div>
            <div style={{
                width: "100%", backgroundColor: "white", borderRadius: 25, height: 130,
                padding: 15, margin: "25px 0"
            }}>
                <Text style={{ fontSize: 24, fontWeight: 500, display: "block" }}>
                    Member
                </Text>
                <Button onClick={() => { router.push("/my/plans") }} disabled={!isConnected}
                    style={{ height: 50, borderRadius: 30, marginTop: 10 }}
                    colorStyle="accentGradient">
                    {displayText2}
                </Button>

            </div>


        </div>
    )
}