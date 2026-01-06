type TransformSaveData = (data: unknown) => unknown;

export interface ActionFormProps<TReq = never, TRes = unknown> {
  formModel?: UnknownRecord;
  formProps?: FormElProps;
  requestFn?: (data: TReq) => Promise<IResponse<TRes>>;
  transformSaveData?: TransformSaveData;
}
