require("@nomiclabs/hardhat-etherscan");


async function main() {
    const NaiveSubdomainRegistrar = await ethers.getContractFactory("SubscriptionSubdomainRegistrar");
 
    // Start deployment, returning a promise that resolves to a contract object
    const subdomain_reg = await NaiveSubdomainRegistrar.deploy("0x23d86f0bf4900978B191378B134519371Da52f75");
    console.log("Contract deployed to address:", subdomain_reg.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });