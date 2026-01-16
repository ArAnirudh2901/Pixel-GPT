import { getDb } from "../mongo";

const COLLECTION_NAME = "chat_sessions";

/**
 * Get or create a chat session
 */
export async function getSession(sessionId) {
    const db = await getDb();
    const session = await db.collection(COLLECTION_NAME).findOne({ sessionId });
    return session;
}

/**
 * Save or update a chat session
 */
export async function saveSession(sessionId, data) {
    const db = await getDb();

    const update = {
        $set: {
            ...data,
            updatedAt: new Date(),
        },
        $setOnInsert: {
            sessionId,
            createdAt: new Date(),
        },
    };

    const result = await db.collection(COLLECTION_NAME).updateOne(
        { sessionId },
        update,
        { upsert: true }
    );

    return result;
}

/**
 * Get recent sessions (for history list)
 */
export async function getRecentSessions(limit = 10) {
    const db = await getDb();
    const sessions = await db
        .collection(COLLECTION_NAME)
        .find({})
        .sort({ updatedAt: -1 })
        .limit(limit)
        .toArray();
    return sessions;
}
