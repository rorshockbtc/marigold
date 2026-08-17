import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { action, groupName } = await req.json();

    if (!action || !groupName) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const existingGroups = (user.publicMetadata?.joinedGroups as string[]) || [];

    let updatedGroups = [...existingGroups];

    if (action === 'join' && !existingGroups.includes(groupName)) {
      updatedGroups.push(groupName);
    } else if (action === 'leave') {
      updatedGroups = existingGroups.filter(g => g !== groupName);
    }

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        joinedGroups: updatedGroups
      }
    });

    return NextResponse.json({ joinedGroups: updatedGroups });
  } catch (error) {
    console.error("Error updating user groups:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
