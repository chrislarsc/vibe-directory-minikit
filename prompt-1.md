create a simple web app called "hot or not nft" where you enter an ethereum wallet address, and it then displays one nft at a time from the wallet and the user can mark each nft as hot or not. there's then a view to see all the hot nfts in a gallery; from there, you can click on each nft to see a larger detail of it. store the selections in local storage. 

the app should use the alchemy api with the following details:
• Network URL: <COPY PASTE FROM ALCHEMY DASHBOARD>
• Request: <COPY PASTE FROM ALCHEMY DASHBOARD>
• example response attached <ATTACHED FILE OF WHAT RESPONSE LOOKS LIKE>

the app should use the ensdata api to display the wallet's ENS instead of the wallet address for results. to do so: 
• use this endpoint: api.ensdata.net/{wallet_address}
• example response: <INSERT RESPONSE HERE>

do not over engineer. focus on the simplest possible path to successful implementation.