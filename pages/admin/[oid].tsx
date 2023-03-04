import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Table, Tooltip } from 'antd';
import { Typography } from 'antd';
import EditConfirmation from "../../components/communitySpace/EditConfirmation";
import type { ColumnsType, TableProps } from 'antd/es/table';
import { useAccount } from "wagmi";
import { Input, Button } from 'antd';
import { CSVLink } from 'react-csv';

import CommunitySummaryCard from "../../components/communitySpace/CommunitySummaryCard";
import EditRuleCard from "../../components/communitySpace/EditRuleCard";
import CommunityTreasuryCard from "../../components/communitySpace/CommunityTreasuryCard";
import { domainData, subdomainDetails, provider } from "../../lib/ensdata";
import { ensRegistrarAddr, ensRegistrarAbi } from '../../lib/constants';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { useProvider } from "wagmi";
import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { MeTag } from '../../components/MeTag';
import MintRules from "../../components/communitySpace/MintRules";
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
import CopyShare from "../../utils/CopyShare";
import CommunityStatCard from "../../components/communitySpace/CommunityStatCard";

//data for summary card
export type SummaryCardData = {
    communityName: string;
    ensDomain: string;
    createdDate: string;
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
    createdDate: "",
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
        title: '',
        dataIndex: 'avatar',
        render: (avatar: string) => (
            <div style={{ width: 48, height: 48, borderRadius: "50%", overflow: "hidden", margin: "0 -16px 0 20px" }}>
                <img src={avatar} alt="avatar" style={{ width: "100%", height: "auto" }} />
            </div>),
    },
    {
        title: 'ENS',
        dataIndex: 'name',
        sorter: {

            compare: (a, b) => {
                if (a.index == '0' || b.index == '0') {
                    return 0
                } else {
                    return a.name[0].localeCompare(b.name[0])
                }
            },
            multiple: 1,
        },
        render: (name: [string, boolean]) => {


            if (name[1]) {
                return (
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",

                    }}>

                        <Text strong>{name[0]}</Text>
                        <div style={{
                            marginLeft: "20px"
                        }}></div>
                        <MeTag></MeTag>
                    </div>
                )
            } else {
                return (
                    <Text strong>{name[0]}</Text>
                )
            }
        }
    },
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
        title: 'Wallet address',
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
        render: (address: string) => {
            if (address.length <= 11) {
                return (
                    <div>
                        <Tooltip title="Copy address to clipboard">
                            <button
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigator.clipboard.writeText(address)}
                            >
                                {address}
                            </button>
                        </Tooltip>
                    </div>
                )
            }
            let truncated = address.substring(0, 4) + "..." + address.substring(address.length - 4, address.length);
            return (
                <div>
                    <Tooltip title="Copy address to clipboard">
                        <button
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigator.clipboard.writeText(address)}
                        >
                            {truncated.toLowerCase()}
                        </button>
                    </Tooltip>
                </div>
            )
        }
    },
    {
        title: 'Expiration date',
        dataIndex: 'date',
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
    const [editOpen, setEditOpen] = useState(false);
    const [mintRuleOpen, setMintRuleOpen] = useState(false);

    const [summaryCardData, setSummaryCardData] = useState<SummaryCardData>(defaultCardData);
    const [communityPageData, setCommunityPageData] = useState<DataType[]>();
    const [communityPageSearchData, setCommunityPageSearchData] = useState<DataType[]>();
    const [editData, setEditData] = useState<EditData>({
        website: "", discord: "", twitter: "",
        telegram: "", background: "", image: ""
    });
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

    const ensTokenId=(label)=>{
        const BigNumber = ethers.BigNumber
        const utils = ethers.utils
        const name = label
        const labelHash = utils.keccak256(utils.toUtf8Bytes(name))
        const tokenId = BigNumber.from(labelHash).toString()
        return tokenId;
    }

    const {data:owner2}= useContractRead({
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
    console.log(owner);
    console.log(namesResult);

    const sortCommunityData = (row1: DataType, row2: DataType) => {
        if(row1.avatar && row2.avatar){
            if (row1.avatar > row2.avatar) return 1;
            else return -1;
        }
        if(row1.avatar){
            return 1;
        }
        if(row2.avatar){
            return -1;
        }

        if(row1.address && row2.address){
            if (row1.address > row2.address) return 1;
            else return -1;
        }
        if(row1.address){
            return 1;
        }
        if(row2.address){
            return -1;
        }
    }

    const onSearch = ((value: string) => {
        console.log(value);
        if (value === '') {
            communityPageData.sort(sortCommunityData);
            setCommunityPageSearchData(communityPageData);
        }
        else {
            if (address) {
                let newSearchResults = [];
                for (var index in communityPageData) {
                    if (communityPageData[index].domain.includes(value)) {
                        newSearchResults.push(communityPageData[index]);
                    }
                    else if (communityPageData[index].name[0].includes(value)) {
                        newSearchResults.push(communityPageData[index]);
                    }
                    else if (communityPageData[index].address.includes(value)) {
                        newSearchResults.push(communityPageData[index]);
                    }
                }
                newSearchResults.sort(sortCommunityData);
                setCommunityPageSearchData(newSearchResults);
            }
        }
    });


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
            setEditData({
                website: oidDomainData.website,
                discord: oidDomainData.discord,
                twitter: oidDomainData.twitter,
                telegram: oidDomainData.telegram,
                background: oidDomainData.backgroundSrc,
                image: oidDomainData.avatarSrc
            })
        })()
    }, [oid]);

    const getOneNameAndAvatar = async (row, i) =>{
        let avatar;
        let name;
        if (row.address) {
            try {
                // console.log()
                name = await provider.lookupAddress(row.address);
                avatar = await (await provider.getResolver(name)).getText("avatar");
                if(!avatar.includes("https")){
                    avatar = "https://metadata.ens.domains/goerli/avatar/"+name;
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
            console.log(oidsubdomainDetails);

            setCommunityPageData(oidsubdomainDetails);
            setCommunityPageSearchData(oidsubdomainDetails);

            if (oidsubdomainDetails) {
                setTableLoading(false);
            }
        })()
    }, [oid]);

    useEffect(()=>{
        (async () =>{
        console.log(communityPageData)
        if(communityPageData && communityPageData.length != 0){
            for (let i = 0; i < communityPageData.length; ++i) {
                getOneNameAndAvatar(communityPageData[i], i);
            }
        }})()
    }, [communityPageData && communityPageData.length])

    useEffect(() => {
        if (namesResult) {
            var data = mintRuleData;
            data.ruleCreated = namesResult["available"];
            data.rule = "Any subdomain";
            data.fee = Number(ethers.utils.formatEther(namesResult["registrationFee"]));
            console.log(namesResult[2]);
            setMintRuleData(data);
            setMintRuleOpen(false);
        }

    }, [namesResult])

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "start", width: "100%", padding: "150px 4rem 0 4rem" }}>
           

            <div style={{ flex: "1 1 auto", marginLeft: "30px" }} className="members">
                <div style={{ marginBottom: "20px" }}>
                    <EditRuleCard ens={summaryCardData.ensDomain}></EditRuleCard>
                {isOwner && <CommunityTreasuryCard data={summaryCardData}></CommunityTreasuryCard>}
                <CommunityStatCard></CommunityStatCard>
                    <Button
                            onClick={() => CopyShare(window.location.origin + '/join/' + oid)}
                            style={{ width: 304, height: 48 }}>
                            Share Invitation
                    </Button>
                    <br/>
                    <Search style={{ width: "400px", marginTop:"50px" }} placeholder="Search by everything" onChange={(event) => onSearch(event.target.value)} enterButton />
                    {communityPageSearchData &&
                        <Button
                            type="primary"
                            size="small"
                            style={{ height: "32px", float: "right", color: "#4E86F7", backgroundColor: "#DCE7FD" }}
                        >
                            <CSVLink {...csvReport}>Export List</CSVLink>
                        </Button>
                    }
                
                </div>
                <Table columns={columns} dataSource={communityPageSearchData} loading={tableLoading} />
            </div>
            <EditConfirmation open={editOpen} setEditOpen={setEditOpen} link={"https://alpha.ens.domains/" + summaryCardData.ensDomain} />
            
        </div>
    );

}

export default OrgPage