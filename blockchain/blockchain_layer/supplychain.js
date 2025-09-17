import express from "express";
import bodyParser from "body-parser";
import Ledger from "./ledger.js";



const app = express();
app.use(bodyParser.json());
const ledger = new Ledger();


const requiredFields = {
  CreateHerbBatch: [
    "batchId", "species", "collectorId", "timestamp",
    "latitude", "longitude", "initialWeightKg", "initialQualityMetrics"
  ],
  TransferCustody: ["batchId", "newOwner", "timestamp", "from", "to"],
  RecordProcessingStep: ["batchId", "stepName", "timestamp", "equipmentId", "parameters"],
  RecordQualityTest: ["batchId", "testType", "resultsSummary", "certificateHash", "certificateUrl"],
  FormulateProduct: [
    "finalProductId", "productName", "formulationDate",
    "expiryDate", "ingredientBatchIds"
  ],
};

async function handleEvent(req, res, eventName) {
  const { actor,signature,tx } = req.body;
  if (!tx) {
    return res.status(400).json({ error: "body must include tx" });
  }

  // checking all fields are there or not
  const reqs = requiredFields[eventName];
  if (reqs) {
    const missing = reqs.filter(f => !(f in tx));
    if (missing.length) {
        console.log("Missing key is "+missing[0]);
      return res.status(400).json({ error: "missing required fields", missing });
    }
  }

 
  if (eventName === "TransferCustody") {
    const history = ledger.getHistoryByField("batchId", tx.batchId);
    if (history.length === 0) {
      return res.status(400).json({ error: "no batch exists to transfer custody" });
    }
  }

     

 
  const storedTx = {
    event: eventName,
    ...tx, 
    timestamp: Date.now()
  };

  const block = ledger.addTx(storedTx);
  return res.json({ success: true, block });
}

app.post("/createHerbBatch", (req, res) => {
    handleEvent(req, res, "CreateHerbBatch")
}
);
app.post("/transferCustody", (req, res) => 
    {handleEvent(req, res, "TransferCustody")
    }
    );
app.post("/recordProcessingStep", (req, res) => 
    {
        handleEvent(req, res, "RecordProcessingStep")
    }
    );
app.post("/recordQualityTest", (req, res) => 
    {
        handleEvent(req, res, "RecordQualityTest")
    }
    );
app.post("/formulateProduct", (req, res) =>
    {
        handleEvent(req, res, "FormulateProduct")
    } 
);


app.get("/assetHistory/:id", (req, res) => {
  const id = req.params.id;
  const byBatch = ledger.getHistoryByField("batchId", id);
  const byFinal = ledger.getHistoryByField("finalProductId", id);
  const all = [...byBatch, ...byFinal];
  res.json({ id, history: all });
});


app.get("/fullProvenance/:finalProductId", (req, res) => {
  const id = req.params.finalProductId;
  const finalTxs = ledger.getHistoryByField("finalProductId", id);
  if (finalTxs.length === 0) {
    return res.status(404).json({ error: "final product not found" });
  }
  const finalTx = finalTxs[finalTxs.length - 1];
  const ingredientIds = finalTx.ingredientBatchIds || [];
  const provenance = {
    finalProductTx: finalTx,
    ingredients: ingredientIds.map(bid => ({
      batchId: bid,
      history: ledger.getHistoryByField("batchId", bid)
    }))
  };
  res.json(provenance);
});


app.get("/ledger", (req, res) => res.json(ledger.getAll()));


app.listen(4000, () => {
    console.log("blockchain API listening on 4000");
}
);
