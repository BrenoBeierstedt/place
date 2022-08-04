const fetch = require("node-fetch");
const User = require("../models/user");
const {response} = require("express");


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

        let canzObject = {}


        a.result.forEach(result => {
            if(!canzObject[result.tokenID]) canzObject[result.tokenID] = {to:0,from:0}

            if (result.from === wallet.toLowerCase()) {
                canzObject[result.tokenID].from += 1
            } if (result.to === wallet.toLowerCase()) {
                canzObject[result.tokenID].to += 1
            }
        })



        for (const result of a.result) {
            const i = a.result.indexOf(result);

            if(canzObject[result.tokenID]) {
                if (canzObject[result.tokenID].to > canzObject[result.tokenID].from) {

                    const b = await fetch(process.env.IPFS_URI + process.env.IPFS_HASH + `/${a.result[i].tokenID}`,
                        {method: "GET", headers: {Accept: "application/json"}}
                    ).then(response => response.json())

                    let data = {
                        "name": b.name,
                        "palette": b.pallete || b.Pallete,
                        "img": b.place_image,
                    }
                    arr.push(data)

                }
            }
        }

        setTimeout( ()=> {

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
        }, 0)
    }

    renderTokensForOwner(req.user.wallet)

}


