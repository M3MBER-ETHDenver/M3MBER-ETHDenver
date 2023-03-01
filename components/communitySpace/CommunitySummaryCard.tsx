import { message, Space } from "antd";
import { Button } from "@ensdomains/thorin";
import { relative } from "path";
import { Typography, Card, Skeleton, Avatar } from 'antd';
const { Meta } = Card;
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
const { Title, Text } = Typography;
import CopyShare from "../../utils/CopyShare";

export default function CommunitySummaryCard({ ...props }) {

    const { communityName,
        ensDomain,
        createdDate,
        memberNum,
        backgroundSrc,
        avatarSrc,
        telegram,
        twitter,
        website,
        discord,
    } = props.data;

    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (props.data.ensDomain && props.data.createdDate && props.data.avatarSrc) {
            setLoading(false);
        }
    }, [props.data])

    /*
    const handleInvite = (link: string) => {
        messageApi.open({
            type: 'success',
            content: "Invitation linked copied!",
        });
        navigator.clipboard.writeText(link);
    }*/

    if (loading) {
        return (
            <Card style={{
                width: 365, height: 550, borderRadius: "10px", backgroundColor: "white"
            }} loading={true}>
                {/* <Skeleton.Avatar active style={{ width: 140, height: 140 }} /> */}

            </Card>)
    }
    console.log("#####", props)
    return (
        <Card
            style={{
                width: 365, height: 550, overflow: "hidden", borderRadius: "10px", backgroundColor: "white"
            }}
            className={"summary-card"}
        >
            {contextHolder}
            <div style={{
                width: "100%", height: 180,
                backgroundImage: `url('${backgroundSrc}')`, backgroundSize: "contain"
            }}>
            </div>
            <div style={{ width: "100%", height: 370, position: "relative" }}>
                <div style={{
                    width: 140, height: 140, borderRadius: "50%", overflow: "hidden", border: "5px white",
                    position: "relative", margin: "auto", bottom: 70
                }}>
                    <img src={avatarSrc} alt={`${communityName} avatar`} style={{ width: "100%", height: "100%" }} />
                </div>
                {props.isOwner && <Button size="small"
                    style={{
                        position: "absolute", top: 20, right: 30, width: 56, height: 26,
                        fontSize: 13
                    }}
                    onClick={() => {
                        props.setEditOpen(true)
                    }}>
                    Edit
                </Button>}
                <div style={{
                    width: "100%", position: "absolute", top: 80,
                    display: "flex", flexDirection: "column", alignItems: "center"
                }}>
                    <Title level={3} style={{ margin: "6px 0" }}>{communityName}</Title>
                    <Text strong style={{ margin: "6px 0", fontSize: 16 }}>{ensDomain}</Text>
                    <Text style={{ margin: "6px 0 30px 0", fontSize: 16 }}>Created <b>{createdDate} · {memberNum}</b> Members</Text>



                    {
                        //when the user is owner and rule created or when user is not owner
                        //and rule hasn't stopped
                        (props.isOwner && props.ruleCreated || !props.isOwner) && !props.stopped
                        && <Button
                            size="medium"
                            onClick={() => CopyShare(window.location.origin + '/invite/' + ensDomain)}
                            style={{ width: 304, height: 48 }}>
                            Share Invitation
                        </Button>}

                    {
                        //when the user is owner and the rules has not created
                        props.isOwner && !props.ruleCreated && <Button
                            size="medium"
                            onClick={() => {
                                props.setMintRuleOpen(true);
                            }}
                            style={{ width: 304, height: 48 }}>
                            Create Mint Rules
                        </Button>}

                    {
                        //as long as the minting has been stopped
                        props.stopped && props.ruleCreated && <Button
                            disabled
                            size="medium"
                            style={{ width: 304, height: 48 }}>
                            Share Invitation
                        </Button>}



                    <div style={{ width: 156, height: 24, display: "flex", justifyContent: "space-between", marginTop: "25px" }}>
                        {website ?
                            <a href={website} target="_blank"><img src="/img/website_icon.png" alt="website" style={{ width: 24, aspectRatio: 1 }} /></a>
                            :
                            <img src="/img/website_icon.png" alt="website" style={{ width: 24, aspectRatio: 1, opacity: 0.3 }} />
                        }

                        {discord ?
                            <a href={discord} target="_blank"><img src="/img/discord_icon.png" alt="website" style={{ width: 24, aspectRatio: 1 }} /></a>
                            :
                            <img src="/img/discord_icon.png" alt="discord" style={{ width: 24, aspectRatio: 1, opacity: 0.3 }} />
                        }

                        {twitter ?
                            <a href={twitter} target="_blank"><img src="/img/twitter_icon.png" alt="website" style={{ width: 24, aspectRatio: 1 }} /></a>
                            :
                            <img src="/img/twitter_icon.png" alt="twitter" style={{ width: 24, aspectRatio: 1, opacity: 0.3 }} />
                        }

                        {telegram ?
                            <a href={telegram} target="_blank"><img src="/img/telegram_icon.png" alt="website" style={{ width: 24, aspectRatio: 1 }} /></a>
                            :
                            <img src="/img/telegram_icon.png" alt="telegram" style={{ width: 24, aspectRatio: 1, opacity: 0.3 }} />
                        }

                    </div>
                </div>
            </div>
        </Card>
    )
}