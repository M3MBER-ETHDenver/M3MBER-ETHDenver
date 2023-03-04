import Container from "../../components/Container";
import { Heading } from "@ensdomains/thorin";

//data for table
export interface DataType {
    key: React.Key;
    avatar: string;
    name: [string, boolean];
    domain: string;
    address: string;
    index: string;
}

export default function MyPlans({ Component, pageProps }) {
    return (
        <Container>
            <Heading style={{ fontSize: "50px", marginBottom: 30 }}>My Membership</Heading>
        </Container>
    );
}