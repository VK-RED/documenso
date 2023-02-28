import {
  defaultHandler,
  defaultResponder,
  getUserFromToken,
} from "@documenso/lib/server";
import prisma from "@documenso/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import short from "short-uuid";
import { Document as PrismaDocument, FieldType } from "@prisma/client";
import { getDocument } from "@documenso/lib/query";

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromToken(req, res);
  const { id: documentId } = req.query;
  const body: {
    id: number;
    type: FieldType;
    page: number;
    position: { x: number; y: number };
  } = req.body;

  if (!user) return;

  if (!documentId) {
    res.status(400).send("Missing parameter documentId.");
    return;
  }

  // todo encapsulate entity ownerships checks

  const fields = await prisma.field.findMany({
    where: { documentId: +documentId },
    include: { Recipient: true },
  });

  return res.status(200).end(JSON.stringify(fields));
}

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromToken(req, res);
  const { id: documentId } = req.query;
  const body: {
    id: number;
    type: FieldType;
    page: number;
    positionX: number;
    positionY: number;
    Recipient: { id: number };
    customText: string;
  } = req.body;

  if (!user) return;

  if (!documentId) {
    res.status(400).send("Missing parameter documentId.");
    return;
  }

  const document: PrismaDocument = await getDocument(+documentId, req, res);

  // todo encapsulate entity ownerships checks
  if (document.userId !== user.id) {
    return res.status(401).send("User does not have access to this document.");
  }

  const field = await prisma.field.upsert({
    where: {
      id: +body.id,
    },
    update: {
      positionX: +body.positionX,
      positionY: +body.positionY,
      customText: body.customText,
    },
    create: {
      documentId: +documentId,
      type: body.type,
      page: +body.page,
      positionX: +body.positionX,
      positionY: +body.positionY,
      customText: body.customText,
      // todo refactor only one type of recipientId
      recipientId: body.Recipient.id,
    },
    include: {
      Recipient: true,
    },
  });

  return res.status(201).end(JSON.stringify(field));
}

export default defaultHandler({
  GET: Promise.resolve({ default: defaultResponder(getHandler) }),
  POST: Promise.resolve({ default: defaultResponder(postHandler) }),
});