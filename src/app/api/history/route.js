import { NextResponse } from "next/server";
import { getSession, saveSession } from "@/lib/models/chatHistory";

/**
 * GET /api/history?sessionId=xxx
 * Load chat history for a session
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json(
                { error: "sessionId is required" },
                { status: 400 }
            );
        }

        const session = await getSession(sessionId);

        if (!session) {
            return NextResponse.json({
                sessionId,
                messages: [],
                transformations: [],
                transformationHistory: [],
            });
        }

        return NextResponse.json(session);
    } catch (error) {
        console.error("History GET error:", error);
        return NextResponse.json(
            { error: "Failed to load history" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/history
 * Save chat history for a session
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { sessionId, messages, transformations, transformationHistory, imageUrl } = body;

        if (!sessionId) {
            return NextResponse.json(
                { error: "sessionId is required" },
                { status: 400 }
            );
        }

        await saveSession(sessionId, {
            messages,
            transformations,
            transformationHistory,
            imageUrl,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("History POST error:", error);
        return NextResponse.json(
            { error: "Failed to save history" },
            { status: 500 }
        );
    }
}
