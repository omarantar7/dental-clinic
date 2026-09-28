export type PermissionDefinition = { code: string; description: string };

export interface IPermissionRepository {
  syncAll(
    definitions: ReadonlyArray<PermissionDefinition>,
  ): Promise<{ removed: number }>;
}
