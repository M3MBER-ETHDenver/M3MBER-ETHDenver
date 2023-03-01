import {css, Input} from '@nextui-org/react';
import { Button } from "antd";
import { relative } from "path";
import { Typography } from 'antd';

const { Title, Text } = Typography;


function handleSubdomain(event: any) {
    console.log(event)
  }

export default function CommunityCard({...props}) {
    const { communityName,
        ensDomain,
        createdDate,
        memberNum,
        backgroundSrc,
        avatarSrc } = props.data;
    console.log(avatarSrc);
    return (
        <div
            style={{ width: 475, height: 583, overflow: "hidden", borderRadius: "20px", backgroundColor: "white" }}
        >
            <div style={{
                width: "100%", height: 143,
                backgroundImage: `url('${backgroundSrc}')`, backgroundSize: "contain"
            }}>
            </div>
            <div style={{ width: "100%", height: 370, position: "relative" }}>
                <div style={{
                    width: 100, height: 100, borderRadius: "50%", overflow: "hidden", border: "5px white",
                    position: "relative", margin: "auto", bottom: 50
                }}>
                    <img src={avatarSrc} alt={`${communityName} avatar`} style={{ width: "100%", height: "100%" }} />
                </div>
                <div style={{
                    width: "100%", position: "absolute", top: 70,
                    display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                    <Text style={{fontSize: 18, color: "gray"}}>You're invited to join</Text>
                    <Title level={2} style={{ margin: "6px 0" }}>{communityName}</Title>
                    <Text style={{ margin: "3px 0 30px 0", fontSize: 16 }}>Created <b>{createdDate} · {memberNum}</b> Members</Text>

                </div>

                <div style={{
                    width: "100%", position: "relative", top: 120,
                    display: "flex", flexDirection: "column", alignItems: "center", 
                }}>
                    <Input
                            
                            labelRight={ensDomain}
                            placeholder="julie" 
                        />
                    <h1>{} ETH</h1>
                    <Button type="primary" style={{ width: 296, height: 43, marginTop: "20px" }}>
                        Mint Your Subdomain
                    </Button>

                </div>
                    
        
            </div>
        </div>
    )
}