## How to run the Dapp
- Go to the folder Dapp.
- Replace the Org1 and .json file with yours.
- Run ```node ./index.js```

## This project is done with the help of below frameworks, libs, tools and IDE etc.
• IPFS client
• IBM-MicroFab Docker Image
• NodeJS
• Crypto
• web3
• ipfs-http-client
• Javascript

## Description of the application
### Flow of the application
Figure 1 shows each step taken to solve the notary task for buyer and seller through IPFS and Hyperledger smart contract. The agreement between the buyer and seller are first stored [1] in local IPFS. I am saving the path of the file in the Dapp and reads [1] it for buyer. Buyer then digitally signs it using SHA256 hashing and encrypting through RSA [2] with its private key. I am using crypto package to generate the public-private key pairs and verify the digital signature.
Once buyers signs it, the signature is stored in Hyperledger smart contract through method createAssets008() as shown in figure 3. Same steps are also taken for seller to sign and then store the signature in smart contract through the same method. This method the stores the digital signature of each buyer and seller with key “signature”.
Since now the digital signature sits on blockchain through smart contracts and document sits on IPFS. Next task is to read document and buyer’s digital signature and verify it. Smart contract’s method readAssets008 () (figure 2) is invoked from Dapp to get the digital signature of buyer. It is then decrypted in Dapp using buyer’s public key, which results in a hash. The plain text retrieved from IPFS is then hashed using the same algo – SHA256. Both the hashes are compared to verify the authenticity of document and buyer [2]. Same steps are repeated for seller as well.

## Smart contract methods
• createAssets008()– Stores the digital signature of the buyer and seller. The digital signature is constructed in Dapp and set through this method of smart contract.

• readAssets008()– Gets the digital signature of the buyer. The digital signature is constructed in Dapp and get through this method of smart contract.
 
• assetExists008() – Checks and confirm whether the asset is present in the blockchain with given ID. It is created to avoid creating the objects with the same id again.

• approveOrCancelAgreement008()– Approves or rejects the document by changing the parameter called “state” in the asset.

• updateAssets008()- Updates the states.

• deleteAssets008()- Deletes the state.


<img width="408" alt="image" src="https://user-images.githubusercontent.com/25216571/181632792-a6f6dc05-9f1f-4b9d-ab61-493ed56d7db6.png">
