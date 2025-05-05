"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { toast } from "sonner";

const OneWeek = 60 * 60 * 24 * 7; // 7 days
export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;
  try {
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      toast.error("User already exists, please log in instead.");
      return {
        success: false,
        message: "User already exists, please log in instead.",
      };
    }
    await db.collection("users").doc(uid).set({
      name,
      email,
    });
    return {
      success: true,
      message: "Sign Up successful,Please Sign In to continue",
    };
  } catch (error) {
    console.error("Error signing up:", error);
    if (error === "auth/email-already-in-use") {
      toast.error(
        "This email is already in use. Please try another one or log in."
      );
      return {
        success: false,
        message: "This email is already in use. Please try another one.",
      };
    }
    return {
      success: false,
      message: "An error occurred while signing up. Please try again later.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;
  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      toast.error("User not found. Please sign up first.");
      return {
        success: false,
        message: "User not found. Please sign up first.",
      };
    }
    await setSessionCookie(idToken);
  } catch (error) {
    console.error("Error signing in:", error);
    return {
      success: false,
      message: "An error occurred while signing in. Please try again later.",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: OneWeek * 1000,
  });
  cookieStore.set("session", sessionCookie, {
    maxAge: OneWeek,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function getCurrentUser() :Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db.collection("users").doc(decodedClaims.uid).get();
    if (!userRecord.exists) {
      return null;
    }
    return{
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log("Error getting current user:", error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function getInterviewByUserId(userId: string): Promise<Interview[] | null> {

  const interviews  = await db.collection("interviews")
  .where("userId", "==", userId)
  .orderBy("createdAt", "desc")
  .get();
  return interviews.docs.map((doc)=>({
    id: doc.id,
    ...doc.data(),
  }))as Interview[];

}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  const interviews = await db.collection("interviews")
  .orderBy("createdAt", "desc")
  .where("finalized", "==", true)
  .where("userId", "!=", userId)
  .limit(limit)
  .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}