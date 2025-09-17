# Demo Testing Guide (Users, Payloads, Workflow)

Base URL: http://localhost:3000

## Demo Users
Password for all: test123.

- Farmer (role: farmer)
  - email: farmer@test.com
  - complete-registration body:
{
  "farmerName": "John Doe",
  "contactInfo": { "phone": "+91-9876543210", "address": "Kerala" },
  "licenseNumber": "FARM123456",
  "farmLocation": { "latitude": 10.8505, "longitude": 76.2711, "address": "Kerala" }
}

- Manufacturer (role: manufacturer)
  - email: manufacturer@test.com
  - complete-registration body:
{
  "companyName": "Herb Processing Co.",
  "gmpLicense": "GMP789012",
  "facilityLocation": { "latitude": 10.0168, "longitude": 76.3558, "address": "Kochi" }
}

- Tester (role: tester)
  - email: tester@test.com
  - complete-registration body:
{
  "labName": "Quality Lab Inc.",
  "nablAccreditation": "NABL123456",
  "labLocation": { "latitude": 12.9716, "longitude": 77.5946, "address": "Bangalore" }
}

- Regulator (role: regulator)
  - email: regulator@test.com
  - complete-registration body:
{
  "regulatorName": "Food Safety Authority",
  "department": "Quality Control",
  "jurisdiction": "Kerala"
}

## Auth Endpoints (order)
1) POST /api/auth/register
{ "email": "<email>", "password": "test123", "role": "<role>" }

2) POST /api/auth/complete-registration  (Authorization: Bearer TEMP token)
Use the role-specific body above. Returns a new token (registrationStep=2).

3) POST /api/auth/login
{ "email": "<email>", "password": "test123" }

4) GET /api/auth/registration-status  (Authorization: Bearer token)

## Sample Event Payloads

- Farmer: POST /api/farmer/collection-event  (Authorization: Bearer farmer token)
{
  "gpsTaggedLocation": { "latitude": 10.8505, "longitude": 76.2711, "address": "Farm Location" },
  "speciesIdentity": { "botanicalName": "Ocimum sanctum", "commonName": "Tulsi", "partUsed": "Leaves" },
  "initialQualityMetrics": { "moisture": "12%", "color": "Green", "aroma": "Strong" },
  "certifications": ["Organic Certified"],
  "images": ["image1.jpg"]
}

- Manufacturer: POST /api/manufacturer/receive-material  (Authorization: Bearer manufacturer token)
{
  "batchId": "<BATCH_ID>",
  "supplierInfo": { "farmerId": "FARMER_...", "farmerName": "John Doe" },
  "receivedQuantity": "100kg",
  "receivedCondition": "Good",
  "qualityInspection": { "moisture": "12%" },
  "storageLocation": "Warehouse A"
}

- Manufacturer: POST /api/manufacturer/processing-event  (Authorization: Bearer manufacturer token)
{
  "batchId": "<BATCH_ID>",
  "processingDetails": {
    "processingMethod": "Solar Drying",
    "temperatureRange": "40-45°C",
    "processingDuration": "48 hours",
    "outputQuantity": "85kg"
  },
  "qualityParameters": { "moisture": "11.5%" },
  "packagingDetails": { "packagingType": "Bags" },
  "outputBatches": []
}

- Tester: POST /api/tester/receive-sample  (Authorization: Bearer tester token)
{
  "batchId": "<BATCH_ID>",
  "sampleQuantity": "500g",
  "sampleCondition": "Good",
  "testRequirements": ["Moisture", "Pesticide Residue"]
}

- Tester: POST /api/tester/conduct-test/<sampleId>  (Authorization: Bearer tester token)
{
  "testResults": { "moisture": "11.5%", "pesticideResidue": "ND" },
  "testParameters": ["Moisture", "Pesticide Residue"],
  "testMethods": ["Gravimetric"],
  "equipmentUsed": ["Moisture Analyzer"]
}

## Optional Custody (in-memory)
- POST /api/custody/initial  (Authorization: Bearer farmer token)
{ "batchId": "<BATCH_ID>" }

- POST /api/custody/initiate  (Authorization: Bearer farmer token)
{ "toUserId": "<MANUFACTURER_USER_ID>", "batchId": "<BATCH_ID>" }

- POST /api/custody/accept/<transferId>  (Authorization: Bearer manufacturer token)

- GET /api/custody/verify/<BATCH_ID>

- GET /api/custody/history/<BATCH_ID>

## Minimal Workflow
1) Register + complete-registration for all roles
2) Login to get role tokens
3) Farmer creates COLLECTION → note batchId
4) Manufacturer receives material → creates PROCESSING
5) Tester receives sample → conducts QUALITY_TEST
6) (Optional) Custody initial → initiate → accept → verify
7) Customer (public):
- POST /api/customer/scan-qr  body: { "qrData": "{\"batchId\":\"<BATCH_ID>\",\"type\":\"BATCH_QR\"}" }
- GET /api/customer/product-history/<BATCH_ID>

## Notes
- Use correct role token for protected routes.
- In-memory only; restart clears data.
- If email exists error, use a new email or restart.

