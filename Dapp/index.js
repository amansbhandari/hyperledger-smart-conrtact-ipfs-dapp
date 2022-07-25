/**
 * @author aman singh bhandari
 * @bannerid B00910008
 */
import { createRequire } from "module";
import { create } from "ipfs-http-client";
import { AbortController } from "node-abort-controller";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);

var Web3 = require("web3");
const crypto = require("crypto");
const client = create();
var MFS_path008 = "/buyer-seller-agreement";
global.AbortController = AbortController;
let details = "{price:12ETH, item:rent-bmw3series}"; //Agreement between parties

const { Gateway, Wallets } = require("fabric-network");
const path = require("path");

const AppUtil = require("./lib/AppUtil.cjs");

const { buildWallet } = require("./lib/AppUtil.cjs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const walletPath = path.join(__dirname, "Org1"); //Org1 is exported and is kept in root folder

const http = require("http"); //protocol
const url = require("url");

const host = "0.0.0.0"; //localhost
const port = 8083; //port to listen

let identity = "Org1 Admin";
let networkConnections = {};
let gateway = null;
let network = null;
let contract = null;

const buyerKeyPair008 = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "der",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "der",
  },
});

const sellerKeyPair008 = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "der",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "der",
  },
});

async function initNetwork008() {
  try {
    const ccp = AppUtil.buildJunglekidsOrg1();
    const wallet = await buildWallet(Wallets, walletPath);
    if (gateway == null) gateway = new Gateway();

    if (network == null) {
      console.log("\nNetwork is not created yet.");
      console.log("Build a network gateway to connect to local emulator");

      await gateway.connect(ccp, {
        wallet,
        identity: identity, //.json exported from contract
        discovery: { enabled: true, asLocalhost: false }, //using emulator
      });
    }

    await submitAgreement008(); //write the agreement between buyer and seller in IPFS.
    await fetchAndSignDocBuyer008(); //Buyer will fetch and sign the document
    await fetchAndSignDocSeller008(); //Seller will fetch and sign the document
    await verifyBuyerDigiSign008(); //Verify Buyer's digital signature with buyer's public key
    await verifySellerDigiSign008(); //Verify Seller's digital signature with Seller's public key
  } catch (error) {
    console.error(`initializeHyperledgerNetwork error: ${error}`);
  }
}

var fetchAndSignDocBuyer008 = async function () {
  console.log("\n############### Buyer Signing document ###############");
  const raw = await readDocumentFromIPFS008();
  console.log(
    "Buyer read the document from IPFS with content:: " + '"' + raw + '"'
  );

  const privateKey = crypto.createPrivateKey({
    key: buyerKeyPair008.privateKey,
    type: "pkcs8",
    format: "der",
  });
  console.log("Buyer will sign the document now..");
  //--Sign document ---
  const sign = crypto.createSign("SHA256");
  console.log("Hashing SHA256..");
  sign.update(raw);
  sign.end();
  const signature = sign.sign(privateKey).toString("base64");
  console.log("Encrypting the hash with buyer's private key..");
  console.log("Signature of buyer completed successfully!");
  console.log("Digital signature is ", signature);

  await createAsset("BuyerSignature", signature);
};

var fetchAndSignDocSeller008 = async function () {
  console.log("\n############### Seller Signing document ###############");
  const raw = await readDocumentFromIPFS008();
  console.log(
    "Seller read the document from IPFS with content:: " + '"' + raw + '"'
  );

  const privateKey = crypto.createPrivateKey({
    key: sellerKeyPair008.privateKey,
    type: "pkcs8",
    format: "der",
  });
  console.log("Seller will sign the document now..");
  //--Sign document ---
  const sign = crypto.createSign("SHA256");
  console.log("Hashing SHA256..");
  sign.update(raw);
  sign.end();
  const signature = sign.sign(privateKey).toString("base64");
  console.log("Encrypting the hash with seller's private key..");
  console.log("Signature of seller completed successfully!");
  console.log("Digital signature is ", signature);

  await createAsset("SellerSignature", signature);
};

var verifyBuyerDigiSign008 = async function () {
  console.log("\n############### Verify buyer's signatures ###############");

  const raw = await readDocumentFromIPFS008();
  console.log("Read plain text of document from IPFS..");
  const result = await readAsset("BuyerSignature");
  let resultjson = JSON.parse(result);
  const value = resultjson.signature;
  console.log("Fetch buyer's signature from smart contract (getter method)..");
  console.log("Seller will now verify the digital sign of Buyer..");
  const sign = Buffer.from(value, "base64");
  const publicKey = crypto.createPublicKey({
    key: buyerKeyPair008.publicKey,
    type: "spki",
    format: "der",
  });
  console.log("Using public key of buyer..");

  const verify = crypto.createVerify("SHA256");
  verify.update(raw);
  verify.end();
  console.log("Hashing the plain text gotten from IPFS..");
  let isVerified = verify.verify(publicKey, sign);
  console.log("Digital sign of buyer verified with result:: ", isVerified);
};

var verifySellerDigiSign008 = async function () {
  console.log("\n############### Verify seller's signatures ###############");

  const raw = await readDocumentFromIPFS008();
  console.log("Read plain text of document from IPFS..");
  const result = await readAsset("SellerSignature");
  let resultjson = JSON.parse(result);
  const value = resultjson.signature;
  console.log("Fetch seller's signature from smart contract (getter method)..");
  console.log("Buyer will now verify the digital sign of Seller..");
  const sign = Buffer.from(value, "base64");
  const publicKey = crypto.createPublicKey({
    key: sellerKeyPair008.publicKey,
    type: "spki",
    format: "der",
  });
  console.log("Using public key of seller..");

  const verify = crypto.createVerify("SHA256");
  verify.update(raw);
  verify.end();
  console.log("Hashing the plain text gotten from IPFS..");
  let isVerified = verify.verify(publicKey, sign);
  console.log("Digital sign of seller verified with result:: ", isVerified);

  console.log("\nThe signature of both buyer and seller are vaerified..");
  console.log("Hurrrayy !! Approving the agreement!!");
};

var readDocumentFromIPFS008 = async function () {
  return client.files.stat(MFS_path008, { hash: true }).then(async (r) => {
    let ipfsAddr008 = r.cid.toString();
    //reading the content
    const resp = await client.cat(ipfsAddr008);
    let content = [];
    for await (const chunk of resp) {
      content = [...content, ...chunk];
      const raw = Buffer.from(content).toString("utf8");
      return raw;
    }
  });
};

var submitAgreement008 = async function () {
  global.AbortController = AbortController;
  const agreement008 =
    "Buyer will pay one thousand dollars on the day of delivery of item."; //Agreement between buyer and seller
  console.log(
    "\nSaving the agreement between buyer and seller in local IPFS: " +
      agreement008
  );

  return client.files
    .write(MFS_path008, new TextEncoder().encode(agreement008), {
      create: true,
    })
    .then(async (r) => {
      client.files.stat(MFS_path008, { hash: true }).then(async (r) => {
        let ipfsAddr008 = r.cid.toString();
        console.log("Stored file on IPFS with address ", ipfsAddr008);
      });
    })
    .catch((e) => {
      console.log(e);
    });
};

async function initContract() {
  try {
    console.log(
      "\nFrom the gateway created to access the emulator, retreive the channel"
    );
    network = await gateway.getNetwork("channel1"); //get the channel
    console.log("Got the network gateway of specified channel");
    contract = network.getContract("assignment2"); //get contract to access its method later
    console.log("Got the contract");
    networkConnections["assignment2"] = contract; //add to connection map
    return contract;
  } catch (error) {
    console.error(`\nContract initialization error: ${error}`);
  }
}

/**
 *
 * verifies if the contract is loaded and
 */
async function getActorConnection() {
  if (!networkConnections["assignmentz"]) {
    await initContract();
  }
  return networkConnections["assignment2"];
}

async function approveOrCancelAgreement(id, value) {
  let contract = await getActorConnection();
  let result = "";

  try {
    await contract.submitTransaction("approveOrCancelAgreement008", id, value); //approve or reject agreement
    result = "Agreement with Id " + id + " was successfully submitted!";
  } catch (e) {
    result = e.message;
  }
  console.log("\n" + result);
  return result;
}

async function createAsset(id, value) {
  let contract = await getActorConnection();
  let result = "";
  console.log("Creating asset with id = " + id + ", value = " + value);

  try {
    await contract.submitTransaction("createAssets008", id, value); //submit agreement
    result = "Agreement with Id " + id + " was successfully submitted!";
  } catch (e) {
    result = e.message;
  }
  console.log("\n" + result);
  return result;
}

async function readAsset(id) {
  console.log(
    "\n---- Now Buyer/Seller wants to retreive the agreement to validate it ------"
  );
  let contract = await getActorConnection();
  let result = "";
  try {
    result = await contract.evaluateTransaction("readAssets008", id);
  } catch (e) {
    result = e.message;
  }
  console.log(
    "On retreving the Buyer/Seller got the below agreement and supporting fields \n" +
      result
  );
  return result;
}

const requestListener = async function (req, res) {
  const queryObject = url.parse(req.url, true).query;

  console.log("req.url:", req.url);

  let result = "";
  let id = "";
  let value = "";
  let status = "";
  const crypto = require("crypto");

  res.setHeader("Content-Type", "application/json");

  if (req.url.startsWith("/retrieve-agreement")) {
    id = queryObject.id;
    result = await readAsset(id);

    let resultjson = JSON.parse(result);
    const agreement = resultjson.agreement;

    const retrivedHash = resultjson.hash;
    console.log("\nretrived agreement from the contract: " + agreement);
    console.log("retrived hash from the contract: " + retrivedHash);
    console.log(
      "\nBuyer/Seller will now calculate hash of retreived agreement (md5): "
    );

    var calculatedHash = crypto
      .createHash("md5")
      .update(agreement)
      .digest("hex"); //Hashing with md5

    console.log("Calculated hash is: " + calculatedHash);

    if (calculatedHash === retrivedHash) {
      console.log(
        "\nYayy !!! Hash matched that means the agreement integrity is verified!"
      );
      console.log("Buyer/Seller will now APPROVE the agreement");
      resultjson.message =
        "Buyer retrived the asset -> calculated its hash -> It matched :) !!!";
    } else {
      console.log("\nOopsss !!! Hash didn't match");
      console.log("Buyer/Seller will now CANCEL the agreement");
      resultjson.message =
        "Buyer retrived the asset -> calculated its hash -> And it didn't match :( !!!";
    }
    result = JSON.stringify(resultjson);
    res.writeHead(200);
    res.end(result);
  } else if (req.url.startsWith("/approve-agreement")) {
    status = queryObject.status;
    id = queryObject.id;
    console.log(
      "\nBuyer/Seller requested to change the status of contract to " + status
    );

    result = await approveOrCancelAgreement(id, status);

    console.log("Status changed successfully!");
    res.writeHead(200);
    res.end(result);
  } else if (req.url.startsWith("/submit-agreement")) {
    value = queryObject.value;
    id = queryObject.id;
    result = await createAsset(id, value);
    res.writeHead(200);
    res.end(result);
  } else {
    res.writeHead(200);
    res.end("Unsupported URL");
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, async () => {
  await initNetwork008();
  console.log(`Server is running on http://${host}:${port}`);
});
