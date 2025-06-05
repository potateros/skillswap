import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { SkillExchangeRequest, RequestStatus } from '../entities/SkillExchangeRequest';
import { User } from '../entities/User';
import { Skill } from '../entities/Skill';
import { CreateSkillExchangeRequestDTO, UpdateSkillExchangeRequestDTO } from '../dto/SkillExchangeRequestDTO';
import { createAppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class ExchangeRequestService {
  private exchangeRequestRepository: Repository<SkillExchangeRequest>;
  private userRepository: Repository<User>;
  private skillRepository: Repository<Skill>;

  constructor() {
    this.exchangeRequestRepository = AppDataSource.getRepository(SkillExchangeRequest);
    this.userRepository = AppDataSource.getRepository(User);
    this.skillRepository = AppDataSource.getRepository(Skill);
  }

  async createExchangeRequest(requesterId: number, requestData: CreateSkillExchangeRequestDTO): Promise<SkillExchangeRequest> {
    try {
      // Verify requester exists
      const requester = await this.userRepository.findOne({ where: { id: requesterId } });
      if (!requester) {
        throw createAppError('Requester not found', 404);
      }

      // Verify provider exists
      const provider = await this.userRepository.findOne({ where: { id: requestData.providerId } });
      if (!provider) {
        throw createAppError('Provider not found', 404);
      }

      // Verify skills exist
      const skillRequested = await this.skillRepository.findOne({ where: { id: requestData.skillRequestedId } });
      if (!skillRequested) {
        throw createAppError('Requested skill not found', 404);
      }

      let skillOffered = null;
      if (requestData.skillOfferedId) {
        skillOffered = await this.skillRepository.findOne({ where: { id: requestData.skillOfferedId } });
        if (!skillOffered) {
          throw createAppError('Offered skill not found', 404);
        }
      }

      const exchangeRequest = new SkillExchangeRequest();
      exchangeRequest.requester_id = requesterId;
      exchangeRequest.provider_id = requestData.providerId;
      exchangeRequest.skill_offered_id = requestData.skillOfferedId;
      exchangeRequest.skill_requested_id = requestData.skillRequestedId;
      exchangeRequest.message = requestData.message;
      exchangeRequest.credits_offered = requestData.creditsOffered || 1;
      exchangeRequest.status = RequestStatus.PENDING;

      const savedRequest = await this.exchangeRequestRepository.save(exchangeRequest);
      
      logger.info('Exchange request created', { 
        requestId: savedRequest.id, 
        requesterId, 
        providerId: requestData.providerId 
      });
      
      return savedRequest;
    } catch (error) {
      if ((error as any).statusCode) throw error;
      logger.error('Error creating exchange request', error);
      throw createAppError('Failed to create exchange request', 500);
    }
  }

  async getExchangeRequests(userId: number, type?: 'sent' | 'received'): Promise<any[]> {
    try {
      let queryBuilder = this.exchangeRequestRepository
        .createQueryBuilder('request')
        .leftJoinAndSelect('request.requester', 'requester')
        .leftJoinAndSelect('request.provider', 'provider')
        .leftJoinAndSelect('request.skill_offered', 'skillOffered')
        .leftJoinAndSelect('request.skill_requested', 'skillRequested');

      if (type === 'sent') {
        queryBuilder = queryBuilder.where('request.requester_id = :userId', { userId });
      } else if (type === 'received') {
        queryBuilder = queryBuilder.where('request.provider_id = :userId', { userId });
      } else {
        // Get both sent and received
        queryBuilder = queryBuilder.where(
          '(request.requester_id = :userId OR request.provider_id = :userId)',
          { userId }
        );
      }

      queryBuilder = queryBuilder.orderBy('request.created_at', 'DESC');

      const requests = await queryBuilder.getMany();

      // Transform to match frontend expectations
      return requests.map(request => ({
        id: request.id,
        requester_id: request.requester_id,
        provider_id: request.provider_id,
        skill_offered_id: request.skill_offered_id,
        skill_requested_id: request.skill_requested_id,
        message: request.message,
        credits_offered: request.credits_offered,
        status: request.status,
        created_at: request.created_at,
        updated_at: request.updated_at,
        requester_name: request.requester?.name,
        requester_email: request.requester?.email,
        provider_name: request.provider?.name,
        provider_email: request.provider?.email,
        skill_offered_name: request.skill_offered?.name,
        skill_requested_name: request.skill_requested?.name,
        request_type: request.requester_id === userId ? 'sent' : 'received',
        other_user_name: request.requester_id === userId ? request.provider?.name : request.requester?.name,
        other_user_email: request.requester_id === userId ? request.provider?.email : request.requester?.email
      }));
    } catch (error) {
      logger.error('Error fetching exchange requests', error);
      throw createAppError('Failed to fetch exchange requests', 500);
    }
  }

  async updateExchangeRequest(requestId: number, userId: number, updateData: UpdateSkillExchangeRequestDTO): Promise<SkillExchangeRequest> {
    try {
      const request = await this.exchangeRequestRepository.findOne({
        where: { id: requestId },
        relations: ['requester', 'provider']
      });

      if (!request) {
        throw createAppError('Exchange request not found', 404);
      }

      // Only the provider can update the status
      if (request.provider_id !== userId) {
        throw createAppError('Not authorized to update this request', 403);
      }

      request.status = updateData.status;
      const updatedRequest = await this.exchangeRequestRepository.save(request);
      
      logger.info('Exchange request updated', { 
        requestId, 
        userId, 
        newStatus: updateData.status 
      });
      
      return updatedRequest;
    } catch (error) {
      if ((error as any).statusCode) throw error;
      logger.error('Error updating exchange request', error);
      throw createAppError('Failed to update exchange request', 500);
    }
  }
}