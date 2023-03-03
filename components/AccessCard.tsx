import React from "react";
import { Card, Button, Typography } from "@ensdomains/thorin";


export default function AccessCard(props) {
    const { wrapETH2LD, isApprovedForAll, setApprovalForAll, isApprovedForAllResult, step, burnCanUnwrap } = props;

    if (step == 1)
        return (
            (setApprovalForAll.isSuccess || isApprovedForAll.data) ?
                <Card
                    style={{
                        padding: "20px 50px", width: 350, height: 450,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        backgroundColor: "#4E86F7", color: "white"
                    }}>

                    <img src="/check.png" alt="check" style={{ width: 75, height: 75, margin: "50px auto 20px auto" }} />
                    <p style={{ fontSize: 26, textAlign: "center" }}>Wrap your name (TODO)</p>
                    <p style={{ fontSize: 26, textAlign: "center", margin: "80px auto 0 auto" }}>Completed!</p>
                </Card>
                :
                <Card
                    style={{
                        padding: "20px 50px", width: 350, height: 450,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)"
                    }}>

                    <img src="/1.png" alt="1" style={{ width: 75, height: 75, margin: "50px auto 20px auto" }} />
                    <p style={{ fontSize: 26, textAlign: "center" }}>Wrap your name (TODO)</p>
                    <Button size="medium" loading={wrapETH2LD.isLoading}
                        onClick={() => { wrapETH2LD.write() }}
                        disabled={!wrapETH2LD.write || wrapETH2LD.isLoading || wrapETH2LD.isSuccess || isApprovedForAllResult}
                        style={{ width: 180, height: 50, borderRadius: 100, margin: "80px auto 0 auto" }}>
                        {setApprovalForAll.isLoading ? "Loading..." : "Sign"}
                    </Button>
                </Card>
        );

    if (step == 2)
        return (
            (setApprovalForAll.isSuccess || isApprovedForAll.data) ?
                <Card
                    style={{
                        padding: "20px 50px", width: 350, height: 450,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        backgroundColor: "#4E86F7", color: "white"
                    }}>

                    <img src="/check.png" alt="check" style={{ width: 75, height: 75, margin: "50px auto 20px auto" }} />
                    <p style={{ fontSize: 26, textAlign: "center" }}>Grant M3MBER Contract Right</p>
                    <p style={{ fontSize: 26, textAlign: "center", margin: "80px auto 0 auto" }}>Completed!</p>
                </Card>
                :
                <Card
                    style={{
                        padding: "20px 50px", width: 350, height: 450,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)"
                    }}>

                    <img src="/1.png" alt="1" style={{ width: 75, height: 75, margin: "50px auto 20px auto" }} />
                    <p style={{ fontSize: 26, textAlign: "center" }}>Grant M3MBER Contract Right</p>
                    <Button size="medium" loading={setApprovalForAll.isLoading}
                        onClick={() => { setApprovalForAll.write() }}
                        disabled={!setApprovalForAll.write || setApprovalForAll.isLoading || setApprovalForAll.isSuccess || isApprovedForAllResult}
                        style={{ width: 180, height: 50, borderRadius: 100, margin: "80px auto 0 auto" }}>
                        {setApprovalForAll.isLoading ? "Loading..." : "Sign"}
                    </Button>
                </Card>
        );

    if (step == 3)
        return (
            (burnCanUnwrap.isSuccess) ?
                <Card
                    style={{
                        padding: "20px 50px", width: 350, height: 450,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                        backgroundColor: "#4E86F7", color: "white"
                    }}>

                    <img src="/check.png" alt="check" style={{ width: 75, height: 75, margin: "50px auto 20px auto" }} />
                    <p style={{ fontSize: 26, textAlign: "center" }}>Burn CAN_UNWRAP fuses</p>
                    <p style={{ fontSize: 26, textAlign: "center", margin: "80px auto 0 auto" }}>Completed!</p>
                </Card>
                :
                <Card
                    style={{
                        padding: "20px 50px", width: 350, height: 450,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.12)"
                    }}>

                    <img src="/1.png" alt="1" style={{ width: 75, height: 75, margin: "50px auto 20px auto" }} />
                    <p style={{ fontSize: 26, textAlign: "center" }}>Burn CAN_UNWRAP fuses</p>
                    <Button size="medium" loading={burnCanUnwrap.isLoading}
                        onClick={() => burnCanUnwrap.write()}
                        disabled={!burnCanUnwrap.write || burnCanUnwrap.isLoading || burnCanUnwrap.isSuccess || (!setApprovalForAll.isSuccess && !isApprovedForAll.data)}
                        style={{ width: 180, height: 50, borderRadius: 100, margin: "80px auto 0 auto" }}>
                        {burnCanUnwrap.isLoading ? "Loading..." : "Sign"}
                    </Button>
                </Card>
        );
}