import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { migrateCode } from "@/lib/agent";

export async function POST(req: Request) {
  const { filename } = await req.json();

  const filePath = path.join(process.cwd(), "uploads", filename);
  const code = fs.readFileSync(filePath, "utf-8");

  const result = await migrateCode(code);

  return NextResponse.json({ result });
}
