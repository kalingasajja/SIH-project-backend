import { type NextRequest, NextResponse } from "next/server"

function handleEvent(data: any, eventName: string) {
  console.log(`Handling event: ${eventName}`, data)

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
    console.log("Frontend received RecordProcessingStep:", data)
    
    // Forward to backend
    const backendResponse = await fetch('http://localhost:3001/api/recordProcessingStep', {
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
    console.error("Error in recordProcessingStep:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
