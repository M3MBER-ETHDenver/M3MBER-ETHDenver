import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Table, Tooltip } from 'antd';
import { Typography } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { useAccount } from "wagmi";
import { Input } from 'antd';
import { Button } from "@ensdomains/thorin";
import CommunityTreasuryCard from "../../components/communitySpace/CommunityTreasuryCard";
import { domainData, subdomainDetails, provider } from "../../lib/ensdata";
import { ensRegistrarAddr, ensRegistrarAbi } from '../../lib/constants';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { useProvider } from "wagmi";
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import {
    namewrapperAbiGoerli,
    namewrapperAddrGoerli,
    M3mberRegistrarAddrGoerli,
    M3mberRegistrarAbiGoerli,
    ensBaseRegistrarAbi,
    ensBaseRegistrarAddr
} from '../../lib/constants';
import { toast } from "react-toastify";
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from 'ethers';
import { DataSource } from "@syncfusion/ej2-react-diagrams";
import useCheckMobileScreen from "../../hooks/useCheckMobileScreen";
import Container from "../../components/Container";
import SquareIconButton from "../../components/SquareIconButton";
import MembershipCard from "../../components/MembershipCard";
import { Tag } from "@ensdomains/thorin";

//data for summary card
export type SummaryCardData = {
    communityName: string;
    ensDomain: string;
    memberNum: number;
    backgroundSrc: string;
    avatarSrc: string;
    telegram: string;
    twitter: string;
    website: string;
    discord: string;
}
const defaultCardData: SummaryCardData = {
    communityName: "",
    ensDomain: "",
    memberNum: 0,
    backgroundSrc: "",
    avatarSrc: "",
    telegram: "",
    twitter: "",
    website: "",
    discord: ""
}

const { Title, Text } = Typography;
//data for table
export interface DataType {
    key: React.Key;
    avatar: string;
    name: [string, boolean];
    domain: string;
    address: string;
    expirationdate: string;
    index: string;
}

//data for edit modal
export interface EditData {
    website: string;
    discord: string;
    twitter: string;
    telegram: string;
    background: string;
    image: string;
}

//data for mint rule
export interface MintRuleData {
    ruleCreated: boolean;
    stopped: boolean;
    rule: string;
    fee: number;
}

//columns setting
const columns: ColumnsType<DataType> = [
    {
        title: 'M3MBER subname',
        dataIndex: 'domain',
        sorter: {

            compare: (a, b) => {
                if (a.index == '0' || b.index == '0') {
                    return 0
                } else {
                    return a.domain.localeCompare(b.domain)
                }

            },
            multiple: 1,
        },
    },
    {
        title: 'Owner address',
        dataIndex: 'address',
        sorter: {
            compare: (a, b) => {
                if (a.index == '0' || b.index == '0') {
                    return 0
                } else {
                    return a.address.localeCompare(b.address)
                }

            },
            multiple: 1,
        },
        render: (_, record) => {
            if (record.name[0] != "Not Set") {
                return (
                    <div>
                        <Tooltip title="Copy address to clipboard">
                            <Tag
                                style={{
                                    cursor: 'pointer', width: 150, height: 36, display: "flex", justifyContent: "center"
                                }}
                                onClick={() => navigator.clipboard.writeText(record.address)}
                            >
                                {record.name[0]}
                            </Tag>
                        </Tooltip>
                    </div>
                )
            }

            if (record.address.length <= 11) {
                return (
                    <div>
                        <Tooltip title="Copy address to clipboard">
                            <Tag
                                style={{
                                    cursor: 'pointer', width: 150, height: 36, display: "flex", justifyContent: "center",
                                    color: "#4E86F7", borderColor: "rgba(78,134,247, 0.2)"
                                }}
                                onClick={() => navigator.clipboard.writeText(record.address)}
                                colorStyle="background"
                            >
                                {record.address}
                            </Tag>
                        </Tooltip>
                    </div>
                )
            }
            let truncated = record.address.substring(0, 4) + "..." + record.address.substring(record.address.length - 4, record.address.length);
            return (
                <div>
                    <Tooltip title="Copy address to clipboard">
                        <Tag
                            style={{
                                cursor: 'pointer', width: 150, height: 36, display: "flex", justifyContent: "center",
                                color: "#4E86F7", borderColor: "rgba(78,134,247, 0.2)"
                            }}
                            onClick={() => navigator.clipboard.writeText(record.address)}
                            colorStyle="background"
                        >
                            {truncated.toLowerCase()}
                        </Tag>
                    </Tooltip>
                </div>
            )
        }
    },
    {
        title: 'Expiration date',
        dataIndex: 'expirationdate',
        sorter: {

            compare: (a, b) => {
                return 0;

            },
            multiple: 1,
        },
    },
];

// headers for the export csv
const headers = [
    { label: "Avatar", key: "avatar" },
    { label: "Primary Name", key: "name" },
    { label: "Domain", key: "domain" },
    { label: "Wallet address", key: "address" }
];


// styling for search bar
const { Search } = Input;


function OrgPage({ Component, pageProps }) {
    // const config = {
    //     address: ensRegistrarAddr,
    //     abi: ensRegistrarAbi,
    //     functionName: 'resolver',
    //     args: ["flamingle.eth"]
    //   }

    const router = useRouter();
    const [oid, setOid] = useState("");

    const [summaryCardData, setSummaryCardData] = useState<SummaryCardData>(defaultCardData);
    const [communityPageData, setCommunityPageData] = useState<DataType[]>();
    const [communityPageSearchData, setCommunityPageSearchData] = useState<DataType[]>();
    const [tableLoading, setTableLoading] = useState(true);
    const { address, connector, isConnected } = useAccount();
    // TODO: set access
    const [mintRuleAccess, setMintRuleAccess] = useState(false);
    // TODO: set owner
    //const [isOwner, setIsOwnder] = useState(true);

    //TODO: set mint rules data, pay attention to ruleCreated and stopped
    //temperary data, replace with real web3 integration:
    const [mintRuleData, setMintRuleData] = useState({
        //change back!
        ruleCreated: false,
        stopped: false,
        rule: "",
        fee: 0.05
    })
    // const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
    //     console.log('params', pagination, filters, sorter, extra);
    // };

    const csvReport = {
        data: communityPageSearchData,
        headers: headers,
        filename: 'export_lists.csv'
    };

    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
        }
    })
    const isCanUnwrapBurnt = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'allFusesBurned',
        args: [
            namehash.hash(oid),
            1,
        ]
    })

    const { data: owner } = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'ownerOf',
        args: [
            namehash.hash(oid)
        ]
    })

    const ensTokenId = (label) => {
        const BigNumber = ethers.BigNumber
        const utils = ethers.utils
        const name = label
        const labelHash = utils.keccak256(utils.toUtf8Bytes(name))
        const tokenId = BigNumber.from(labelHash).toString()
        return tokenId;
    }

    const { data: owner2 } = useContractRead({
        address: ensBaseRegistrarAddr,
        abi: ensBaseRegistrarAbi,
        functionName: 'ownerOf',
        args: [
            ensTokenId(oid.split(".")[0])
        ]
    })
    const isOwner = owner == address || owner2 == address;
    const usingMobile = useCheckMobileScreen();
    //const isOwner = true; 


    const isApprovedForAll = useContractRead({
        address: namewrapperAddrGoerli,
        abi: namewrapperAbiGoerli,
        functionName: 'isApprovedForAll',
        args: [
            address,
            M3mberRegistrarAddrGoerli,
        ]
    })
    const { data: namesResult } = useContractRead({
        address: M3mberRegistrarAddrGoerli,
        abi: M3mberRegistrarAbiGoerli,
        functionName: 'names',
        args: [
            namehash.hash(oid),
        ]
    })

    const sortCommunityData = (row1: DataType, row2: DataType) => {
        if (row1.avatar && row2.avatar) {
            if (row1.avatar > row2.avatar) return 1;
            else return -1;
        }
        if (row1.avatar) {
            return 1;
        }
        if (row2.avatar) {
            return -1;
        }

        if (row1.address && row2.address) {
            if (row1.address > row2.address) return 1;
            else return -1;
        }
        if (row1.address) {
            return 1;
        }
        if (row2.address) {
            return -1;
        }
    }

    useEffect(() => {
        if (isCanUnwrapBurnt.data && isApprovedForAll.data) {
            // console.log(isCanUnwrapBurnt.data);
            // console.log(namehash.hash(oid));
            // console.log("+++++");
            setMintRuleAccess(true);
        } else {
            setMintRuleAccess(false);
        }
    }, [oid])


    useEffect(() => {
        (async () => {
            const oidDomainData = await domainData(oid);
            setSummaryCardData(oidDomainData);
        })()
    }, [oid]);

    const getOneNameAndAvatar = async (row, i) => {
        let avatar;
        let name;
        if (row.address) {
            try {
                // console.log()
                name = await provider.lookupAddress(row.address);
                avatar = await (await provider.getResolver(name)).getText("avatar");
                if (!avatar.includes("https")) {
                    avatar = "https://metadata.ens.domains/goerli/avatar/" + name;
                }
            } catch (error) {
                console.log(error);
            }
        }
        if (!avatar) avatar = "https://source.boringavatars.com/beam/40/" + row.domain;

        if (!name) name = "Not Set";

        let communityPageDataCopy = [...communityPageData];
        row.name = [name, row.name[1]];
        row.avatar = avatar;
        communityPageDataCopy[i] = row;
        // lock?
        communityPageDataCopy.sort(sortCommunityData);
        setCommunityPageData(communityPageDataCopy);
        setCommunityPageSearchData(communityPageDataCopy);
        // lock release?
    }

    useEffect(() => {
        (async () => {
            const oidsubdomainDetails = await subdomainDetails(oid);
            // console.log(oidsubdomainDetails);

            setCommunityPageData(oidsubdomainDetails);
            setCommunityPageSearchData(oidsubdomainDetails);

            if (oidsubdomainDetails) {
                setTableLoading(false);
            }
        })()
    }, [oid]);

    useEffect(() => {
        (async () => {
            // console.log(communityPageData)
            if (communityPageData && communityPageData.length != 0) {
                for (let i = 0; i < communityPageData.length; ++i) {
                    getOneNameAndAvatar(communityPageData[i], i);
                }
            }
        })()
    }, [communityPageData && communityPageData.length])

    useEffect(() => {
        if (namesResult) {
            var data = mintRuleData;
            data.ruleCreated = namesResult["available"];
            data.rule = "Any subdomain";
            data.fee = Number(ethers.utils.formatEther(namesResult["registrationFee"]));
            console.log(namesResult[2]);
        }

    }, [namesResult])

    function handleShare() {
        navigator.clipboard.writeText(window.location.origin + '/join/' + oid);
        toast.success("Successfully copied share link!")
    }

    return (
        <Container>
            <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                <section style={{ width: 325, marginRight: 25 }}>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                        <SquareIconButton link={`/giveoutpass/${oid}`} text={"Give out pass"} icon={"/give_out_icon.png"} />
                        <SquareIconButton link={`/edit/${oid}`} text={"Edit membership"} icon={"/edit_icon.png"} />
                    </div>
                    <MembershipCard text="Memership Claimed" data={summaryCardData.memberNum} />
                    <CommunityTreasuryCard data={summaryCardData} />
                    <Button style={{ marginTop: 25 }} onClick={handleShare}>Share Invite Link</Button>
                </section>
                <section style={{ flex: "8 8 auto" }}>
                    <Table columns={columns} dataSource={communityPageSearchData} loading={tableLoading} />
                </section>
            </div>
        </Container>


    );

}

export default OrgPage