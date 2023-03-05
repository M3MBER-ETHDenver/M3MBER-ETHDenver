import Container from "../../components/Container";
import { Modal, Card, Heading, Button, Textarea } from '@ensdomains/thorin';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { Space, Table, Tooltip } from 'antd';
import { Tag } from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import useCheckMobileScreen from "../../hooks/useCheckMobileScreen";
import { ensBaseRegistrarAbi, ensBaseRegistrarAddr, M3mberRegistrarAbiGoerli, M3mberRegistrarAddrGoerli, namewrapperAbiGoerli, namewrapperAddrGoerli } from "../../lib/constants";
import { useRouter } from "next/router";
import namehash from "@ensdomains/eth-ens-namehash";
import { ethers } from "ethers";
import { provider, subdomainDetails, myNamesData } from "../../lib/ensdata";
import { InfoCircleTwoTone } from '@ant-design/icons';
import CustomModal from "../../components/CustomModal";
import { InputNumber, Input } from "antd";
import {
    useAccount,
    useContractRead,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
    goerli
} from 'wagmi'
//data for table
export interface DataType {
    key: React.Key;
    plan: string;
    domain: string;
    address: string;
    //TODO: I changed this from string to date, rember to update data
    expirationdate: Date;
    index: string;
    id: number;
}



//TODO: this whole data table needs to be updated
export default function MyPlans({ Component, pageProps }) {
    const [tableLoading, setTableLoading] = useState(false);
    const router = useRouter();
    //TODO: change oid to dynamic get on this page
    const [myData, setMyData] = useState<DataType[]>();
    const { address, connector, isConnected } = useAccount();
    const [fee, setFee] = useState("0.01");
    const [description, setDescription] = useState("Basic Access to member.eth. All the members will have limited access of our team alpha update at nft chat channel.");

    
    //columns setting
    const columns: ColumnsType<DataType> = [
        {
            dataIndex: 'info',
            render: (_, record) => (
                <InfoCircleTwoTone style={{ fontSize: 20 }} className="info-button"
                    onClick={() => {
                        //TODO: pass in the data for info overlay
                        setFee("0.01");
                        setDescription("Basic Access to member.eth. All the members will have limited access of our team alpha update at nft chat channel.");
                        //setInfoOpen(true);
                    }} />
            ),
        },
        {
            title: 'Plan',
            dataIndex: 'plan',
            
        },
        {
            title: 'M3MBER subname',
            dataIndex: 'domain',
            
        },
        {
            title: 'Expiration date',
            dataIndex: 'expirationdate',
            render: (expirationdate)=>{
                return(
                <p style={{color:new Date(expirationdate).getTime() < new Date(new Date().getFullYear(), new Date().getMonth() + 2).getTime()?"rgb(255,124,94)":"black"}}>{expirationdate}</p>
                )
            }
            
        },
        {
            title: 'Action',
            key: 'action',
            render: (a, record) => {
                /*const {data:data} = useContractRead({
                    address: M3mberRegistrarAddrGoerli,
                    abi: M3mberRegistrarAbiGoerli,
                    functionName: 'names',
                    args: [namehash.hash(record.parent)]
                }); 
                const { config } = usePrepareContractWrite({
                    address: M3mberRegistrarAddrGoerli,
                    abi: M3mberRegistrarAbiGoerli,
                    functionName: 'renew',
                    args: [
                        namehash.hash(record.parent), // parentNode
                        record.labelhash,
                        1
                    ],
                    overrides: {
                        gasLimit: '1000000',
                        value: data? data["registrationFee"]:0
                    },
                })
                const renewName = useContractWrite(config)
                */
                return (
                <Space>
                    <Button size="small" onClick={()=>{router.push("/extend/"+record.domain+"?d="+new Date(new Date(record.expirationdate).getTime() - (new Date(record.expirationdate).getTimezoneOffset() * 60000 )).toISOString().split("T")[0])}}>Extend</Button>
                    <Button size="small" onClick={()=>{window.open(`https://testnets.opensea.io/assets/goerli/0x060f1546642e67c485d56248201fea2f9ab1803c/${record.id.toString()}/transfer`)}}>Transfer</Button>
                    <Button size="small" onClick={()=>{window.open(`https://testnets.opensea.io/assets/goerli/0x060f1546642e67c485d56248201fea2f9ab1803c/${record.id.toString()}`)}}>Sell</Button>
                </Space>)
            },
        },
    ];

    
    useEffect(() => {
       (async ()=>{
        if(address){
            const data = await myNamesData(address)
            setMyData(data)   
        }
       })()
    }, [address])
    
    

    const ensTokenId = (label) => {
        const BigNumber = ethers.BigNumber
        const utils = ethers.utils
        const name = label
        const labelHash = utils.keccak256(utils.toUtf8Bytes(name))
        const tokenId = BigNumber.from(labelHash).toString()
        return tokenId;
    }

    return (
        <Container>
            <Heading style={{ fontSize: "50px", marginBottom: 30 }}>My Memberships</Heading>
            <Table columns={columns} dataSource={myData} loading={tableLoading} />
            {/*
                    <CustomModal open={infoOpen} onDismiss={() => { setInfoOpen(false); }}>
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "10px" }}>
                            <div style={{ flex: "1 1 auto" }}>
                                <p style={{ marginBottom: "10px", color: "#9B9BA5" }}>Subname of</p>
                                <Input disabled value={} placeholder=""
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
                </CustomModal>*/}
        </Container>
    );
}