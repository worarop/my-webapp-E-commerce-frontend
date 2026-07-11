import { store } from '../store';
import { updateJobStatus, addLog, setWorkerRunning } from '../store/slices/workerSlice';
import { updateOrderStatus } from '../store/slices/orderSlice';
import { adjustStock } from '../store/slices/catalogSlice';
import { loadDb as mockLoadDb, saveDb as mockSaveDb } from '../lib/mockBackend';

class ReduxWorkerService {
  private interval: any = null;

  public start() {
    if (typeof window === 'undefined') return;
    if (this.interval) return;

    store.dispatch(setWorkerRunning(true));

    store.dispatch(addLog({
      type: 'info',
      service: 'worker',
      message: 'Background transaction processor worker started.'
    }));

    // Poll every 4 seconds
    this.interval = setInterval(() => {
      this.processNextJob();
    }, 4000);
  }

  public stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      store.dispatch(setWorkerRunning(false));
      store.dispatch(addLog({
        type: 'warning',
        service: 'worker',
        message: 'Background worker daemon paused.'
      }));
    }
  }

  public resume() {
    if (!this.interval) {
      store.dispatch(setWorkerRunning(true));
      this.start();
    }
  }

  private processNextJob() {
    const state = store.getState();
    const isRunning = state.worker.isWorkerRunning;
    if (!isRunning) return;

    const queue = state.worker.paymentQueue;
    const queuedJob = queue.find(j => j.status === 'queued');
    if (!queuedJob) return;

    // Transition job status to processing
    store.dispatch(updateJobStatus({ jobId: queuedJob.id, status: 'processing' }));
    store.dispatch(addLog({
      type: 'info',
      service: 'worker',
      message: `[Worker] Processing Job ${queuedJob.id} (Order: ${queuedJob.orderId})`
    }));

    // Simulate network processing latency
    setTimeout(() => {
      // Re-fetch fresh state
      const freshState = store.getState();
      const job = freshState.worker.paymentQueue.find(j => j.id === queuedJob.id);
      if (!job) return;

      const order = freshState.order.orders.find(o => o.id === job.orderId);
      if (!order) {
        store.dispatch(updateJobStatus({ jobId: job.id, status: 'failed' }));
        store.dispatch(addLog({
          type: 'error',
          service: 'worker',
          message: `[Worker] Order ${job.orderId} not found for Job ${job.id}`
        }));
        return;
      }

      if (job.shouldFail) {
        // PAYMENT FAILED
        store.dispatch(updateJobStatus({ jobId: job.id, status: 'failed' }));
        store.dispatch(addLog({
          type: 'warning',
          service: 'worker',
          message: `[Worker] Job ${job.id} failed. Releasing reserved stock...`
        }));

        // Refund/Release stock back to Catalog
        for (const item of order.items) {
          store.dispatch(adjustStock({ id: item.productId, change: item.quantity }));
        }

        store.dispatch(updateOrderStatus({
          orderId: job.orderId,
          status: 'failed',
          errorMessage: 'Payment transaction declined by gateway.'
        }));

        store.dispatch(addLog({
          type: 'error',
          service: 'payment',
          message: `[Gateway] Transaction failed for Order ${job.orderId}. Reason: Insufficient funds or invalid details.`
        }));
      } else {
        // PAYMENT SUCCESS - Validate balance using mockBackend DB
        const allUsers = mockLoadDb();
        const user = allUsers.find(u => u.id === order.userId);
        if (!user || user.balance < order.totalAmount) {
          // Insufficient Balance
          store.dispatch(updateJobStatus({ jobId: job.id, status: 'failed' }));
          
          for (const item of order.items) {
            store.dispatch(adjustStock({ id: item.productId, change: item.quantity }));
          }

          store.dispatch(updateOrderStatus({
            orderId: job.orderId,
            status: 'failed',
            errorMessage: 'Insufficient account wallet balance.'
          }));

          store.dispatch(addLog({
            type: 'error',
            service: 'payment',
            message: `[Gateway] Transaction failed for Order ${job.orderId} due to insufficient user balance.`
          }));
          return;
        }

        // Deduct user balance in mockBackend DB
        const allUsersForCharge = mockLoadDb();
        const userToCharge = allUsersForCharge.find(u => u.id === order.userId);
        if (userToCharge) {
          userToCharge.balance = Number((userToCharge.balance - order.totalAmount).toFixed(2));
          mockSaveDb(allUsersForCharge);
        }

        const txnId = `txn-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        store.dispatch(updateJobStatus({ jobId: job.id, status: 'completed' }));
        store.dispatch(updateOrderStatus({
          orderId: job.orderId,
          status: 'paid',
          transactionId: txnId
        }));

        store.dispatch(addLog({
          type: 'success',
          service: 'payment',
          message: `[Gateway] Transaction ${txnId} approved. Charged $${order.totalAmount.toFixed(2)}.`
        }));

        store.dispatch(addLog({
          type: 'success',
          service: 'worker',
          message: `[Worker] Job ${job.id} completed. Order ${job.orderId} paid.`
        }));

        // Simulate Shipment after 8 seconds
        setTimeout(() => {
          this.simulateShipping(job.orderId);
        }, 8000);
      }
    }, 3000);
  }

  private simulateShipping(orderId: string) {
    const state = store.getState();
    const order = state.order.orders.find(o => o.id === orderId);
    if (!order || order.status !== 'paid') return;

    store.dispatch(updateOrderStatus({ orderId, status: 'shipping' }));
    store.dispatch(addLog({
      type: 'info',
      service: 'worker',
      message: `[Worker] Order ${orderId} dispatched for courier delivery.`
    }));

    // Simulate completion after 10 seconds
    setTimeout(() => {
      const freshState = store.getState();
      const freshOrder = freshState.order.orders.find(o => o.id === orderId);
      if (!freshOrder || freshOrder.status !== 'shipping') return;

      store.dispatch(updateOrderStatus({ orderId, status: 'completed' }));
      store.dispatch(addLog({
        type: 'success',
        service: 'worker',
        message: `[Worker] Order ${orderId} delivered successfully. Closing order.`
      }));
    }, 10000);
  }
}

export const workerService = new ReduxWorkerService();
export default workerService;
