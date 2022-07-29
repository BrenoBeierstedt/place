const fetch = require("node-fetch");
const User = require("../models/user");


exports.getSprayCans = async (req, res, next) => {

    const renderTokensForOwner = async (userWallet) => {

        const wallet = userWallet

        let a = await fetch(
            `https://api.etherscan.io/api?`+ new URLSearchParams({
                module:"account",
                action:"tokennfttx",
                address: wallet.toLowerCase(),
                tag:"latest",
                apikey: process.env.ETHER_APIKEY,
                contractaddress: process.env.CONTRACTADDRESS
            }),
            {method: "GET", headers: {Accept: "application/json"}}
        ).then(response => response.json())

        let arr = []

        for (let i = 0; i < a.result.length; i++) {
            if(a.result[i].from !== wallet.toLowerCase() && a.result[i].to === wallet.toLowerCase()) {

                // if (a.result[i].to === wallet.toLowerCase()) {
                const b = await fetch(process.env.IPFS_URI + process.env.IPFS_HASH + `/${a.result[i].tokenID}`,
                    {method: "GET", headers: {Accept: "application/json"}}
                ).then(response => response.json())

                let data = {
                    "name": b.name,
                    "palette": b.pallete || b.Pallete,
                    "img": b.place_image,
                }
                arr.push(data)

                // }
            }
        }

        const uniqueArray = arr.filter((value, index) => {
            const _value = JSON.stringify(value);
            return index === arr.findIndex(obj => {
                return JSON.stringify(obj) === _value;
            });
        });


        User.find({userID: req.user.id}).then(() => {
            res.json({success: true, spray:uniqueArray});

        }).catch((err) => {
            req.place.logger.error("Couldn't get SprayCans for user: " + err);

            res.json({
                success: false,
                error: {
                    message: "An unknown error occurred while trying to retrieve your SprayCans.",
                    code: "server_error"
                }
            });
        });
    }

    renderTokensForOwner(req.user.wallet)

}


