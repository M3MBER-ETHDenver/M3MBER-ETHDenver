import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';

export default function Invite() {
    const [oid, setOid] = useState("");
    const router = useRouter();
    useEffect(() => {
        if (router.query.oid != undefined) {
            setOid(typeof (router.query.oid) == 'string' ? router.query.oid : router.query.oid[0]);
        }
    })

    return (
        <div style={{ width: "100%", height: "100%" }}>

        </div>
    )

}
