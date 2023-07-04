import GraphQLJSON from 'graphql-type-json';
import { BSON } from 'bson';
import getStorageEngine from '../../helper/ipfs-storage-engine.js';
import { Helper } from '../../../utilities/helper.js';
import Joi from 'joi';
import resolverWrapper, { validateCID } from '../validation.js';

export interface IMetadataResponse {
  [key: string]: string;
}

export interface IMetadataReuqest {
  cid?: string;
}

export const queryMetadata = Joi.object<IMetadataReuqest>({
  cid: validateCID.optional(),
});

// The GraphQL schema
export const typeDefsMetadata = `#graphql
  scalar JSON

  type Query {
      getMetadata(cid: String): JSON
  }
`;

// A map of functions which return data for the schema.
export const resolversMetadata = {
  JSON: GraphQLJSON,
  Query: {
    getMetadata: resolverWrapper(
      queryMetadata,
      async (_: any, params: any): Promise<IMetadataResponse> => {
        const ipfs = await getStorageEngine();
        const cid =
          typeof params.cid === 'undefined'
            ? await ipfs.resolve()
            : await Helper.toCID(params.cid);
        if (typeof cid === 'undefined') {
          return {};
        }
        return BSON.deserialize(await ipfs.readBytes(cid));
      }
    ),
  },
};