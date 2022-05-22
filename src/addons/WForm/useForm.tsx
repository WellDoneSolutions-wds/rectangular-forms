import { useReducer, useRef } from "react";
import { AbstractControl } from "../../exports";
import {
  AsyncProcessor,
  AsyncProcessorFailed,
  AsyncProcessorProcessing,
  AsyncProcessorSucceed,
} from "../utils/LoadControl";
import { STATUS } from "./WForm";
interface IUseConfigForm {
  createForm: ICreateForm;
  shared?: { [key: string]: any };
  onSubmit?: (
    control: AbstractControl,
    save: AsyncProcessor,
    event: React.FormEvent<HTMLFormElement>
  ) => void;
  onFormLoaded?: (form: AbstractControl, data: any) => void;
  loadRetry?: (
    config: {
      processingLoad: () => void;
      succeedLoad: (data: any) => void;
      failedLoad: (error: any) => void;
    },
    params: any
  ) => {};
}

type ICreateForm = (
  data: any,
  oldForm: AbstractControl | null
) => AbstractControl;

export interface IFormConfig {
  form: AbstractControl | null;
  formLoadedData: any;
  formLoadParams: any;
  formLoadStatus: STATUS;
  formLoadedError: any;
  formSavedData: any;
  formSaveParams: any;
  formSaveStatus: STATUS;
  formSavedError: any;
}
export class FormConfig implements IFormConfig {
  form!: AbstractControl;
  get formLoadedData() {
    return this._loadDataAsyncProcesor.data;
  }

  get formLoadParams() {
    return this._loadDataAsyncProcesor.params;
  }

  get formLoadStatus() {
    return this._loadDataAsyncProcesor.status;
  }
  get formLoadedError() {
    return this._loadDataAsyncProcesor.error;
  }

  loadProcessing(params?: any) {
    this._loadDataAsyncProcesor.processing(params);
  }

  loadSucceed(data: any) {
    this._loadDataAsyncProcesor.succeed(data);

    const { createForm, onFormLoaded } = this.config;
    this.form = createForm(data, this.form);
    this.form.forceUpdate = this.forceUpdate;

    this.forceUpdate();

    if (onFormLoaded) {
      //TODO: remove setTimeout. The purpose of setTimeout is make sure that <WForm> has finish of render.
      // so <WFormGroup|WFormArray|WFormContro   subscribe={()=>{}}> subscribe method will called the first time.
      setTimeout(() => {
        onFormLoaded(this.form!, data);
      }, 100);
    }
  }
  loadFailed(error: any) {
    this._loadDataAsyncProcesor.failed(error);
  }

  loadRetry(
    callback: (
      triggers: {
        processing: AsyncProcessorProcessing;
        succeed: AsyncProcessorSucceed;
        failed: AsyncProcessorFailed;
      },
      data: any
    ) => void,
    params?: any
  ) {
    this._loadDataAsyncProcesor.retry(callback, params);
  }

  get formSavedData() {
    return this._saveDataAsyncProcesor.data;
  }

  get formSaveParams() {
    return this._saveDataAsyncProcesor.params;
  }

  get formSaveStatus() {
    return this._saveDataAsyncProcesor.status;
  }
  get formSavedError() {
    return this._saveDataAsyncProcesor.error;
  }

  formSaveProcessing(params?: any) {
    this._saveDataAsyncProcesor.processing(params);
  }

  formSaveSucceed(data: any) {
    this._saveDataAsyncProcesor.succeed(data);
  }
  formSaveFailed(error: any) {
    this._saveDataAsyncProcesor.failed(error);
  }

  formSaveRetry(
    callback: (
      triggers: {
        processing: AsyncProcessorProcessing;
        succeed: AsyncProcessorSucceed;
        failed: AsyncProcessorFailed;
      },
      data: any
    ) => void,
    params?: any
  ) {
    this._saveDataAsyncProcesor.retry(callback, params);
  }

  private _loadDataAsyncProcesor: AsyncProcessor;
  private _saveDataAsyncProcesor: AsyncProcessor;
  constructor(private config: IUseConfigForm, public forceUpdate: () => void) {
    this._loadDataAsyncProcesor = new AsyncProcessor(forceUpdate);
    this._saveDataAsyncProcesor = new AsyncProcessor(forceUpdate);

    this.loadProcessing = this.loadProcessing.bind(this);
    this.loadSucceed = this.loadSucceed.bind(this);
    this.loadFailed = this.loadFailed.bind(this);

    this.loadRetry = this.loadRetry.bind(this);
  }

  public static create(
    config: IUseConfigForm,
    forceUpdate: () => void
  ): FormConfig {
    return new FormConfig(config, forceUpdate);
  }

  submit(event: React.FormEvent<HTMLFormElement>) {
    const { onSubmit } = this.config;
    onSubmit && onSubmit(this.form!, this._saveDataAsyncProcesor, event);
  }
}

export const useFormConfig = (props: IUseConfigForm) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return useRef(FormConfig.create(props, forceUpdate)).current;
};
