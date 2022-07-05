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

exports.getSprayCans = (req, res, next) => {
    // TODO add wallet integration
    let sprayArr = [
        {"name":"Spray1", "palette":["#FFFFFF", "#E4E4E4","#E4E4E4", "#888888", "#222222"], "img":"https://cdn.discordapp.com/attachments/935914562140639323/992394749610831963/can-nobg2.png"},
        {"name":"Spray2", "palette":["#e72222", "#8bc033","#1a20a4", "#632c6c", "#222222"], "img":"https://cdn.discordapp.com/attachments/935914562140639323/992394749610831963/can-nobg2.png"},
        {"name":"Spray3", "palette":["#e72222", "#e1b010","#111111", "#d96eec", "#222222"], "img":"https://cdn.discordapp.com/attachments/935914562140639323/992394749610831963/can-nobg2.png"}
    ]
    User.find({userID: req.user.id}).then(() => {
        res.json({success: true, spray: sprayArr});

    }).catch((err) => {
        req.place.logger.error("Couldn't get SprayCans for user: " + err);
        res.json({success: false, error: {message: "An unknown error occurred while trying to retrieve your SprayCans.", code: "server_error"}});
    });
};