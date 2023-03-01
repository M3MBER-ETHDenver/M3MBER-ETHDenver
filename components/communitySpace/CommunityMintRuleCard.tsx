import { Button, message, Space } from "antd";
import { relative } from "path";
import { Typography, Card, Skeleton, Avatar } from 'antd';
const { Meta } = Card;
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
const { Title, Text } = Typography;

export default function CommunityMintRuleCard(props) {
    const CopyShare = async (text) => {
        try {
            await navigator.clipboard.writeText(text)
            toast.success('Link copied to clipboard')
        } catch (err) {
            console.error('Failed to copy, please try again.', err)
            toast.error('Failed to copy, please try again.')
        }
    }


    // const { 
    // } = props.data;

    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    // const data = []

    useEffect(() => {
        setLoading(true);
        if(props.data.rule){
            data.push([props.data.rule, props.data.fee])
            console.log(data)
            setData(data);
            // if (props.data.ensDomain && props.data.createdDate && props.data.avatarSrc) {
            setLoading(false);
        // }
        }
    }, [])

    if (loading) {
        return (
        <Card style={{
            width: 365, height: 550, borderRadius: "10px", backgroundColor: "white"
        }} loading={true}>
        </Card>)
    }

    return (
        <Card
            style={{
                width: 365, overflow: "hidden", borderRadius: "10px", backgroundColor: "white", marginTop: "30px", marginBottom: "30px"
            }}
            className={"mint-rule-card"}
        >
            <div style={{ width: "100%", height: "auto", position: "relative" }}>
                <div style={{
                    width: "100%", display: "flex", flexDirection: "column"
                }}>
                    <div>
                        <Text style={{ fontSize: "24px", fontWeight: "700" }}>Mint rule</Text>
                        <Button type="primary" size="small" style={{ width: "60px", height: "26px", float: "right", marginTop: "5px"}}
                            onClick={() => {
                                props.setMintRuleOpen(true); // OK
                            }}
                        >
                            Edit
                        </Button>
                    </div>
                    {/* <>
                        {(() => {
                            const arr = [];
                            for (let i = 0; i < data.length; i++) {
                                arr.push(
                                <div style={{marginTop: "20px"}}>
                                    {
                                        Object.entries(data[i]).map(([key, value]) => 
                                        <div>
                                            <Text style={{ fontSize: "16px", fontWeight: "500", color: "rgba(155, 155, 165, 1)" }}>{key}</Text>
                                            <Button type="primary" size="small" style={{ width: "60px", height: "26px", float: "right", marginTop: "5px", color: "rgba(83, 172, 134, 1)", backgroundColor: "rgba(233, 244, 239, 1)"}}>
                                                {value}
                                            </Button>
                                        </div>
                                        )
                                    }
                                </div>
                                );
                            }
                            return arr;
                        })()}
                    </> */}
                    <>
                        {(() => {
                            const arr = [];
                            for (let i = 0; i < data.length; i++) {
                                arr.push(
                                <div style={{marginTop: "20px"}}>
                                    {
                                        <div>
                                            <Text style={{ fontSize: "16px", fontWeight: "500", color: "rgba(155, 155, 165, 1)" }}>{data[i][0]}</Text>
                                            <Button type="primary" size="small" style={{ width: "60px", height: "26px", float: "right", color: "rgba(83, 172, 134, 1)", backgroundColor: "rgba(233, 244, 239, 1)"}}>
                                            {data[i][1] === 0 ? "Free": data[i][1]} 
                                            </Button>
                                        </div>
                                    }
                                </div>
                                );
                            }
                            return arr;
                        })()}
                    </>

                </div>
            </div>
        </Card>
    )
}