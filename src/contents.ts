import { Contents } from '@jupyterlite/contents';
import { Contents as ServerContents } from '@jupyterlab/services';
import { ApolloClient, gql } from '@apollo/client/core';

const GET_NOTEBOOK_FRAGMENT = gql`
  fragment Notebook on ContentBlock {
    id
    createdAt
    nbContent
    properties
  }
`;

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

export type IModel = ServerContents.IModel;
/**
 * A class to handle requests to /api/contents
 */
export class JupyteachContents extends Contents {
  apolloClient: ApolloClient<Record<string, unknown>> | undefined = undefined;
  contentBlockIDToFileName: { [key: number]: string } = {};
  fileNameToContentBlockID: { [key: string]: number } = {};

  getIdAndKey = ({
    fileName,
    contentBlockId
  }: {
    fileName?: string;
    contentBlockId?: number;
  }): { id: number | undefined; key: string | undefined } => {
    if (contentBlockId) {
      return { id: contentBlockId, key: `ContentBlock:${contentBlockId}` };
    }
    if (fileName) {
      // Try to access blockID in `fileNameToContentBlockID`
      const blockID = this.fileNameToContentBlockID[fileName];
      if (blockID) {
        return { id: blockID, key: `ContentBlock:${blockID}` };
      }
    }
    return { id: undefined, key: undefined };
  };

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
    const { id, key } = this.getIdAndKey({ fileName: options.name });

    if (this.apolloClient && id) {
      this.apolloClient.cache.modify({
        id: key,
        fields: {
          nbContent: _ => options.content
        }
      });
      console.debug(
        '[contents.ts] save --  just called modify to update nbContent'
      );
    }

    const out = super.save(path, options);
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
    console.debug('[contents.ts] get', { path, options });

    // handle matplotlib rc files...
    if (path.endsWith('matplotlibrc')) {
      const out = await super.get(path, options);
      if (out) {
        console.debug('[contents.ts] get MATPLOTLIBRC', { path, options, out });
        return out;
      }
    }
    const url = new URL(window.location.href);
    const forceRefreshRaw = url.searchParams.get('forceRefresh');
    const haveRefreshArg = forceRefreshRaw !== null;
    const forceRefresh = forceRefreshRaw === 'true';

    // if we set forceRefresh to false, then grab from super
    if (haveRefreshArg && !forceRefresh) {
      const out = await super.get(path, options);
      if (out) {
        console.debug('[contents.ts] grab from super', {
          path,
          options,
          out,
          haveRefreshArg,
          forceRefresh
        });
        return out;
      }
    }

    const blockIdRaw = url.searchParams.get('contentBlockId');
    const contentBlockId = blockIdRaw ? +blockIdRaw : undefined;
    const { id, key } = this.getIdAndKey({ contentBlockId });

    if (this.apolloClient && id && path.endsWith('.ipynb')) {
      // check to see if this is in the cache already -- should be !"])
      const nb = this.apolloClient.readFragment({
        id: key,
        fragment: GET_NOTEBOOK_FRAGMENT
      }) as Pick<
        IContentBlock,
        'properties' | 'createdAt' | 'id' | 'nbContent'
      > | null;
      if (nb) {
        const out = {
          name: nb.properties.fileName,
          path: nb.properties.fileName,
          type: 'notebook' as const,
          writable: true,
          created: nb.createdAt,
          last_modified: nb.properties.lastModified,
          mimetype: 'application/x-ipynb+json',
          content: nb.nbContent,
          format: 'json' as const,
          size: JSON.stringify(nb.nbContent).length
        };
        if (contentBlockId) {
          this.contentBlockIDToFileName[contentBlockId] =
            nb.properties.fileName;
          this.fileNameToContentBlockID[nb.properties.fileName] =
            contentBlockId;
        }
        console.debug('[contents.ts] get returning from Apollo cache', { out });
        return out;
      }
    }

    const out = await super.get(path, options);
    console.debug('[contents.ts] get fallback response', { out });

    // otherwise, just fallback
    return out;
  }

  async createCheckpoint(
    path: string
  ): Promise<ServerContents.ICheckpointModel> {
    return super.createCheckpoint(path);
  }
}
