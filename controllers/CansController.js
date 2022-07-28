const User = require("../models/user");
const fetch = require("node-fetch");


exports.getSprayCans = async (req, res, next) => {

    // TODO add wallet integration
    const renderTokensForOwner = async (userWallet) => {
        const a = await fetch(
            `https://testnets-api.opensea.io/api/v1/assets?owner=${userWallet}&order_direction=desc&offset=0&&include_orders=false`,
            {method: "GET", headers: {Accept: "application/json"}}
        ).then(response => response.json())

        let arr = []
        for (let i = 0; i < a.assets.length; i++) {

            if (a.assets[i].asset_contract.address == '0x062a771d6cbba642577b9cd095f3827ee737e232') {
                const b = await  fetch(a.assets[i].token_metadata,
                    {method: "GET", headers: {Accept: "application/json"}}
                ).then(response => response.json())

                let data ={
                    "name": b.name,
                    "palette": b.pallete || b.pallete,
                    "img": b.image,
                    "metadata": a.assets[i].token_metadata
                }

                arr.push(data)



            }
        }

        User.find({userID: req.user.id}).then(() => {
            res.json({success: true, spray:arr});

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


