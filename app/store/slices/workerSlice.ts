import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PaymentJob, WorkerLog } from '../../types';

interface WorkerState {
  paymentQueue: PaymentJob[];
  logs: WorkerLog[];
  isWorkerRunning: boolean;
}

const loadInitialState = (): WorkerState => {
  const defaultLogs: WorkerLog[] = [
    {
      id: 'log-init',
      timestamp: new Date().toISOString(),
      type: 'info',
      service: 'worker',
      message: 'Redux background microservices orchestrator initialized.'
    }
  ];

  if (typeof window === 'undefined') {
    return { paymentQueue: [], logs: defaultLogs, isWorkerRunning: true };
  }

  try {
    const storedQueue = localStorage.getItem('ec_payment_queue');
    const storedLogs = localStorage.getItem('ec_logs');
    const paymentQueue = storedQueue ? JSON.parse(storedQueue) : [];
    const logs = storedLogs ? JSON.parse(storedLogs) : defaultLogs;
    return { paymentQueue, logs, isWorkerRunning: true };
  } catch (e) {
    return { paymentQueue: [], logs: defaultLogs, isWorkerRunning: true };
  }
};

const initialState: WorkerState = loadInitialState();

export const workerSlice = createSlice({
  name: 'worker',
  initialState,
  reducers: {
    queuePaymentJob: (state, action: PayloadAction<PaymentJob>) => {
      state.paymentQueue.push(action.payload);
    },
    updateJobStatus: (state, action: PayloadAction<{ jobId: string; status: PaymentJob['status'] }>) => {
      const { jobId, status } = action.payload;
      const job = state.paymentQueue.find(j => j.id === jobId);
      if (job) {
        job.status = status;
      }
    },
    addLog: (state, action: PayloadAction<{ type: WorkerLog['type']; service: WorkerLog['service']; message: string }>) => {
      const newLog: WorkerLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: action.payload.type,
        service: action.payload.service,
        message: action.payload.message
      };
      state.logs = [newLog, ...state.logs].slice(0, 100);
    },
    clearLogs: (state) => {
      state.logs = [];
    },
    setWorkerRunning: (state, action: PayloadAction<boolean>) => {
      state.isWorkerRunning = action.payload;
    }
  }
});

export const { queuePaymentJob, updateJobStatus, addLog, clearLogs, setWorkerRunning } = workerSlice.actions;
export default workerSlice.reducer;
