import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default async function createUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const createUser = z.object({
    username: z.string(),
    password: z.string(),
  });
}
