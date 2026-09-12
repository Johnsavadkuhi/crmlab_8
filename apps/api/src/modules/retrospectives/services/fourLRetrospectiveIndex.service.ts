import { FourLRetrospectiveModel } from "../models/fourLRetrospective.model";

export async function ensureFourLRetrospectiveIndexes() {
  await FourLRetrospectiveModel.createIndexes();
}
