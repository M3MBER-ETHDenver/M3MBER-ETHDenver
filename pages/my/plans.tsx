import Container from "../../components/Container";
import { Modal, Card, Heading, Button, Textarea } from '@ensdomains/thorin';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Space, Table, Tooltip } from 'antd';
import { Tag } from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import useCheckMobileScreen from "../../hooks/useCheckMobileScreen";
import { useAccount, useContractRead } from "wagmi";
import { ensBaseRegistrarAbi, ensBaseRegistrarAddr, M3mberRegistrarAbiGoerli, M3mberRegistrarAddrGoerli, namewrapperAbiGoerli, namewrapperAddrGoerli } from "../../lib/constants";
import { useRouter } from "next/router";
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from "ethers";
import { provider, subdomainDetails } from "../../lib/ensdata";
import { InfoCircleTwoTone } from '@ant-design/icons';
import CustomModal from "../../components/CustomModal";
import { InputNumber, Input } from "antd";




//data for table
export interface DataType {
    key: React.Key;
    plan: string;
    domain: string;
    address: string;
    expirationdate: string;
    index: string;
}



//TODO: this whole data table needs to be updated
export default function MyPlans({ Component, pageProps }) {
    const [communityPageSearchData, setCommunityPageSearchData] = useState<DataType[]>();
    const [tableLoading, setTableLoading] = useState(false);
    const router = useRouter();
    //TODO: change oid to dynamic get on this page
    const [oid, setOid] = useState("m3mber.eth");
    const [communityPageData, setCommunityPageData] = useState<DataType[]>();
    const { address, connector, isConnected } = useAccount();
    const [infoOpen, setInfoOpen] = useState(false);
    const [fee, setFee] = useState("0.01");
    const [description, setDescription] = useState("Basic Access to member.eth. All the members will have limited access of our team alpha update at nft chat channel.");

    //columns setting
    const columns: ColumnsType<DataType> = [
        {
            dataIndex: 'info',
            render: (_, record) => (
                <InfoCircleTwoTone style={{ fontSize: 20 }} className="info-button"
                    onClick={() => {
                        //TODO
                        setFee("0.01");
                        setDescription("Basic Access to member.eth. All the members will have limited access of our team alpha update at nft chat channel.");
                        setInfoOpen(true);
                    }} />
            ),
        },
        {
            title: 'Plan',
            dataIndex: 'plan',
            sorter: {

                compare: (a, b) => {
                    if (a.index == '0' || b.index == '0') {
                        return 0
                    } else {
                        return a.plan.localeCompare(b.plan)
                    }

                },
                multiple: 1,
            },
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
            title: 'Expiration date',
            dataIndex: 'expirationdate',
            sorter: {

                compare: (a, b) => {
                    return 0;

                },
                multiple: 1,
            },
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small">Extend</Button>
                    <Button size="small">Transfer</Button>
                    <Button size="small">Sell</Button>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
        }
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
    console.log(namesResult);

    const sortCommunityData = (row1: DataType, row2: DataType) => {
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
        (async () => {
            const oidsubdomainDetails = await subdomainDetails(oid);
            console.log(oidsubdomainDetails);
            //TODO: update here to match new DataType
            setCommunityPageData(oidsubdomainDetails);
            setCommunityPageSearchData(oidsubdomainDetails);

            if (oidsubdomainDetails) {
                setTableLoading(false);
            }
        })()
    }, [oid]);

    const data: DataType[] = [
        {
            key: 1,
            plan: "m3mber.eth - monthly",
            domain: "julie.flamingle.eth",
            address: "",
            expirationdate: "Jan 14, 2023",
            index: ""
        },
        {
            key: 1,
            plan: "m3mber.eth - monthly",
            domain: "julie.flamingle.eth",
            address: "",
            expirationdate: "Jan 14, 2023",
            index: ""
        },
        {
            key: 1,
            plan: "m3mber.eth - monthly",
            domain: "julie.flamingle.eth",
            address: "",
            expirationdate: "Jan 14, 2023",
            index: ""
        }
    ]

    return (
        <Container>
            <Heading style={{ fontSize: "50px", marginBottom: 30 }}>My Memberships</Heading>
            <Table columns={columns} dataSource={data} loading={tableLoading} />
            <CustomModal open={infoOpen} onDismiss={() => { setInfoOpen(false); }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "10px" }}>
                    <div style={{ flex: "1 1 auto" }}>
                        <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Subname of</p>
                        <Input disabled value={oid} placeholder=""
                            style={{ height: 50 }} />
                    </div>
                    <div style={{ flex: "1 1 auto", marginLeft: "10px" }}>
                        <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Fee</p>
                        <InputNumber
                            disabled
                            size="large"
                            stringMode
                            className="fee-input"
                            prefix={<img src="/eth.png" alt="etherem" style={{ height: 14, width: "100%" }} />}
                            value={fee}
                            min="0" defaultValue="0.05" step="0.01"
                            style={{ height: 50 }} />
                    </div>
                    <div style={{ flex: "0 1 200px", marginLeft: "10px" }}>
                        <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Period</p>
                        <Input disabled value={"Monthly"}
                            style={{ height: 50 }} />
                    </div>
                </div>
                <div>
                    <p style={{ color: "#9B9BA5" }}>Description</p>
                    <Textarea label="" value={description}
                        style={{ height: "200px" }}
                        maxLength={1000}
                        disabled
                        placeholder="Describe what benefit this membership will provide" />
                </div>
            </CustomModal>
        </Container>
    );
}