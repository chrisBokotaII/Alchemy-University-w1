const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  //alice
  //Private key: bc5c964e48a8fcdfb364672253a3e0a94f378d6d762609233a791949e76f28f0
  //Public key: 0260fc4bed1276057457632d9daeaf93c7fbcda86921d4c4b60a77c7160972bdf2
  //Address: aeaf93c7fbcda86921d4c4b60a77c7160972bdf2

  "0260fc4bed1276057457632d9daeaf93c7fbcda86921d4c4b60a77c7160972bdf2": 100,

  //bob
  //Private key:1c9fd86f2d0feac2865392885fd32f0b6c5ca2c06ce6538dcae89e0f08471970
  //Public key:0244921a55a77134675fdec7889665eac5effee530e0e9fd9b1b90d8d40776184b
  //Address: 9665eac5effee530e0e9fd9b1b90d8d40776184b

  "0244921a55a77134675fdec7889665eac5effee530e0e9fd9b1b90d8d40776184b": 75,

  //charlie
  //Private key: 3025bde395c33b9f5fc9b3aaebccc14e62e5affdce7d195672c10f6f3985a811
  //Public key: 021b621322199d7fe4906c27402c568064ae87dfe85809459898bc437c4c3f2e25
  //Address: 2c568064ae87dfe85809459898bc437c4c3f2e25

  "021b621322199d7fe4906c27402c568064ae87dfe85809459898bc437c4c3f2e25": 50,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.json({ balance });
});

app.post("/send", (req, res) => {
  const { sender, signdata: sigStringed, message } = req.body;
  const { recipient, amount } = message;
  const deserializedData = {
    ...sigStringed,
    r: BigInt(sigStringed.r),
    s: BigInt(sigStringed.s),
  };

  const hashMessage = (message) => keccak256(Uint8Array.from(message));

  const isValid =
    secp.secp256k1.verify(deserializedData, hashMessage(message), sender) ===
    true;

  if (!isValid) {
    return res.status(400).json({ message: "Bad signature!" });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).json({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;

    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
