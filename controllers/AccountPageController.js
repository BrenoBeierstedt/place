const User = require("../models/user");

exports.getOwnAccount = (req, res, next) => {
    res.redirect("/@" + req.user.name);
};

exports.getAccountByID = (req, res, next) => {
    User.findById(req.params.userID).then((user) => {
        res.redirect(`/@${user.name}`);
    }).catch((err) => next());
};

exports.getAccount = (req, res, next) => {
    User.findByUsername(req.params.username).then((user) => {
        if (!user || ((user.banned || user.deactivated) && !(req.user && (req.user.moderator || req.user.admin)))) return next();
        user.getInfo(req.place).then(async (info) => {
            if (req.user && req.user.admin) {
                const accessData = await user.getUniqueIPsAndUserAgents();
                user.ipAddresses = accessData.ipAddresses;
                user.userAgents = accessData.userAgents;
                user.keys = accessData.keys;
            }
            return req.responseFactory.sendRenderedResponse("public/account", { profileUser: user, profileUserInfo: info, hasNewPassword: req.query.hasNewPassword });
        });
    }).catch((err) => next());
};

exports.getAPIAccount = (req, res, next) => {
    function returnUserNotFound() {
        res.status(404).json({success: false, error: {code: "not_found", message: "We couldn't find that user."}});
    }
    User.findByUsername(req.params.username).then((user) => {
        if(!user) return returnUserNotFound();
        if((user.banned || user.deactivated) && !(req.user.moderator || req.user.admin)) return returnUserNotFound();
        user.getInfo(req.place).then((info) => res.json(info)).catch((err) => {console.log(err); returnUserNotFound() });
    }).catch((err) => returnUserNotFound());
};

exports.getSprayCans = async (req, res, next) => {
    // TODO add wallet integration




    let sprayArr =
        [
            {
                "name": "B0WB",
                "palette": ["#000000", "#3d2e93", "#6440d8", "#6c88ff", "#7bd5f3", "#ffffff"],
                "img": "https://i.imgur.com/nAaxf3Q.png"
            },
            {
                "name": "F1R3",
                "palette": ["#000000", "#7d1b49", "#bf0000", "#e93100", "#ff9000", "#ffffff"],
                "img": "https://i.imgur.com/VeMF0HU.png"
            },
            {
                "name": "B0LT",
                "palette": ["#000000", "#915816", "#be8420", "#ebb70a", "#fffc00", "#ffffff"],
                "img": "https://i.imgur.com/lSDomWJ.png"
            },
            {
                "name": "SCH00l",
                "palette": ["#000000", "#484848", "#707070", "#9b9b9b", "#d0d0d0", "#ffffff"],
                "img": "https://i.imgur.com/Kl6DWrn.png"
            },
            {
                "name": "SN3K",
                "palette": ["#000000", "#0a5d45", "#4ab907", "#a7ed00", "#e5ff05", "#ffffff"],
                "img": "https://i.imgur.com/oEf0tWu.png"
            }
        ]
    User.find({userID: req.user.id}).then(() => {
        res.json({success: true, spray: sprayArr});

    }).catch((err) => {
        req.place.logger.error("Couldn't get SprayCans for user: " + err);

        res.json({
            success: false,
            error: {message: "An unknown error occurred while trying to retrieve your SprayCans.", code: "server_error"}
        });
    });
};