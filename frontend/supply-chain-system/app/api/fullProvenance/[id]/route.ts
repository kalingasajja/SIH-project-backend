import { type NextRequest, NextResponse } from "next/server"

// Mock function to simulate backend API call
async function handleEvent(eventName: string, data: any) {
  // This would typically make a call to your actual backend
  console.log(`[v0] Calling backend with event: ${eventName}`, data)

  // Mock response based on the image data
  if (eventName === "GetFullProvenance") {
    return {
      finalProductTx: {
        event: "FormulateProduct",
        finalProductId: data.id,
        productName: "Hair Oil",
        formulationDate: "17-09-2025",
        expiryDate: "09/2030",
        ingredientBatchIds: ["01"],
        timestamp: 1758111571756,
      },
      ingredients: [
        {
          batchId: "01",
          history: [
            {
              event: "CreateHerbBatch",
              batchId: "01",
              species: "123",
              collectorId: "456",
              timestamp: "12:00",
              latitude: "34.56",
              longitude: "23.45",
              initialWeightKg: "0.1",
              initialQualityMetrics: "2.55",
            },
            {
              event: "RecordProcessingStep",
              batchId: "01",
              stepName: "Extraction",
              timestamp: "14:30",
              equipmentId: "EQ001",
              parameters: "Temperature: 60°C, Duration: 2hrs",
            },
            {
              event: "RecordQualityTest",
              batchId: "01",
              testType: "Purity Test",
              resultsSummary: "95% purity achieved",
              certificateHash: "abc123def456",
              certificateUrl: "https://certificates.gov.in/cert123",
            },
          ],
        },
      ],
    }
  }

  return null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const result = await handleEvent("GetFullProvenance", { id })

    if (!result) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error in fullProvenance API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
