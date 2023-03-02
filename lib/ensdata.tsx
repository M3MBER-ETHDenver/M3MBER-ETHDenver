import { SummaryCardData, DataType } from "../pages/admin/[oid]";
import { getChain } from "../pages/_app";
import { useState } from "react";
import { ethers, getDefaultProvider } from 'ethers'
// import { useProvider } from 'wagmi';
import { ensRegistrarAddr, ensRegistrarAbi, ensBaseRegistrarAbi } from './constants';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { useNetwork, goerli, mainnet } from "wagmi";
import { useContractRead } from 'wagmi'
import namehash from "@ensdomains/eth-ens-namehash";
import { AnyARecord } from "dns";
import { resolve } from "path";
import { rejects } from "assert";

const CHAIN_GRAPH_MAP = new Map([[goerli, 'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli'], [mainnet, 'https://api.thegraph.com/subgraphs/name/ensdomains/ens']])

// new version of graph is still quite unstable
// const APIURL = 'https://gateway.thegraph.com/api/process.env.GRAPH_API_KEY/subgraphs/id/EjtE3sBkYYAwr45BASiFp8cSZEvd1VHTzzYFvJwQUuJx'
const APIURL = CHAIN_GRAPH_MAP.get(getChain());
const DEFAULT_AVATAR = "/img/dog_avatar.png";
export const GraphClient = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache(),
})

const countSubdomains = async (ensName : string) => {
    const query =
        `
    {
        domains (where: {name:"${ensName}"}){
            subdomainCount
        }
    }    
    `
    const data = await GraphClient
        .query({
            query: gql(query),
        })

    return data;
}

const registeredDate = async (ensName: string) => {
    const query =
        `{
        registrations (where: {domain_: {name: "${ensName}"}}) {
            id
            registrationDate
        }
    }  
    `
    const data = await GraphClient
        .query({
            query: gql(query),
        })
    return data;
}
export const subdomainDetails = async (ensName: string) => {

    const id = namehash.hash(ensName);
    const query =
        `
    {
        domains (where: {name:"${ensName}"}){
            
            subdomains{
                owner{
                    id
                }    
                resolvedAddress{
                    id
                }
                name
            }
        }
  }    `
    const data = await GraphClient
        .query({
            query: gql(query),
        })
    const subdomainDetails: DataType[] = [];
    // console.log(data.data);
    if (!data.data.domains[0]) {
        return subdomainDetails;
    }
    for (let i = 0; i < data.data.domains[0].subdomains.length; ++i) {
        // const resolver = await provider.getResolver(data.data.domains[0].subdomains[i].name);
        // let avatar = await resolver.getText("avatar");
        let avatar;
        let name;
        if (data.data.domains[0].subdomains[i].resolvedAddress) {
            try {
                // console.log()
                //name = await provider.lookupAddress(data.data.domains[0].subdomains[i].resolvedAddress.id);
                //avatar = await (await provider.getResolver(name)).getText("avatar");
            } catch (error) {
                console.log(error);
            }
        }
        if (!avatar) avatar = "https://source.boringavatars.com/beam/40/" + data.data.domains[0].subdomains[i].name;

        if (!name) name = "Loading..."
        subdomainDetails.push({
            key: (i + 1).toString(),
            avatar: avatar,
            name: [name, false],
            domain: data.data.domains[0].subdomains[i].name,
            address: data.data.domains[0].subdomains[i].resolvedAddress ? data.data.domains[0].subdomains[i].resolvedAddress.id : "Not Set",
            index: ""
        });
    }
    return subdomainDetails;
}

export const findAddress = async (ensName) => {
    const query =
        `
    {
        domains (where: {name:"${ensName}"}){
            resolvedAddress{
                id
            }
            name
        }
    }
    `
    const data = await GraphClient.query({
        query: gql(query),
    })

    return data;
}


// const provider = getDefaultProvider();
// const provider = useProvider();
// const ethRegistrar = new ethers.Contract(
//     ensRegistrarAddr,
//     ensRegistrarAbi,
//     provider
// )
export const provider = new ethers.providers.InfuraProvider(
    process.env.NETWORK,
    process.env.INFURA_API_KEY
);
export async function domainData(domainName) {
    const resolver = await provider.getResolver(domainName);
    const subdomainCountsData = await countSubdomains(domainName);
    let subdomainCount;
    if (subdomainCountsData.data.domains[0] != null) {
        subdomainCount = subdomainCountsData ? subdomainCountsData.data.domains[0].subdomainCount : null;
    } else {
        subdomainCount = null;
    }
    let telegram: string = null;
    let url: string = null;
    let discord: string = null;
    let twitter: string = null;
    let communityName: string = null;
    let avatar: string = null;
    let time = null;
    if (resolver != null) {
        telegram = await resolver.getText("telegram");
        url = await resolver.getText("url");
        discord = await resolver.getText("com.discord");
        twitter = await resolver.getText("com.twitter");
        communityName = await resolver.getText("name");
        avatar = await resolver.getText("avatar");
        time = await registeredDate(domainName);
    }

    if (!avatar) avatar = "https://source.boringavatars.com/marble/40/" + domainName;

    const result: SummaryCardData = {
        communityName: communityName,
        ensDomain: domainName,
        createdDate: time !== null ? new Date(time.data.registrations[0].registrationDate * 1000).toDateString() : null,
        memberNum: subdomainCount,
        backgroundSrc: "/img/comm_bg_temp.png",
        avatarSrc: avatar,
        telegram: telegram,
        website: url,
        discord: discord,
        twitter: twitter,
    }
    // console.log(result);
    return result;
}