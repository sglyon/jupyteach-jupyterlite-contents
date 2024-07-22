import { Contents, IModel } from '@jupyterlite/contents';
import type { Contents as ServerContents } from '@jupyterlab/services';

interface IContentBlock {
  authorId: number;
  createdAt: string;
  id: number;
  nbContent: IModel['content'];
  properties: {
    fileName: string;
    lastModified: string;
  };
  type: string;
  updatedAt: string;
}

/**
 * A class to handle requests to /api/contents
 */
export class JupyteachContents extends Contents {
  el: Element | null;
  nbName: string | null = null;
  nbPath: string | null = null;
  contentRaw: string | null = null;
  contentBlock: IContentBlock | null = null;

  constructor(options: Contents.IOptions) {
    super(options);
    this.el = frameElement;
    if (this.el) {
      this.nbName = this.el.getAttribute('data-nb-name');
      this.nbPath = this.el.getAttribute('data-nb-path');
      this.contentRaw = this.el.getAttribute('data-content-block');
      if (this.contentRaw) {
        this.contentBlock = JSON.parse(this.contentRaw) as IContentBlock;
      }
    }
    console.log('Done with setup, here is what I found', {
      el: this.el,
      nbName: this.nbName,
      nbPath: this.nbPath,
      contentRaw: this.contentRaw,
      contentBlock: this.contentBlock
    });
  }

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
    if (this.el) {
      if (this.contentBlock) {
        const dataName = 'data-content-block';
        this.contentBlock.nbContent = options.content;
        this.el.setAttribute(dataName, JSON.stringify(this.contentBlock));
        console.log('Just saved to ', dataName);
      }
    }

    // TODO: if I try to save to a separate directory and it doesn't exist
    //       it is not created. The object appears in the local storage
    //       and has the given path, but there are no entries for the directories
    return super.save(path, options);
  }

  async get(
    path: string,
    options?: ServerContents.IFetchOptions | undefined
  ): Promise<IModel | null> {
    console.debug('[contents.ts] get with all the stuffs', {
      path,
      options,
      el: this.el,
      nbPath: this.nbPath,
      contentBlock: this.contentBlock,
      contentsObject: this
    });
    const url = new URL(window.location.href);
    const forceRefreshRaw = url.searchParams.get('forceRefresh');
    const haveRefreshArg = forceRefreshRaw !== null;
    const forceRefresh = forceRefreshRaw === 'true';

    let matchPath = decodeURIComponent(path);
    if (matchPath.startsWith('/')) {
      matchPath = matchPath.slice(1);
    }

    let matchNbPath = this.nbPath || '';
    if (matchNbPath.startsWith('/')) {
      matchNbPath = matchPath.slice(1);
    }

    if (matchPath === matchNbPath && this.el) {
      // Only if we are trying to get the exact file we said we wanted...
      // if we set forceRefresh to false, then try to grab
      if (haveRefreshArg && !forceRefresh) {
        try {
          const fromSuper = await super.get(path, options);
          if (fromSuper !== null) {
            return fromSuper;
          }
        } catch (e) {
          console.error('Failed to get from super.get', e);
        }
      }

      // We read this content on mount. Just package it
      if (this.contentBlock) {
        // have it -- nice! Package it up!
        const out = {
          name:
            this.nbName ||
            this.contentBlock.properties.fileName ||
            'ERROR.ipynb',
          path: this.nbPath || path,
          type: 'notebook' as const,
          writable: true,
          created: this.contentBlock.createdAt,
          last_modified: this.contentBlock.properties.lastModified,
          mimetype: 'application/x-ipynb+json',
          content: this.contentBlock.nbContent,
          format: 'json' as const,
          size: this.contentRaw?.length || 0
        };

        console.log('[contents.ts] get: returning', { path, out });

        return out;
      }
    }

    return super.get(path, options);
  }
}
