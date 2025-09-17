import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { POST_SUBMIT, PostVendorIntakeSubmitSchema } from "../../intake/route"

export const PostVendorIntakeSubmitSchemaExport = PostVendorIntakeSubmitSchema

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => POST_SUBMIT(req, res)

