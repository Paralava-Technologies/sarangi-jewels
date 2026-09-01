import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

interface TaskRequest {
  taskId: string;
  payload: string;
}

interface TaskResponse {
  success: boolean;
  result: string;
}

@Controller()
export class CustomLogicController {
  private readonly logger = new Logger(CustomLogicController.name);

  @GrpcMethod('CustomLogicService', 'ProcessTask')
  processTask(data: TaskRequest): TaskResponse {
    this.logger.log(`Received task over gRPC: ${data.taskId} with payload ${data.payload}`);
    // Highly scalable custom business logic here
    return {
      success: true,
      result: `Processed task ${data.taskId} successfully`,
    };
  }
}
