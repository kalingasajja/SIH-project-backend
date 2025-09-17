import { type NextRequest, NextResponse } from "next/server"

// Mock function to simulate backend API call
async function handleEvent(eventName: string, data: any) {
  // This would typically make a call to your actual backend
  console.log(`[v0] Calling backend with event: ${eventName}`, data)

  // Mock response based on the first image data
  if (eventName === "GetAssetHistory") {
    return {
      id: data.id,
      history: [
        {
          event: "FormulateProduct",
          finalProductId: data.id,
          productName: "Hair Oil",
          formulationDate: "17-09-2025",
          expiryDate: "09/2030",
          ingredientBatchIds: ["01"],
          timestamp: 1758111571756,
        },
      ],
    }
  }

  return null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const result = await handleEvent("GetAssetHistory", { id })

    if (!result) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error in assetHistory API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
