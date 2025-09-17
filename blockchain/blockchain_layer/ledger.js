import crypto from "crypto";



class Ledger {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, "0", Date.now(), { msg: "Genesis" }, "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTx(tx) {
    const prev = this.getLatestBlock();
    const index = prev.index + 1;
    const ts = Date.now();
    const hash = calculateHash(index, prev.hash, ts, tx);
    const block = new Block(index, prev.hash, ts, tx, hash);
    this.chain.push(block);
    return block;
  }

  getHistoryByField(field, value) {
    return this.chain
      .map(b => b.tx)
      .filter(tx => tx && tx[field] === value);
  }

  getAll() {
    return this.chain;
  }
}


export default Ledger;



class Block {
  constructor(index, previousHash, timestamp, tx, hash) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.tx = tx;
    this.hash = hash;
  }
}

function calculateHash(index, prevHash, timestamp, tx) {
  return crypto
    .createHash("sha256")
    .update(String(index) + prevHash + String(timestamp) + JSON.stringify(tx))
    .digest("hex");
}
