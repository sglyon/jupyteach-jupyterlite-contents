import { Contents } from '@jupyterlite/contents';
import { Contents as ServerContents } from '@jupyterlab/services';
import { PathExt } from '@jupyterlab/coreutils';
import { ApolloClient, gql } from '@apollo/client/core';

const GET_NOTEBOOK_FRAGMENT = gql`
  fragment Notebook on ContentBlock {
    id
    createdAt
    properties
  }
`;

interface IContentResponseType {
  content: any;
  name: string;
  last_modified: string;
  created: string;
  size: number;
  mimetype: string;
  type: ServerContents.ContentType;
  filepath: string;
}

interface IContentBlock {
  authorId: number;
  createdAt: string;
  id: number;
  nbContent: ServerContents.IModel['content'];
  properties: {
    fileName: string;
    lastModified: string;
  };
  type: string;
  updatedAt: string;
}

const extractNotebookIdAndKey = (
  path: string
): { id: number | undefined; key: string | undefined } => {
  const basename = PathExt.basename(path);
  const match = basename.match(/(\d+)\.ipynb/);
  if (match) {
    const id = +match[1];
    return { id, key: `ContentBlock:${id}` };
  }
  return { id: undefined, key: undefined };
};

export type IModel = ServerContents.IModel;
/**
 * A class to handle requests to /api/contents
 */
export class JupyteachContents extends Contents {
  requestId = 0;
  responses: { [key: number]: IContentResponseType } = {};
  apolloClient: ApolloClient<Record<string, unknown>> | undefined = undefined;

  /**
   * Save a file.
   *
   * @param path - The desired file path.
   * @param options - Optional overrides to the model.
   *
   * @returns A promise which resolves with the file content model when the file is saved.
   */
  async save(
    path: string,
    options: Partial<IModel> = {}
  ): Promise<IModel | null> {
    // call the superclass method
    console.debug('[contents.ts] save', { path, options });
    const out = super.save(path, options);
    const { id, key } = extractNotebookIdAndKey(path);

    if (this.apolloClient && id) {
      // call updateFragment to update the cache
      console.debug('[contents.ts] updateFragment', { id, key, nbContent: options.content });
      this.apolloClient.cache.updateFragment(
        {
          id: key,
          fragment: GET_NOTEBOOK_FRAGMENT
        },
        existing => {
          return {
            ...existing,
            properties: {
              ...existing.properties,
              nbContent: options.content,
            },
          };
        }
      );
    }
    return out;
  }

  async initialize(): Promise<void> {
    const out = await super.initialize();
    this.apolloClient = (<any>window).parent.apolloClient as ApolloClient<
      Record<string, unknown>
    >;
    console.debug('[contents.ts] I have this client', this.apolloClient);
    return out;
  }

  async newUntitled(
    options?: ServerContents.ICreateOptions | undefined
  ): Promise<ServerContents.IModel | null> {
    return super.newUntitled(options);
  }

  async get(
    path: string,
    options?: ServerContents.IFetchOptions | undefined
  ): Promise<ServerContents.IModel | null> {
    // Try this...
    const { id, key } = extractNotebookIdAndKey(path);
    const url = new URL(window.location.href);
    const forceRefreshRaw = url.searchParams.get('forceRefresh');
    const haveRefreshArg = forceRefreshRaw !== null;
    const forceRefresh = forceRefreshRaw === 'true';

    // if we set forceRefresh to false, then grab from super
    if (haveRefreshArg && !forceRefresh) {
      const out = await super.get(path, options);
      if (out) {
        return out;
      }
    }
    if (this.apolloClient && id) {
      // check to see if this is in the cache already -- should be !"])
      const nb = this.apolloClient.readFragment({
        id: key,
        fragment: GET_NOTEBOOK_FRAGMENT
      }) as Pick<
        IContentBlock,
        'properties' | 'createdAt' | 'id' | 'nbContent'
      > | null;
      console.debug('[contents.ts] get inside if', {
        path,
        options,
        nb,
        client: this.apolloClient
      });
      if (nb) {
        return {
          content: nb.nbContent,
          created: nb.createdAt,
          format: 'json',
          last_modified: nb.properties.lastModified,
          mimetype: 'application/x-ipynb+json',
          name: nb.properties.fileName,
          path: nb.properties.fileName,
          size: JSON.stringify(nb.nbContent).length,
          type: 'notebook',
          writable: true
        };
      }
    }

    // otherwise, just fallback
    return super.get(path, options);
  }

  async createCheckpoint(
    path: string
  ): Promise<ServerContents.ICheckpointModel> {
    return super.createCheckpoint(path);
  }
}
