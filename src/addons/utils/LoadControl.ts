import { STATUS } from "../..";

export type AsyncProcessorProcessing = (params?: any) => void;
export type AsyncProcessorSucceed = (data: any) => void;
export type AsyncProcessorFailed = (error?: any) => void;

export class AsyncProcessor {
  error: any;
  data: any;
  params: any;
  status: STATUS = "";

  constructor(private forceUpdate?: () => void) {
    this.processing = this.processing.bind(this);
    this.succeed = this.succeed.bind(this);
    this.failed = this.failed.bind(this);
  }

  get triggers() {
    return {
      processing: this.processing,
      succeed: this.succeed,
      failed: this.failed,
    };
  }

  processing: AsyncProcessorProcessing = (params?: any) => {
    this.params = params;
    this.status = "PROCESSING";
    const { forceUpdate } = this;
    forceUpdate && forceUpdate();
  };
  succeed: AsyncProcessorSucceed = (data: any) => {
    this.data = data;
    this.status = "SUCCESS";
    const { forceUpdate } = this;
    forceUpdate && forceUpdate();
  };
  failed: AsyncProcessorFailed = (error: any) => {
    this.error = error;
    this.status = "FAILURE";
    const { forceUpdate } = this;
    forceUpdate && forceUpdate();
  };

  retry(
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
    callback(this.triggers, params || this.params);
  }
}
