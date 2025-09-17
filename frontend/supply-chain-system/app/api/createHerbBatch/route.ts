import { type NextRequest, NextResponse } from "next/server"

function handleEvent(data: any, eventName: string) {
  // This function would typically interact with your blockchain or database
  console.log(`Handling event: ${eventName}`, data)

  // For demo purposes, we'll just log the data
  // In a real implementation, this would:
  // 1. Validate the data
  // 2. Store it in a database or blockchain
  // 3. Return appropriate response

  return {
    success: true,
    message: `${eventName} processed successfully`,
    data: data,
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Log the received data
    console.log("Frontend received CreateHerbBatch:", data)
    
    // Forward to backend
    const backendResponse = await fetch('http://localhost:3001/api/createHerbBatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    const backendResult = await backendResponse.json()
    
    // Log backend response
    console.log("Backend response:", backendResult)
    
    return NextResponse.json(backendResult, { status: backendResponse.status })
  } catch (error) {
    console.error("Error in createHerbBatch:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
