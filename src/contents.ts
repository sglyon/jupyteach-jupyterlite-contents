import { Contents } from '@jupyterlite/contents';
import { Contents as ServerContents } from '@jupyterlab/services';

export type IModel = ServerContents.IModel;
/**
 * A class to handle requests to /api/contents
 */
export class JupyteachContents extends Contents {
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
    const out = super.save(path, options);

    // now do custom stuffs
    console.log('I am in the custom save method!!!', { path, options, out });

    return out;
  }
}
