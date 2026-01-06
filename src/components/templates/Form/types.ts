type TransformSaveData = (data: unknown) => unknown;

export interface ActionFormProps<TReq = never, TRes = unknown> {
  formModel?: any;
  formProps?: any;
  requestFn?: (data: TReq) => Promise<IResponse<TRes>>;
  transformSaveData?: TransformSaveData;
}
