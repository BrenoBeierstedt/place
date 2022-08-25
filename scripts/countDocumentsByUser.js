const config = require("../config/config");
const { MongoClient } = require("mongodb");
const fs = require("fs");

const client = new MongoClient(config.database);

const queryPixelUserCount = async function (db) {
	const cursor = await db.collection("pixels").find({});

	const docs = await cursor.toArray();

	let editorsCount = {};

	for (let i = 0; i < docs.length; i++) {
		const doc = docs[i];

		if (doc.editorID in editorsCount) {
			editorsCount[doc.editorID] += 1;
		} else {
			editorsCount[doc.editorID] = 1;
		}
	}

	let userAmountArray = [];

	for (const [key, value] of Object.entries(editorsCount)) {
		const userId = key;
		const pixelAmount = value;

		userAmountArray.push({
			userId,
			pixelAmount,
		});
	}

	userAmountArray.sort((a, b) => b.pixelAmount - a.pixelAmount);

	userAmountArray = userAmountArray.slice(0, 10);

	return userAmountArray;
};

const run = async function () {
	try {
		// Connect the client to the server (optional starting in v4.7)
		await client.connect();
		// Establish and verify connection
		await client.db("admin").command({ ping: 1 });
		console.log("Connected successfully to server");

		const db = await client.db("bathroom");

		const pixelAmount = await queryPixelUserCount(db);

		const userCursor = await db.collection("users").find({});

		const userDocs = await userCursor.toArray();

		for (let i = 0; i < userDocs.length; i++) {
			const userDoc = userDocs[i];

			for (let j = 0; j < pixelAmount.length; j++) {
				const doc = pixelAmount[j];

				if (doc.userId == userDoc._id) {
					doc.wallet = userDoc.wallet;
					doc.name = userDoc.name;
				}
			}
		}

		fs.writeFile(
			"./results.json",

			JSON.stringify(pixelAmount),

			function (err) {
				if (err) {
					console.error(err);
					return;
				}

				console.log("Finalizado");
			}
		);
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
};

run();
