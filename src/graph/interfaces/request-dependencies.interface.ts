import { InputRequest } from '../../interfaces/input-request.interface';

export interface RequestDependencies {
    request: InputRequest,
    dependencies: InputRequest[]
}
